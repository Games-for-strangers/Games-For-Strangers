import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@gamesforstrangers/ui/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[60px] w-full min-w-0 rounded-radius-lg border border-border-strong bg-surface-base px-5 py-1 text-base transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-subtle focus-visible:border-brand-violet focus-visible:ring-4 focus-visible:ring-brand-violet/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
