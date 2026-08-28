import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { lookupIcon, ICON_NAMES, normalizeIconName } from "@/lib/icon-map";

/**
 * Icons resolve against a curated map (see lib/icon-map.ts — the full lucide
 * barrel cost a 436 KB chunk). The trade-off is that a name outside the set
 * silently renders a fallback glyph, so this test makes that loud instead:
 * every icon named by this branch's config must exist in the map.
 */

const BRAND = new Set(["whatsapp", "wa"]); // handled separately in Icon.tsx

function iconNamesInConfigs(): string[] {
  const dir = join(process.cwd(), "configs");
  const names: string[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".config.ts")) continue;
    const src = readFileSync(join(dir, file), "utf8");
    // Match ANY key whose name ends in "icon" (icon, iconLight, iconDark,
    // placeholderIcon, …). Listing fields explicitly is what let `iconLight`
    // slip through once and ship "?" glyphs on a live client's theme toggle.
    for (const m of src.matchAll(/\b\w*[iI]con:\s*"([^"]+)"/g)) names.push(m[1]);
  }
  return [...new Set(names)];
}

/**
 * Icon names hardcoded in COMPONENTS, not configs — e.g. a Media placeholder's
 * `placeholderIcon="user"`. Configs aren't the only place a name reaches the
 * curated map: a component default renders on every client, so a missing one
 * (like `user`, which shipped "?" glyphs on the Team grid) is worse. Scanning
 * only configs missed exactly this.
 */
function iconNamesInComponents(): string[] {
  const names: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) {
        const src = readFileSync(full, "utf8");
        // Literal string props whose name ends in "Icon": placeholderIcon="…",
        // fallbackIcon="…", etc. (JSX prop = double-quoted literal). Dynamic
        // `{expr}` values are skipped — only a literal can be checked statically.
        for (const m of src.matchAll(/\b\w*[iI]con=\s*"([^"]+)"/g)) names.push(m[1]);
      }
    }
  };
  walk(join(process.cwd(), "components"));
  return [...new Set(names)];
}

describe("curated icon set", () => {
  it("covers every icon named by this branch's config(s)", () => {
    const used = iconNamesInConfigs().filter((n) => !BRAND.has(normalizeIconName(n)));
    const missing = used.filter((n) => !lookupIcon(n));
    expect(
      missing,
      `these config icons aren't in lib/icon-map.ts (they'd render as a "?" glyph): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("covers every icon hardcoded in a component (placeholderIcon, …)", () => {
    const used = iconNamesInComponents().filter((n) => !BRAND.has(normalizeIconName(n)));
    const missing = used.filter((n) => !lookupIcon(n));
    expect(
      missing,
      `these component icons aren't in lib/icon-map.ts (they'd render as a "?" glyph on every client): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("resolves kebab, camel and pascal spellings identically", () => {
    expect(lookupIcon("shield-check")).toBe(lookupIcon("shieldCheck"));
    expect(lookupIcon("shield-check")).toBe(lookupIcon("ShieldCheck"));
  });

  it("returns undefined for an unknown name (so Icon can fall back)", () => {
    expect(lookupIcon("definitely-not-an-icon")).toBeUndefined();
  });

  it("exposes a non-trivial set for configs to choose from", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(80);
  });
});
