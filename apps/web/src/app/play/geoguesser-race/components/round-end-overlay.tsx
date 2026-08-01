"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { RoundEndEvent } from "@/hooks/use-socket";

const ReviewMap = dynamic(
  () => import("./review-map").then((m) => m.ReviewMap),
  { ssr: false, loading: () => <div className="h-48 w-full animate-pulse rounded-xl bg-white/5 sm:h-56" /> },
);

const CIRCUMFERENCE = 2 * Math.PI * 40;

interface RoundEndOverlayProps {
  data: RoundEndEvent;
  playerId: string | null;
}

export function RoundEndOverlay({ data, playerId }: RoundEndOverlayProps) {
  const isWinner = data.winner !== null && data.winner.playerId === playerId;
  const endRef = useRef(data.nextRoundAt);
  endRef.current = data.nextRoundAt;

  const [countdownMs, setCountdownMs] = useState(() => {
    return Math.max(0, data.nextRoundAt - Date.now());
  });

  useEffect(() => {
    const tick = () => {
      const remaining = endRef.current - Date.now();
      if (remaining <= 0) {
        setCountdownMs(0);
        return;
      }
      setCountdownMs(remaining);
    };

    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  const progress = Math.max(0, Math.min(1, countdownMs / 10_000));
  const seconds = Math.max(0, Math.ceil(countdownMs / 1000));

  const playerGuess = playerId && data.guesses
    ? data.guesses.find((g) => g.username === playerId)
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        {/* Answer card */}
        <div className="space-y-4 rounded-3xl border border-border-default bg-surface-base/80 p-6 shadow-lg sm:p-8 text-center">
          {data.winner ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="space-y-1"
            >
              <p className="text-3xl sm:text-4xl">{data.winner.animal}</p>
              <p className="text-lg font-bold">
                {isWinner ? "You got it!" : `${data.winner.username} got it!`}
              </p>
              <p className="text-sm text-muted-foreground">
                {((data.winner.time) / 1000).toFixed(1)}s
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
        </div>

        {/* Map */}
        {data.lat != null && data.lng != null ? (
          <ReviewMap
            lat={data.lat}
            lng={data.lng}
            city={data.city}
            country={data.answer}
            guesses={data.guesses}
          />
        ) : null}

        {/* Fun fact + guesses row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {data.funFact ? (
            <div className="flex-1 rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Did you know?</p>
              <p className="mt-1 text-xs italic text-text-secondary">
                &ldquo;{data.funFact}&rdquo;
              </p>
            </div>
          ) : null}

          {data.guesses && data.guesses.length > 0 ? (
            <div className="flex-1 rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Guesses</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {data.guesses.map((g, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                      g.correct
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {g.animal} {g.guess}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Leaderboard */}
        {data.scores.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Today&apos;s strangers</p>
            <div className="space-y-1">
              {data.scores.slice(0, 5).map((s, i) => (
                <div
                  key={s.playerId}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span>
                    {i + 1}. {s.playerId === playerId ? "You" : s.username}
                  </span>
                  <span className="font-medium">
                    {s.score} {s.score === 1 ? "point" : "points"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Countdown */}
        <div className="flex flex-col items-center gap-1">
          <svg width="56" height="56" viewBox="0 0 100 100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-white/10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={false}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
              className={
                progress > 0.3
                  ? "text-brand-violet"
                  : progress > 0.1
                    ? "text-amber-400"
                    : "text-red-500"
              }
            />
          </svg>
          <motion.span
            key={seconds}
            initial={seconds <= 5 ? { scale: 1.4 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className={`text-xs font-mono font-bold tabular-nums ${
              seconds <= 5 ? "text-red-500" : "text-text-muted"
            }`}
          >
            {seconds}s
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
