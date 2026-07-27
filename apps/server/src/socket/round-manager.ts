import type { Server as SocketIOServer, Socket } from "socket.io";
import prisma from "@gamesforstrangers/db";
import { gameState } from "../state";

interface PlayerInfo {
  animal: string;
  color: string;
  username: string;
  uuid: string;
}

interface GuessEntry {
  playerId: string;
  animal: string;
  username: string;
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

const GAME_SLUG = "geoguesser-race";
const ROUND_DURATION_MS = 60_000;
const SCOREBOARD_DURATION_MS = 10_000;
const CYCLE_DURATION_MS = ROUND_DURATION_MS + SCOREBOARD_DURATION_MS;

export class RoundManager {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private locationRounds: RoundState[] = [];
  private usedIndices: Set<number> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private dbGameId: string | null = null;
  private playerUsernames: Map<string, string> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async init() {
    await this.loadLocations();
    this.startCycle();
  }

  private async loadLocations() {
    const game = await prisma.game.findUnique({
      where: { slug: GAME_SLUG },
    });
    if (!game) {
      console.error(`Game "${GAME_SLUG}" not found in DB. Run pnpm db:seed first.`);
      return;
    }
    this.dbGameId = game.id;

    const rounds = await prisma.round.findMany({
      where: { gameId: game.id },
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

    gameState.joinRoom(gameId, GAME_SLUG);
    this.broadcastPlayerCount(gameId);

    if (room.currentRound) {
      socket.emit("new-round", {
        imageUrl: room.currentRound.imageUrl,
        roundId: room.currentRound.roundId,
        endTime: room.currentRound.startedAt.getTime() + ROUND_DURATION_MS,
        city: room.currentRound.city,
        country: room.currentRound.answer,
        landmark: room.currentRound.landmark,
      });
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
    const isCorrect = guess.trim().toLowerCase() === round.answer.toLowerCase();

    const entry: GuessEntry = {
      playerId: playerInfo.uuid,
      animal: playerInfo.animal,
      username: playerInfo.username,
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
    if (!room || !room.currentRound || !this.dbGameId) return;

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
              gameId: this.dbGameId,
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
              gameId: this.dbGameId,
              score: 1,
              date: today,
            },
          });
        }
      } catch (err) {
        console.error("Failed to save guess/score", err);
      }
    }

    const scores = await this.getScores();

    this.io.to(gameId).emit("round-end", {
      winner: winner
        ? {
            animal: winner.animal,
            username: winner.username,
            time: winner.time,
            playerId: winner.playerId,
          }
        : null,
      answer: round.answer,
      city: round.city,
      landmark: round.landmark,
      region: round.region,
      funFact: round.funFact,
      scores,
      nextRoundAt: Date.now() + SCOREBOARD_DURATION_MS,
    });
  }

  private async getScores() {
    if (!this.dbGameId) return [];
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const topScores = await prisma.dailyScore.findMany({
        where: {
          gameId: this.dbGameId,
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
      city: location.city,
      country: location.answer,
      landmark: location.landmark,
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
