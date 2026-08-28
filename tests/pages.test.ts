import { describe, it, expect } from "vitest";
import { resolveNav, rootRelativeAnchors } from "@/lib/nav";
import { localizeConfig } from "@/lib/i18n";
import type { SiteConfig } from "@/lib/types";

const base = {
  client: "t",
  siteName: "T",
  logo: { alt: "T" },
  theme: { stylePreset: "rounded", defaultMode: "light", fonts: { heading: "a", body: "b" } },
  sections: [
    { type: "services", enabled: true, props: { title: "S", items: [] } },
    { type: "contact", enabled: true, props: { title: "C" } },
  ],
} as unknown as SiteConfig;

describe("nav with and without routed pages", () => {
  it("a one-pager keeps bare #fragments (unchanged behaviour)", () => {
    expect(resolveNav(base).map((n) => n.href)).toEqual(["#services", "#contact"]);
  });

  it("root-relatives section links once pages exist, so they work from a sub-page", () => {
    const withPages = {
      ...base,
      pages: [{ slug: "privacy", title: "Privacy", nav: false, sections: [] }],
    } as SiteConfig;
    expect(resolveNav(withPages).map((n) => n.href)).toEqual(["/#services", "/#contact"]);
  });

  it("lists nav-opted-in pages after the sections, and omits nav:false ones", () => {
    const withPages = {
      ...base,
      pages: [
        { slug: "privacy", title: "Privacy", nav: false, sections: [] },
        { slug: "pricing-guide", title: "Guide", sections: [] },
      ],
    } as SiteConfig;
    const nav = resolveNav(withPages);
    expect(nav.map((n) => n.href)).toEqual(["/#services", "/#contact", "/pricing-guide"]);
    expect(nav.find((n) => n.href === "/privacy")).toBeUndefined();
  });

  it("an explicit config.nav still wins over everything", () => {
    const explicit = {
      ...base,
      nav: [{ label: "Only", href: "/only" }],
      pages: [{ slug: "privacy", title: "Privacy", sections: [] }],
    } as SiteConfig;
    expect(resolveNav(explicit)).toEqual([{ label: "Only", href: "/only" }]);
  });
});

describe("anchors work from sub-pages", () => {
  it("rewrites bare #fragments to root-relative, at any depth", () => {
    const cfg = {
      header: { cta: { label: "Call", href: "#contact" } },
      sections: [
        { type: "hero", props: { primaryCta: { href: "#contact" }, secondaryCta: { href: "#services" } } },
        { type: "pricing", props: { tiers: [{ cta: { href: "#contact" } }] } },
      ],
    };
    const out = rootRelativeAnchors(cfg) as typeof cfg;
    expect(out.header.cta.href).toBe("/#contact");
    expect(out.sections[0].props.primaryCta!.href).toBe("/#contact");
    expect(out.sections[0].props.secondaryCta!.href).toBe("/#services");
    // nested inside an array of objects — the shape that's easy to miss
    expect(out.sections[1].props.tiers![0].cta.href).toBe("/#contact");
  });

  it("leaves absolute, external and already-rooted hrefs alone", () => {
    const cfg = {
      a: { href: "/privacy" },
      b: { href: "https://example.com" },
      c: { href: "tel:+15550000000" },
      d: { href: "/#contact" },
    };
    expect(rootRelativeAnchors(cfg)).toEqual(cfg);
  });

  it("is applied by localizeConfig only when the site has pages", () => {
    const onePager = {
      ...base,
      header: { cta: { label: "x", href: "#contact" } },
    } as SiteConfig;
    expect(localizeConfig(onePager, "en").header?.cta?.href).toBe("#contact");

    const paged = {
      ...onePager,
      pages: [{ slug: "privacy", title: "Privacy", nav: false, sections: [] }],
    } as SiteConfig;
    expect(localizeConfig(paged, "en").header?.cta?.href).toBe("/#contact");
  });
});

describe("i18n reaches routed pages", () => {
  const multi = {
    ...base,
    i18n: { defaultLocale: "en", locales: [{ code: "en", label: "EN" }, { code: "fr", label: "FR" }] },
    pages: [
      {
        slug: "privacy",
        title: "Privacy",
        nav: false,
        sections: [{ type: "about", id: "privacy-body", enabled: true, props: { title: "Privacy policy", body: "x" } }],
      },
    ],
    translations: {
      fr: { sections: { "privacy-body": { title: "Politique de confidentialité" } } },
    },
  } as unknown as SiteConfig;

  it("translates page sections, not just home sections", () => {
    const fr = localizeConfig(multi, "fr");
    const props = fr.pages?.[0].sections[0].props as { title: string };
    expect(props.title).toBe("Politique de confidentialité");
  });

  it("leaves the default locale untouched", () => {
    const en = localizeConfig(multi, "en");
    const props = en.pages?.[0].sections[0].props as { title: string };
    expect(props.title).toBe("Privacy policy");
  });

  it("still strips translations from the returned config (no RSC leak)", () => {
    expect(localizeConfig(multi, "fr").translations).toBeUndefined();
  });
});
