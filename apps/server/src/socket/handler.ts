import type { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "socket.io";
import type http from "node:http";
import { env } from "@gamesforstrangers/env/server";
import { RoundManager } from "./round-manager";
import { verifyTurnstileToken } from "../turnstile";

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "join-game": { max: 10, windowMs: 60_000 },
  "guess-submit": { max: 30, windowMs: 60_000 },
  "leave-game": { max: 10, windowMs: 60_000 },
};

function createSocketRateLimiter() {
  const counts = new Map<string, Map<string, { count: number; resetAt: number }>>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, events] of counts) {
      for (const [ip, entry] of events) {
        if (now > entry.resetAt) events.delete(ip);
      }
      if (events.size === 0) counts.delete(key);
    }
  }, 60_000);

  if (typeof cleanup.unref === "function") cleanup.unref();

  return (event: string, socket: Socket): boolean => {
    const limit = RATE_LIMITS[event];
    if (!limit) return true;

    const ip = socket.handshake.address;
    const now = Date.now();

    if (!counts.has(event)) counts.set(event, new Map());
    const events = counts.get(event)!;

    const entry = events.get(ip);
    if (!entry || now > entry.resetAt) {
      events.set(ip, { count: 1, resetAt: now + limit.windowMs });
      return true;
    }

    if (entry.count >= limit.max) {
      socket.emit("rate-limited", { event, retryAfter: entry.resetAt - now });
      return false;
    }

    entry.count++;
    return true;
  };
}

const socketRateLimit = createSocketRateLimiter();

export function createSocketServer(httpServer: http.Server) {
  const io: SocketIOServer = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  const roundManager = new RoundManager(io);
  roundManager.init();

  io.on("connection", (socket: Socket) => {
    socket.on("join-game", async (data: { gameId: string; playerInfo: { animal: string; color: string; username: string; uuid: string }; cfToken?: string }) => {
      if (!socketRateLimit("join-game", socket)) return;
      if (data.cfToken && !(await verifyTurnstileToken(data.cfToken))) {
        socket.emit("turnstile-error", { event: "join-game" });
        return;
      }
      roundManager.joinGame(socket, data.gameId, data.playerInfo);
    });

    socket.on("guess-submit", async (data: { gameId: string; roundId: string; guess: string; cfToken?: string }) => {
      if (!socketRateLimit("guess-submit", socket)) return;
      if (data.cfToken && !(await verifyTurnstileToken(data.cfToken))) {
        socket.emit("turnstile-error", { event: "guess-submit" });
        return;
      }
      roundManager.submitGuess(socket, data.gameId, data.roundId, data.guess);
    });

    socket.on("leave-game", (data: { gameId: string }) => {
      if (!socketRateLimit("leave-game", socket)) return;
      roundManager.leaveGame(socket, data.gameId);
    });

    socket.on("disconnect", () => {
      roundManager.disconnect(socket);
    });
  });

  return io;
}
