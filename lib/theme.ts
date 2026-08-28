import type { CSSProperties } from "react";
import type { StylePreset, Theme, ThemeColors, ThemeMode, ThemeToggleConfig } from "./types";

/**
 * Style presets translate a design *intent* into concrete geometry tokens:
 * border-radius, shadow character, spacing and border treatment.
 *
 * Colors and fonts from the client's config personalize on top of whichever
 * preset is chosen — the preset never touches color, only shape and rhythm.
 */
type PresetTokens = {
  "--radius-btn": string;
  /**
   * Button border-radius on hover. Set it equal to `--radius-btn` for no effect
   * (the default for most presets); set it to a different shape to make buttons
   * *morph* on hover — `Button` transitions border-radius, so the change
   * animates over `--transition-base`. Kept as a token rather than a
   * preset-name branch in the component so presets stay pure data.
   */
  "--radius-btn-hover": string;
  "--radius-card": string;
  "--radius-pill": string;
  "--radius-media": string;
  /**
   * Elevation. All three tint from `--shadow-color` (set per *mode* by
   * `paletteCssVars`), never from a literal black or from `--text` directly:
   * in dark mode `--shadow-color` is real black so shadows read as shadows, and
   * in light mode it's the palette's ink so they stay on-brand.
   */
  "--shadow-card": string;
  "--shadow-card-lg": string;
  "--shadow-pop": string;
  "--section-py": string;
  /** Border weight for card-like surfaces. `0px` = genuinely borderless. */
  "--card-border-width": string;
  /** Whether cards read as bordered panels (sharp) or floating surfaces (soft). */
  "--card-surface": string;
  /** Interaction motion — the preset's "feel": snappy (sharp) vs smooth (soft). */
  "--transition-base": string;
  "--transition-ease": string;
  /**
   * Hover lift transforms. Most presets rise straight up (`translateY`), but a
   * preset whose shadow is a hard *offset block* (stark: `4px 4px 0`, no blur)
   * must move DIAGONALLY up-and-left so the element lifts away from its shadow
   * and reveals more of it — a vertical-only lift breaks that illusion.
   * Applied to interactive cards and to primary buttons / the FAB.
   */
  "--hover-lift-card": string;
  "--hover-lift-btn": string;
};

const PRESETS: Record<StylePreset, PresetTokens> = {
  /** Crisp, architectural, high-contrast. Corners are near-square; structure
   *  comes from borders and tight offsets rather than soft shadows. */
  sharp: {
    "--radius-btn": "2px",
    "--radius-btn-hover": "2px",
    "--radius-card": "3px",
    "--radius-pill": "3px",
    "--radius-media": "3px",
    "--shadow-card": "0 1px 0 0 color-mix(in srgb, var(--shadow-color) 20%, transparent)",
    "--shadow-card-lg": "0 24px 50px -28px color-mix(in srgb, var(--shadow-color) 45%, transparent)",
    "--shadow-pop": "0 10px 24px -12px color-mix(in srgb, var(--shadow-color) 40%, transparent)",
    "--section-py": "clamp(4.5rem, 8vw, 7rem)",
    "--card-border-width": "1px",
    "--card-surface": "color-mix(in srgb, var(--text) 5%, transparent)",
    "--transition-base": "150ms",
    "--transition-ease": "cubic-bezier(0.2, 0, 0, 1)",
    "--hover-lift-card": "translateY(-4px)",
    "--hover-lift-btn": "translateY(-2px)",
  },
  /** Balanced, modern, approachable. Medium radii with gentle elevation. */
  rounded: {
    "--radius-btn": "10px",
    "--radius-btn-hover": "10px",
    "--radius-card": "16px",
    "--radius-pill": "9999px",
    "--radius-media": "16px",
    "--shadow-card": "0 6px 20px -6px color-mix(in srgb, var(--shadow-color) 16%, transparent)",
    "--shadow-card-lg": "0 22px 55px -20px color-mix(in srgb, var(--shadow-color) 24%, transparent)",
    "--shadow-pop": "0 12px 30px -12px color-mix(in srgb, var(--shadow-color) 22%, transparent)",
    "--section-py": "clamp(4.5rem, 8vw, 7rem)",
    "--card-border-width": "1px",
    "--card-surface": "color-mix(in srgb, var(--text) 3%, transparent)",
    "--transition-base": "200ms",
    "--transition-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--hover-lift-card": "translateY(-4px)",
    "--hover-lift-btn": "translateY(-2px)",
  },
  /** Calm, airy, reassuring. Large radii, diffuse low-contrast shadows,
   *  generous vertical rhythm. Surfaces float rather than being outlined. */
  soft: {
    "--radius-btn": "14px",
    "--radius-btn-hover": "14px",
    "--radius-card": "26px",
    "--radius-pill": "9999px",
    "--radius-media": "28px",
    "--shadow-card": "0 14px 40px -18px color-mix(in srgb, var(--shadow-color) 22%, transparent)",
    "--shadow-card-lg": "0 34px 70px -30px color-mix(in srgb, var(--shadow-color) 26%, transparent)",
    "--shadow-pop": "0 18px 45px -20px color-mix(in srgb, var(--shadow-color) 24%, transparent)",
    "--section-py": "clamp(5.5rem, 9vw, 8.5rem)",
    "--card-border-width": "0px",
    "--card-surface": "color-mix(in srgb, var(--text) 2%, transparent)",
    "--transition-base": "280ms",
    "--transition-ease": "cubic-bezier(0.33, 1, 0.68, 1)",
    "--hover-lift-card": "translateY(-4px)",
    "--hover-lift-btn": "translateY(-2px)",
  },

  /** Brutalist, loud, high-impact. Square corners, thick borders, and hard
   *  offset shadows (no blur) that read as printed/screen-printed. Tight
   *  vertical rhythm and near-instant motion. Gyms, streetwear, auto detailing. */
  stark: {
    "--radius-btn": "0px",
    "--radius-btn-hover": "0px",
    "--radius-card": "0px",
    "--radius-pill": "0px",
    "--radius-media": "0px",
    "--shadow-card": "4px 4px 0 color-mix(in srgb, var(--shadow-color) 100%, transparent)",
    "--shadow-card-lg": "8px 8px 0 color-mix(in srgb, var(--shadow-color) 100%, transparent)",
    "--shadow-pop": "3px 3px 0 color-mix(in srgb, var(--shadow-color) 100%, transparent)",
    "--section-py": "clamp(3.5rem, 7vw, 5.5rem)",
    "--card-border-width": "2px",
    "--card-surface": "color-mix(in srgb, var(--text) 4%, transparent)",
    "--transition-base": "120ms",
    "--transition-ease": "cubic-bezier(0.2, 0, 0, 1)",
    // Diagonal, NOT a vertical-only lift: stark's shadow is a hard offset block
    // (4px 4px 0, no blur), so the surface must move up-AND-left to lift away
    // from it and reveal more of the block. A translateY alone breaks the effect.
    "--hover-lift-card": "translate(-2px, -2px)",
    "--hover-lift-btn": "translate(-1px, -1px)",
  },

  /** Playful, chunky, tactile. Pill buttons, thick borders, and solid drop
   *  shadows with no blur so surfaces read like stacked cards. The easing
   *  overshoots for a bouncy feel. Kids' activities, ice cream, pet grooming. */
  toybox: {
    "--radius-btn": "999px",
    "--radius-btn-hover": "999px",
    "--radius-card": "20px",
    "--radius-pill": "999px",
    "--radius-media": "14px",
    "--shadow-card": "0 4px 0 color-mix(in srgb, var(--shadow-color) 16%, transparent)",
    "--shadow-card-lg": "0 7px 0 color-mix(in srgb, var(--shadow-color) 18%, transparent)",
    "--shadow-pop": "0 4px 0 color-mix(in srgb, var(--shadow-color) 28%, transparent)",
    "--section-py": "clamp(4rem, 7.5vw, 6rem)",
    "--card-border-width": "2px",
    "--card-surface": "color-mix(in srgb, var(--text) 2%, transparent)",
    "--transition-base": "220ms",
    "--transition-ease": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "--hover-lift-card": "translateY(-4px)",
    "--hover-lift-btn": "translateY(-2px)",
  },

  /** Organic and boutique. Asymmetric petal-shaped corners (large/small on
   *  opposing diagonals) with soft diffuse shadows. Buttons *morph* to a flat
   *  radius on hover via `--radius-btn-hover`. Florists, salons, boutiques. */
  petal: {
    "--radius-btn": "18px 5px 18px 5px",
    "--radius-btn-hover": "18px",
    "--radius-card": "28px 8px 28px 8px",
    "--radius-pill": "999px",
    "--radius-media": "22px 6px 22px 6px",
    "--shadow-card": "0 10px 24px -8px color-mix(in srgb, var(--shadow-color) 14%, transparent)",
    "--shadow-card-lg": "0 18px 44px -10px color-mix(in srgb, var(--shadow-color) 18%, transparent)",
    "--shadow-pop": "0 8px 18px -4px color-mix(in srgb, var(--shadow-color) 22%, transparent)",
    "--section-py": "clamp(5rem, 8.5vw, 7.75rem)",
    "--card-border-width": "1px",
    // 1% composited to only ~2/255 against the background — below the
    // perceptual threshold. 3% gives a soft, genuinely visible tint.
    "--card-surface": "color-mix(in srgb, var(--text) 3%, transparent)",
    "--transition-base": "300ms",
    "--transition-ease": "cubic-bezier(0.65, 0, 0.35, 1)",
    "--hover-lift-card": "translateY(-4px)",
    "--hover-lift-btn": "translateY(-2px)",
  },
};

/** Wrap a font family name so multi-word names are valid in a CSS var. */
function fontStack(family: string): string {
  return `"${family}", system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
}

/**
 * Resolve a theme's palettes into a concrete pair plus the starting mode.
 *
 * A theme may define only one palette; when the other is missing it mirrors the
 * defined one, so switching modes is always safe. `hasBoth` reports whether the
 * two palettes are genuinely distinct (i.e. whether a toggle is meaningful).
 */
export function resolvePalettes(theme: Theme): {
  light: ThemeColors;
  dark: ThemeColors;
  defaultMode: ThemeMode;
  hasBoth: boolean;
} {
  const light = theme.colorsLight;
  const dark = theme.colorsDark;
  const hasBoth = Boolean(light && dark);
  return {
    // At least one is guaranteed by the `Theme` type.
    light: (light ?? dark)!,
    dark: (dark ?? light)!,
    defaultMode: theme.defaultMode ?? (light ? "light" : "dark"),
    hasBoth,
  };
}

/** The palette that renders on first load (respecting `defaultMode`). */
export function defaultPalette(theme: Theme): ThemeColors {
  const { light, dark, defaultMode } = resolvePalettes(theme);
  return defaultMode === "dark" ? dark : light;
}

/**
 * Whether the header theme toggle is actually shown: it must be enabled in
 * config AND the theme must define two distinct palettes. This is the single
 * source of truth used by both the header (to render the button) and the theme
 * wrapper (to decide whether to honour or discard a remembered choice) — if the
 * toggle is hidden, a stale localStorage preference is cleared so the
 * `defaultMode` always wins.
 */
export function themeToggleShown(theme: Theme, toggle?: ThemeToggleConfig): boolean {
  return Boolean(toggle?.enabled) && resolvePalettes(theme).hasBoth;
}

/**
 * Mode-independent CSS custom properties (fonts + preset geometry) applied
 * inline to the theme wrapper. Colors are applied separately, per mode, so a
 * runtime toggle only swaps colors — see `paletteCssVars`.
 */
export function buildBaseStyle(theme: Theme): CSSProperties {
  const preset = PRESETS[theme.stylePreset] ?? PRESETS.rounded;
  return {
    "--ff-heading": fontStack(theme.fonts.heading),
    "--ff-body": fontStack(theme.fonts.body),
    ...preset,
  } as CSSProperties;
}

/**
 * The color custom properties for one palette, as a CSS declaration string
 * (for a scoped `[data-mode="…"]` rule). Also sets `color-scheme` so native
 * controls, scrollbars and pickers match the mode.
 *
 * `--shadow-color` is the tint every preset shadow mixes from. It is per-MODE,
 * not per-preset, because a shadow's colour is a property of the surface it
 * falls on, not of the shape language: on a dark palette it must be real black
 * (tinting from the light `--text` would produce pale *glows* instead of
 * shadows), while on a light palette the palette's ink keeps shadows on-brand.
 *
 * `--backdrop-intensity` is the same idea applied to `Backdrop`'s decorative
 * washes: it's a multiplier `Backdrop.tsx` applies to each layer's opacity via
 * `calc()`. It's per-MODE, not per-backdrop-variant, because the reason a wash
 * reads differently isn't the shape of the backdrop, it's the surface it sits
 * on. The dark-palette constraint (see "Theme system" in the README) needs `primary` to
 * be light-enough to contrast a dark `background` — so the same raw opacity
 * puts a *lighter* tint against a *darker* surface in dark mode, which reads as
 * more prominent than the equivalent light-mode wash (a darker tint against a
 * light surface). Dimmed below 1 in dark mode to compensate back to parity.
 */
/* ------------------------------------------------------------------ *
 * CSS value safety
 * ------------------------------------------------------------------ */

/**
 * Characters a legitimate colour value can contain. Covers hex, `rgb()`,
 * `hsl()`, `oklch()`, `color-mix(in srgb, …)` and named colours.
 *
 * What it EXCLUDES is the point: `;` and `}` would end the declaration or the
 * rule, `<` could close the surrounding `<style>` tag, and quotes or a
 * backslash could escape a string context. Palette values are interpolated
 * straight into a `<style>` block, so a value like
 * `red}</style><script>alert(1)</script>` was executable markup — and the
 * validator accepts any `z.string()` as a colour, so nothing upstream stopped it.
 *
 * Harmless today, because configs are written by hand. Not harmless the day a
 * UI or database writes them, which is the future this engine is being built
 * toward.
 */
const CSS_COLOR_SAFE = /^[a-zA-Z0-9#%.,()\s\-/_]*$/;

/**
 * A colour value that is safe to interpolate into a stylesheet.
 *
 * Rejects rather than sanitises: a value that fails this test is not a colour
 * that lost a character, it is something that was never a colour, and quietly
 * repairing it would hide the mistake. Falls back so a bad value costs a wrong
 * shade rather than a broken page — and warns in development, where it can
 * still be fixed.
 */
export function cssColor(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  if (!v) return fallback;
  if (CSS_COLOR_SAFE.test(v)) return v;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[theme] colour value rejected as unsafe for CSS: ${JSON.stringify(v)} — using ${fallback}`,
    );
  }
  return fallback;
}

/* ------------------------------------------------------------------ *
 * Contrast-aware foregrounds
 * ------------------------------------------------------------------ */

/** `#abc` / `#aabbcc` → [r,g,b]. Returns null for anything else (e.g. `oklch()`). */
function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG relative luminance. */
function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1–21. Returns 0 when either colour isn't parseable hex. */
export function contrastRatio(a: string, b: string): number {
  const [ra, rb] = [parseHex(a), parseHex(b)];
  if (!ra || !rb) return 0;
  const [la, lb] = [luminance(ra), luminance(rb)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG AA for normal-size text. */
const AA_TEXT = 4.5;

/**
 * The text colour to use ON a filled surface, chosen so it is actually legible.
 *
 * This fixes a limitation the engine shipped with for months:
 * every filled element hardcoded its label as `var(--background)` and simply
 * assumed that contrasted. For `primary` it usually does. For `accent` it
 * usually doesn't — an accent is picked to *pop* against the page, which makes
 * it mid-tone, and mid-tone is exactly what neither the palette's ink nor its
 * paper contrasts. The "most popular" pricing badge was failing at 2.94–3.23:1
 * on live sites because of it.
 *
 * Order: prefer a palette colour so the result stays on-brand, and fall back to
 * black or white — which always clears AA against a mid-tone — only when no
 * palette colour can. Unparseable input keeps the old behaviour rather than
 * throwing, since a config may legitimately use a colour space this can't read.
 */
export function onColor(surface: string, colors: ThemeColors): string {
  const candidates = [colors.background, colors.text, colors.muted].filter(
    (c): c is string => Boolean(c),
  );
  if (!parseHex(surface)) return colors.background;

  let best = colors.background;
  let bestRatio = -1;
  for (const c of candidates) {
    const r = contrastRatio(c, surface);
    if (r > bestRatio) [best, bestRatio] = [c, r];
  }
  if (bestRatio >= AA_TEXT) return best;

  return contrastRatio("#000000", surface) >= contrastRatio("#FFFFFF", surface)
    ? "#000000"
    : "#FFFFFF";
}

/**
 * Star-rating gold, per mode.
 *
 * Stars used to take `--accent`, which conflated two different jobs: an accent
 * is a decorative brand pop chosen to look good, while a star is *meaningful
 * non-text content* and must clear WCAG's 3:1 against the surface behind it.
 * Three of three client palettes failed that — accents sat at 2.27, 2.53 and
 * 2.94:1 — and "fixing" it meant darkening brand colours to satisfy a
 * constraint that was never really about them.
 *
 * Separating them lets a brand accent be as bright as it likes. A rating also
 * reads as gold everywhere it appears online (Google, Amazon, Trustpilot), so a
 * consistent gold is arguably better than a brand-matched one.
 *
 * Two values because one can't serve both surfaces well: a single mid-gold that
 * clears 3:1 on near-white is muddy on near-black. Measured against every
 * background in use plus pure white/black — light 3.55:1 worst case, dark
 * 11.10:1. A client can still override with `colors.star`.
 */
const STAR_LIGHT = "#A9750A";
const STAR_DARK = "#FFC107";

export function paletteCssVars(colors: ThemeColors, mode: ThemeMode): string {
  // Every value below is interpolated into a `<style>` block, so each one is
  // checked before it gets there — see `cssColor`. The fallbacks are the neutral
  // defaults from `globals.css`, so a rejected value degrades to a plain theme
  // rather than an unstyled or broken page.
  const primary = cssColor(colors.primary, "#2563eb");
  const secondary = cssColor(colors.secondary, "#1e293b");
  const accent = cssColor(colors.accent, "#38bdf8");
  const background = cssColor(colors.background, "#ffffff");
  const text = cssColor(colors.text, "#0f172a");
  const muted = cssColor(colors.muted ?? colors.text, text);
  /** The validated palette, so `onColor` never picks an unchecked candidate. */
  const safe: ThemeColors = { primary, secondary, accent, background, text, muted };

  return [
    `--primary:${primary}`,
    `--secondary:${secondary}`,
    `--accent:${accent}`,
    `--background:${background}`,
    `--text:${text}`,
    `--muted:${muted}`,
    `--shadow-color:${mode === "dark" ? "#000000" : text}`,
    `--backdrop-intensity:${mode === "dark" ? "0.7" : "1"}`,
    `--star:${cssColor(colors.star, mode === "dark" ? STAR_DARK : STAR_LIGHT)}`,
    // Legible label colours for filled surfaces — see `onColor`. Emitted per
    // palette because the answer depends on the palette, which is the whole
    // reason hardcoding `--background` was wrong.
    //
    // Computed from the ALREADY-VALIDATED values, and checked again on the way
    // out: `onColor` may return one of the palette's own colours, so an unsafe
    // input would otherwise reappear here having bypassed the check above.
    `--on-primary:${cssColor(onColor(primary, safe), background)}`,
    `--on-secondary:${cssColor(onColor(secondary, safe), background)}`,
    `--on-accent:${cssColor(onColor(accent, safe), background)}`,
    `color-scheme:${mode}`,
  ].join(";");
}

export { PRESETS };
