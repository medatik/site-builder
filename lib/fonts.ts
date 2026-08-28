import type { ThemeFonts } from "./types";

const DEFAULT_WEIGHTS = [300, 400, 500, 600, 700, 800];

/**
 * Build a Google Fonts CSS2 stylesheet URL from arbitrary family names.
 *
 * Fonts are loaded dynamically (per client, at request time) rather than being
 * statically imported, so any Google Font a client names in their config works
 * with no code change. Families are de-duplicated and spaces encoded as `+`.
 */
export function googleFontsHref(
  families: string[],
  weights: number[] = DEFAULT_WEIGHTS,
): string {
  const unique = Array.from(new Set(families.filter(Boolean)));
  const wght = weights.join(";");
  const params = unique
    .map((family) => `family=${family.trim().replace(/\s+/g, "+")}:wght@${wght}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function fontsHrefForTheme(fonts: ThemeFonts): string {
  return googleFontsHref([fonts.heading, fonts.body]);
}
