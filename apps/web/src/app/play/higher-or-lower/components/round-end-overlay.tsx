"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { HigherLowerChoice, HigherLowerRoundEndEvent, RevealedCountry } from "../types";
import { flagEmoji, formatStatValue, statLabel } from "../types";

interface RoundEndOverlayProps {
  data: HigherLowerRoundEndEvent;
  playerId: string | null;
  myGuess: HigherLowerChoice | null;
}

export function RoundEndOverlay({ data, playerId, myGuess }: RoundEndOverlayProps) {
  const endRef = useRef(data.nextRoundAt);
  endRef.current = data.nextRoundAt;

  const [countdownMs, setCountdownMs] = useState(() =>
    Math.max(0, data.nextRoundAt - Date.now()),
  );

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

  const guessedCorrectly =
    myGuess !== null && data.winners.some((w) => w.playerId === playerId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-border-default bg-surface-base/80 p-6 shadow-lg sm:p-8">
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="space-y-1"
            >
              <p className="text-lg font-bold">
                {guessedCorrectly
                  ? "You got it! +1 pt"
                  : data.winners.length > 0
                    ? `${data.winners.length} ${data.winners.length === 1 ? "stranger" : "strangers"} got it right!`
                    : "Time's up!"}
              </p>
              <p className="text-sm text-muted-foreground">
                The answer was{" "}
                <span className={`font-semibold ${data.answer === "higher" ? "text-emerald-400" : "text-red-400"}`}>
                  {data.answer.toUpperCase()}
                </span>
              </p>
            </motion.div>

            <div className="flex items-stretch gap-3">
              <RevealCard country={data.countryA} stat={data.stat} isLarger={data.answer === "higher"} />
              <div className="flex items-center text-xs font-bold text-text-muted">VS</div>
              <RevealCard country={data.countryB} stat={data.stat} isLarger={data.answer === "lower"} />
            </div>

            <p className="text-xs text-muted-foreground">
              {data.countryA.name} has a {data.answer} {statLabel(data.stat)} than {data.countryB.name}
            </p>

            {data.winners.length > 0 ? (
              <div className="rounded-xl bg-white/5 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Correct guesses
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {data.winners.map((w) => (
                    <span
                      key={w.playerId}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                        w.playerId === playerId
                          ? "bg-brand-violet/20 text-brand-violet"
                          : "bg-green-500/15 text-green-400"
                      }`}
                    >
                      {w.username}
                      <span className="text-[10px] opacity-70">{(w.time / 1000).toFixed(1)}s</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col items-center gap-1.5">
            <p className="text-xs text-text-muted">
              Next round in <span className="font-mono font-bold tabular-nums">{seconds}s</span>
            </p>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-violet transition-all duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RevealCard({
  country,
  stat,
  isLarger,
}: {
  country: RevealedCountry;
  stat: HigherLowerRoundEndEvent["stat"];
  isLarger: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 ${
        isLarger ? "border-emerald-500/50 bg-emerald-500/[0.06]" : "border-border-default bg-muted"
      }`}
    >
      <span className="text-4xl">{flagEmoji(country.code)}</span>
      <span className="text-center text-sm font-semibold text-text-primary">
        {country.name}
      </span>
      <span className={`font-mono text-sm font-bold tabular-nums ${isLarger ? "text-emerald-400" : "text-text-muted"}`}>
        {formatStatValue(stat, country.value)}
      </span>
    </motion.div>
  );
}
