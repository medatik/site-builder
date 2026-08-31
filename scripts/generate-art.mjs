#!/usr/bin/env node
/**
 * Generates the demo sites' artwork from their own palettes.
 *
 * Most photographic slots now carry real, licensed photographs (see
 * public/photos/CREDITS.md). This covers what is left: team monograms, and any
 * slot with no photograph behind it. Every image is DERIVED FROM THE CONFIG that
 * uses it — the script reads `colorsLight` out of each config and draws with
 * those exact values, which is the theme system's idea applied to assets.
 *
 * It also remains the fallback for a NEW client: a site can be stood up and
 * demonstrated before anyone has sourced a single photograph.
 *
 * Output is deterministic — the RNG is seeded from each file's name — so
 * re-running produces byte-identical files and never churns the repo.
 *
 * Usage:  node scripts/generate-art.mjs
 *
 * These are illustrations, not photographs, and deliberately so: a generated
 * photograph of a clinic that does not exist would be a lie in a way a generated
 * pattern is not. That is also why team members stay monograms even now that
 * real photography is available — a stock face under an invented name is a
 * different thing again, and this repository is public.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = join(ROOT, "public", "art");
const NL = "\n  ";

/* ------------------------------------------------------------------ *
 * Deterministic RNG — same seed, same picture, every run.
 * ------------------------------------------------------------------ */
function rngFrom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const round = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ *
 * Config reading. Deliberately strict: a silent fallback here would emit
 * artwork in the wrong brand colours, which is worse than failing loudly.
 * ------------------------------------------------------------------ */
const KEYS = ["primary", "secondary", "accent", "background", "text", "muted"];

function paletteOf(source, file) {
  const block = source.match(/colorsLight:\s*\{([\s\S]*?)\n\s{4}\}/);
  if (!block) throw new Error(`${file}: no colorsLight block found`);
  const palette = {};
  for (const key of KEYS) {
    const m = block[1].match(new RegExp(`\\b${key}:\\s*"(#[0-9A-Fa-f]{3,8})"`));
    if (!m) throw new Error(`${file}: colorsLight.${key} missing or not a hex value`);
    palette[key] = m[1];
  }
  return palette;
}

/** Team member names, so avatars can be monograms rather than a stock face. */
function teamNamesOf(source) {
  const start = source.indexOf('type: "team"');
  if (start === -1) return [];
  const rest = source.slice(start + 1);
  const end = rest.indexOf('      type: "');
  const block = end === -1 ? rest : rest.slice(0, end);
  return [...block.matchAll(/\bname:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const initialsOf = (name) =>
  name
    .replace(/\b(Dr|Mr|Mrs|Ms|Prof)\.?\s+/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ------------------------------------------------------------------ *
 * Drawing
 * ------------------------------------------------------------------ */
const defs = (p, id, angle) => `
  <defs>
    <linearGradient id="wash${id}" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${p.primary}" stop-opacity="0.20"/>
      <stop offset="0.55" stop-color="${p.secondary}" stop-opacity="0.10"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.7" cy="0.25" r="0.8">
      <stop offset="0" stop-color="${p.accent}" stop-opacity="0.26"/>
      <stop offset="1" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

/** Angular, electrical: diagonal bands, right-angled traces, a bolt. */
function angular(p, w, h, rand, f) {
  const parts = [];
  for (let i = 0; i < f.density + 3; i++) {
    const x = round(rand() * w);
    const bw = round(w * (0.06 + rand() * 0.1));
    parts.push(
      `<path d="M${x} 0 L${round(x + bw)} 0 L${round(x + bw - h * 0.45)} ${h} L${round(x - h * 0.45)} ${h} Z" fill="${p.primary}" opacity="${round(0.05 + rand() * 0.07)}"/>`,
    );
  }
  for (let i = 0; i < f.density + 2; i++) {
    let x = round(rand() * w * 0.8);
    let y = round(h * (0.15 + rand() * 0.7));
    const pts = [`${x},${y}`];
    for (let s = 0; s < 4; s++) {
      if (s % 2 === 0) x = round(x + w * (0.06 + rand() * 0.12));
      else y = round(y + h * (rand() - 0.5) * 0.3);
      pts.push(`${x},${y}`);
    }
    parts.push(
      `<polyline points="${pts.join(" ")}" fill="none" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="${round(w * 0.003)}" stroke-linejoin="round" stroke-linecap="round"/>`,
      `<circle cx="${x}" cy="${y}" r="${round(w * 0.007)}" fill="${p.accent}" opacity="0.75"/>`,
    );
  }
  if (f.show) {
    const cx = w * f.x, cy = h * f.y, s = Math.min(w, h) * f.scale;
    parts.push(
      `<path transform="rotate(${f.rot} ${round(cx)} ${round(cy)})" d="M${round(cx)} ${round(cy - s)} L${round(cx - s * 0.55)} ${round(cy + s * 0.12)} L${round(cx - s * 0.06)} ${round(cy + s * 0.12)} L${round(cx - s * 0.22)} ${round(cy + s)} L${round(cx + s * 0.6)} ${round(cy - s * 0.18)} L${round(cx + s * 0.08)} ${round(cy - s * 0.18)} Z" fill="${f.warm ? p.accent : p.primary}" opacity="${f.opacity}"/>`,
    );
  }
  return parts.join(NL);
}

/** Organic, clinical-calm: overlapping soft fields and open arcs. */
function organic(p, w, h, rand, f) {
  const parts = [];
  const cols = [p.primary, p.secondary, p.accent];
  for (let i = 0; i < f.density + 4; i++) {
    const cx = round(w * (0.1 + rand() * 0.85));
    const cy = round(h * (0.1 + rand() * 0.85));
    const rx = round(Math.min(w, h) * (0.16 + rand() * 0.3));
    parts.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${round(rx * (0.7 + rand() * 0.5))}" fill="${cols[i % 3]}" opacity="${round(0.07 + rand() * 0.08)}"/>`,
    );
  }
  const ox = round(w * (0.15 + rand() * 0.5));
  const oy = round(h * (0.35 + rand() * 0.4));
  for (let i = 0; i < 3; i++) {
    const r = round(Math.min(w, h) * (0.22 + i * (0.1 + rand() * 0.08)));
    parts.push(
      `<circle cx="${ox}" cy="${oy}" r="${r}" fill="none" stroke="${p.primary}" stroke-opacity="${round(0.16 - i * 0.04)}" stroke-width="${round(w * 0.0035)}"/>`,
    );
  }
  if (f.show) {
    const cx = w * f.x, cy = h * f.y;
    const a = Math.min(w, h) * f.scale * 0.62, b = a * 0.34;
    const col = f.warm ? p.accent : p.primary;
    parts.push(
      `<g opacity="${f.opacity}" transform="rotate(${f.rot} ${round(cx)} ${round(cy)})">` +
        `<rect x="${round(cx - b)}" y="${round(cy - a)}" width="${round(b * 2)}" height="${round(a * 2)}" rx="${round(b * 0.5)}" fill="${col}"/>` +
        `<rect x="${round(cx - a)}" y="${round(cy - b)}" width="${round(a * 2)}" height="${round(b * 2)}" rx="${round(b * 0.5)}" fill="${col}"/></g>`,
    );
  }
  return parts.join(NL);
}

/** Classical, institutional: columns, a pediment arc, a fine dot grid. */
function classical(p, w, h, rand, f) {
  const parts = [];
  const n = 4 + (f.density % 3);
  const bw = w * 0.045;
  const gap = w * (0.12 + rand() * 0.05);
  for (let i = 0; i < n; i++) {
    const x = round(w * (0.06 + f.x * 0.12) + i * gap);
    const top = round(h * (0.3 + rand() * 0.08));
    parts.push(
      `<rect x="${x}" y="${top}" width="${round(bw)}" height="${round(h - top)}" fill="${p.text}" opacity="0.07"/>`,
      `<rect x="${round(x - bw * 0.22)}" y="${round(top - h * 0.022)}" width="${round(bw * 1.44)}" height="${round(h * 0.022)}" fill="${p.text}" opacity="0.09"/>`,
    );
  }
  parts.push(
    `<path d="M${round(w * 0.08)} ${round(h * 0.3)} Q ${round(w * (0.35 + rand() * 0.25))} ${round(h * 0.06)} ${round(w * 0.86)} ${round(h * 0.3)}" fill="none" stroke="${p.primary}" stroke-opacity="0.3" stroke-width="${round(w * 0.004)}"/>`,
  );
  const step = Math.round(w * 0.035);
  const dots = [];
  for (let x = step; x < w; x += step)
    for (let y = step; y < h; y += step) if (rand() > 0.55) dots.push(`M${x} ${y} h1`);
  parts.push(
    `<path d="${dots.join(" ")}" stroke="${p.accent}" stroke-opacity="0.26" stroke-width="${round(w * 0.0035)}" stroke-linecap="round"/>`,
  );
  if (f.show) {
    const cx = w * f.x, cy = h * f.y, s = Math.min(w, h) * f.scale * 0.85;
    parts.push(
      `<g transform="rotate(${round(f.rot * 0.3)} ${round(cx)} ${round(cy)})" stroke="${f.warm ? p.accent : p.primary}" stroke-opacity="${f.opacity}" stroke-width="${round(w * 0.005)}" fill="none" stroke-linecap="round">` +
        `<path d="M${round(cx)} ${round(cy - s)} V${round(cy + s * 0.9)}"/>` +
        `<path d="M${round(cx - s * 0.8)} ${round(cy - s * 0.55)} H${round(cx + s * 0.8)}"/>` +
        `<path d="M${round(cx - s * 0.8)} ${round(cy - s * 0.55)} l${round(-s * 0.3)} ${round(s * 0.55)} h${round(s * 0.6)} Z"/>` +
        `<path d="M${round(cx + s * 0.8)} ${round(cy - s * 0.55)} l${round(-s * 0.3)} ${round(s * 0.55)} h${round(s * 0.6)} Z"/>` +
        `</g>`,
    );
  }
  return parts.join(NL);
}

const MOTIFS = { angular, organic, classical };

function scene({ palette, motif, w, h, seed }) {
  const rand = rngFrom(seed);
  const id = Math.floor(rand() * 1e6);
  // The focal mark is what makes two tiles read as different pictures rather
  // than one picture twice. Everything about it varies with the seed — where it
  // sits, how large, which way up, which palette colour, whether it appears at
  // all — and it stays under a fifth of the frame so it reads as a brand mark
  // rather than clip-art dropped in the middle.
  const focal = {
    x: round(0.22 + rand() * 0.56),
    y: round(0.26 + rand() * 0.46),
    scale: round(0.1 + rand() * 0.07),
    rot: Math.round(rand() * 34 - 17),
    opacity: round(0.4 + rand() * 0.3),
    warm: rand() > 0.55,
    show: rand() > 0.22,
    density: Math.floor(rand() * 4),
  };
  const angle = Math.round(rand() * 360);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${defs(palette, id, angle)}
  <rect width="${w}" height="${h}" fill="${palette.background}"/>
  <rect width="${w}" height="${h}" fill="url(#wash${id})"/>
  ${MOTIFS[motif](palette, w, h, rand, focal)}
  <rect width="${w}" height="${h}" fill="url(#glow${id})"/>
</svg>
`;
}

function avatar({ palette, initials, seed }) {
  const rand = rngFrom(seed);
  const s = 400;
  const tilt = Math.round(rand() * 60 - 30);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${tilt} 0.5 0.5)">
      <stop offset="0" stop-color="${palette.primary}"/>
      <stop offset="1" stop-color="${palette.secondary}"/>
    </linearGradient>
  </defs>
  <!-- No background rect on purpose. These are drawn from colorsLight, so
       painting the light background here put a cream tile on every card of a
       DARK-mode page. Transparent, the monogram sits on whatever surface
       renders it and both modes look deliberate. -->
  <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.44}" fill="url(#g)"/>
  <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.475}" fill="none" stroke="${palette.accent}" stroke-opacity="0.5" stroke-width="${s * 0.01}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-size="${s * 0.3}"
        font-weight="700" fill="${palette.background}" letter-spacing="${s * 0.012}">${initials}</text>
</svg>
`;
}

/* ------------------------------------------------------------------ *
 * Which client gets which motif, and how many of each asset — the only
 * hand-made decisions in here. The counts match what each config actually
 * references: merrick's hero is `centered` (no media slot) and it has no
 * gallery, so generating either would just leave dead files in the repo.
 * ------------------------------------------------------------------ */
const CLIENTS = {
  // Counts track what each config still needs. Slots that now carry a real
  // photograph (see public/photos/CREDITS.md) are not generated — a spare file
  // nothing references is just repo litter. Team members stay monograms
  // everywhere: a stock face attached to an invented name is a different thing
  // from an illustration, and this repo is public.
  "voltedge-electric": { motif: "angular", heroes: 0, about: false, gallery: 0 },
  "riverside-family-health": { motif: "organic", heroes: 0, about: false, gallery: 6 },
  "merrick-stone-law": { motif: "classical", heroes: 0, about: false, gallery: 0 },
};

const configs = readdirSync(join(ROOT, "configs")).filter(
  (f) => f.endsWith(".config.ts") && !f.startsWith("_"),
);

let written = 0;
for (const file of configs) {
  const slug = file.replace(".config.ts", "");
  const spec = CLIENTS[slug];
  if (!spec) {
    console.log(`  ${slug}: no spec assigned, skipped`);
    continue;
  }
  const { motif, heroes, about, gallery } = spec;
  const source = readFileSync(join(ROOT, "configs", file), "utf8");
  const palette = paletteOf(source, file);
  const dir = join(OUT_ROOT, slug);
  mkdirSync(dir, { recursive: true });

  const put = (name, svg) => {
    writeFileSync(join(dir, name), svg, "utf8");
    written++;
  };

  for (let i = 1; i <= heroes; i++) {
    const n = i === 1 ? "hero" : `hero-${i}`;
    put(`${n}.svg`, scene({ palette, motif, w: 1600, h: 1000, seed: `${slug}-${n}` }));
  }
  if (about) put("about.svg", scene({ palette, motif, w: 1200, h: 900, seed: `${slug}-about` }));
  for (let i = 1; i <= gallery; i++) {
    put(`gallery-${i}.svg`, scene({ palette, motif, w: 1000, h: 1000, seed: `${slug}-gallery-${i}` }));
  }
  const names = teamNamesOf(source);
  for (const name of names) {
    const ini = initialsOf(name);
    put(`team-${ini.toLowerCase()}.svg`, avatar({ palette, initials: ini, seed: `${slug}-${name}` }));
  }
  console.log(
    `  ${slug}: ${motif}, ${palette.primary}/${palette.accent}, ${names.length} team avatars`,
  );
}
console.log(`\n${written} files written to public/art/`);
