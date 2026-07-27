/**
 * Wikimedia Commons image fetcher for GeoGuesser Race.
 *
 * Uses curated Commons categories (Streets in X, Views of Y, etc.)
 * instead of noisy free-text search. Falls back to Wikipedia article
 * images, then to free-text search as last resort.
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

const UA = "GamesForStrangers/1.0 (image-curation-script; https://github.com/kinzi/gamesforstrangers)";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

const SLEEP_BETWEEN_DOWNLOADS = 6_000;
const SLEEP_BETWEEN_CATEGORIES = 1_500;
const SLEEP_BETWEEN_PAGES = 800;

interface ImageResult {
  title: string;
  url: string;
  descriptionurl: string;
  artist?: string;
  license?: string;
  width: number;
  height: number;
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
  categories?: string[];
}

const BAD_WORDS = /\b(flag|icon|map|logo|seal|emblem|coat of arms|locator|diagram|orthographic|montage|collage|selfie|portrait|close.?up|macro|food|texture|poster|infographic)\b/i;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function apiFetch(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Api-User-Agent": UA, "Accept": "application/json, */*;q=0.5" },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`    API ${res.status}:`, text.slice(0, 500));
    throw new Error(`API HTTP ${res.status}`);
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

// --- Category name generation ---

function getCategoryNames(city: string, country: string, custom?: string[]): string[] {
  if (custom && custom.length > 0) return custom.map((c) => `Category:${c}`);

  const cityEnc = encodeURIComponent(city);
  const countryEnc = encodeURIComponent(country);

  // Ordered by most likely to have street-level/guessable photos
  return [
    `Category:Streets in ${cityEnc}`,
    `Category:Views of ${cityEnc}`,
    `Category:Street scenes in ${cityEnc}`,
    `Category:Architecture of ${countryEnc}`,
    `Category:Urban landscapes of ${countryEnc}`,
    `Category:Streets in ${countryEnc}`,
    `Category:Cityscapes of ${cityEnc}`,
    `Category:Street scenes in ${countryEnc}`,
  ];
}

// --- Commons category member search ---

function categoryUrl(category: string, limit = 15): string {
  return `${COMMONS_API}?action=query` +
    `&generator=categorymembers` +
    `&gcmtitle=${category}` +
    `&gcmtype=file` +
    `&gcmlimit=${limit}` +
    `&prop=imageinfo` +
    `&iiprop=url|extmetadata|size` +
    `&format=json`;
}

async function searchCategoryImages(category: string, limit = 15): Promise<ImageResult[]> {
  const data = await apiFetch(categoryUrl(category, limit));
  const pages = data.query?.pages ?? {};
  const results: ImageResult[] = [];

  for (const id of Object.keys(pages)) {
    if (id === "-1") continue;
    const p = pages[id];
    const info = p.imageinfo?.[0];
    if (!info) continue;
    if (!info.url || BAD_WORDS.test(p.title)) continue;

    // Prefer horizontal (landscape) orientation for game display
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
      width: info.width ?? 0,
      height: info.height ?? 0,
    });
  }

  // Sort: landscapes (wider) first, larger images first
  results.sort((a, b) => {
    const aRatio = a.width / Math.max(a.height, 1);
    const bRatio = b.width / Math.max(b.height, 1);
    if (Math.abs(aRatio - bRatio) > 0.5) return bRatio - aRatio;
    return b.width - a.width;
  });

  return results;
}

// --- Wikipedia article image search (fallback) ---

async function searchWikipediaImages(query: string): Promise<ImageResult[]> {
  const searchUrl = `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
  const searchRes = await apiFetch(searchUrl);
  const pages = searchRes.query?.search ?? [];

  for (const page of pages) {
    const pageTitle = page.title;
    const imgUrl = `${WIKIPEDIA_API}?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&imlimit=20`;
    const imgRes = await apiFetch(imgUrl);
    const imgPages = Object.values(imgRes.query?.pages ?? {}) as any[];
    const fileTitles: string[] = [];

    for (const p of imgPages) {
      if (p.images) {
        for (const img of p.images) {
          const title = img.title;
          if (!title.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
          fileTitles.push(title);
        }
      }
    }

    if (fileTitles.length === 0) continue;

    const infoUrl = `${WIKIPEDIA_API}?action=query&prop=imageinfo&iiprop=url|extmetadata|size&titles=${encodeURIComponent(fileTitles.join("|"))}&format=json`;
    const infoRes = await apiFetch(infoUrl);
    const infoPages = Object.values(infoRes.query?.pages ?? {}) as any[];
    const results: ImageResult[] = [];

    for (const p of infoPages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      if ((info.width && info.width < 800) || (info.height && info.height < 800)) continue;
      if (BAD_WORDS.test(p.title)) continue;

      const meta = info.extmetadata ?? {};
      const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "").trim() ?? "";
      const license = meta.LicenseShortName?.value ?? "";

      results.push({
        title: p.title,
        url: info.url,
        descriptionurl: info.descriptionurl,
        artist,
        license,
        width: info.width ?? 0,
        height: info.height ?? 0,
      });
    }

    if (results.length > 0) {
      console.log(`    → ${results.length} photos from Wikipedia article "${pageTitle}"`);
      results.sort((a, b) => b.width - a.width);
      return results;
    }

    await sleep(500);
  }

  return [];
}

// --- Commons free-text search (last resort fallback) ---

function searchUrl(query: string, limit = 20): string {
  return `${COMMONS_API}?action=query` +
    `&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6` +
    `&gsrlimit=${limit}` +
    `&prop=imageinfo` +
    `&iiprop=url|extmetadata|size` +
    `&format=json`;
}

async function searchCommonsText(query: string, limit = 20): Promise<ImageResult[]> {
  const data = await apiFetch(searchUrl(query, limit));
  const pages = data.query?.pages ?? {};
  const results: ImageResult[] = [];

  for (const id of Object.keys(pages)) {
    if (id === "-1") continue;
    const p = pages[id];
    const info = p.imageinfo?.[0];
    if (!info) continue;
    if ((info.width && info.width < 800) || (info.height && info.height < 800)) continue;
    if (BAD_WORDS.test(p.title)) continue;

    const meta = info.extmetadata ?? {};
    const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "").trim() ?? "";
    const license = meta.LicenseShortName?.value ?? "";

    results.push({
      title: p.title,
      url: info.url,
      descriptionurl: info.descriptionurl,
      artist,
      license,
      width: info.width ?? 0,
      height: info.height ?? 0,
    });
  }

  results.sort((a, b) => {
    const aRatio = a.width / Math.max(a.height, 1);
    const bRatio = b.width / Math.max(b.height, 1);
    if (Math.abs(aRatio - bRatio) > 0.5) return bRatio - aRatio;
    return b.width - a.width;
  });

  return results;
}

// --- Main per-location fetch logic ---

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

  let candidates: ImageResult[] = [];
  const seen = new Set<string>();

  // Phase 1: Commons curated categories (best — street-level, organized)
  const categoryNames = getCategoryNames(loc.city, loc.country, loc.categories);
  for (const cat of categoryNames) {
    console.log(`  Category: ${cat}`);
    await sleep(SLEEP_BETWEEN_CATEGORIES);
    try {
      const results = await searchCategoryImages(cat, 20);
      const fresh = results.filter((r) => {
        const key = r.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      console.log(`    → ${fresh.length} new landscape photos`);
      candidates.push(...fresh);
      if (candidates.length >= 10) break; // enough candidates to pick 5
    } catch (err: any) {
      const msg = String(err);
      // Skip "not found" categories (common — not all cities have every category)
      if (msg.includes("HTTP 400") || msg.includes("not found")) {
        console.log(`    Category doesn't exist, skipping`);
      } else {
        console.error(`    Error:`, msg.slice(0, 200));
      }
    }
  }

  // Phase 2: Wikipedia article images (good — curated per-article)
  if (candidates.length < 5) {
    console.log(`  Wikipedia: "${loc.query}"`);
    await sleep(SLEEP_BETWEEN_PAGES);
    try {
      const results = await searchWikipediaImages(loc.query);
      const fresh = results.filter((r) => {
        const key = r.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      console.log(`    → ${fresh.length} new article images`);
      candidates.push(...fresh);
    } catch (err) {
      console.error(`    Wikipedia error:`, String(err).slice(0, 200));
    }
  }

  // Phase 3: Commons free-text search (last resort — noisy)
  if (candidates.length < 5) {
    const queries = [`${loc.query} -selfie -portrait`, `${loc.city} ${loc.country} view`, `${loc.city} ${loc.country} landmark`];
    for (const q of queries) {
      if (candidates.length >= 5) break;
      console.log(`  Text search: "${q.slice(0, 80)}"`);
      await sleep(SLEEP_BETWEEN_PAGES);
      try {
        const results = await searchCommonsText(q, 15);
        const fresh = results.filter((r) => {
          const key = r.url;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        console.log(`    → ${fresh.length} new images`);
        candidates.push(...fresh);
      } catch (err) {
        console.error(`    Search error:`, String(err).slice(0, 200));
      }
    }
  }

  if (candidates.length === 0) {
    console.log(`  No suitable images found.`);
    return [];
  }

  // Take the best 5 (already sorted by landscape-orientation + resolution)
  const best = candidates.slice(0, 5);
  console.log(`  Downloading ${best.length} best of ${candidates.length} candidates...`);

  const entries: ManifestEntry[] = [];
  let idx = 0;

  for (const candidate of best) {
    idx++;
    const ext = extname(candidate.url).split("?")[0].toLowerCase() || ".jpg";
    const id = `${countrySlug}-${citySlug}-${String(idx).padStart(2, "0")}`;
    const filePath = join(folder, `${id}${ext}`);

    console.log(`  [${idx}/5] ${candidate.title}`);
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

    if (idx < 5) {
      console.log(`       sleeping ${SLEEP_BETWEEN_DOWNLOADS / 1000}s...`);
      await sleep(SLEEP_BETWEEN_DOWNLOADS);
    }
  }

  console.log(`  Done: ${entries.length} images`);
  return entries;
}

// --- CLI ---

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
    const catIdx = args.indexOf("--categories");
    if (countryIdx !== -1 && cityIdx !== -1) {
      locations.push({
        country: args[countryIdx + 1],
        city: args[cityIdx + 1],
        landmark: queryIdx !== -1 ? args[queryIdx + 1] : undefined,
        query: queryIdx !== -1 ? args[queryIdx + 1] : `${args[cityIdx + 1]} ${args[countryIdx + 1]}`,
        categories: catIdx !== -1 ? args[catIdx + 1].split(",") : undefined,
      });
    }
  }

  if (locations.length === 0) {
    console.log("Usage:");
    console.log("  bun run scripts/fetch-images.ts --list scripts/locations-to-fetch.json");
    console.log("  bun run scripts/fetch-images.ts --country Japan --city Tokyo --query \"Shibuya\" --categories \"Streets in Tokyo,Views of Tokyo\"");
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
