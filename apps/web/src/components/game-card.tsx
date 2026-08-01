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
}

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function GameCard({ title, description, icon: Icon, href, comingSoon }: GameCardProps) {
  if (comingSoon) {
    return (
      <motion.div
        variants={cardVariants}
        className="group relative flex flex-col gap-3 rounded-2xl border border-dashed border-border-default bg-surface-base/50 p-6 opacity-50 transition-all duration-300"
      >
        <Icon className="size-10 text-text-muted/40" strokeWidth={1.5} />
        <div>
          <h3 className="text-lg font-semibold text-text-muted/60">{title}</h3>
          <p className="mt-1 text-sm text-text-muted/40">{description}</p>
        </div>
        <span className="text-xs font-medium text-text-muted/40">Coming soon</span>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants}>
      <Link href={href ?? "#"}>
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group relative flex flex-col gap-4 rounded-2xl border border-brand-violet/30 bg-gradient-to-br from-surface-strong via-surface-strong to-surface-elevated p-8 shadow-lg shadow-brand-violet/5 transition-all duration-300 hover:border-brand-violet/60 hover:shadow-xl hover:shadow-brand-violet/10"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-violet/[0.04] to-brand-blue/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex items-start justify-between">
            <Icon className="size-12 text-brand-violet/80" strokeWidth={1.5} />
            <ArrowRight className="size-5 text-brand-violet/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-violet" />
          </div>

          <div className="relative space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
