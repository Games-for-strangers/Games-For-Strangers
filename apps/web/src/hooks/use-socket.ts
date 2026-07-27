"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface PlayerCountEvent {
  count: number;
}

interface NewRoundEvent {
  imageUrl: string;
  roundId: string;
  endTime: number;
  city: string;
  country: string;
  landmark: string;
}

interface GuessResultEvent {
  animal: string;
  time: number;
  correct: boolean;
  blurred: boolean;
}

interface RoundEndEvent {
  winner: { animal: string; username: string; time: number; playerId: string } | null;
  answer: string;
  city: string;
  landmark: string;
  region: string;
  funFact: string;
  scores: { playerId: string; username: string; score: number }[];
  nextRoundAt: number;
}

type GameEventHandlers = {
  onPlayerCount?: (data: PlayerCountEvent) => void;
  onNewRound?: (data: NewRoundEvent) => void;
  onGuessResult?: (data: GuessResultEvent) => void;
  onRoundEnd?: (data: RoundEndEvent) => void;
};

interface UseSocketOptions {
  gameId: string;
  playerInfo: {
    animal: string;
    color: string;
    username: string;
    uuid: string;
  } | null;
  handlers: GameEventHandlers;
  cfToken?: string | null;
}

export function useSocket({ gameId, playerInfo, handlers, cfToken }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!playerInfo) return;

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";
    const socket = io(serverUrl);

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id ?? null);
      socket.emit("join-game", {
        gameId,
        playerInfo: {
          animal: playerInfo.animal,
          color: playerInfo.color,
          username: playerInfo.username,
          uuid: playerInfo.uuid,
        },
        cfToken: cfToken ?? undefined,
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("player-count", (data: PlayerCountEvent) => {
      handlers.onPlayerCount?.(data);
    });

    socket.on("new-round", (data: NewRoundEvent) => {
      handlers.onNewRound?.(data);
    });

    socket.on("guess-result", (data: GuessResultEvent) => {
      handlers.onGuessResult?.(data);
    });

    socket.on("round-end", (data: RoundEndEvent) => {
      handlers.onRoundEnd?.(data);
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leave-game", { gameId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId, playerInfo?.animal, playerInfo?.color, playerInfo?.username, playerInfo?.uuid]);

  const submitGuess = useCallback((roundId: string, guess: string) => {
    socketRef.current?.emit("guess-submit", { gameId, roundId, guess, cfToken: cfToken ?? undefined });
  }, [gameId, cfToken]);

  return { connected, submitGuess, socketId };
}
