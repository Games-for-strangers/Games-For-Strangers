export type HigherLowerStat = "population" | "areaKm2";

export type HigherLowerChoice = "higher" | "lower";

export interface PublicCountry {
  name: string;
  code: string;
}

export interface RevealedCountry extends PublicCountry {
  value: number;
}

export interface HigherLowerNewRoundEvent {
  roundId: string;
  endTime: number;
  stat: HigherLowerStat;
  countryA: PublicCountry;
  countryB: PublicCountry;
}

export interface HigherLowerWinner {
  animal: string;
  username: string;
  time: number;
  playerId: string;
}

export interface HigherLowerRoundEndEvent {
  winner: HigherLowerWinner | null;
  winners: HigherLowerWinner[];
  stat: HigherLowerStat;
  answer: HigherLowerChoice;
  countryA: RevealedCountry;
  countryB: RevealedCountry;
  guesses: {
    animal: string;
    username: string;
    guess: string;
    correct: boolean;
    time: number;
  }[];
  scores: { playerId: string; username: string; score: number }[];
  nextRoundAt: number;
}

export function statLabel(stat: HigherLowerStat): string {
  return stat === "population" ? "population" : "total area";
}

export function formatStatValue(stat: HigherLowerStat, value: number): string {
  return stat === "population" ? value.toLocaleString() : `${value.toLocaleString()} km²`;
}

/** ISO 3166-1 alpha-2 code -> flag emoji (regional indicator symbols). */
export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}
