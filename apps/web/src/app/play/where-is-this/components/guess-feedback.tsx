"use client";

import { useEffect, useState } from "react";

export type GuessFeedbackState =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "correct"; time: number; animal: string }
  | { type: "incorrect"; animal: string }
  | { type: "blurred"; animal: string; time: number };

interface GuessFeedbackProps {
  state: GuessFeedbackState;
  onDismiss?: () => void;
}

export function GuessFeedback({ state, onDismiss }: GuessFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.type === "idle") {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (state.type !== "pending") {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, onDismiss]);

  if (!visible) return null;

  if (state.type === "pending") {
    return (
      <div className="rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground">
        Checking...
      </div>
    );
  }

  if (state.type === "correct") {
    return (
      <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        Correct! ({((state.time) / 1000).toFixed(1)}s)
      </div>
    );
  }

  if (state.type === "incorrect") {
    return (
      <div className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400">
        Nope, try again!
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground">
      {state.animal} guessed ({((state.time) / 1000).toFixed(1)}s)
    </div>
  );
}
