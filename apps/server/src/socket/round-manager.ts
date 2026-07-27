import type { Server as SocketIOServer, Socket } from "socket.io";
import prisma from "@gamesforstrangers/db";
import { gameState } from "../state";
import { LOCATIONS } from "../locations";
import { generateHints, getLocationCoords } from "../geo-data";

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
  hints: string[];
  lat: number;
  lng: number;
}

const GAME_SLUG = "geoguesser-race";
const ROUND_DURATION_MS = 20_000;
const SCOREBOARD_DURATION_MS = 10_000;
const CYCLE_DURATION_MS = ROUND_DURATION_MS + SCOREBOARD_DURATION_MS;
let idCounter = 0;

function makeRoundId(): string {
  return `round_${++idCounter}_${Date.now()}`;
}

export class RoundManager {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private locationRounds: RoundState[] = [];
  private usedIndices: Set<number> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private dbGameId: string | null = null;
  private dbReady: Promise<string | null>;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.dbReady = this.resolveDbGameId();
  }

  private async resolveDbGameId(): Promise<string | null> {
    try {
      const game = await prisma.game.findUnique({ where: { slug: GAME_SLUG } });
      if (game) {
        this.dbGameId = game.id;
        return game.id;
      }
      console.warn(`Game "${GAME_SLUG}" not found in DB — scores won't persist`);
    } catch (err) {
      console.warn("DB unavailable — scores won't persist", String(err));
    }
    return null;
  }

  async init() {
    const coordsCache = new Map<string, { lat: number; lng: number }>();
    const hintsCache = new Map<string, string[]>();
    this.locationRounds = LOCATIONS.map((loc) => {
      const cacheKey = `${loc.country}:${loc.city}`;
      if (!coordsCache.has(cacheKey)) {
        coordsCache.set(cacheKey, getLocationCoords(loc.country, loc.city));
      }
      if (!hintsCache.has(loc.country)) {
        hintsCache.set(loc.country, generateHints(loc.country));
      }
      const coords = coordsCache.get(cacheKey)!;
      return {
        roundId: makeRoundId(),
        imageUrl: loc.url,
        answer: loc.country,
        city: loc.city,
        landmark: loc.landmark,
        region: loc.region,
        funFact: loc.funFact,
        startedAt: new Date(),
        guesses: [],
        hints: hintsCache.get(loc.country)!,
        lat: coords.lat,
        lng: coords.lng,
      };
    });
    console.log(`Loaded ${this.locationRounds.length} locations from hard-coded data`);
    this.startCycle();
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
    const src = this.locationRounds[idx]!;
    return {
      roundId: makeRoundId(),
      guesses: [],
      imageUrl: src.imageUrl,
      answer: src.answer,
      city: src.city,
      landmark: src.landmark,
      region: src.region,
      funFact: src.funFact,
      startedAt: src.startedAt,
      hints: src.hints,
      lat: src.lat,
      lng: src.lng,
    };
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
        hints: room.currentRound.hints,
        lat: room.currentRound.lat,
        lng: room.currentRound.lng,
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
    if (!room || !room.currentRound) return;

    const round = room.currentRound;
    const winner = round.guesses.find((g) => g.correct);

    if (winner) {
      const gameIdResolved = await this.dbReady;
      if (gameIdResolved) {
        try {
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);

          const existing = await prisma.dailyScore.findUnique({
            where: {
              playerId_gameId_date: {
                playerId: winner.playerId,
                gameId: gameIdResolved,
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
                gameId: gameIdResolved,
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
      lat: round.lat,
      lng: round.lng,
      guesses: round.guesses.map((g) => ({
        animal: g.animal,
        username: g.username,
        guess: g.guess,
        correct: g.correct,
        time: g.time,
      })),
      scores,
      nextRoundAt: Date.now() + SCOREBOARD_DURATION_MS,
    });
  }

  private async getScores() {
    const gameIdResolved = await this.dbReady;
    if (!gameIdResolved) return [];
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const topScores = await prisma.dailyScore.findMany({
        where: {
          gameId: gameIdResolved,
          date: today,
        },
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

    const location = this.getRandomLocation();
    const startedAt = new Date();

    room.currentRound = {
      roundId: location.roundId,
      imageUrl: location.imageUrl,
      answer: location.answer,
      city: location.city,
      landmark: location.landmark,
      region: location.region,
      funFact: location.funFact,
      hints: location.hints,
      lat: location.lat,
      lng: location.lng,
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
      hints: location.hints,
      lat: location.lat,
      lng: location.lng,
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
