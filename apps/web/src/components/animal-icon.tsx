"use client";

import type { SVGProps } from "react";

const PATHS: Record<string, (props: SVGProps<SVGSVGElement>) => React.ReactNode> = {
  Fox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3L7 9l-3-1 2 4c-1 2-1 5 2 7l4 2 4-2c3-2 3-5 2-7l2-4-3 1z" />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
      <path d="M10 14c1 .5 3 .5 4 0" />
    </svg>
  ),
  Frog: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="8" ry="5" />
      <circle cx="8" cy="11" r="2" fill="currentColor" />
      <circle cx="16" cy="11" r="2" fill="currentColor" />
      <path d="M12 14v3" />
      <path d="M5 8c2-2 6-2 7 0M19 8c-2-2-6-2-7 0" />
    </svg>
  ),
  Raccoon: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="13" rx="6" ry="5" />
      <circle cx="9" cy="11" r="2" fill="currentColor" />
      <circle cx="15" cy="11" r="2" fill="currentColor" />
      <path d="M7 8c2-3 8-3 10 0" />
      <path d="M7 18l-2 2M17 18l2 2" />
    </svg>
  ),
  Koala: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="8" cy="10" r="4" />
      <circle cx="16" cy="10" r="4" />
      <ellipse cx="12" cy="14" rx="5" ry="4" />
      <circle cx="10" cy="13" r="1" fill="currentColor" />
      <circle cx="14" cy="13" r="1" fill="currentColor" />
      <path d="M12 14v2" />
    </svg>
  ),
  Lion: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="6" />
      <path d="M6 8c-2 0-3 1-2 3M18 8c2 0 3 1 2 3M6 16c-2 0-3-1-2-3M18 16c2 0 3-1 2-3" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      <path d="M10 15c1.5.5 2.5.5 4 0" />
    </svg>
  ),
  Tiger: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="13" rx="7" ry="6" />
      <path d="M7 7l1 2M12 7l1 2M17 7l-1 2" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <path d="M10 16c1.5.5 2.5.5 4 0" />
      <path d="M12 7V5" />
    </svg>
  ),
  Cat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5l-3 4 3 2 3-2z" />
      <ellipse cx="12" cy="14" rx="5" ry="4" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M10 17c1 .5 3 .5 4 0" />
      <path d="M7 19l-1 2M17 19l1 2" />
    </svg>
  ),
  Dog: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 5l-3 3v3l-2 2v4l2 2h10l2-2v-4l-2-2V8l-3-3z" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <path d="M10 16c1 .5 3 .5 4 0" />
    </svg>
  ),
  Wolf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4l-4 4 4 2 4-2z" />
      <ellipse cx="12" cy="14" rx="5" ry="4" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M10 17c1 .5 3 .5 4 0" />
      <path d="M6 8l-2 3M18 8l2 3" />
    </svg>
  ),
  Bear: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <ellipse cx="12" cy="15" rx="5" ry="4" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
      <path d="M12 15v2" />
    </svg>
  ),
  Panda: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="6" ry="5" />
      <circle cx="9" cy="12" r="3" fill="currentColor" />
      <circle cx="15" cy="12" r="3" fill="currentColor" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="15" cy="11" r="1" />
      <path d="M10 16c1 .5 3 .5 4 0" />
    </svg>
  ),
  Hamster: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="6" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.3" />
      <path d="M7 8l-1 2M17 8l1 2" />
    </svg>
  ),
  Rabbit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="4" ry="5" />
      <ellipse cx="8" cy="7" rx="2" ry="4" />
      <ellipse cx="16" cy="7" rx="2" ry="4" />
      <circle cx="10" cy="13" r="1" fill="currentColor" />
      <circle cx="14" cy="13" r="1" fill="currentColor" />
      <path d="M10 17c1 .5 3 .5 4 0" />
    </svg>
  ),
  Unicorn: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="5" ry="4" />
      <path d="M12 4v4" />
      <path d="M8 10c-2 1-3 3-2 5M16 10c2 1 3 3 2 5" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      <path d="M10 16c1 .5 3 .5 4 0" />
      <path d="M12 4l2 2" />
    </svg>
  ),
  Octopus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="4" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      <path d="M8 16l-2 3M16 16l2 3M8 14l-3 1M16 14l3 1M12 16v4M8 16l-1 2M16 16l1 2" />
    </svg>
  ),
  Butterfly: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="10" rx="5" ry="3" transform="rotate(-20 12 10)" />
      <ellipse cx="12" cy="10" rx="5" ry="3" transform="rotate(20 12 10)" />
      <ellipse cx="12" cy="14" rx="3" ry="2" transform="rotate(-15 12 14)" />
      <ellipse cx="12" cy="14" rx="3" ry="2" transform="rotate(15 12 14)" />
      <path d="M12 5v14" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
    </svg>
  ),
  Turtle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="13" rx="6" ry="4" />
      <path d="M9 13l-2 4M15 13l2 4M8 9c2-2 6-2 8 0" />
      <path d="M12 9V7" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Owl: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="5" ry="6" />
      <circle cx="9" cy="11" r="3" fill="currentColor" />
      <circle cx="15" cy="11" r="3" fill="currentColor" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
      <path d="M8 17c1.5 1 4.5 1 6 0" />
      <path d="M7 8l-2-1M17 8l2-1" />
    </svg>
  ),
  Penguin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="4" ry="6" />
      <ellipse cx="12" cy="15" rx="2.5" ry="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      <path d="M8 8c2-1 6-1 8 0" />
      <path d="M10 20l-1 2M14 20l1 2" />
    </svg>
  ),
  Sloth: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="5" />
      <circle cx="9.5" cy="11" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="11" r="1.5" fill="currentColor" />
      <path d="M10 15c1 .5 3 .5 4 0" />
      <path d="M6 16l-3 1M18 16l3 1" />
    </svg>
  ),
};

interface AnimalIconProps {
  animal: string;
  className?: string;
}

export function AnimalIcon({ animal, className }: AnimalIconProps) {
  const render = PATHS[animal];
  if (!render) return null;
  return <span className={className}>{render({ width: "100%", height: "100%" })}</span>;
}
