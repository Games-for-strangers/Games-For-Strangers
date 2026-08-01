"use client";

import { motion } from "framer-motion";
import type { PublicCountry, HigherLowerStat } from "../types";
import { flagEmoji, statLabel } from "../types";

interface StatPromptProps {
  stat: HigherLowerStat;
  countryA: PublicCountry;
  countryB: PublicCountry;
}

export function StatPrompt({ stat, countryA, countryB }: StatPromptProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <motion.p
        key={`${countryA.code}-${countryB.code}-${stat}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-text-muted"
      >
        Does{" "}
        <span className="font-semibold text-text-primary">{countryA.name}</span>{" "}
        have a higher or lower{" "}
        <span className="font-semibold text-brand-violet">{statLabel(stat)}</span>{" "}
        than{" "}
        <span className="font-semibold text-text-primary">{countryB.name}</span>?
      </motion.p>

      <div className="flex w-full max-w-md items-stretch gap-3">
        <CountryCard country={countryA} highlight />
        <div className="flex items-center text-xs font-bold text-text-muted">VS</div>
        <CountryCard country={countryB} />
      </div>
    </div>
  );
}

function CountryCard({ country, highlight }: { country: PublicCountry; highlight?: boolean }) {
  return (
    <motion.div
      key={country.code}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border bg-surface-base p-5 ${
        highlight ? "border-brand-violet/40" : "border-border-default"
      }`}
    >
      <span className="text-5xl">{flagEmoji(country.code)}</span>
      <span className="text-center text-sm font-semibold text-text-primary">
        {country.name}
      </span>
    </motion.div>
  );
}
