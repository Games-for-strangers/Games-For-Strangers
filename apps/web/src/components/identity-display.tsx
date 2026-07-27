"use client";

import { AnimalIcon } from "./animal-icon";

interface IdentityDisplayProps {
  animal: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function IdentityDisplay({ animal, color, size = "sm" }: IdentityDisplayProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${sizeMap[size]}`}
      style={{ backgroundColor: color }}
      title={animal}
    >
      <AnimalIcon animal={animal} className="h-3/5 w-3/5 text-muted-foreground" />
    </span>
  );
}
