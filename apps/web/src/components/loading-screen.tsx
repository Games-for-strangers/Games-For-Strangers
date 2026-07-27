"use client";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-32">
      <div className="h-2 w-32 animate-pulse rounded-full bg-muted-foreground/20" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
