import type { Server as SocketIOServer, Socket } from "socket.io";
import prisma from "@gamesforstrangers/db";
import { gameState } from "../state";

export interface PlayerInfo {
  animal: string;
  color: string;
  username: string;
  uuid: string;
}

export interface GuessEntry {
  playerId: string;
  animal: string;
  username: string;
  guess: string;
  time: number;
  correct: boolean;
}

export interface BaseRound {
  roundId: string;
  startedAt: Date;
  guesses: GuessEntry[];
}

interface GameRoom<TRound extends BaseRound> {
  id: string;
  players: Map<string, PlayerInfo>;
  currentRound: TRound | null;
}

let idCounter = 0;
export function makeRoundId(): string {
  return `round_${++idCounter}_${Date.now()}`;
}

/**
 * A self-contained game loop: rooms, round lifecycle, timers and scoring for
 * one game slug. Subclasses provide round content and answer checking; the
 * base class handles everything else (join/leave, broadcasts, DailyScore
 * persistence, the round/scoreboard cycle).
 */
export abstract class BaseGameEngine<TRound extends BaseRound> {
  readonly slug: string;
  protected abstract readonly roundDurationMs: number;
  protected abstract readonly scoreboardDurationMs: number;
  // true: first correct guess wins and ends the round early (GeoGuesser).
  // false: round runs the full duration, every correct guess scores (Higher or Lower).
  protected abstract readonly endsEarlyOnCorrect: boolean;

  protected io: SocketIOServer;
  protected rooms: Map<string, GameRoom<TRound>> = new Map();
  private dbReady: Promise<string | null>;

  // slug is a constructor param (not an abstract field) because subclass
  // field initializers run after super() — reading an abstract slug here
  // would see undefined.
  constructor(io: SocketIOServer, slug: string) {
    this.io = io;
    this.slug = slug;
    this.dbReady = this.resolveDbGameId();
  }

  /** Build a fresh round (with hidden answer) around the given base fields. */
  protected abstract createRound(base: BaseRound): TRound;
  protected abstract isCorrect(round: TRound, guess: string): boolean;
  /** Game-specific fields for the `new-round` payload (answer stripped). */
  protected abstract buildNewRoundExtras(round: TRound): Record<string, unknown>;
  /** Game-specific fields for the `round-end` payload (answer revealed). */
  protected abstract buildRoundEndExtras(round: TRound): Record<string, unknown>;

  private async resolveDbGameId(): Promise<string | null> {
    try {
      const game = await prisma.game.findUnique({ where: { slug: this.slug } });
      if (game) return game.id;
      console.warn(`Game "${this.slug}" not found in DB — scores won't persist`);
    } catch (err) {
      console.warn("DB unavailable — scores won't persist", String(err));
    }
    return null;
  }

  init() {
    this.startCycle();
  }

  joinGame(socket: Socket, gameId: string, playerInfo: PlayerInfo) {
    if (!this.rooms.has(gameId)) {
      this.rooms.set(gameId, {
        id: gameId,
        players: new Map(),
        currentRound: null,
      });
    }

    const room = this.rooms.get(gameId)!;
    room.players.set(socket.id, playerInfo);
    socket.join(gameId);

    gameState.joinRoom(gameId, this.slug);
    this.broadcastPlayerCount(gameId);

    // Late joiners get the in-progress round immediately
    if (room.currentRound) {
      socket.emit("new-round", this.newRoundPayload(room.currentRound));
    }
  }

  leaveGame(socket: Socket, gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    room.players.delete(socket.id);
    socket.leave(gameId);

    gameState.leaveRoom(gameId);

    if (room.players.size === 0) {
      this.rooms.delete(gameId);
    } else {
      this.broadcastPlayerCount(gameId);
    }
  }

  disconnect(socket: Socket) {
    for (const [gameId, room] of this.rooms) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        gameState.leaveRoom(gameId);
        this.broadcastPlayerCount(gameId);
      }
    }
  }

  submitGuess(socket: Socket, gameId: string, roundId: string, guess: string) {
    const room = this.rooms.get(gameId);
    if (!room || !room.currentRound) return;

    const round = room.currentRound;
    if (round.roundId !== roundId) return;

    const playerInfo = room.players.get(socket.id);
    if (!playerInfo) return;

    const alreadyGuessed = round.guesses.some(
      (g) => g.playerId === playerInfo.uuid,
    );
    if (alreadyGuessed) return;

    const elapsed = Date.now() - round.startedAt.getTime();
    const isCorrect = this.isCorrect(round, guess);

    round.guesses.push({
      playerId: playerInfo.uuid,
      animal: playerInfo.animal,
      username: playerInfo.username,
      guess,
      time: elapsed,
      correct: isCorrect,
    });

    this.io.to(gameId).emit("guess-result", {
      animal: playerInfo.animal,
      time: elapsed,
      correct: isCorrect,
      blurred: true,
    });

    if (isCorrect && this.endsEarlyOnCorrect) {
      this.finishRound(gameId);
    }
  }

  private get cycleDurationMs() {
    return this.roundDurationMs + this.scoreboardDurationMs;
  }

  private startCycle() {
    this.startNewRound();

    setInterval(() => {
      this.advanceCycle();
    }, this.cycleDurationMs);
  }

  private advanceCycle() {
    for (const [gameId] of this.rooms) {
      this.finishRound(gameId);
    }

    setTimeout(() => {
      for (const [gameId] of this.rooms) {
        this.startNewRoundInRoom(gameId);
      }
    }, this.scoreboardDurationMs);
  }

  private async finishRound(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room || !room.currentRound) return;

    const round = room.currentRound;
    // Clear immediately so the round can't be finished twice (early end +
    // backstop timer + cycle advance can otherwise double-score the winner).
    room.currentRound = null;

    const winners = this.endsEarlyOnCorrect
      ? round.guesses.filter((g) => g.correct).slice(0, 1)
      : round.guesses.filter((g) => g.correct);

    if (winners.length > 0) {
      const dbGameId = await this.dbReady;
      if (dbGameId) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        for (const winner of winners) {
          try {
            const existing = await prisma.dailyScore.findUnique({
              where: {
                playerId_gameId_date: {
                  playerId: winner.playerId,
                  gameId: dbGameId,
                  date: today,
                },
              },
            });

            if (existing) {
              await prisma.dailyScore.update({
                where: { id: existing.id },
                data: { score: existing.score + 1, username: winner.username },
              });
            } else {
              await prisma.dailyScore.create({
                data: {
                  playerId: winner.playerId,
                  username: winner.username,
                  gameId: dbGameId,
                  score: 1,
                  date: today,
                },
              });
            }
          } catch (err) {
            console.error("Failed to save score", err);
          }
        }
      }
    }

    const scores = await this.getScores();
    const first = winners[0];

    this.io.to(gameId).emit("round-end", {
      winner: first
        ? {
            animal: first.animal,
            username: first.username,
            time: first.time,
            playerId: first.playerId,
          }
        : null,
      winners: winners.map((w) => ({
        animal: w.animal,
        username: w.username,
        time: w.time,
        playerId: w.playerId,
      })),
      guesses: round.guesses.map((g) => ({
        animal: g.animal,
        username: g.username,
        guess: g.guess,
        correct: g.correct,
        time: g.time,
      })),
      scores,
      nextRoundAt: Date.now() + this.scoreboardDurationMs,
      ...this.buildRoundEndExtras(round),
    });
  }

  private async getScores() {
    const dbGameId = await this.dbReady;
    if (!dbGameId) return [];
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const topScores = await prisma.dailyScore.findMany({
        where: { gameId: dbGameId, date: today },
        orderBy: { score: "desc" },
        take: 10,
      });

      return topScores.map((s) => ({
        playerId: s.playerId,
        username: s.username,
        score: s.score,
      }));
    } catch {
      return [];
    }
  }

  private startNewRound() {
    for (const [gameId] of this.rooms) {
      this.startNewRoundInRoom(gameId);
    }
  }

  private startNewRoundInRoom(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    const round = this.createRound({
      roundId: makeRoundId(),
      startedAt: new Date(),
      guesses: [],
    });
    room.currentRound = round;

    this.io.to(gameId).emit("new-round", this.newRoundPayload(round));

    // Force end after round duration
    setTimeout(() => {
      if (this.rooms.get(gameId)?.currentRound?.roundId === round.roundId) {
        this.finishRound(gameId);
      }
    }, this.roundDurationMs + 100);
  }

  private newRoundPayload(round: TRound) {
    return {
      roundId: round.roundId,
      endTime: round.startedAt.getTime() + this.roundDurationMs,
      ...this.buildNewRoundExtras(round),
    };
  }

  private broadcastPlayerCount(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    this.io.to(gameId).emit("player-count", {
      count: room.players.size,
    });
  }
}
