"use client";

import { useCallback, useEffect, useState } from "react";

const TOKENS_KEY = "gfs_hint_tokens";
const ROUNDS_KEY = "gfs_hint_rounds_counted";

// 1 token per round played, max 10 saved
const MAX_TOKENS = 10;

function loadRoundsCounted(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(ROUNDS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function loadTokens(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(TOKENS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveTokens(n: number) {
  try {
    localStorage.setItem(TOKENS_KEY, String(n));
  } catch {
    // Storage full or blocked
  }
}

function saveRoundsCounted(n: number) {
  try {
    localStorage.setItem(ROUNDS_KEY, String(n));
  } catch {
    // Storage full or blocked
  }
}

export function useHintTokens() {
  const [tokens, setTokens] = useState(loadTokens);
  const [roundsCounted, setRoundsCounted] = useState(loadRoundsCounted);

  // Call this when a new round starts to earn a token
  const earnForRound = useCallback(() => {
    const current = loadRoundsCounted();
    const newCount = current + 1;
    saveRoundsCounted(newCount);
    setRoundsCounted(newCount);

    const currentTokens = loadTokens();
    if (currentTokens < MAX_TOKENS) {
      const earned = currentTokens + 1;
      saveTokens(earned);
      setTokens(earned);
    }
  }, []);

  const spendToken = useCallback(() => {
    const current = loadTokens();
    if (current <= 0) return false;
    const newCount = current - 1;
    saveTokens(newCount);
    setTokens(newCount);
    return true;
  }, []);

  const reset = useCallback(() => {
    saveTokens(0);
    saveRoundsCounted(0);
    setTokens(0);
    setRoundsCounted(0);
  }, []);

  return { tokens, roundsCounted, earnForRound, spendToken, reset };
}
