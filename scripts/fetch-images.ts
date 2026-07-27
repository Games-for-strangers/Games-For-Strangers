/**
 * Wikimedia Commons image fetcher for GeoGuesser Race.
 *
 * Usage:
 *   bun run scripts/fetch-images.ts --list scripts/locations-to-fetch.json
 *
 * Output:
 *   downloads/<country>-<city>/<id>.jpg
 *   downloads/manifest.json
 *
 * Idempotent: skips locations already downloaded (folder with files exists).
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const SLEEP_BETWEEN_DOWNLOADS = 6_000;
const SLEEP_BETWEEN_SEARCHES = 1_500;

interface ImageResult {
  title: string;
  url: string;
  descriptionurl: string;
  artist?: string;
  license?: string;
}

interface ManifestEntry {
  id: string;
  url: string;
  country: string;
  city: string;
  hint: string;
}

interface LocationArgs {
  country: string;
  city: string;
  landmark?: string;
  query: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function apiFetch(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return await res.json();
}

async function downloadWithRetry(downloadUrl: string, retries = 8): Promise<ArrayBuffer> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(downloadUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": "https://commons.wikimedia.org/",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (res.ok) return await res.arrayBuffer();

    if (res.status === 429) {
      const wait = Math.min(4_000 * 2 ** i + Math.floor(Math.random() * 3_000), 60_000);
      console.log(`    Rate limited — waiting ${Math.round(wait / 1000)}s...`);
      await sleep(wait);
      continue;
    }

    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error(`Failed after ${retries} retries`);
}

function searchUrl(query: string, limit = 15): string {
  return `${API}?action=query` +
    `&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6` +
    `&gsrlimit=${limit}` +
    `&prop=imageinfo` +
    `&iiprop=url|extmetadata|size` +
    `&format=json` +
    `&origin=*`;
}

async function searchCommonsImages(query: string, limit = 15): Promise<ImageResult[]> {
  const data = await apiFetch(searchUrl(query, limit));
  const pages = data.query?.pages ?? {};
  const results: ImageResult[] = [];

  for (const id of Object.keys(pages)) {
    if (id === "-1") continue;
    const p = pages[id];
    const info = p.imageinfo?.[0];
    if (!info) continue;

    // Skip small images (< 800px on either dimension)
    if ((info.width && info.width < 800) || (info.height && info.height < 800)) continue;

    const meta = info.extmetadata ?? {};
    const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "").trim() ?? "";
    const license = meta.LicenseShortName?.value ?? "";

    results.push({
      title: p.title,
      url: info.url,
      descriptionurl: info.descriptionurl,
      artist,
      license,
    });
  }

  return results;
}

async function fetchLocationImages(loc: LocationArgs, downloadDir: string): Promise<ManifestEntry[]> {
  const countrySlug = slug(loc.country);
  const citySlug = slug(loc.city);
  const folder = join(downloadDir, `${countrySlug}-${citySlug}`);
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

  // Skip if already downloaded
  const existingFiles = existsSync(folder) ? readdirSync(folder).filter((f) => !f.endsWith(".txt") && !f.endsWith(".json")) : [];
  if (existingFiles.length >= 5) {
    console.log(`  Already has ${existingFiles.length} images, skipping`);
    return [];
  }

  const queries = [
    loc.query,
    `${loc.city} ${loc.country} street`,
    `${loc.city} ${loc.country} landmark`,
  ];

  let candidates: ImageResult[] = [];

  for (const q of queries) {
    console.log(`  Search: "${q}"`);
    await sleep(SLEEP_BETWEEN_SEARCHES);
    try {
      const results = await searchCommonsImages(q, 15);
      console.log(`    → ${results.length} large photos`);
      if (results.length > 0) {
        candidates = results;
        break;
      }
    } catch (err) {
      console.error(`    API error:`, err);
    }
  }

  if (candidates.length === 0) {
    console.log(`  No suitable images.`);
    return [];
  }

  const entries: ManifestEntry[] = [];
  let downloaded = 0;

  for (const candidate of candidates) {
    if (downloaded >= 5) break;

    // Verify it's a photo file type
    const ext = extname(candidate.url).split("?")[0].toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

    downloaded++;
    const id = `${countrySlug}-${citySlug}-${String(downloaded).padStart(2, "0")}`;
    const filePath = join(folder, `${id}${ext}`);

    console.log(`  [${downloaded}/5] ${candidate.title}`);
    console.log(`       ${candidate.url}`);

    try {
      const buffer = await downloadWithRetry(candidate.url);
      writeFileSync(filePath, new Uint8Array(buffer));

      const hint = loc.landmark
        ? `${loc.landmark} in ${loc.city}, ${loc.country}`
        : `A view of ${loc.city}, ${loc.country}`;

      entries.push({
        id,
        url: `https://pub-a5e09a8effa54dd3a2e3a3181f2b86a9.r2.dev/images/${id}${ext}`,
        country: loc.country,
        city: loc.city,
        hint,
      });

      if (candidate.artist) {
        const attr = `Photo by ${candidate.artist}${candidate.license ? ` — License: ${candidate.license}` : ""}`;
        writeFileSync(join(folder, `${id}-attribution.txt`), attr + "\n" + candidate.descriptionurl);
      }

      console.log(`       ✓ saved (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`       ✗ ${err}`);
    }

    if (downloaded < 5) {
      console.log(`       sleeping ${SLEEP_BETWEEN_DOWNLOADS / 1000}s...`);
      await sleep(SLEEP_BETWEEN_DOWNLOADS);
    }
  }

  console.log(`  Done: ${entries.length} images`);
  return entries;
}

async function main() {
  const args = process.argv.slice(2);
  const downloadDir = join(import.meta.dir, "..", "downloads");
  if (!existsSync(downloadDir)) mkdirSync(downloadDir, { recursive: true });

  let locations: LocationArgs[] = [];

  const listIdx = args.indexOf("--list");
  if (listIdx !== -1 && args[listIdx + 1]) {
    const listPath = join(import.meta.dir, "..", args[listIdx + 1]);
    if (!existsSync(listPath)) {
      console.error(`File not found: ${listPath}`);
      process.exit(1);
    }
    locations = JSON.parse(readFileSync(listPath, "utf-8"));
  }

  if (locations.length === 0) {
    const countryIdx = args.indexOf("--country");
    const cityIdx = args.indexOf("--city");
    const queryIdx = args.indexOf("--query");
    if (countryIdx !== -1 && cityIdx !== -1) {
      locations.push({
        country: args[countryIdx + 1],
        city: args[cityIdx + 1],
        landmark: queryIdx !== -1 ? args[queryIdx + 1] : undefined,
        query: queryIdx !== -1 ? args[queryIdx + 1] : `${args[cityIdx + 1]} ${args[countryIdx + 1]}`,
      });
    }
  }

  if (locations.length === 0) {
    console.log("Usage:");
    console.log("  bun run scripts/fetch-images.ts --list scripts/locations-to-fetch.json");
    console.log("  bun run scripts/fetch-images.ts --country Japan --city Tokyo --query \"Shibuya Crossing\"");
    process.exit(1);
  }

  const manifestPath = join(downloadDir, "manifest.json");
  const allEntries: ManifestEntry[] = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf-8"))
    : [];

  for (const loc of locations) {
    const entries = await fetchLocationImages(loc, downloadDir);
    allEntries.push(...entries);
  }

  writeFileSync(manifestPath, JSON.stringify(allEntries, null, 2));
  console.log(`\nTotal: ${allEntries.length} entries written to downloads/manifest.json`);
}

main().catch(console.error);
