import { describe, it, expect } from "vitest";
import { onColor, contrastRatio, paletteCssVars } from "@/lib/theme";
import type { ThemeColors } from "@/lib/types";

/**
 * Filled elements used to hardcode their label as `var(--background)` and assume
 * that contrasted — a limitation that shipped for months. For `primary`
 * it usually does. For `accent` it usually doesn't: an accent is chosen to POP
 * against the page, which makes it mid-tone, and mid-tone is exactly what
 * neither the palette's ink nor its paper contrasts. The "most popular" pricing
 * badge was live at 2.94–3.23:1 because of it.
 *
 * `onColor` picks a foreground that measurably passes. These assert the
 * guarantee against every real client palette, not just a fixture — a rule that
 * only holds for invented colours would be worthless.
 */

const AA = 4.5;

const palettes: Record<string, ThemeColors> = {
  "voltedge light": { primary: "#123E63", secondary: "#0C1622", accent: "#C17A08", background: "#F4F7FB", text: "#0F1C2B", muted: "#566574" },
  "voltedge dark":  { primary: "#FFB020", secondary: "#12324F", accent: "#38D2F0", background: "#0C1622", text: "#EAF1F8", muted: "#8DA2B8" },
  "merrick light":  { primary: "#8A2733", secondary: "#1B2A4A", accent: "#A77F39", background: "#F4F1E9", text: "#20242E", muted: "#5B6172" },
  "merrick dark":   { primary: "#C0913F", secondary: "#22304F", accent: "#C24A56", background: "#17151C", text: "#ECE7DD", muted: "#9A9488" },
  "riverside light":{ primary: "#117B6F", secondary: "#0B5A54", accent: "#D36F57", background: "#F6FAF8", text: "#173430", muted: "#58746E" },
  "riverside dark": { primary: "#EC7684", secondary: "#22304F", accent: "#0F819C", background: "#090507", text: "#E8CBCF", muted: "#A1848A" },
};

describe("onColor guarantees a legible label on every filled surface", () => {
  for (const [name, p] of Object.entries(palettes)) {
    it(`${name}: primary, secondary and accent all clear AA`, () => {
      for (const surface of [p.primary, p.secondary, p.accent]) {
        const fg = onColor(surface, p);
        expect(contrastRatio(fg, surface), `${fg} on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    });
  }

  it("prefers a palette colour when one already passes, so it stays on-brand", () => {
    const p = palettes["voltedge light"];
    // primary #123E63 is dark; the palette's own near-white paper is 10.3:1.
    expect(onColor(p.primary, p)).toBe(p.background);
  });

  it("any non-palette fallback is black or white, never something arbitrary", () => {
    // Stated as a property rather than "palette X falls back", because which
    // palettes need the fallback is an accident of their colours — and an
    // earlier version of this test asserted voltedge's amber fell back when its
    // ink actually reaches 4.96:1 and correctly stays on-brand.
    for (const p of Object.values(palettes)) {
      for (const surface of [p.primary, p.secondary, p.accent]) {
        const fg = onColor(surface, p);
        const fromPalette = [p.background, p.text, p.muted].includes(fg);
        if (!fromPalette) expect(["#000000", "#FFFFFF"]).toContain(fg);
      }
    }
  });

  it("at least one real palette actually needs the fallback", () => {
    // Guards the opposite failure: if every surface could be served from the
    // palette, the fallback branch would be dead code and untested in practice.
    const usedFallback = Object.values(palettes).some((p) =>
      [p.primary, p.secondary, p.accent].some((s) => {
        const fg = onColor(s, p);
        return !([p.background, p.text, p.muted] as (string | undefined)[]).includes(fg);
      }),
    );
    expect(usedFallback).toBe(true);
  });

  it("degrades instead of throwing on a colour space it can't parse", () => {
    const p = { ...palettes["voltedge light"], accent: "oklch(0.7 0.1 250)" };
    expect(() => onColor(p.accent, p)).not.toThrow();
    expect(onColor(p.accent, p)).toBe(p.background);
  });

  it("emits the variables the components consume", () => {
    const css = paletteCssVars(palettes["merrick light"], "light");
    for (const v of ["--on-primary:", "--on-secondary:", "--on-accent:"]) {
      expect(css).toContain(v);
    }
  });
});
