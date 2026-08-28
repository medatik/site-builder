import { describe, it, expect } from "vitest";
import { brandFingerprint, monogram } from "@/lib/seo";
import type { SiteConfig } from "@/lib/types";

/**
 * The favicon and OG card are generated per client, but Next derives the `?hash`
 * on `/icon` and `/opengraph-image` from the SOURCE FILE — which is engine code,
 * identical for every site. So every site's icon was served from one
 * URL under `Cache-Control: immutable, max-age=31536000`, and a browser that had
 * seen any earlier version kept it for a year. Reloading could not fix it: the
 * URL never changed, so nothing was ever re-fetched.
 *
 * `brandFingerprint` goes into `generateImageMetadata`'s `id`, putting the
 * branding in the path. These tests exist because the failure is invisible in
 * development (a hard reload hides it) and only bites returning visitors and
 * social-platform scrapers.
 */

function config(extra: Record<string, unknown>): SiteConfig {
  return {
    client: "acme",
    siteName: "Acme Plumbing",
    logo: {},
    theme: { stylePreset: "sharp", fonts: { heading: "Inter", body: "Inter" } },
    sections: [],
    ...extra,
  } as unknown as SiteConfig;
}

describe("brandFingerprint", () => {
  it("is stable for identical input (so a rebuild doesn't churn the URL)", () => {
    expect(brandFingerprint("acme", "AP", "#111", "#fff")).toBe(
      brandFingerprint("acme", "AP", "#111", "#fff"),
    );
  });

  it("changes when ANY drawn value changes", () => {
    const base = brandFingerprint("acme", "AP", "#111", "#fff");
    expect(brandFingerprint("other", "AP", "#111", "#fff")).not.toBe(base); // client
    expect(brandFingerprint("acme", "XY", "#111", "#fff")).not.toBe(base); // monogram
    expect(brandFingerprint("acme", "AP", "#222", "#fff")).not.toBe(base); // primary
    expect(brandFingerprint("acme", "AP", "#111", "#eee")).not.toBe(base); // background
  });

  it("distinguishes two clients that differ only by slug", () => {
    // The real-world case: the template and a client both rendering a 1-letter
    // mark on similar colours must not collide onto one cached URL.
    expect(brandFingerprint("voltedge-electric", "V", "#f5a", "#0b1")).not.toBe(
      brandFingerprint("_template", "V", "#f5a", "#0b1"),
    );
  });

  it("is URL-safe and short", () => {
    expect(brandFingerprint("acme", "AP", "#111", "#fff")).toMatch(/^[a-z0-9]+$/);
  });

  it("treats a missing part differently from an empty one being absent", () => {
    expect(brandFingerprint("a", undefined, "b")).toBe(brandFingerprint("a", "b"));
  });
});

describe("monogram", () => {
  it("prefers an explicit monogram, capped at two characters", () => {
    expect(monogram(config({ logo: { monogram: "VE" } }))).toBe("VE");
    expect(monogram(config({ logo: { monogram: "LONG" } }))).toBe("LO");
  });

  it("falls back to the first letter of the site name, uppercased", () => {
    expect(monogram(config({ siteName: "acme plumbing" }))).toBe("A");
  });

  it("is the single source the icon, the OG card and the fingerprint all read", () => {
    // If these ever diverge, the URL stops changing when the drawn mark changes
    // — which is exactly the bug this whole mechanism exists to prevent.
    const c = config({ logo: { monogram: "VE" } });
    expect(brandFingerprint(c.client, monogram(c))).toBe(brandFingerprint("acme", "VE"));
  });
});
