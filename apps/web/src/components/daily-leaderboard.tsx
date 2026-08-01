"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { IdentityDisplay } from "@/components/identity-display";

interface ScoreEntry {
  playerId: string;
  username: string;
  score: number;
}

interface LeaderboardResponse {
  scores: ScoreEntry[];
  total: number;
  limit: number;
  offset: number;
}

const PAGE_SIZE = 25;

interface DailyLeaderboardProps {
  /** Game slug to fetch scores for */
  game: string;
  /** Shown above the leaderboard so multiple games can be told apart */
  gameTitle?: string;
}

export function DailyLeaderboard({ game, gameTitle }: DailyLeaderboardProps) {
  const { identity: playerIdentity } = usePlayerIdentity();
  const { identity: animalIdentity } = useAnonymousIdentity();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002";

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${serverUrl}/api/scores/daily?game=${game}&limit=${PAGE_SIZE}&offset=0`,
      );
      if (res.ok) {
        const data: LeaderboardResponse = await res.json();
        setScores(data.scores);
        setTotal(data.total);
        setOffset(PAGE_SIZE);
      }
    } catch {}
    setLoading(false);
  }, [serverUrl, game]);

  const fetchMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${serverUrl}/api/scores/daily?game=${game}&limit=${PAGE_SIZE}&offset=${offset}`,
      );
      if (res.ok) {
        const data: LeaderboardResponse = await res.json();
        setScores((prev) => [...prev, ...data.scores]);
        setOffset((prev) => prev + PAGE_SIZE);
      }
    } catch {}
    setLoadingMore(false);
  }, [serverUrl, game, offset]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    const interval = setInterval(fetchInitial, 15_000);
    return () => clearInterval(interval);
  }, [fetchInitial]);

  const hasMore = scores.length < total;

  return (
    <section className="mt-16">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold tracking-tight text-text-primary">Today&apos;s Leaderboard</h2>
        <p className="mt-1 text-xs text-text-muted">
          {gameTitle ? `${gameTitle} — top strangers of the day` : "Top strangers of the day"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-violet" />
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-blue [animation-delay:150ms]" />
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-cyan [animation-delay:300ms]" />
          </div>
        </div>
      ) : scores.length === 0 ? (
        <div className="rounded-radius-xl border border-border-default bg-surface-base px-6 py-12 text-center">
          <p className="text-sm text-text-muted">No scores yet today. Be the first!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-radius-xl border border-border-default bg-surface-base">
          <AnimatePresence mode="popLayout">
            {scores.map((entry, i) => {
              const rank = i + 1;
              const isMe = playerIdentity?.uuid === entry.playerId;
              return (
                <motion.div
                  key={`${entry.playerId}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: i * 0.015 }}
                  className={`flex items-center gap-3 border-b border-border-default px-4 py-2.5 text-sm last:border-0 ${
                    isMe ? "bg-brand-violet/[0.06]" : ""
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      rank <= 3
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                        : "bg-white/5 text-text-muted"
                    }`}
                  >
                    {rank}
                  </span>

                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    <IdentityDisplay animal={animalIdentity?.animal ?? ""} color={"#888"} size="sm" />
                    <span className={`truncate ${isMe ? "font-semibold text-brand-violet" : "text-text-primary"}`}>
                      {entry.username}
                      {isMe ? " (you)" : ""}
                    </span>
                  </span>

                  <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-text-muted">
                    {entry.score} {entry.score === 1 ? "pt" : "pts"}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {hasMore ? (
            <div className="border-t border-border-default px-4 py-3 text-center">
              <button
                onClick={fetchMore}
                disabled={loadingMore}
                className="inline-flex h-9 items-center gap-1.5 rounded-radius-md border border-border-default bg-surface-base px-4 text-xs font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loadingMore ? (
                  <>
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-brand-violet" />
                    Loading...
                  </>
                ) : (
                  `Load More (${scores.length} of ${total})`
                )}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
