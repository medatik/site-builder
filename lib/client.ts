import type { SiteConfig } from "./types";
import { configs, getConfig, listClients } from "@/configs";
import { validateConfig } from "./validate-config";
import { resolveTokens } from "./tokens";

/**
 * The slug this deployment renders at "/". Set per deployment via
 * NEXT_PUBLIC_ACTIVE_CLIENT. Falls back to the first registered config so the
 * app always renders something in local dev.
 */
export const ACTIVE_CLIENT =
  process.env.NEXT_PUBLIC_ACTIVE_CLIENT ?? Object.keys(configs)[0];

/** Resolve the active client's config, or throw a clear error if misconfigured. */
export function getActiveConfig(): SiteConfig {
  const config = getConfig(ACTIVE_CLIENT);
  if (!config) {
    throw new Error(
      `NEXT_PUBLIC_ACTIVE_CLIENT="${ACTIVE_CLIENT}" does not match any config in /configs. ` +
        `Available: ${Object.keys(configs).join(", ")}`,
    );
  }
  // Validate what the AUTHOR wrote, before tokens are expanded — an error should
  // point at `{phone}`, not at the number it turned into.
  warnIfInvalid(config);
  // Resolve here rather than only in `localizeConfig`, because the metadata and
  // asset routes (`layout.tsx` generateMetadata, `sitemap.ts`, `robots.ts`,
  // `icon.tsx`, `opengraph-image.tsx`) read this config directly and would
  // otherwise ship a literal "{phone}" into a meta description.
  return resolveTokens(config);
}

/**
 * Report config problems once per process, in development only.
 *
 * Warn rather than throw: these are mostly SILENT failures (a duplicate section
 * id, a translation pointing at a section that doesn't exist) — real problems
 * worth surfacing while building a site, but never a reason to take a live
 * client site down. `npm test` asserts the same rules and fails hard, which is
 * where they should block.
 */
const warned = new Set<string>();
function warnIfInvalid(config: SiteConfig): void {
  if (process.env.NODE_ENV === "production" || warned.has(config.client)) return;
  warned.add(config.client);
  const problems = validateConfig(config);
  if (problems.length) {
    console.warn(
      `[config:${config.client}] ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`,
    );
  }
}

export { getConfig, listClients };
