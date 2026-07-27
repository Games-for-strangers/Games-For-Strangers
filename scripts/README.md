# Image Sourcing Workflow for GeoGuesser Race

## Goal

Replace the 182 placeholder picsum.photos images with 200 real, curated
Wikimedia Commons photos across 40 countries (5 per country).

## Prerequisites

```bash
bun install
```

Set R2 credentials (for upload step):

```bash
$env:R2_ACCESS_KEY_ID = "e160b597157e6d1f4fef470e6f5d70be"
$env:R2_SECRET_ACCESS_KEY = "709c1fbbf8712794767614f29e18be11f643fb80ce938a96361322a86818160b"
```

## Step 1 — Curate your country list

Edit `scripts/locations-to-fetch.json` — each entry has:

```json
{
  "country": "Japan",
  "city": "Tokyo",
  "landmark": "Shibuya Crossing",
  "query": "Shibuya Crossing Tokyo"
}
```

The `query` is sent to the Wikimedia Commons search API. Tune it until
you get good results.

## Step 2 — Fetch images

```bash
bun run scripts/fetch-images.ts --list scripts/locations-to-fetch.json
```

Downloads up to 5 images per location into `downloads/<country>-<city>/`.
Idempotent — skips locations that already have images.

## Step 3 — Review and curate

Delete any blurry, wrong-location, or watermarked images.
Re-run for locations that need better results.

## Step 4 — Upload to R2

```bash
bun run scripts/upload-to-r2.ts
```

Uploads images to `games-for-strangers` R2 bucket, updates manifest
URLs to the public endpoint `https://pub-a5e09a8effa54dd3a2e3a3181f2b86a9.r2.dev`.

## Step 5 — Generate locations.json

```bash
bun run scripts/manifest-to-locations.ts
```

Reads the manifest and writes `packages/db/src/locations.json` with
fun facts, regions, and R2 URLs.

## Step 6 — Deploy

Commit the updated `locations.json`, push, redeploy.
