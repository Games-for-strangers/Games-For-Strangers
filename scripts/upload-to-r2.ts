/**
 * Upload downloaded images + manifest to Cloudflare R2.
 *
 * Uses Bun's built-in S3 client (Bun 1.1+).
 *
 * Usage:
 *   R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx \
 *     bun run scripts/upload-to-r2.ts [--dir downloads]
 *
 * After upload, run manifest-to-locations.ts to generate locations.json
 * with the correct public URLs.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { readdir, readFile } from "node:fs/promises";

const R2_ACCOUNT_ID = "7b71f489541fe72763c158b881ed7ccb";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = "games-for-strangers";
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const PUBLIC_URL = "https://pub-a5e09a8effa54dd3a2e3a3181f2b86a9.r2.dev";

function mimeType(ext: string): string {
  switch (ext) {
    case "jpg": case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "json": return "application/json";
    case "txt": return "text/plain";
    default: return "application/octet-stream";
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function main() {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("Missing R2 credentials. Set:");
    console.error("  R2_ACCESS_KEY_ID");
    console.error("  R2_SECRET_ACCESS_KEY");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dirIdx = args.indexOf("--dir");
  const downloadDir = dirIdx !== -1
    ? args[dirIdx + 1]
    : join(import.meta.dir, "..", "downloads");

  if (!existsSync(downloadDir)) {
    console.error(`Directory not found: ${downloadDir}`);
    process.exit(1);
  }

  const s3 = new Bun.S3Client({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    endpoint: R2_ENDPOINT,
  });

  console.log(`Uploading from ${downloadDir} to bucket "${R2_BUCKET}"`);

  let uploaded = 0;
  let skipped = 0;

  for await (const filePath of walk(downloadDir)) {
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "json" || ext === "txt") continue;

    const key = relative(downloadDir, filePath).replace(/\\/g, "/");

    // Skip if already uploaded (S3 head)
    try {
      await s3.head(key);
      console.log(`  ~ ${key} (exists, skipping)`);
      skipped++;
      continue;
    } catch {
      // doesn't exist — upload
    }

    const buffer = await readFile(filePath);
    const contentType = mimeType(ext);

    try {
      await s3.write(key, buffer, { type: contentType });
      console.log(`  ✓ ${key} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  ✗ ${key} — ${err}`);
    }
  }

  console.log(`\nUploaded ${uploaded}, skipped ${skipped}`);

  // Upload manifest + update URLs to public endpoint
  const manifestPath = join(downloadDir, "manifest.json");
  if (existsSync(manifestPath)) {
    console.log("\nUploading manifest with updated public URLs...");
    let manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    // Replace CDN URLs with actual public R2 URLs
    manifest = manifest.map((e: any) => ({
      ...e,
      url: e.url.replace(/https:\/\/[^/]+\/images\//, `${PUBLIC_URL}/images/`),
    }));

    const updatedManifest = JSON.stringify(manifest, null, 2);
    await s3.write("manifest.json", updatedManifest, { type: "application/json" });
    console.log("  ✓ manifest.json");

    // Also write updated manifest locally
    writeFileSync(manifestPath, updatedManifest, "utf-8");
    console.log("  ✓ local manifest.json updated with public URLs");
  }

  console.log("\nDone!");
}

main().catch(console.error);
