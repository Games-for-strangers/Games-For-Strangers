import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Games for Strangers",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-radius-2xl border border-border-default bg-surface-base">
        <span className="text-4xl font-bold tracking-tight text-text-muted">?</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">
        Nowhere to be found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        This page drifted off into the void. There&apos;s nothing here but cosmic dust.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-radius-md bg-gradient-to-r from-brand-violet to-brand-blue px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to games
      </Link>
    </div>
  );
}
