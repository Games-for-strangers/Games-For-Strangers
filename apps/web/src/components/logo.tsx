"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-lg font-bold tracking-tight">
      Games for{" "}
      <span className="bg-gradient-to-r from-brand-violet to-brand-blue bg-clip-text text-transparent">
        Strangers
      </span>
    </Link>
  );
}