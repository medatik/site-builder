import { describe, it, expect, vi } from "vitest";
import type { SiteConfig } from "@/lib/types";

/**
 * The sitemap is the one file whose entire job is telling a crawler that a URL
 * exists, and it shipped listing only the home page — so a live `/privacy` was
 * invisible to it for as long as routed pages have existed. Footer links made
 * such a page discoverable eventually, which is exactly why nobody noticed.
 *
 * These tests exist so adding a page type can't silently skip the sitemap again.
 */

const holder = vi.hoisted(() => ({ config: null as unknown as SiteConfig }));
vi.mock("@/lib/client", () => ({ getActiveConfig: () => holder.config }));

const { default: sitemap } = await import("@/app/sitemap");

function configWith(extra: Partial<SiteConfig>): SiteConfig {
  return {
    client: "acme",
    siteName: "Acme",
    business: { url: "https://acme.test", phone: "1", email: "a@b.c", address: "x" },
    sections: [],
    ...extra,
  } as unknown as SiteConfig;
}

describe("sitemap", () => {
  it("lists the home page alone when a site has no routed pages", () => {
    holder.config = configWith({});
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual(["https://acme.test"]);
  });

  it("includes every routed page", () => {
    holder.config = configWith({
      pages: [
        { slug: "privacy", title: "Privacy", nav: false, sections: [] },
        { slug: "commercial", title: "Commercial", sections: [] },
      ],
    } as Partial<SiteConfig>);

    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://acme.test/privacy");
    expect(urls).toContain("https://acme.test/commercial");
  });

  it("ranks a legal page (nav:false) below a page meant to rank", () => {
    holder.config = configWith({
      pages: [
        { slug: "privacy", title: "Privacy", nav: false, sections: [] },
        { slug: "commercial", title: "Commercial", sections: [] },
      ],
    } as Partial<SiteConfig>);

    const byUrl = Object.fromEntries(sitemap().map((e) => [e.url, e]));
    expect(byUrl["https://acme.test/privacy"].priority).toBeLessThan(
      byUrl["https://acme.test/commercial"].priority!,
    );
  });

  it("gives each page its own locale alternates, keeping the home page's slash", () => {
    holder.config = configWith({
      i18n: {
        defaultLocale: "en",
        locales: [
          { code: "en", label: "English" },
          { code: "fr", label: "Français" },
        ],
      },
      pages: [{ slug: "privacy", title: "Privacy", nav: false, sections: [] }],
    } as Partial<SiteConfig>);

    const byUrl = Object.fromEntries(sitemap().map((e) => [e.url, e]));

    // The home page's canonical form is the bare origin, so its query variant
    // needs the slash Next would otherwise drop.
    expect(byUrl["https://acme.test"].alternates?.languages?.fr).toBe(
      "https://acme.test/?lang=fr",
    );
    expect(byUrl["https://acme.test/privacy"].alternates?.languages?.fr).toBe(
      "https://acme.test/privacy?lang=fr",
    );
  });

  it("emits nothing when no site URL can be resolved", () => {
    holder.config = configWith({ business: { phone: "1", email: "a@b.c", address: "x" } } as Partial<SiteConfig>);
    expect(sitemap()).toEqual([]);
  });
});
