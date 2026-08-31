import type { SiteConfig, LocaleConfig, TextDir, ThemeFonts, Section } from "./types";
import { rootRelativeAnchors } from "./nav";
import { resolveTokens } from "./tokens";

/**
 * Locale resolution + content localisation for the multilingual system.
 *
 * A site is authored once in its default locale; `translations[locale]` carries
 * only the strings that change. At render time the active locale is picked from
 * the `?lang=` URL param and `localizeConfig` deep-merges the overlay over the
 * base, so the section components never know i18n exists — they just receive a
 * fully-resolved config in the right language.
 */

/** Whether the config declares real multilingual support (>1 locale). */
export function isMultilingual(config: SiteConfig): boolean {
  return (config.i18n?.locales?.length ?? 0) > 1;
}

/** Whether the header language selector should render. */
export function languageSelectorShown(config: SiteConfig): boolean {
  return isMultilingual(config) && config.i18n?.switcher?.enabled !== false;
}

/** The locale to render: the requested one if it's offered, else the default. */
export function pickLocale(config: SiteConfig, requested?: string): string {
  const i18n = config.i18n;
  if (!i18n) return requested ?? "en";
  const known = i18n.locales.some((l) => l.code === requested);
  return known ? (requested as string) : i18n.defaultLocale;
}

/** Metadata for one locale (falls back sanely when i18n is absent). */
export function localeMeta(config: SiteConfig, code: string): LocaleConfig & { dir: TextDir } {
  const found = config.i18n?.locales.find((l) => l.code === code);
  return {
    code,
    label: found?.label ?? code,
    dir: found?.dir ?? "ltr",
    font: found?.font,
  };
}

/** Is `v` a plain object (mergeable), not an array or null? */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge `patch` over `base`. Plain objects merge recursively; everything
 * else (arrays, primitives) is replaced by the patch. A translation that wants
 * to change one nested string only writes that string.
 */
function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return (patch === undefined ? base : (patch as T));
  const out: Record<string, unknown> = isPlainObject(base) ? { ...base } : {};
  for (const [k, v] of Object.entries(patch)) {
    out[k] = isPlainObject(v) ? deepMerge(out[k], v) : v;
  }
  return out as T;
}

/**
 * Produce the config as it should render for `locale`: the localised config,
 * then the render-time passes — token expansion (see `resolveTokens`) and
 * making in-page anchors root-relative on multi-page sites (see
 * `rootRelativeAnchors`). Every route resolves its config through here, so all
 * three concerns are applied in exactly one place.
 */
export function localizeConfig(config: SiteConfig, locale: string): SiteConfig {
  const localized = localizeForLocale(config, locale);
  // Tokens expand AFTER the overlay merge, so translated copy resolves `{phone}`
  // too and a token behaves identically in every locale. Returns the same object
  // when the config uses no tokens.
  const tokenized = resolveTokens(localized);
  // Untouched unless the site actually has routed pages, so one-pagers keep
  // their bare `#section` fragments exactly as authored.
  return tokenized.pages?.length ? rootRelativeAnchors(tokenized) : tokenized;
}

/**
 * Base config with the locale's translation overlay merged in, its per-locale
 * font applied, and sections localised by `id`. Returns the base untouched when
 * there's nothing to localise.
 */
function localizeForLocale(config: SiteConfig, locale: string): SiteConfig {
  const meta = localeMeta(config, locale);
  const t = config.translations?.[locale];

  // Per-locale font override always applies (even with no text overlay), so a
  // locale can swap to a script-appropriate face.
  const fonts: ThemeFonts = meta.font ? { ...config.theme.fonts, ...meta.font } : config.theme.fonts;
  const themeChanged = fonts !== config.theme.fonts;

  // Always drop `translations` from the returned config: it's been consumed, and
  // the config flows into client components (the header). Leaving it attached
  // would serialise EVERY language into EVERY page's RSC payload — bloat + a
  // cross-locale content leak into the HTML.
  const { translations: _drop, ...rest } = config;
  void _drop;

  if (!t && !themeChanged) return rest;

  const localized: SiteConfig = {
    ...rest,
    theme: themeChanged ? { ...config.theme, fonts } : config.theme,
  };

  if (!t) return localized;

  if (t.siteName) localized.siteName = t.siteName;
  if (t.nav) localized.nav = t.nav;
  if (t.header) localized.header = deepMerge(config.header ?? {}, t.header);
  if (t.footer) localized.footer = deepMerge(config.footer ?? {}, t.footer);
  if (t.business) localized.business = deepMerge(config.business ?? {}, t.business);
  if (t.seo) localized.seo = deepMerge(config.seo ?? {}, t.seo);

  // Sections: overlay props by section id (defaulting to type). The cast is
  // needed because `.map` erases the per-section `type`↔`props` correlation of
  // the discriminated union — the overlay is loosely typed by design, same as
  // the section registry. Defined outside the `if (t.sections)` branch below so
  // it is also available to the pages branch when a translation supplies ONLY
  // `t.pages` (a title/SEO fix with no section copy to change) — `t.sections?.`
  // handles the undefined case itself, returning each section unchanged.
  const overlaySections = (list: Section[]): Section[] =>
    list.map((section): Section => {
      const overlay = t.sections?.[section.id ?? section.type];
      if (!overlay) return section;
      return { ...section, props: deepMerge(section.props, overlay) } as Section;
    });

  if (t.sections) {
    localized.sections = overlaySections(config.sections);
  }

  // Routed pages localise through the SAME overlay map — their sections are
  // keyed by id/type just like home's, so ids must be unique site-wide. Without
  // this a multilingual site would silently serve English sub-pages. `t.pages`
  // additionally covers the page's own `title`/`seo`, which live on
  // `PageConfig` itself — outside the section tree, so `t.sections` cannot
  // reach them (see `Translation.pages`).
  if (config.pages?.length && (t.sections || t.pages)) {
    localized.pages = config.pages.map((page) => {
      const pageOverlay = t.pages?.[page.slug];
      return {
        ...page,
        title: pageOverlay?.title ?? page.title,
        seo: pageOverlay?.seo ? deepMerge(page.seo ?? {}, pageOverlay.seo) : page.seo,
        sections: overlaySections(page.sections),
      };
    });
  }

  return localized;
}
