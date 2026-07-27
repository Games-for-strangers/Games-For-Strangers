import { cn } from "@gamesforstrangers/ui/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-radius-lg bg-surface-elevated",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
