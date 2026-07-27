/**
 * Convert the Wikimedia Commons manifest to the locations.json format
 * that the game server uses.
 *
 * Usage:
 *   bun run scripts/manifest-to-locations.ts [--manifest downloads/manifest.json]
 *
 * This takes the downloaded manifest and generates the full locations.json
 * with fun facts, regions, and attribution. You'll want to manually fill in
 * the region and funFact fields after review.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface ManifestEntry {
  id: string;
  url: string;
  country: string;
  city: string;
  hint: string;
}

interface LocationEntry {
  url: string;
  country: string;
  city: string;
  landmark: string;
  region: string;
  funFact: string;
}

// Pre-populated region + fun fact map for common locations.
// Add entries as you curate images.
const LOCATION_META: Record<string, { region: string; funFact: string }> = {
  "Japan/Tokyo": { region: "Kanto", funFact: "Tokyo is the most populous metropolitan area in the world, with over 37 million residents." },
  "Japan/Kyoto": { region: "Kansai", funFact: "Kyoto was the imperial capital of Japan for over 1,000 years." },
  "Japan/Osaka": { region: "Kansai", funFact: "Osaka is known as the 'Kitchen of Japan' for its famous street food culture." },
  "Japan/Mount Fuji": { region: "Chubu", funFact: "Mount Fuji is an active stratovolcano and Japan's tallest peak at 3,776 meters." },
  "France/Paris": { region: "Île-de-France", funFact: "Paris has 38 million visitors per year, making it one of the most visited cities in the world." },
  "Italy/Rome": { region: "Lazio", funFact: "Rome is over 2,700 years old and was once the center of the Roman Empire." },
  "United States/New York City": { region: "New York", funFact: "New York City has over 800 languages spoken, making it the most linguistically diverse city in the world." },
  "United Kingdom/London": { region: "Greater London", funFact: "London has over 170 museums, including the British Museum which has 8 million artifacts." },
  "Egypt/Giza": { region: "Giza", funFact: "The Great Pyramid of Giza was the tallest man-made structure in the world for over 3,800 years." },
  "Australia/Sydney": { region: "New South Wales", funFact: "The Sydney Opera House has over 1 million roof tiles." },
  "Brazil/Rio de Janeiro": { region: "Rio de Janeiro", funFact: "Rio's Christ the Redeemer statue is 30 meters tall and has stood atop Corcovado Mountain since 1931." },
  "India/Agra": { region: "Uttar Pradesh", funFact: "The Taj Mahal was built by Emperor Shah Jahan in memory of his wife Mumtaz Mahal." },
  "China/Beijing": { region: "Beijing", funFact: "The Great Wall of China stretches over 21,000 km and was built over 2,000 years." },
  "Peru/Machu Picchu": { region: "Cusco", funFact: "Machu Picchu was built around 1450 AD and was never found by Spanish conquistadors." },
  "Greece/Santorini": { region: "South Aegean", funFact: "Santorini's iconic blue-domed churches and white buildings were rebuilt after a devastating 1956 earthquake." },
  "Turkey/Istanbul": { region: "Marmara", funFact: "Istanbul is the only city in the world that spans two continents: Europe and Asia." },
  "Thailand/Bangkok": { region: "Central Thailand", funFact: "Bangkok's full ceremonial name is 168 characters long, making it the world's longest city name." },
  "South Africa/Cape Town": { region: "Western Cape", funFact: "Table Mountain is one of the oldest mountains in the world, at over 260 million years old." },
  "United Arab Emirates/Dubai": { region: "Dubai", funFact: "The Burj Khalifa is so tall that its residents can break their fast up to 3 minutes later than those at ground level." },
  "Mexico/Chichen Itza": { region: "Yucatán", funFact: "El Castillo pyramid was built to align with the equinox, creating a serpent shadow illusion." },
  "Vietnam/Ha Long Bay": { region: "Quảng Ninh", funFact: "Ha Long Bay has over 1,600 limestone islands and islets." },
  "Netherlands/Amsterdam": { region: "North Holland", funFact: "Amsterdam has 1,281 bridges, more than Venice." },
  "Switzerland/Zermatt": { region: "Valais", funFact: "The Matterhorn is one of the most photographed mountains in the world." },
};

function main() {
  const args = process.argv.slice(2);
  const manifestIdx = args.indexOf("--manifest");
  const manifestPath = manifestIdx !== -1
    ? args[manifestIdx + 1]
    : join(import.meta.dir, "..", "downloads", "manifest.json");

  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    console.error("Run scripts/fetch-images.ts first, or pass --manifest <path>");
    process.exit(1);
  }

  const manifest: ManifestEntry[] = JSON.parse(readFileSync(manifestPath, "utf-8"));
  console.log(`Loaded ${manifest.length} manifest entries`);

  const locations: LocationEntry[] = [];

  for (const entry of manifest) {
    const key = `${entry.country}/${entry.city}`;
    const meta = LOCATION_META[key];
    const cityParts = entry.hint.split(",").map((s) => s.trim());
    const landmarkGuess = cityParts.length > 0 ? cityParts[0] : entry.city;

    locations.push({
      url: entry.url,
      country: entry.country,
      city: entry.city,
      landmark: meta ? landmarkGuess : entry.city,
      region: meta?.region ?? "Unknown",
      funFact: meta?.funFact ?? `A view of ${entry.city}, ${entry.country}`,
    });
  }

  const outputPath = join(import.meta.dir, "..", "packages", "db", "src", "locations.json");
  writeFileSync(outputPath, JSON.stringify(locations, null, 2));
  console.log(`Wrote ${locations.length} locations to ${outputPath}`);
}

main();
