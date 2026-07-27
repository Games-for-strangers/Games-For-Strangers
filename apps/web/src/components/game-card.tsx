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
  const content = (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex flex-col gap-3 rounded-2xl border-2 p-6 transition-colors ${
        comingSoon
          ? "border-dashed opacity-50"
          : "hover:border-foreground/20 hover:shadow-sm"
      }`}
    >
      <Icon className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {comingSoon ? (
        <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
      ) : (
        <ArrowRight className="absolute bottom-6 right-6 size-5 transition-transform group-hover:translate-x-1" />
      )}
    </motion.div>
  );

  if (comingSoon || !href) return content;

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
