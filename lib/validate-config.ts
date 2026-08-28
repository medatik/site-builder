import { z } from "zod";
import type { SiteConfig } from "./types";
import { SECTION_TYPES } from "./section-types";
import { DELIVERY_CHANNELS } from "./contact/constants";

/**
 * Runtime validation for a `SiteConfig`.
 *
 * WHY, given TypeScript already checks configs: TS only checks what it can SEE
 * at build time. The moment a config arrives from somewhere TS never compiled —
 * a database, a CMS, the planned UI editor, or JSON over the wire — a malformed
 * config becomes a production crash instead of a type error. This is the guard
 * for that future, and it costs nothing today (it runs once per process).
 *
 * Deliberately a SHAPE check, not a mirror of all 664 lines of `lib/types.ts`.
 * Duplicating the full type would create exactly the drift problem we flagged
 * elsewhere: two definitions of the same thing, silently disagreeing. So this
 * asserts the invariants that actually break the renderer at runtime, and lets
 * TypeScript keep owning the fine detail of every section's props.
 */

const sectionSchema = z
  .object({
    // Must be a type the registry can render — an unknown type renders nothing,
    // silently dropping a whole section from the page.
    type: z.enum([...SECTION_TYPES] as [string, ...string[]]),
    enabled: z.boolean().optional(),
    id: z.string().min(1).optional(),
    props: z.record(z.string(), z.unknown()),
  })
  .loose();

const themeSchema = z
  .object({
    stylePreset: z.enum(["sharp", "rounded", "soft", "stark", "toybox", "petal"]),
    defaultMode: z.enum(["light", "dark"]).optional(),
    fonts: z.object({ heading: z.string().min(1), body: z.string().min(1) }),
    colorsLight: z.record(z.string(), z.string()).optional(),
    colorsDark: z.record(z.string(), z.string()).optional(),
  })
  .loose()
  // At least one palette is required or every colour resolves to the :root
  // fallback and the site renders unthemed.
  .refine((t) => t.colorsLight || t.colorsDark, {
    message: "theme needs colorsLight and/or colorsDark",
  });

const pageSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, "slug must be kebab-case (no leading slash)"),
    title: z.string().min(1),
    sections: z.array(sectionSchema),
    nav: z.boolean().optional(),
  })
  .loose();

export const siteConfigSchema = z
  .object({
    client: z.string().min(1),
    siteName: z.string().min(1),
    logo: z.object({ alt: z.string().min(1) }).loose(),
    theme: themeSchema,
    sections: z.array(sectionSchema).min(1, "a site needs at least one section"),
    pages: z.array(pageSchema).optional(),
    i18n: z
      .object({
        defaultLocale: z.string().min(1),
        locales: z.array(z.object({ code: z.string().min(1) }).loose()).min(1),
      })
      .loose()
      // A default locale that isn't in the list makes pickLocale fall back to a
      // locale with no metadata — the site renders in a language it can't name.
      .refine((i) => i.locales.some((l) => l.code === i.defaultLocale), {
        message: "i18n.defaultLocale must be one of i18n.locales",
      })
      .optional(),
  })
  .loose();

/** Anchor key for a section: its `id`, defaulting to its `type`. */
const keyOf = (s: { id?: string; type: string }) => s.id ?? s.type;

/**
 * Copy that ships in `_template.config.ts` and `scripts/section-skeletons.ts`.
 * Its presence means a config hasn't been filled in yet — harmless on its own,
 * but disqualifying for anything that makes a public claim (see the review
 * markup check below).
 */
const PLACEHOLDER_COPY =
  /Replace this with|Customer Name|(First|Second|Third|Fourth|Fifth|Sixth) Customer|City or context|A short, believable|specific beats generic|keeps the row balanced/i;

/** Every section in a config, home page plus any routed pages. */
type LooseSection = { id?: string; type: string; props?: Record<string, unknown> };
function allSectionsOf(c: { sections: unknown[]; pages?: { sections: unknown[] }[] }): LooseSection[] {
  return [
    ...(c.sections as LooseSection[]),
    ...((c.pages ?? []).flatMap((p) => p.sections) as LooseSection[]),
  ];
}

/**
 * Validate a config, returning human-readable problems (empty = valid).
 * Returns rather than throws so callers choose the severity.
 */
export function validateConfig(config: unknown): string[] {
  const parsed = siteConfigSchema.safeParse(config);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => `${i.path.join(".") || "config"}: ${i.message}`);
  }

  // Cross-field invariants zod can't express cleanly. These fail SILENTLY at
  // runtime rather than erroring, which is what makes them worth asserting:
  // the key is both the DOM anchor and the i18n overlay key.
  // `pages` is optional and only exists once multi-page support lands; typing it
  // locally keeps this valid on branches with and without the feature.
  const c = parsed.data as unknown as SiteConfig & {
    pages?: { slug: string; sections: { id?: string; type: string }[] }[];
  };
  const problems: string[] = [];

  const keys = [
    ...c.sections.map(keyOf),
    ...(c.pages ?? []).flatMap((p) => p.sections.map(keyOf)),
  ];
  const dupes = [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))];
  if (dupes.length) problems.push(`duplicate section id/type: ${dupes.join(", ")}`);

  const slugs = (c.pages ?? []).map((p) => p.slug);
  const dupeSlugs = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  if (dupeSlugs.length) problems.push(`duplicate page slug: ${dupeSlugs.join(", ")}`);

  const known = new Set(keys);
  for (const [locale, t] of Object.entries(c.translations ?? {})) {
    for (const k of Object.keys(t.sections ?? {})) {
      if (!known.has(k)) problems.push(`translations.${locale} targets unknown section "${k}"`);
    }
  }

  // Review markup over placeholder copy is the one config mistake with a
  // consequence OUTSIDE the site: Google issues a manual action ("spammy
  // structured markup") for review markup on reviews that were never collected,
  // which strips rich results from the whole domain until a reconsideration
  // request clears it. Enabling the flag and forgetting to replace the demo
  // quotes is exactly how that happens, so catch it here rather than in review.
  for (const s of allSectionsOf(c)) {
    if (s.type !== "testimonials") continue;
    const props = s.props as { structuredData?: unknown; items?: { quote?: string; author?: string }[] };
    if (props.structuredData !== true) continue;
    const placeholders = (props.items ?? []).filter(
      (t) => PLACEHOLDER_COPY.test(t.quote ?? "") || PLACEHOLDER_COPY.test(t.author ?? ""),
    );
    if (placeholders.length) {
      problems.push(
        `section "${keyOf(s)}" has structuredData: true but ${placeholders.length} testimonial(s) still contain template placeholder text — ` +
          `publishing schema.org review markup for reviews that were never collected risks a Google manual action. ` +
          `Replace the quotes with real ones, or set structuredData: false.`,
      );
    }
  }

  // A mistyped delivery channel silently delivers an enquiry NOWHERE — no error,
  // just a lead quietly lost. Flag any channel that has no adapter.
  const knownChannels = new Set<string>(DELIVERY_CHANNELS);
  const allSections = [
    ...c.sections,
    ...(c.pages ?? []).flatMap((p) => p.sections),
  ] as { type: string; id?: string; props?: { delivery?: { channels?: unknown } } }[];
  for (const s of allSections) {
    if (s.type !== "contact") continue;
    const channels = s.props?.delivery?.channels;
    if (!Array.isArray(channels)) continue;
    for (const ch of channels) {
      if (!knownChannels.has(ch as string)) {
        problems.push(
          `section "${keyOf(s)}" delivery channel "${ch}" is unknown (expected: ${DELIVERY_CHANNELS.join(", ")})`,
        );
      }
    }
  }

  return problems;
}

/** Throwing variant, for start-up checks where a bad config must not boot. */
export function assertValidConfig(config: unknown, label = "config"): void {
  const problems = validateConfig(config);
  if (problems.length) {
    throw new Error(`Invalid ${label}:\n  - ${problems.join("\n  - ")}`);
  }
}
