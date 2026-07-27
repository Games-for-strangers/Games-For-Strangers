export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex items-center gap-1">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-violet" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-blue [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-cyan [animation-delay:300ms]" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">
        Loading...
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Warming up the servers
      </p>
    </div>
  );
}
