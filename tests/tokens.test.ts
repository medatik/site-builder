import { describe, it, expect } from "vitest";
import { resolveTokens, buildTokens, hardenPhone, telHref } from "@/lib/tokens";
import { localizeConfig } from "@/lib/i18n";
import type { SiteConfig } from "@/lib/types";

/**
 * Tokens are what let a config stay pure data (see "Configs are data"
 * in the README). The rules worth pinning down are the ones that fail
 * SILENTLY if they regress: a leaked isolate character inside a `tel:` link
 * still looks like a phone number, and an unexpanded `{phone}` still renders.
 */

const LRI = "⁦";
const PDI = "⁩";
const NBSP = " ";

const base = {
  client: "t",
  siteName: "Testfirm",
  logo: { alt: "T" },
  theme: { stylePreset: "rounded", defaultMode: "light", fonts: { heading: "a", body: "b" } },
  business: { phone: "+212 656 55 01 64", email: "hi@test.com", address: "Casablanca" },
  sections: [],
} as unknown as SiteConfig;

describe("phone hardening", () => {
  it("wraps in bidi isolates and swaps spaces for NBSP", () => {
    expect(hardenPhone("+212 656 55")).toBe(`${LRI}+212${NBSP}656${NBSP}55${PDI}`);
  });

  it("builds a tel: href identical to what the components generate inline", () => {
    // Contact.tsx / Location.tsx / footers/parts.tsx / SpotlightFooter.tsx all do
    // `tel:${business.phone.replace(/\s+/g, "")}`. If this diverged, a {phoneHref}
    // link and an engine-rendered link would point at different numbers.
    const raw = "+212 656 55 01 64";
    expect(telHref(raw)).toBe(`tel:${raw.replace(/\s+/g, "")}`);
    expect(telHref(raw)).toBe("tel:+212656550164");
  });

  it("strips NBSP too, so a hardened value passed here still yields a clean href", () => {
    expect(telHref(hardenPhone("+212 656 55"))).not.toContain(NBSP);
  });
});

describe("token expansion", () => {
  it("expands {phone} into copy, hardened", () => {
    const cfg = resolveTokens({
      ...base,
      sections: [{ type: "hero", props: { title: "Call {phone} today" } }],
    } as unknown as SiteConfig);
    expect((cfg.sections[0].props as { title: string }).title).toBe(
      `Call ${LRI}+212${NBSP}656${NBSP}55${NBSP}01${NBSP}64${PDI} today`,
    );
  });

  it("expands {phoneHref} with NO isolate characters in it", () => {
    // The bug this exists to prevent: isolates leaking into a live tel: link.
    const cfg = resolveTokens({
      ...base,
      sections: [{ type: "hero", props: { cta: { href: "{phoneHref}" } } }],
    } as unknown as SiteConfig);
    const href = (cfg.sections[0].props as unknown as { cta: { href: string } }).cta.href;
    expect(href).toBe("tel:+212656550164");
    expect(href).not.toContain(LRI);
    expect(href).not.toContain(PDI);
    expect(href).not.toContain(NBSP);
  });

  it("leaves business.phone RAW so the components can derive their own hrefs", () => {
    const cfg = resolveTokens({
      ...base,
      sections: [{ type: "hero", props: { title: "Call {phone}" } }],
    } as unknown as SiteConfig);
    expect(cfg.business?.phone).toBe("+212 656 55 01 64");
    expect(cfg.business?.phone).not.toContain(LRI);
    expect(cfg.business?.phone).not.toContain(NBSP);
  });

  it("leaves an unrecognised {token} exactly as written", () => {
    const cfg = resolveTokens({
      ...base,
      sections: [{ type: "hero", props: { title: "Save {amount} on {notAToken}" } }],
    } as unknown as SiteConfig);
    expect((cfg.sections[0].props as { title: string }).title).toBe("Save {amount} on {notAToken}");
  });

  it("walks nested arrays and objects", () => {
    const cfg = resolveTokens({
      ...base,
      sections: [
        {
          type: "pricing",
          props: { tiers: [{ features: ["Ring {phoneRaw}"], cta: { href: "{phoneHref}" } }] },
        },
      ],
    } as unknown as SiteConfig);
    const tier = (cfg.sections[0].props as { tiers: { features: string[]; cta: { href: string } }[] })
      .tiers[0];
    expect(tier.features[0]).toBe("Ring +212 656 55 01 64");
    expect(tier.cta.href).toBe("tel:+212656550164");
  });

  it("is idempotent — resolving twice changes nothing", () => {
    const once = resolveTokens({
      ...base,
      sections: [{ type: "hero", props: { title: "Call {phone}" } }],
    } as unknown as SiteConfig);
    expect(resolveTokens(once)).toEqual(once);
  });

  it("returns the SAME object when a config uses no tokens (costs nothing)", () => {
    expect(resolveTokens(base)).toBe(base);
  });

  it("offers {email}/{emailHref}/{address}/{siteName}", () => {
    const tokens = buildTokens(base);
    expect(tokens.email).toBe("hi@test.com");
    expect(tokens.emailHref).toBe("mailto:hi@test.com");
    expect(tokens.address).toBe("Casablanca");
    expect(tokens.siteName).toBe("Testfirm");
  });

  it("omits tokens whose business field is absent, leaving them unexpanded", () => {
    const noBusiness = { ...base, business: undefined } as unknown as SiteConfig;
    const cfg = resolveTokens({
      ...noBusiness,
      sections: [{ type: "hero", props: { title: "Call {phone}" } }],
    } as unknown as SiteConfig);
    expect((cfg.sections[0].props as { title: string }).title).toBe("Call {phone}");
  });
});

describe("tokens and translations", () => {
  const multi = {
    ...base,
    i18n: {
      defaultLocale: "en",
      locales: [
        { code: "en", label: "English", dir: "ltr" },
        { code: "ar", label: "العربية", dir: "rtl" },
      ],
    },
    sections: [{ type: "hero", id: "hero", enabled: true, props: { title: "Call {phone}" } }],
    translations: {
      ar: { sections: { hero: { title: "اتصل على {phone}" } } },
    },
  } as unknown as SiteConfig;

  it("expands tokens inside TRANSLATED copy, after the overlay merge", () => {
    const ar = localizeConfig(multi, "ar");
    expect((ar.sections[0].props as { title: string }).title).toBe(
      `اتصل على ${LRI}+212${NBSP}656${NBSP}55${NBSP}01${NBSP}64${PDI}`,
    );
  });

  it("uses the locale's OWN business override, not the base one", () => {
    // This is why resolveTokens skips `translations` and localizeConfig re-runs it.
    const withLocalAddress = {
      ...multi,
      sections: [{ type: "hero", id: "hero", enabled: true, props: { title: "Visit {address}" } }],
      translations: {
        ar: {
          business: { address: "الدار البيضاء" },
          sections: { hero: { title: "زر {address}" } },
        },
      },
    } as unknown as SiteConfig;
    const ar = localizeConfig(withLocalAddress, "ar");
    expect((ar.sections[0].props as { title: string }).title).toBe("زر الدار البيضاء");
    // The default locale still gets the base address.
    const en = localizeConfig(withLocalAddress, "en");
    expect((en.sections[0].props as { title: string }).title).toBe("Visit Casablanca");
  });
});
