import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { paletteCssVars } from "@/lib/theme";
import { Stars } from "@/components/ui/Stars";
import type { ThemeColors } from "@/lib/types";

/**
 * Stars took `--accent`, which conflated two different jobs: an accent is a
 * decorative brand pop, a star is meaningful non-text content that must clear
 * WCAG's 3:1 against its surface. All three client palettes failed that (2.27,
 * 2.53, 2.94:1), and the only fix available was darkening brand colours to
 * satisfy a constraint that was never about them.
 *
 * `--star` separates the two. These pin that separation, and the contrast of
 * the defaults — because the whole point is a guarantee, not a good intention.
 */

const hex2rgb = (h: string) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lum = (rgb: number[]) => {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [L1, L2] = [lum(hex2rgb(a)), lum(hex2rgb(b))];
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};
const starFrom = (css: string) => css.match(/--star:([^;]+)/)?.[1] ?? "";

const base: ThemeColors = {
  primary: "#123E63", secondary: "#0C1622", accent: "#E8930A",
  background: "#F4F7FB", text: "#0F1C2B", muted: "#566574",
};

describe("star colour", () => {
  it("is emitted as its own variable, independent of accent", () => {
    const css = paletteCssVars(base, "light");
    expect(css).toContain("--star:");
    expect(starFrom(css)).not.toBe(base.accent);
  });

  it("differs by mode — one gold cannot serve near-white and near-black", () => {
    expect(starFrom(paletteCssVars(base, "light"))).not.toBe(
      starFrom(paletteCssVars(base, "dark")),
    );
  });

  it("the LIGHT default clears 3:1 on every light background in use", () => {
    const star = starFrom(paletteCssVars(base, "light"));
    for (const bg of ["#F4F7FB", "#F4F1E9", "#F6FAF8", "#FFFFFF"]) {
      expect(ratio(star, bg), `${star} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("the DARK default clears 3:1 on every dark background in use", () => {
    const star = starFrom(paletteCssVars({ ...base, background: "#0C1622" }, "dark"));
    for (const bg of ["#0C1622", "#17151C", "#090507", "#000000"]) {
      expect(ratio(star, bg), `${star} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("a client can override it", () => {
    const css = paletteCssVars({ ...base, star: "#123456" }, "light");
    expect(starFrom(css)).toBe("#123456");
  });

  it("Stars renders with the star colour, never the accent", () => {
    const html = renderToStaticMarkup(<Stars rating={4} />);
    expect(html).toContain("fill-star");
    expect(html).not.toContain("fill-accent");
  });
});
