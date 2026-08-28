import type { MetadataRoute } from "next";
import { getActiveConfig } from "@/lib/client";
import { siteUrl } from "@/lib/seo";

/**
 * Sitemap for the active client: the home page plus every routed page declared
 * in `config.pages`. Multilingual sites list each locale as an alternate so
 * search engines index every language rather than treating `?lang=` as
 * duplicate content.
 *
 * Routed pages were missing here until 2026-08-03 — `pages` shipped and the
 * sitemap was never taught about it, so a live `/privacy` was absent from the
 * one file whose entire job is telling crawlers a URL exists. Footer links made
 * it discoverable eventually; the sitemap makes it immediate.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const config = getActiveConfig();
  const base = siteUrl(config);
  if (!base) return [];

  const locales = config.i18n?.locales ?? [];
  const defaultLocale = config.i18n?.defaultLocale;

  /**
   * Per-URL locale alternates. The home page's canonical form is the bare
   * origin, so its `?lang=` variants need the slash Next would otherwise drop
   * (`https://site.com/?lang=fr`, not `https://site.com?lang=fr`).
   */
  function alternates(url: string) {
    if (locales.length <= 1) return undefined;
    const withLang = (code: string) =>
      url === base ? `${base}/?lang=${code}` : `${url}?lang=${code}`;
    return {
      languages: Object.fromEntries(
        locales.map((l) => [l.code, l.code === defaultLocale ? url : withLang(l.code)]),
      ),
    };
  }

  function entry(
    url: string,
    changeFrequency: "monthly" | "yearly",
    priority: number,
  ): MetadataRoute.Sitemap[number] {
    const alt = alternates(url);
    return {
      url,
      lastModified: new Date(),
      changeFrequency,
      priority,
      ...(alt ? { alternates: alt } : {}),
    };
  }

  return [
    entry(base, "monthly", 1),
    ...(config.pages ?? []).map((page) =>
      // `nav: false` is how a legal page is declared (it's routed to the footer
      // rather than the header), so it doubles as the signal that this page is
      // boilerplate rather than something the client wants to rank.
      page.nav === false
        ? entry(`${base}/${page.slug}`, "yearly", 0.3)
        : entry(`${base}/${page.slug}`, "monthly", 0.8),
    ),
  ];
}
