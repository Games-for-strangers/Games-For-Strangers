"use client";

import { ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePlayerCounts } from "@/hooks/use-player-counts";
import { getAccent } from "@/lib/game-accents";

const SLUG = "geoguesser-race";

export function FeaturedGame() {
  const playerCounts = usePlayerCounts();
  const count = playerCounts[SLUG] ?? 0;
  const accent = getAccent(SLUG);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl border ${accent.border} ${accent.cover} ${accent.glow} min-h-[300px]`}
    >
      <Globe className="absolute -bottom-8 -right-8 size-64 opacity-15 rotate-12 text-white" />

      <div className="relative flex flex-col gap-4 p-8 sm:p-10">
        <span className="type-eyebrow inline-block self-start rounded-full bg-white/10 px-3 py-1">
          Featured
        </span>

        <h1 className="max-w-lg text-4xl font-extrabold tracking-tight sm:text-5xl">
          GeoGuesser Race
        </h1>

        <p className="max-w-md text-sm text-text-secondary sm:text-base">
          Race strangers to guess the country from a Street View image.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
            <span className={`font-mono tabular-nums ${accent.text}`}>
              {count}
            </span>{" "}
            playing now
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            20s rounds
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
            Daily leaderboard
          </span>
        </div>

        <Link
          href="/play/geoguesser-race"
          className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-blue px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
        >
          Play Now
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}