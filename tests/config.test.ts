import { describe, it, expect } from "vitest";
import { getActiveConfig } from "@/lib/client";
import { listClients } from "@/lib/client";
import type { SiteConfig } from "@/lib/types";

/**
 * Validates every config the engine ships, parameterised over the registry — so
 * a config added later is covered the moment it is registered, with no test edit.
 * A config is data, but it is data the build depends on: a broken one takes that
 * site down without any engine code having changed.
 */

/**
 * `pages` is optional and only exists once multi-page support lands; typing it
 * locally keeps this suite valid on branches with and without the feature.
 */
type MaybePaged = SiteConfig & {
  pages?: { slug: string; sections: { id?: string; type: string }[] }[];
};

/** Every anchor key on a site: sections plus any routed pages' sections. */
function anchorKeys(config: SiteConfig): string[] {
  const fromSections = config.sections.map((s) => s.id ?? s.type);
  const fromPages = ((config as MaybePaged).pages ?? []).flatMap((p) =>
    p.sections.map((s) => s.id ?? s.type),
  );
  return [...fromSections, ...fromPages];
}

describe.each(listClients().map((c) => [c.client, c] as const))("config: %s", (_slug, config) => {
  it("has unique section anchor keys", () => {
    // The key (`id`, defaulting to `type`) is BOTH the DOM anchor and the i18n
    // overlay key. Duplicates silently break in-page nav and make a translation
    // apply to the wrong section — neither raises an error at build time.
    const keys = anchorKeys(config);
    const dupes = [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))];
    expect(dupes, `duplicate section id/type: ${dupes.join(", ")}`).toEqual([]);
  });

  it("uses unique page slugs", () => {
    const slugs = ((config as MaybePaged).pages ?? []).map((p) => p.slug);
    const dupes = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
    expect(dupes, `duplicate page slug: ${dupes.join(", ")}`).toEqual([]);
  });

  it("only declares translation overlays for keys that exist", () => {
    // A typo'd overlay key type-checks (the map is a loose Record) and then
    // silently does nothing — this is the guard for that.
    const keys = new Set(anchorKeys(config));
    for (const [locale, t] of Object.entries(config.translations ?? {})) {
      const unknown = Object.keys(t.sections ?? {}).filter((k) => !keys.has(k));
      expect(unknown, `${locale} translates unknown section(s): ${unknown.join(", ")}`).toEqual([]);
    }
  });

  it("declares every locale it provides translations for", () => {
    const declared = new Set((config.i18n?.locales ?? []).map((l) => l.code));
    const translated = Object.keys(config.translations ?? {});
    const orphan = translated.filter((l) => !declared.has(l));
    expect(orphan, `translations for undeclared locale(s): ${orphan.join(", ")}`).toEqual([]);
  });

  it("points every nav/CTA anchor at a section that exists", () => {
    const keys = new Set(anchorKeys(config));
    const anchors = (config.nav ?? [])
      .map((n) => n.href)
      .concat(config.header?.cta ? [config.header.cta.href] : [])
      .filter((h) => h?.startsWith("#") || h?.startsWith("/#"))
      .map((h) => h.replace(/^\/?#/, ""));
    const broken = anchors.filter((a) => a !== "top" && !keys.has(a));
    expect(broken, `nav/CTA points at missing section(s): ${broken.join(", ")}`).toEqual([]);
  });
});

describe("active client", () => {
  it("resolves", () => {
    expect(getActiveConfig().client).toBeTruthy();
  });
});
