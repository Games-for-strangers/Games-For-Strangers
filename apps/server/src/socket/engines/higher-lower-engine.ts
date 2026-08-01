import type { Server as SocketIOServer } from "socket.io";
import type { CountryStat } from "../../higher-lower-data";
import { COUNTRY_STATS } from "../../higher-lower-data";
import type { BaseRound } from "../game-engine";
import { BaseGameEngine } from "../game-engine";

export type HigherLowerStat = "population" | "areaKm2";

export interface HigherLowerRound extends BaseRound {
  stat: HigherLowerStat;
  countryA: CountryStat;
  countryB: CountryStat;
  answer: "higher" | "lower";
}

// Minimum ratio between the two values so rounds never come down to a
// coin-flip on near-equal countries.
const MIN_DIFF_RATIO = 1.15;

function publicCountry(c: CountryStat) {
  return { name: c.name, code: c.code };
}

export class HigherLowerEngine extends BaseGameEngine<HigherLowerRound> {
  protected readonly roundDurationMs = 20_000;
  protected readonly scoreboardDurationMs = 10_000;
  protected readonly endsEarlyOnCorrect = false;

  // Shuffled index pool — countries are drawn without repeats until the
  // pool is exhausted, then reshuffled.
  private pool: number[] = [];

  constructor(io: SocketIOServer) {
    super(io, "higher-or-lower");
  }

  protected createRound(base: BaseRound): HigherLowerRound {
    const stat: HigherLowerStat = Math.random() < 0.5 ? "population" : "areaKm2";
    const [countryA, countryB] = this.pickPair(stat);
    return {
      ...base,
      stat,
      countryA,
      countryB,
      answer: countryA[stat] > countryB[stat] ? "higher" : "lower",
    };
  }

  protected isCorrect(round: HigherLowerRound, guess: string): boolean {
    return guess.trim().toLowerCase() === round.answer;
  }

  protected buildNewRoundExtras(round: HigherLowerRound): Record<string, unknown> {
    return {
      stat: round.stat,
      countryA: publicCountry(round.countryA),
      countryB: publicCountry(round.countryB),
    };
  }

  protected buildRoundEndExtras(round: HigherLowerRound): Record<string, unknown> {
    return {
      stat: round.stat,
      answer: round.answer,
      countryA: { ...publicCountry(round.countryA), value: round.countryA[round.stat] },
      countryB: { ...publicCountry(round.countryB), value: round.countryB[round.stat] },
    };
  }

  private pickPair(stat: HigherLowerStat): [CountryStat, CountryStat] {
    let a = this.drawCountry();
    let b = this.drawCountry();

    for (let attempt = 0; attempt < 10; attempt++) {
      const hi = Math.max(a[stat], b[stat]);
      const lo = Math.min(a[stat], b[stat]);
      if (hi / lo >= MIN_DIFF_RATIO) break;
      a = this.drawCountry();
      b = this.drawCountry();
    }

    return [a, b];
  }

  private drawCountry(): CountryStat {
    if (this.pool.length === 0) {
      this.pool = COUNTRY_STATS.map((_, i) => i);
      for (let i = this.pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.pool[i], this.pool[j]] = [this.pool[i]!, this.pool[j]!];
      }
    }
    return COUNTRY_STATS[this.pool.pop()!]!;
  }
}
