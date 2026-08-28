import type { ReactNode } from "react";
import type { Theme, TextDir } from "@/lib/types";
import { buildBaseStyle, paletteCssVars, resolvePalettes } from "@/lib/theme";
import { fontsHrefForTheme } from "@/lib/fonts";

/**
 * Applies a client's theme to everything inside it.
 *
 * - Fonts + preset geometry go on a wrapper element inline; the two color
 *   palettes are emitted as scoped `[data-mode="light|dark"]` CSS rules so a
 *   runtime toggle only has to flip one attribute (no re-render, no reflow of
 *   the tree). Themes stay scoped to the wrapper, so multiple sites can render
 *   on one page (see /preview).
 * - The starting mode is `defaultMode`. When the site is `switchable` (the
 *   header toggle is shown), a small inline script re-applies the visitor's
 *   remembered choice before paint (no flash). When it is NOT switchable, that
 *   same script instead *clears* any stale saved choice so the `defaultMode`
 *   always wins — otherwise hiding the toggle would strand a visitor on a mode
 *   they can no longer change. `suppressHydrationWarning` keeps React from
 *   reverting the pre-hydration attribute.
 * - Google Fonts load dynamically via `<link>`; React 19 hoists + de-dupes
 *   precedence-tagged stylesheet links.
 */
export function ThemeScope({
  theme,
  scopeId,
  switchable = false,
  lang,
  dir,
  children,
}: {
  theme: Theme;
  scopeId: string;
  switchable?: boolean;
  /** BCP-47 code for the active locale; sets `lang` on the wrapper. */
  lang?: string;
  /** Writing direction for the active locale; sets `dir` on the wrapper so RTL
   *  stays scoped to this site (multiple sites can render on one page). */
  dir?: TextDir;
  children: ReactNode;
}) {
  const { light, dark, defaultMode } = resolvePalettes(theme);
  const baseStyle = buildBaseStyle(theme);
  const fontsHref = fontsHrefForTheme(theme.fonts);

  // The scope id lands in a CSS selector AND inside an inline <script>, so it is
  // reduced to characters that are inert in both. A slug is kebab-case by
  // convention, but a config is hand-edited and will one day be machine-written
  // — `}` would close the CSS rule, `'` would close the JS string.
  const safeScope = scopeId.replace(/[^a-zA-Z0-9_-]/g, "") || "site";
  const domId = `site-${safeScope}`;

  const scopedCss =
    `#${domId}[data-mode="light"]{${paletteCssVars(light, "light")}}` +
    `#${domId}[data-mode="dark"]{${paletteCssVars(dark, "dark")}}`;

  // Runs before paint. When switchable: restore this client's remembered mode.
  // When not: drop any saved mode so the default applies (and never strands a
  // visitor after the toggle is hidden).
  //
  // Values are embedded via JSON.stringify rather than quoted by hand, so a
  // quote or backslash cannot terminate the literal, and `<` is escaped so the
  // string can never contain a closing </script>.
  const js = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
  const key = js(`themeMode:${safeScope}`);
  const el = js(domId);
  const restoreScript = switchable
    ? `(function(){try{var m=localStorage.getItem(${key});` +
      `if(m==='light'||m==='dark'){var e=document.getElementById(${el});` +
      `if(e)e.setAttribute('data-mode',m);}}catch(e){}})();`
    : `(function(){try{localStorage.removeItem(${key});}catch(e){}})();`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsHref} precedence="high" />
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        id={domId}
        data-theme-scope
        data-mode={defaultMode}
        lang={lang}
        dir={dir}
        suppressHydrationWarning
        style={baseStyle}
        className="min-h-screen bg-background font-body text-text antialiased"
      >
        {children}
      </div>
      <script dangerouslySetInnerHTML={{ __html: restoreScript }} />
    </>
  );
}
