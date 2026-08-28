import { describe, it, expect } from "vitest";
import { validateConfig, assertValidConfig } from "@/lib/validate-config";

/**
 * These assert the validator has TEETH. Its whole reason to exist is catching
 * configs TypeScript never compiled (a DB row, the future UI editor, JSON over
 * the wire), so each case here is written as "malformed input arrives at
 * runtime" — not as a type error.
 */

const valid = {
  client: "acme",
  siteName: "Acme",
  logo: { alt: "Acme" },
  theme: { stylePreset: "rounded", fonts: { heading: "Poppins", body: "Inter" }, colorsLight: { primary: "#000" } },
  sections: [{ type: "hero", enabled: true, props: { title: "Hi" } }],
};

describe("validateConfig", () => {
  it("accepts a well-formed config", () => {
    expect(validateConfig(valid)).toEqual([]);
  });

  it("rejects a missing required field", () => {
    const { siteName: _omit, ...noName } = valid;
    void _omit;
    expect(validateConfig(noName).join()).toMatch(/siteName/);
  });

  it("rejects an unknown section type (it would silently render nothing)", () => {
    const bad = { ...valid, sections: [{ type: "carousel-of-doom", props: {} }] };
    expect(validateConfig(bad).join()).toMatch(/type/);
  });

  it("rejects a theme with no palette (site would render unthemed)", () => {
    const bad = { ...valid, theme: { stylePreset: "rounded", fonts: { heading: "a", body: "b" } } };
    expect(validateConfig(bad).join()).toMatch(/colorsLight/);
  });

  it("rejects an unknown style preset", () => {
    const bad = { ...valid, theme: { ...valid.theme, stylePreset: "neon" } };
    expect(validateConfig(bad).length).toBeGreaterThan(0);
  });

  it("rejects a site with no sections", () => {
    expect(validateConfig({ ...valid, sections: [] }).join()).toMatch(/at least one section/);
  });

  it("catches duplicate section keys (breaks anchors AND i18n silently)", () => {
    const bad = {
      ...valid,
      sections: [
        { type: "hero", props: { title: "a" } },
        { type: "hero", props: { title: "b" } },
      ],
    };
    expect(validateConfig(bad).join()).toMatch(/duplicate section id\/type: hero/);
  });

  it("catches a translation pointing at a section that doesn't exist", () => {
    const bad = { ...valid, translations: { fr: { sections: { servicse: {} } } } };
    expect(validateConfig(bad).join()).toMatch(/unknown section "servicse"/);
  });

  it("catches a defaultLocale that isn't in the locale list", () => {
    const bad = { ...valid, i18n: { defaultLocale: "de", locales: [{ code: "en" }] } };
    expect(validateConfig(bad).join()).toMatch(/defaultLocale/);
  });

  it("rejects a page slug with a leading slash", () => {
    const bad = { ...valid, pages: [{ slug: "/privacy", title: "P", sections: [] }] };
    expect(validateConfig(bad).join()).toMatch(/kebab-case/);
  });

  it("assertValidConfig throws with every problem listed", () => {
    expect(() => assertValidConfig({ ...valid, sections: [] })).toThrow(/at least one section/);
    expect(() => assertValidConfig(valid)).not.toThrow();
  });
});

describe("review markup over placeholder copy", () => {
  const withReviews = (structuredData: boolean, items: Record<string, unknown>[]) => ({
    ...valid,
    sections: [{ type: "testimonials", enabled: true, props: { title: "Reviews", structuredData, items } }],
  });

  const PLACEHOLDER = [
    { quote: "Replace this with a real quote from a real customer.", author: "First Customer", rating: 5 },
  ];
  const REAL = [
    { quote: "They rewired the whole shop over a weekend and came in under quote.", author: "Samira B.", rating: 5 },
  ];

  it("flags markup enabled over template placeholder copy", () => {
    // The one config mistake whose consequence is outside the site: a Google
    // manual action strips rich results from the domain.
    expect(validateConfig(withReviews(true, PLACEHOLDER)).join()).toMatch(/placeholder text/);
  });

  it("says nothing when the reviews are real", () => {
    expect(validateConfig(withReviews(true, REAL))).toEqual([]);
  });

  it("says nothing when the markup is off, however fake the copy", () => {
    // Placeholders are expected in an unfinished config — they only matter
    // once the config starts making a public claim.
    expect(validateConfig(withReviews(false, PLACEHOLDER))).toEqual([]);
  });

  it("catches it on a routed page too, not just the home page", () => {
    const cfg = {
      ...valid,
      pages: [{ slug: "reviews", title: "Reviews", sections: [
        { type: "testimonials", enabled: true, props: { title: "R", structuredData: true, items: PLACEHOLDER } },
      ] }],
    };
    expect(validateConfig(cfg).join()).toMatch(/placeholder text/);
  });
});
