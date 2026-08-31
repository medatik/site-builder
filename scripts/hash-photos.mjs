#!/usr/bin/env node
/**
 * Renames every photograph to include a hash of its own contents, and rewrites
 * the references to it.
 *
 * Why: replacing an image while keeping its filename is silently broken. Nothing
 * downstream can tell the bytes changed, so two layers keep serving the old
 * picture — Next's image optimiser caches under `.next/cache/images` keyed on
 * the path, and the browser holds `/_next/image` responses for four hours. The
 * file on disk is right, the page is wrong, and no amount of rebuilding fixes
 * it. That cost real confusion once; hence this.
 *
 * With `hero.8a3f21c9.jpg`, changing the picture changes the URL, so no cache
 * anywhere can serve a stale one. It is the same trick `brandFingerprint` plays
 * for the generated favicon and OG image, applied to photography.
 *
 * Safe to re-run. A file whose hash already matches its name is left alone, so
 * the usual case is a no-op; drop a new photo in (or overwrite an existing one)
 * and re-run to pick it up.
 *
 * Usage:  npm run hash:photos
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS = join(ROOT, "public", "photos");
const HASH_LEN = 8;

if (!existsSync(PHOTOS)) {
  console.log("No public/photos directory — nothing to do.");
  process.exit(0);
}

/** Files that may reference a photo by path. */
const referrers = [
  ...readdirSync(join(ROOT, "configs"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(ROOT, "configs", f)),
  join(PHOTOS, "CREDITS.md"),
].filter(existsSync);

const hashOf = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, HASH_LEN);

/** `hero.8a3f21c9.jpg` -> { slot: "hero", hash: "8a3f21c9", ext: "jpg" } */
function parse(name) {
  const parts = name.split(".");
  const ext = parts.pop();
  const hash = parts.length > 1 && /^[0-9a-f]{8}$/.test(parts.at(-1)) ? parts.pop() : null;
  return { slot: parts.join("."), hash, ext };
}

const renames = [];
for (const client of readdirSync(PHOTOS, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)) {
  const dir = join(PHOTOS, client);
  for (const name of readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))) {
    const { slot, hash, ext } = parse(name);
    const actual = hashOf(readFileSync(join(dir, name)));
    if (hash === actual) continue; // already current
    const next = `${slot}.${actual}.${ext}`;
    renameSync(join(dir, name), join(dir, next));
    renames.push({ client, from: name, to: next });
  }
}

if (renames.length === 0) {
  console.log("Every photo already carries a hash of its contents. Nothing to do.");
  process.exit(0);
}

let rewrites = 0;
for (const file of referrers) {
  let text = readFileSync(file, "utf8");
  const before = text;
  for (const { client, from, to } of renames) {
    // Scoped by the client folder so two sites can share a slot name safely.
    text = text.split(`${client}/${from}`).join(`${client}/${to}`);
  }
  if (text !== before) {
    writeFileSync(file, text);
    rewrites++;
  }
}

for (const { client, from, to } of renames) console.log(`  ${client}/${from}  ->  ${to}`);
console.log(`\n${renames.length} renamed, ${rewrites} referring file(s) rewritten.`);

// A reference the rename missed would 404 at runtime rather than here, so check.
const missed = [];
for (const file of referrers) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/photos\/([a-z0-9-]+)\/([A-Za-z0-9.-]+\.(?:jpe?g|png|webp|avif))/g)) {
    if (!existsSync(join(PHOTOS, m[1], m[2]))) missed.push(`${file}: ${m[0]}`);
  }
}
if (missed.length) {
  console.error("\nDangling references after rename:");
  for (const m of missed) console.error("  " + m);
  process.exit(1);
}
console.log("Every reference resolves.");
