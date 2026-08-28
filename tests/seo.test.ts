import { describe, it, expect, afterEach } from "vitest";
import { structuredData, siteUrl } from "@/lib/seo";
import { getActiveConfig } from "@/lib/client";
import type { SiteConfig } from "@/lib/types";

/** Minimal config fixture; only the fields structured data reads. */
const config = {
  ...getActiveConfig(),
  siteName: "Acme Plumbing",
  business: {
    phone: "+1 (555) 000-0000",
    email: "hello@acme.com",
    address: "123 Main Street, Springfield",
    schemaType: "Plumber",
    url: "https://acme.com",
    hours: [
      { days: "Mon–Fri", hours: "8:00am – 6:00pm" },
      { days: "Saturday", hours: "By appointment" },
    ],
    socials: [{ icon: "facebook", label: "Facebook", href: "https://facebook.com/acme" }],
  },
} as SiteConfig;

describe("structured data (local SEO)", () => {
  const ld = structuredData(config);

  it("uses the client's specific schema type", () => {
    expect(ld["@type"]).toBe("Plumber");
  });

  it("falls back to LocalBusiness when unspecified", () => {
    const noType = structuredData({ ...config, business: { phone: "1" } } as SiteConfig);
    expect(noType["@type"]).toBe("LocalBusiness");
  });

  it("carries the NAP data Google needs", () => {
    expect(ld.name).toBe("Acme Plumbing");
    expect(ld.telephone).toBe("+1 (555) 000-0000");
    expect(ld.address).toMatchObject({ streetAddress: "123 Main Street, Springfield" });
  });

  it("expands a weekday range into individual days with 24h times", () => {
    const specs = ld.openingHoursSpecification as Array<Record<string, unknown>>;
    expect(specs[0].dayOfWeek).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    expect(specs[0].opens).toBe("08:00");
    expect(specs[0].closes).toBe("18:00");
  });

  it("omits times it cannot parse rather than publishing wrong hours", () => {
    const specs = ld.openingHoursSpecification as Array<Record<string, unknown>>;
    const sat = specs.find((s) => (s.dayOfWeek as string[])?.includes("Saturday"));
    expect(sat).toBeDefined();
    expect(sat?.opens).toBeUndefined();
  });

  it("lists socials as sameAs (identity signals)", () => {
    expect(ld.sameAs).toEqual(["https://facebook.com/acme"]);
  });

  it("emits valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(ld))).not.toThrow();
  });
});

describe("canonical site URL", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it("prefers explicit config over env", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://from-env.com";
    expect(siteUrl(config)).toBe("https://acme.com");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://from-env.com";
    expect(siteUrl({ ...config, business: { phone: "1" } } as SiteConfig)).toBe("https://from-env.com");
  });

  it("falls back to Vercel's production domain (so deploys need no wiring)", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "acme.vercel.app";
    expect(siteUrl({ ...config, business: { phone: "1" } } as SiteConfig)).toBe("https://acme.vercel.app");
  });

  it("strips a trailing slash so joined URLs never double up", () => {
    expect(siteUrl({ ...config, business: { url: "https://acme.com/" } } as SiteConfig)).toBe("https://acme.com");
  });

  it("is undefined when nothing is configured (sitemap then emits no URLs)", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(siteUrl({ ...config, business: { phone: "1" } } as SiteConfig)).toBeUndefined();
  });
});

describe("review markup is guarded", () => {
  const withTestimonials = (props: Record<string, unknown>) =>
    ({
      ...config,
      business: {
        ...config.business,
        // A rating copied from Google — must never reach the JSON-LD.
        rating: { value: 4.9, count: 213, url: "https://g.page/x", source: "Google" },
      },
      sections: [
        { type: "testimonials", enabled: true, props: {
          title: "Reviews",
          items: [
            { quote: "Great work", author: "Ann", rating: 5 },
            { quote: "Very tidy", author: "Ben", rating: 4 },
          ],
          ...props,
        } },
      ],
    }) as unknown as SiteConfig;

  it("emits NOTHING without the explicit opt-in", () => {
    const ld = structuredData(withTestimonials({}));
    expect(ld.review).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
  });

  it("emits Review + AggregateRating when opted in", () => {
    const ld = structuredData(withTestimonials({ structuredData: true }));
    expect(Array.isArray(ld.review)).toBe(true);
    expect((ld.review as unknown[]).length).toBe(2);
    expect(ld.aggregateRating).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: 4.5, // (5 + 4) / 2
      reviewCount: 2,
    });
  });

  it("NEVER derives markup from business.rating (that rating is Google's)", () => {
    // The Google aggregate is 4.9 / 213. Marking it up would breach Google's
    // structured-data policy, so it must appear nowhere in the JSON-LD.
    const ld = structuredData(withTestimonials({ structuredData: true }));
    const json = JSON.stringify(ld);
    expect(json).not.toContain("213");
    expect(json).not.toContain("4.9");
    expect((ld.aggregateRating as { reviewCount: number }).reviewCount).toBe(2);
  });

  it("skips unrated testimonials rather than emitting invalid Review nodes", () => {
    const ld = structuredData(
      withTestimonials({ structuredData: true, items: [{ quote: "No stars", author: "Cy" }] }),
    );
    expect(ld.review).toBeUndefined();
  });

  it("ignores a disabled testimonials section", () => {
    const cfg = withTestimonials({ structuredData: true });
    (cfg.sections[0] as { enabled: boolean }).enabled = false;
    expect(structuredData(cfg).review).toBeUndefined();
  });

  it("rounds the average to one decimal place", () => {
    const ld = structuredData(
      withTestimonials({ structuredData: true, items: [
        { quote: "a", author: "A", rating: 5 },
        { quote: "b", author: "B", rating: 4 },
        { quote: "c", author: "C", rating: 5 },
      ] }),
    );
    expect((ld.aggregateRating as { ratingValue: number }).ratingValue).toBe(4.7);
  });
});
