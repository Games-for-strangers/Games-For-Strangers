"use client";

interface IdentityDisplayProps {
  animal: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function IdentityDisplay({ animal, color, size = "sm" }: IdentityDisplayProps) {
  const initial = animal.charAt(0).toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-muted-foreground ${sizeMap[size]}`}
      style={{ backgroundColor: color }}
      title={animal}
    >
      {initial}
    </span>
  );
}
