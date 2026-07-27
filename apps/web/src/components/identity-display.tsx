"use client";

interface IdentityDisplayProps {
  animal: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-6 text-sm",
  md: "h-8 w-8 text-base",
  lg: "h-10 w-10 text-lg",
};

export function IdentityDisplay({ animal, color, size = "sm" }: IdentityDisplayProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${sizeMap[size]}`}
      style={{ backgroundColor: color }}
      title={animal}
    >
      {animal}
    </span>
  );
}
