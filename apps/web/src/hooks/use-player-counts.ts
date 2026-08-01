"use client";

import { useEffect, useState } from "react";

export function usePlayerCounts() {
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";
        const res = await fetch(`${serverUrl}/api/games`);
        if (res.ok) {
          const games: { slug: string; activePlayers: number }[] = await res.json();
          const counts: Record<string, number> = {};
          for (const g of games) {
            counts[g.slug] = g.activePlayers;
          }
          setPlayerCounts(counts);
        }
      } catch {}
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 15_000);
    return () => clearInterval(interval);
  }, []);

  return playerCounts;
}