"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    console.error(error);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      reset();
      return;
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, reset]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-radius-2xl border border-border-default bg-surface-base">
        <span className="text-4xl font-bold tracking-tight text-status-error">!</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">
        Something got tangled
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        A cosmic hiccup. Nothing is broken — the universe just blinked.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-radius-md bg-gradient-to-r from-brand-violet to-brand-blue px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Try again{countdown > 0 ? ` (${countdown}s)` : ""}
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-radius-md border border-border-default px-6 text-sm font-semibold text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          Back to games
        </Link>
      </div>
    </div>
  );
}
