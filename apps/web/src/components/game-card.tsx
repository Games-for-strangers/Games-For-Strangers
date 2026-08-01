"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
  slug?: string;
  playersOnline?: number;
}

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const COVER_GEO = "bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.45),transparent_60%),linear-gradient(135deg,#1a2340,rgba(59,130,246,0.25))]";
const COVER_HL = "bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.4),transparent_60%),linear-gradient(135deg,#1a2340,rgba(251,191,36,0.2))]";

const CARD_BORDER_GEO = "border-brand-violet/30 hover:border-brand-violet/60 shadow-glow-violet";
const CARD_BORDER_HL = "border-brand-pink/30 hover:border-brand-pink/60 shadow-glow-pink";

const CHIP_GEO = "bg-brand-violet/15 text-brand-violet";
const CHIP_HL = "bg-brand-pink/15 text-brand-pink";
const DOT_GEO = "bg-brand-violet";
const DOT_HL = "bg-brand-pink";

export function GameCard({ title, description, icon: Icon, href, comingSoon, slug, playersOnline }: GameCardProps) {
  if (comingSoon) {
    return (
      <motion.div
        variants={cardVariants}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-border-default bg-surface-base/50 opacity-50 transition-all duration-300"
      >
        <div className="flex h-28 items-center justify-center bg-surface-strong">
          <Icon className="size-12 text-text-muted/40" strokeWidth={1.5} />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-text-muted/60">{title}</h3>
          <p className="mt-1 text-sm text-text-muted/40">{description}</p>
        </div>
        <div className="px-5 pb-5">
          <span className="text-xs font-medium text-text-muted/40">Coming soon</span>
        </div>
      </motion.div>
    );
  }

  const isGeo = slug === "geoguesser-race";
  const isHl = slug === "higher-or-lower";
  const cover = isGeo ? COVER_GEO : isHl ? COVER_HL : "bg-surface-strong";
  const cardBorder = isGeo ? CARD_BORDER_GEO : isHl ? CARD_BORDER_HL : "border-border-default shadow-lg hover:border-border-strong hover:shadow-xl";
  const chip = isGeo ? CHIP_GEO : isHl ? CHIP_HL : null;
  const dot = isGeo ? DOT_GEO : isHl ? DOT_HL : null;
  const accentText = isGeo ? "text-brand-violet" : isHl ? "text-brand-pink" : "text-text-muted";

  const showPlayerChip = playersOnline !== undefined && playersOnline > 0;

  return (
    <motion.div variants={cardVariants}>
      <Link href={(href ?? "/") as any}>
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${cardBorder}`}
        >
          <div className={`relative flex h-28 items-center justify-center ${cover}`}>
            <Icon className="size-12 text-white/80" strokeWidth={1.5} />
            {showPlayerChip ? (
              <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="font-mono tabular-nums">{playersOnline}</span> playing
              </span>
            ) : null}
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-text-muted">{description}</p>
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <span className={`text-xs font-semibold ${accentText}`}>
              Play now
            </span>
            <ArrowRight
              className={`size-4 transition-all duration-300 group-hover:translate-x-1 ${accentText}`}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}