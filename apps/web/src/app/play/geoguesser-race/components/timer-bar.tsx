"use client";

import { useEffect, useState } from "react";

interface TimerBarProps {
  endTime: number;
  onExpired?: () => void;
}

export function TimerBar({ endTime, onExpired }: TimerBarProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const remaining = endTime - now;
      if (remaining <= 0) {
        setProgress(0);
        onExpired?.();
        return;
      }
      const total = 60_000;
      setProgress((remaining / total) * 100);
    };

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [endTime, onExpired]);

  const color =
    progress > 50 ? "bg-emerald-500" : progress > 20 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all duration-200 ease-linear ${color}`}
        style={{ width: `${Math.max(0, progress)}%` }}
      />
    </div>
  );
}
