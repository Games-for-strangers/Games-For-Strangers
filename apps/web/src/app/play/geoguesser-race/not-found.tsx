import Link from "next/link";

export default function GameNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border-default bg-surface-base">
        <span className="text-4xl font-bold tracking-tight text-text-muted">??</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">
        Wrong coordinates
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        This game doesn&apos;t exist. Maybe it drifted to a different server.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/play/geoguesser-race"
          className="inline-flex h-12 items-center gap-2 rounded-md bg-gradient-to-r from-brand-violet to-brand-blue px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Play GeoGuesser Race
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-md border border-border-default px-6 text-sm font-semibold text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          All games
        </Link>
      </div>
    </div>
  );
}
