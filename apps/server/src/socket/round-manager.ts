import type { Server as SocketIOServer, Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import prisma from "@gamesforstrangers/db";

interface PlayerInfo {
  animal: string;
  color: string;
}

interface GuessEntry {
  playerId: string;
  animal: string;
  guess: string;
  time: number;
  correct: boolean;
}

interface GameRoom {
  id: string;
  players: Map<string, PlayerInfo>;
  currentRound: RoundState | null;
}

interface RoundState {
  roundId: string;
  imageUrl: string;
  answer: string;
  city: string;
  landmark: string;
  region: string;
  funFact: string;
  startedAt: Date;
  guesses: GuessEntry[];
}

const GAME_SLUG = "where-is-this";
const ROUND_DURATION_MS = 60_000;
const SCOREBOARD_DURATION_MS = 10_000;
const CYCLE_DURATION_MS = ROUND_DURATION_MS + SCOREBOARD_DURATION_MS;

export class RoundManager {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private locationRounds: RoundState[] = [];
  private usedIndices: Set<number> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async init() {
    await this.loadLocations();
    this.startCycle();
  }

  private async loadLocations() {
    const rounds = await prisma.round.findMany({
      where: { game: { slug: GAME_SLUG } },
    });

    this.locationRounds = rounds.map((r) => ({
      roundId: r.id,
      imageUrl: r.imageUrl,
      answer: r.answer,
      city: r.city,
      landmark: r.landmark,
      region: r.region,
      funFact: r.funFact,
      startedAt: r.startedAt,
      guesses: [],
    }));

    console.log(`Loaded ${this.locationRounds.length} locations for ${GAME_SLUG}`);
  }

  private getRandomLocation(): RoundState {
    if (this.locationRounds.length === 0) {
      throw new Error("No locations loaded");
    }

    if (this.usedIndices.size >= this.locationRounds.length) {
      this.usedIndices.clear();
    }

    let idx: number;
    do {
      idx = Math.floor(Math.random() * this.locationRounds.length);
    } while (this.usedIndices.has(idx));

    this.usedIndices.add(idx);
    return { ...this.locationRounds[idx], guesses: [] };
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

    this.broadcastPlayerCount(gameId);

    if (room.currentRound) {
      socket.emit("new-round", {
        imageUrl: room.currentRound.imageUrl,
        roundId: room.currentRound.roundId,
        endTime: room.currentRound.startedAt.getTime() + ROUND_DURATION_MS,
      });
    }
  }

  leaveGame(socket: Socket, gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    room.players.delete(socket.id);
    socket.leave(gameId);

    if (room.players.size === 0) {
      this.rooms.delete(gameId);
    } else {
      this.broadcastPlayerCount(gameId);
    }
  }

  disconnect(socket: Socket) {
    for (const [, room] of this.rooms) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        this.broadcastPlayerCount(room.id);
      }
    }
  }

  submitGuess(socket: Socket, gameId: string, roundId: string, guess: string) {
    const room = this.rooms.get(gameId);
    if (!room || !room.currentRound) return;

    const round = room.currentRound;
    if (round.roundId !== roundId) return;

    const alreadyGuessed = round.guesses.some(
      (g) => g.playerId === socket.id,
    );
    if (alreadyGuessed) return;

    const playerInfo = room.players.get(socket.id);
    if (!playerInfo) return;

    const elapsed = Date.now() - round.startedAt.getTime();
    const isCorrect = guess.trim().toLowerCase() === round.answer.toLowerCase();

    const entry: GuessEntry = {
      playerId: socket.id,
      animal: playerInfo.animal,
      guess,
      time: elapsed,
      correct: isCorrect,
    };

    round.guesses.push(entry);

    this.io.to(gameId).emit("guess-result", {
      animal: playerInfo.animal,
      time: elapsed,
      correct: isCorrect,
      blurred: true,
    });

    if (isCorrect) {
      this.endRoundEarly(gameId);
    }
  }

  private endRoundEarly(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room || !room.currentRound) return;

    this.finishRound(gameId);
  }

  private startCycle() {
    this.startNewRound();

    this.timer = setInterval(() => {
      this.advanceCycle();
    }, CYCLE_DURATION_MS);
  }

  private advanceCycle() {
    for (const [gameId] of this.rooms) {
      this.finishRound(gameId);
    }

    setTimeout(() => {
      for (const [gameId] of this.rooms) {
        this.startNewRoundInRoom(gameId);
      }
    }, SCOREBOARD_DURATION_MS);
  }

  private async finishRound(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room || !room.currentRound) return;

    const round = room.currentRound;
    const winner = round.guesses.find((g) => g.correct);

    if (winner) {
      try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await prisma.guess.create({
          data: {
            roundId: round.roundId,
            playerId: winner.playerId,
            guess: winner.guess,
            correct: true,
          },
        });

        const existing = await prisma.dailyScore.findUnique({
          where: {
            playerId_gameId_date: {
              playerId: winner.playerId,
              gameId: gameId,
              date: today,
            },
          },
        });

        if (existing) {
          await prisma.dailyScore.update({
            where: { id: existing.id },
            data: { score: existing.score + 1 },
          });
        } else {
          await prisma.dailyScore.create({
            data: {
              playerId: winner.playerId,
              gameId: gameId,
              score: 1,
              date: today,
            },
          });
        }
      } catch (err) {
        console.error("Failed to save guess/score", err);
      }
    }

    const scores = await this.getScores(gameId);

    this.io.to(gameId).emit("round-end", {
      winner: winner
        ? { animal: winner.animal, time: winner.time, playerId: winner.playerId }
        : null,
      answer: round.answer,
      city: round.city,
      landmark: round.landmark,
      region: round.region,
      funFact: round.funFact,
      scores,
    });
  }

  private async getScores(gameId: string) {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const topScores = await prisma.dailyScore.findMany({
        where: {
          gameId,
          date: today,
        },
        orderBy: { score: "desc" },
        take: 10,
      });

      return topScores.map((s) => ({
        playerId: s.playerId,
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

    const location = this.getRandomLocation();
    const startedAt = new Date();

    room.currentRound = {
      ...location,
      startedAt,
      guesses: [],
    };

    this.io.to(gameId).emit("new-round", {
      imageUrl: room.currentRound.imageUrl,
      roundId: room.currentRound.roundId,
      endTime: startedAt.getTime() + ROUND_DURATION_MS,
    });

    // Force end after round duration
    setTimeout(() => {
      if (this.rooms.has(gameId) && this.rooms.get(gameId)?.currentRound?.roundId === location.roundId) {
        this.finishRound(gameId);
      }
    }, ROUND_DURATION_MS + 100);
  }

  private broadcastPlayerCount(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;

    this.io.to(gameId).emit("player-count", {
      count: room.players.size,
    });
  }
}
