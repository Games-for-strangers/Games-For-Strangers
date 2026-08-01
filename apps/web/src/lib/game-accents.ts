export const GAME_ACCENTS = {
  "geoguesser-race": {
    text: "text-brand-violet",
    chipBg: "bg-brand-violet/15",
    chipText: "text-brand-violet",
    border: "border-brand-violet/30",
    borderHover: "hover:border-brand-violet/60",
    cover: "bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.45),transparent_60%),linear-gradient(135deg,#1a2340,rgba(59,130,246,0.25))]",
    glow: "shadow-glow-violet",
    dot: "bg-brand-violet",
  },
  "higher-or-lower": {
    text: "text-brand-pink",
    chipBg: "bg-brand-pink/15",
    chipText: "text-brand-pink",
    border: "border-brand-pink/30",
    borderHover: "hover:border-brand-pink/60",
    cover: "bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.4),transparent_60%),linear-gradient(135deg,#1a2340,rgba(251,191,36,0.2))]",
    glow: "shadow-glow-pink",
    dot: "bg-brand-pink",
  },
} as const;

export type GameSlug = keyof typeof GAME_ACCENTS;

export function getAccent(slug: string) {
  return GAME_ACCENTS[slug as GameSlug] ?? GAME_ACCENTS["geoguesser-race"];
}