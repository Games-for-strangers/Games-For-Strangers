"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="font-medium hover:underline underline-offset-2">
            Games for Strangers
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
