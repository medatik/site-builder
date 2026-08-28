import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { jsonLdScript, structuredData } from "@/lib/seo";
import { cssColor, paletteCssVars } from "@/lib/theme";
import { ThemeScope } from "@/components/ThemeScope";
import type { SiteConfig, Theme, ThemeColors } from "@/lib/types";

/**
 * Three places interpolate config values into raw markup: the JSON-LD
 * `<script>`, the scoped `<style>`, and the pre-paint theme `<script>`. All
 * three were safe only because a human writes every config by hand.
 *
 * `validate-config.ts` states its own reason for existing as "the moment a
 * config arrives from somewhere TS never compiled — a database, a CMS, the
 * planned UI editor". That is the same moment these become live XSS, so they
 * are closed now rather than after the UI ships and makes it urgent.
 *
 * Each test asserts the ATTACK fails, not merely that some escaping happened —
 * a check for "contains &lt;" would pass on output that still executes.
 */

const BREAKOUT = "</script><script>alert(1)</script>";

describe("JSON-LD cannot be broken out of", () => {
  it("neutralises a closing script tag in any config value", () => {
    const out = jsonLdScript({ name: BREAKOUT });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<script>");
  });

  it("still round-trips, so consumers read the true value", () => {
    // Escaping that corrupted the data would trade one bug for another.
    const out = jsonLdScript({ name: BREAKOUT });
    expect(JSON.parse(out).name).toBe(BREAKOUT);
  });

  it("holds for a whole config going through structuredData", () => {
    const config = {
      client: "x",
      siteName: BREAKOUT,
      business: { phone: "1", email: "a@b.c", address: BREAKOUT },
      sections: [],
    } as unknown as SiteConfig;
    const out = jsonLdScript(structuredData(config));
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe(BREAKOUT);
  });

  it("escapes U+2028/U+2029, which are legal JSON but break some JS parsers", () => {
    const out = jsonLdScript({ a: "x y z" });
    expect(out).not.toContain(" ");
    expect(out).not.toContain(" ");
    expect(JSON.parse(out).a).toBe("x y z");
  });
});

describe("palette values cannot escape the <style> block", () => {
  afterEach(() => vi.restoreAllMocks());

  it("accepts every colour syntax a real config legitimately uses", () => {
    for (const ok of [
      "#fff",
      "#F4F7FB",
      "rgb(255, 0, 0)",
      "hsl(210 40% 98%)",
      "oklch(0.7 0.1 250)",
      "color-mix(in srgb, var(--primary) 40%, transparent)",
      "rebeccapurple",
    ]) {
      expect(cssColor(ok, "#000"), ok).toBe(ok);
    }
  });

  it("rejects anything that could end the declaration, rule or tag", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const bad of [
      "red}</style><script>alert(1)</script>",
      "red;background:url(evil)",
      "red}",
      'red"',
      "red\\",
      "<script>",
    ]) {
      expect(cssColor(bad, "#000"), bad).toBe("#000");
    }
  });

  it("a hostile palette produces no markup-closing characters at all", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const evil: ThemeColors = {
      primary: "red}</style><script>alert(1)</script>",
      secondary: "blue;}",
      accent: "green}",
      background: "#fff",
      text: "#000",
    };
    const css = paletteCssVars(evil, "light");
    expect(css).not.toContain("</style>");
    expect(css).not.toContain("<");
    expect(css).not.toContain("}");
  });
});

describe("the pre-paint theme script cannot be broken out of", () => {
  const theme: Theme = {
    stylePreset: "sharp",
    fonts: { heading: "Inter", body: "Inter" },
    colorsLight: { primary: "#123E63", secondary: "#0C1622", accent: "#C17A08", background: "#F4F7FB", text: "#0F1C2B" },
    colorsDark: { primary: "#FFB020", secondary: "#12324F", accent: "#38D2F0", background: "#0C1622", text: "#EAF1F8" },
  };

  it("neutralises a hostile scope id in both the CSS selector and the script", () => {
    const html = renderToStaticMarkup(
      <ThemeScope theme={theme} scopeId={"x'}</style><script>alert(1)</script>"} switchable>
        <p>hi</p>
      </ThemeScope>,
    );
    // The only <script> present must be ours, and no tag may be closed early.
    expect(html).not.toContain("alert(1)");
    expect(html).not.toContain("</style><script>");
  });

  it("keeps a normal slug working, so the guard costs nothing", () => {
    const html = renderToStaticMarkup(
      <ThemeScope theme={theme} scopeId="voltedge-electric" switchable>
        <p>hi</p>
      </ThemeScope>,
    );
    expect(html).toContain("site-voltedge-electric");
    expect(html).toContain("themeMode:voltedge-electric");
  });
});
