import type { FooterConfig } from "./types";

/**
 * Resolve the footer's copyright line. Three states (see `FooterConfig`):
 * unset → generated default; the literal `"none"` → `null` (render nothing);
 * any other string → verbatim. Centralised here so every footer variant treats
 * the sentinel identically.
 */
export function resolveCopyright(
  footer: FooterConfig | undefined,
  siteName: string,
): string | null {
  if (footer?.copyrightText === "none") return null;
  return (
    footer?.copyrightText ?? `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`
  );
}
