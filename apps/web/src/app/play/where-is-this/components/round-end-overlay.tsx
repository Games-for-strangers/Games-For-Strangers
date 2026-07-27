"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { RoundEndEvent } from "@/hooks/use-socket";

interface RoundEndOverlayProps {
  data: RoundEndEvent;
  playerId: string | null;
}

export function RoundEndOverlay({ data, playerId }: RoundEndOverlayProps) {
  const isWinner = data.winner !== null && data.winner.playerId === playerId;
  const [countdown, setCountdown] = useState<number>(() => {
    const remaining = data.nextRoundAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      const remaining = data.nextRoundAt - Date.now();
      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(id);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 200);
    return () => clearInterval(id);
  }, [data.nextRoundAt, countdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto w-full max-w-md space-y-6 px-6 text-center">
        {data.winner ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="space-y-2"
          >
            <p className="text-4xl">{data.winner.animal}</p>
            <p className="text-lg font-bold">
              {isWinner ? "You won!" : `${data.winner.animal} got it first!`}
            </p>
            <p className="text-sm text-muted-foreground">
              in {((data.winner.time) / 1000).toFixed(1)}s
            </p>
          </motion.div>
        ) : (
          <p className="text-lg font-bold">Time&apos;s up!</p>
        )}

        <div className="rounded-xl bg-muted p-4">
          <p className="text-xs text-muted-foreground">The answer was</p>
          <p className="mt-1 text-2xl font-bold">{data.answer}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.city}, {data.landmark}
          </p>
        </div>

        {data.funFact ? (
          <p className="text-xs italic text-muted-foreground">&ldquo;{data.funFact}&rdquo;</p>
        ) : null}

        {data.scores.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Today&apos;s scores</p>
            <div className="space-y-1">
              {data.scores.slice(0, 5).map((s, i) => (
                <div
                  key={s.playerId}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span>
                    {i + 1}. {s.playerId === playerId ? "You" : s.playerId.slice(0, 6)}
                  </span>
                  <span className="font-medium">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Next round in <span className="font-mono font-medium">{countdown}s</span>
        </p>
      </div>
    </motion.div>
  );
}
