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

const UA = "GamesForStrangers/1.0 (image-curation-script; https://github.com/kinzi/gamesforstrangers)";

// Try Commons API first, fallback to Wikipedia API if blocked.
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

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
    headers: {
      "User-Agent": UA,
      "Api-User-Agent": UA,
      "Accept": "application/json, */*;q=0.5",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    // Log full first KB for debugging
    console.error(`    API returned ${res.status}. Response preview:`);
    console.error(text.slice(0, 800));
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

function searchUrl(query: string, limit = 15): string {
  return `${COMMONS_API}?action=query` +
    `&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6` +
    `&gsrlimit=${limit}` +
    `&prop=imageinfo` +
    `&iiprop=url|extmetadata|size` +
    `&format=json`;
}

// Search Wikipedia article for the location, extract images from the page.
// Uses en.wikipedia.org which is less likely to block VPS IPs than commons.wikimedia.org.
async function searchWikipediaImages(query: string, city: string, country: string): Promise<ImageResult[]> {
  // Search for the article
  const searchUrl = `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
  const searchRes = await apiFetch(searchUrl);
  const pages = searchRes.query?.search ?? [];

  for (const page of pages) {
    const pageTitle = page.title;
    // Get images from the article
    const imgUrl = `${WIKIPEDIA_API}?action=query&prop=images&titles=${encodeURIComponent(pageTitle)}&format=json&imlimit=20`;
    const imgRes = await apiFetch(imgUrl);
    const imgPages = Object.values(imgRes.query?.pages ?? {}) as any[];
    const fileTitles: string[] = [];
    for (const p of imgPages) {
      if (p.images) {
        for (const img of p.images) {
          const title = img.title;
          // Only photos, skip SVGs, audios, videos, etc.
          if (!title.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
          fileTitles.push(title);
        }
      }
    }

    if (fileTitles.length === 0) continue;

    // Get image info (URL, metadata) for each file
    const infoUrl = `${WIKIPEDIA_API}?action=query&prop=imageinfo&iiprop=url|extmetadata|size&titles=${encodeURIComponent(fileTitles.join("|"))}&format=json`;
    const infoRes = await apiFetch(infoUrl);
    const infoPages = Object.values(infoRes.query?.pages ?? {}) as any[];
    const results: ImageResult[] = [];

    for (const p of infoPages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      if ((info.width && info.width < 800) || (info.height && info.height < 800)) continue;

      // Skip non-scenic images (maps, flags, icons, etc.)
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
      });
    }

    if (results.length > 0) {
      console.log(`    → ${results.length} scenic photos from Wikipedia article "${pageTitle}"`);
      return results;
    }

    await sleep(500);
  }

  return [];
}

const BAD_WORDS = /\b(flag|icon|map|logo|seal|emblem|coat of arms|locator|diagram|orthographic|montage|collage|selfie|portrait|close.?up|macro|food|texture)\b/i;

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

    // Skip non-scenic images
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
    `${loc.city} ${loc.country} landmark`,
    `${loc.city} ${loc.country} street view`,
  ];

  let candidates: ImageResult[] = [];

  // Try Wikipedia API first — article-main images are curated and photo-quality
  console.log(`  Wikipedia search: "${loc.query}"`);
  await sleep(SLEEP_BETWEEN_SEARCHES);
  try {
    candidates = await searchWikipediaImages(loc.query, loc.city, loc.country);
    if (candidates.length > 0) {
      console.log(`    → ${candidates.length} curated article images`);
    }
  } catch (err) {
    console.error(`    Wikipedia error:`, err);
  }

  // Fallback: Commons API (noisier but more results)
  if (candidates.length === 0) {
    for (const q of queries) {
      console.log(`  Commons fallback: "${q}"`);
      await sleep(SLEEP_BETWEEN_SEARCHES);
      try {
        // Use stricter query terms and more specific search
        const strictQuery = `${q} -selfie -portrait -closeup -macro -food -texture`;
        const results = await searchCommonsImages(strictQuery, 20);
        // Additional filtering: prefer horizontal photos with recognizable landmarks
        const filtered = results.filter((r) => {
          const title = r.title.toLowerCase();
          // Skip if title suggests non-scenic content
          if (title.match(/\b(portrait|selfie|close.?up|macro|food|texture|icon|logo|map|diagram|flag)\b/)) return false;
          return true;
        });
        console.log(`    → ${filtered.length} photos (${results.length - filtered.length} filtered out)`);
        if (filtered.length > 0) {
          candidates = filtered;
          break;
        }
      } catch (err) {
        console.error(`    Commons error:`, err);
      }
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
