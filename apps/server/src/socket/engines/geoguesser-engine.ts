import type { Server as SocketIOServer } from "socket.io";
import { LOCATIONS } from "../../locations";
import { generateHints, getLocationCoords } from "../../geo-data";
import type { BaseRound } from "../game-engine";
import { BaseGameEngine } from "../game-engine";

export interface GeoGuesserRound extends BaseRound {
  imageUrl: string;
  answer: string;
  city: string;
  landmark: string;
  region: string;
  funFact: string;
  hints: string[];
  lat: number;
  lng: number;
}

type LocationTemplate = Omit<GeoGuesserRound, keyof BaseRound>;

export class GeoGuesserEngine extends BaseGameEngine<GeoGuesserRound> {
  protected readonly roundDurationMs = 20_000;
  protected readonly scoreboardDurationMs = 10_000;
  protected readonly endsEarlyOnCorrect = true;

  private locationTemplates: LocationTemplate[] = [];
  private usedIndices: Set<number> = new Set();

  constructor(io: SocketIOServer) {
    super(io, "geoguesser-race");
  }

  override init() {
    const coordsCache = new Map<string, { lat: number; lng: number }>();
    const hintsCache = new Map<string, string[]>();
    this.locationTemplates = LOCATIONS.map((loc) => {
      const cacheKey = `${loc.country}:${loc.city}`;
      if (!coordsCache.has(cacheKey)) {
        coordsCache.set(cacheKey, getLocationCoords(loc.country, loc.city));
      }
      if (!hintsCache.has(loc.country)) {
        hintsCache.set(loc.country, generateHints(loc.country));
      }
      const coords = coordsCache.get(cacheKey)!;
      return {
        imageUrl: loc.url,
        answer: loc.country,
        city: loc.city,
        landmark: loc.landmark,
        region: loc.region,
        funFact: loc.funFact,
        hints: hintsCache.get(loc.country)!,
        lat: coords.lat,
        lng: coords.lng,
      };
    });
    console.log(`Loaded ${this.locationTemplates.length} locations from hard-coded data`);
    super.init();
  }

  protected createRound(base: BaseRound): GeoGuesserRound {
    return { ...base, ...this.getRandomLocation() };
  }

  protected isCorrect(round: GeoGuesserRound, guess: string): boolean {
    return guess.trim().toLowerCase() === round.answer.toLowerCase();
  }

  protected buildNewRoundExtras(round: GeoGuesserRound): Record<string, unknown> {
    return {
      imageUrl: round.imageUrl,
      city: round.city,
      country: round.answer,
      landmark: round.landmark,
      hints: round.hints,
      lat: round.lat,
      lng: round.lng,
    };
  }

  protected buildRoundEndExtras(round: GeoGuesserRound): Record<string, unknown> {
    return {
      answer: round.answer,
      city: round.city,
      landmark: round.landmark,
      region: round.region,
      funFact: round.funFact,
      lat: round.lat,
      lng: round.lng,
    };
  }

  private getRandomLocation(): LocationTemplate {
    if (this.locationTemplates.length === 0) {
      throw new Error("No locations loaded");
    }

    if (this.usedIndices.size >= this.locationTemplates.length) {
      this.usedIndices.clear();
    }

    let idx: number;
    do {
      idx = Math.floor(Math.random() * this.locationTemplates.length);
    } while (this.usedIndices.has(idx));

    this.usedIndices.add(idx);
    return this.locationTemplates[idx]!;
  }
}
