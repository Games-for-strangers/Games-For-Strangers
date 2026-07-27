"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TimerBarProps {
  endTime: number;
  onExpired?: () => void;
}

export function TimerBar({ endTime, onExpired }: TimerBarProps) {
  const [progress, setProgress] = useState(100);
  const [remainingMs, setRemainingMs] = useState(0);
  const [secondTick, setSecondTick] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;

    const tick = () => {
      const now = Date.now();
      const remaining = endTime - now;
      if (remaining <= 0) {
        setProgress(0);
        setRemainingMs(0);
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpired?.();
        }
        return;
      }
      const total = 60_000;
      setProgress((remaining / total) * 100);
      setRemainingMs(remaining);
    };

    tick();

    const secondInterval = setInterval(() => {
      setSecondTick((prev) => prev + 1);
    }, 1000);

    const interval = setInterval(tick, 50);
    return () => {
      clearInterval(interval);
      clearInterval(secondInterval);
    };
  }, [endTime, onExpired]);

  const secondsLeft = Math.max(0, remainingMs / 1000);
  const isDanger = secondsLeft <= 5;
  const color =
    progress > 50 ? "bg-emerald-500" : progress > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <motion.div
        key={isDanger ? Math.floor(secondsLeft) : "safe"}
        animate={
          isDanger
            ? {
                x: [0, -2, 2, -2, 2, -1, 1, -1, 1, 0],
                scale: [1, 1.25, 1],
              }
            : { x: 0, scale: 1 }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`font-mono text-xs font-bold tabular-nums ${
          isDanger ? "text-red-500" : "text-text-muted"
        }`}
      >
        {secondsLeft.toFixed(1)}s
      </motion.div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-200 ease-linear ${color}`}
          style={{ width: `${Math.max(0, progress)}%` }}
        />
      </div>
    </div>
  );
}
