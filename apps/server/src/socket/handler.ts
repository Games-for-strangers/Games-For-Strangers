import type { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "@gamesforstrangers/env/server";
import { gameState } from "../state";
import { RoundManager } from "./round-manager";

export function createSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  gameState.setIO(io);

  const roundManager = new RoundManager(io);
  roundManager.init().catch(console.error);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      "join-game",
      ({ gameId, playerInfo }: { gameId: string; playerInfo: { animal: string; color: string } }) => {
        roundManager.joinGame(socket, gameId, playerInfo);
      },
    );

    socket.on(
      "guess-submit",
      ({ gameId, roundId, guess }: { gameId: string; roundId: string; guess: string }) => {
        roundManager.submitGuess(socket, gameId, roundId, guess);
      },
    );

    socket.on("leave-game", ({ gameId }: { gameId: string }) => {
      roundManager.leaveGame(socket, gameId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      roundManager.disconnect(socket);
    });
  });

  return io;
}
