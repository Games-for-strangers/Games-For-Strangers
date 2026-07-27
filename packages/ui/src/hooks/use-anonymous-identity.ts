"use client";

import { useCallback, useEffect, useState } from "react";

const ANIMALS = [
  "🦊", "🐸", "🦝", "🐨", "🦁",
  "🐯", "🐱", "🐶", "🐺", "🐻",
  "🐼", "🐹", "🐰", "🦄", "🐙",
  "🦋", "🐢", "🦉", "🐧", "🦥",
] as const;

const COLORS = [
  "#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#E8BAFF",
  "#FFD9BA", "#BAFFEA", "#FFBAF0", "#C9BAFF", "#FFE5BA",
  "#B3FFD9", "#FFB3D9", "#D9FFB3", "#B3D9FF", "#FFC9BA",
  "#BAFFB3", "#E5B3FF", "#FFD9B3", "#B3FFF0", "#FFB3C9",
] as const;

const STORAGE_KEY = "gfs_identity";

interface Identity {
  animal: string;
  color: string;
}

function generateIdentity(): Identity {
  return {
    animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export function useAnonymousIdentity() {
  const [identity, setIdentityState] = useState<Identity | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setIdentityState(JSON.parse(stored));
        return;
      } catch {}
    }
    const fresh = generateIdentity();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setIdentityState(fresh);
  }, []);

  const setIdentity = useCallback((identity: Identity) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    setIdentityState(identity);
  }, []);

  const setAnimal = useCallback((animal: string) => {
    setIdentityState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, animal };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { identity, setAnimal, setIdentity, allAnimals: ANIMALS, allColors: COLORS };
}
