"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HintSystemProps {
  hints: string[];
  tokens: number;
  onSpendToken: () => boolean;
}

const HINT_COST = 1;

export function HintSystem({ hints, tokens, onSpendToken }: HintSystemProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [justSpent, setJustSpent] = useState(false);

  const canReveal = revealedCount < hints.length && tokens >= HINT_COST;

  function handleReveal() {
    if (!canReveal) return;
    if (!onSpendToken()) return;
    setRevealedCount((c) => c + 1);
    setJustSpent(true);
    setTimeout(() => setJustSpent(false), 400);
  }

  const remainingHints = hints.length - revealedCount;

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: revealedCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="overflow-hidden rounded-lg border border-brand-violet/30 bg-brand-violet/10 px-3 py-2 text-xs text-text-secondary"
          >
            <span className="mr-1.5 opacity-50">Hint {i + 1}:</span>
            {hints[i]}
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={handleReveal}
        disabled={!canReveal}
        className={`flex items-center gap-2 self-start rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
          canReveal
            ? "border-brand-violet/40 text-brand-violet hover:bg-brand-violet/10 active:scale-95"
            : "border-white/10 text-text-muted opacity-40"
        } ${justSpent ? "scale-95" : ""}`}
      >
        {canReveal && remainingHints > 0 ? (
          <>
            <span className="flex h-4 w-4 items-center justify-center rounded bg-brand-violet/20 text-[10px] font-bold">
              ?
            </span>
            Reveal hint ({remainingHints} left, {HINT_COST} token each)
          </>
        ) : remainingHints === 0 ? (
          <>
            <span className="text-green-400">✓</span>
            All hints revealed
          </>
        ) : (
          <>
            <span className="text-amber-400">!</span>
            No tokens ({remainingHints} hints remaining)
          </>
        )}
      </button>
    </div>
  );
}
