import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@gamesforstrangers/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-brand-violet focus-visible:ring-1 focus-visible:ring-brand-violet/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-status-error aria-invalid:ring-1 aria-invalid:ring-status-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-brand-violet to-brand-blue text-white hover:brightness-110",
        secondary:
          "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-text-primary",
        ghost:
          "bg-transparent text-text-muted hover:bg-white/5 hover:text-text-primary",
        destructive:
          "bg-status-error/10 text-status-error hover:bg-status-error/20",
      },
      size: {
        sm: "h-9 gap-1.5 rounded-radius-md px-4 text-xs font-semibold",
        md: "h-12 gap-2 rounded-radius-md px-5 text-sm font-semibold",
        lg: "h-14 gap-2.5 rounded-radius-lg px-7 text-base font-semibold",
        icon: "size-9 rounded-radius-md",
        "icon-sm": "size-8 rounded-radius-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
