export default function GameLoading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6 h-24 w-full max-w-xs overflow-hidden rounded-2xl bg-surface-base">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
      <div className="mb-6 flex items-center gap-1">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-violet" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-blue [animation-delay:200ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-cyan [animation-delay:400ms]" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">
        Finding a place...
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Dropping a pin somewhere in the world
      </p>
    </div>
  );
}
