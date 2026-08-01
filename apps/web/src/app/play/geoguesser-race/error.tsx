"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-default bg-surface-base">
        <span className="text-4xl font-bold tracking-tight text-status-error">!</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">
        Connection lost
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        The game server blinked. Don&apos;t worry — your score is safe in the void.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-blue px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Reconnect
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-full border border-border-default px-6 text-sm font-semibold text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          Back to games
        </Link>
      </div>
    </div>
  );
}
