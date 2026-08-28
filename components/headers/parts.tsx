"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import type { SiteConfig, HeaderScrollBehavior, MobileMenuStyle } from "@/lib/types";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/cn";
import { resolveNav } from "@/lib/nav";
import { resolveHeader } from "@/lib/header";
import { themeToggleShown } from "@/lib/theme";
import { languageSelectorShown } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";
import { CtaButton } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelect } from "@/components/ui/LanguageSelect";

/**
 * Shared building blocks + behaviour for header variants. Each variant is pure
 * layout: it calls `useHeaderScroll` for state and composes `HeaderNav`,
 * `HeaderActions`, and `MobileMenu`. That keeps scroll logic and the mobile menu
 * implemented once, so a new variant is arrangement only (mirrors how footer
 * variants share `parts.tsx`).
 */

/** Every header variant is a pure function of the whole config. */
export interface HeaderProps {
  config: SiteConfig;
}

const BORDER = "border-[color-mix(in_srgb,var(--text)_10%,transparent)]";
const menuTransition = "transition-transform duration-[var(--transition-base)] ease-[var(--transition-ease)]";

/**
 * Scroll state for a sticky header. Attaches no listener when `active` is false
 * (non-sticky headers, or `behavior: "none"`), so a static header costs nothing.
 * `hidden` only moves under the `"hide"` behavior.
 */
export function useHeaderScroll(active: boolean, behavior: HeaderScrollBehavior) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active) {
      setScrolled(false);
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (behavior === "hide") {
        // Hide when scrolling down past a threshold; reveal on any upward move.
        if (y > last && y > 140) setHidden(true);
        else if (y < last) setHidden(false);
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active, behavior]);

  return { scrolled, hidden };
}

/**
 * Surface + transform classes for the `<header>` root, from resolved state.
 * `elevated` (a surface appears) triggers whenever the page is scrolled under a
 * behaviour other than `"none"` — shared by elevate / shrink / hide.
 */
export function headerSurface(
  variant: "transparent" | "solid",
  scrolled: boolean,
  behavior: HeaderScrollBehavior,
): string {
  const elevated = scrolled && behavior !== "none";
  if (variant === "solid") {
    return elevated
      ? `bg-background border-b ${BORDER} shadow-[var(--shadow-card)]`
      : "bg-background";
  }
  return elevated
    ? `border-b ${BORDER} bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-md`
    : "bg-transparent";
}

/** Height of the inner bar; shrinks under the `"shrink"` behaviour once scrolled. */
export function barHeight(shrunk: boolean): string {
  return shrunk ? "h-14" : "h-[4.75rem]";
}

/** Inline desktop nav links. Hidden below `lg` unless `always` (minimal header). */
export function HeaderNav({
  nav,
  className = "",
}: {
  nav: NavItem[];
  className?: string;
}) {
  if (!nav.length) return null;
  return (
    <nav className={cn("items-center gap-7", className)} aria-label="Primary">
      {nav.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-muted transition-colors duration-[var(--transition-base)] hover:text-primary"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

/** Build the theme-toggle node (or null) for a config. */
export function themeToggleNode(config: SiteConfig): ReactNode {
  const toggleCfg = config.header?.themeToggle;
  if (!themeToggleShown(config.theme, toggleCfg)) return null;
  return (
    <ThemeToggle iconLight={toggleCfg?.iconLight} iconDark={toggleCfg?.iconDark} label={toggleCfg?.label} />
  );
}

/** Build the language-selector node (or null) for a config. */
export function languageSelectNode(config: SiteConfig): ReactNode {
  if (!languageSelectorShown(config) || !config.i18n) return null;
  return <LanguageSelect locales={config.i18n.locales} defaultLocale={config.i18n.defaultLocale} />;
}

/**
 * All shared header state + the wired `<header>` root props, so every variant
 * is pure inner-layout. Applies `resolveHeader` (sticky neutralisation +
 * back-compat), drives the scroll state, and exposes the menu open state.
 */
export function useHeaderShell(config: SiteConfig) {
  const [open, setOpen] = useState(false);
  const nav = resolveNav(config);
  const resolved = resolveHeader(config.header);
  const { scrolled, hidden } = useHeaderScroll(
    resolved.sticky && resolved.behavior !== "none",
    resolved.behavior,
  );
  const shrunk = resolved.behavior === "shrink" && scrolled;

  const rootProps = {
    "data-variant": resolved.variant,
    "data-sticky": resolved.sticky,
    "data-scrolled": scrolled,
    "data-hidden": hidden,
    className: cn(
      "top-0 z-50 transition-all duration-[var(--transition-base)] ease-[var(--transition-ease)]",
      resolved.sticky ? "sticky" : "relative",
      headerSurface(resolved.variant, scrolled, resolved.behavior),
      hidden && "-translate-y-full",
    ),
  };

  return {
    nav,
    open,
    setOpen,
    resolved,
    scrolled,
    shrunk,
    rootProps,
    themeToggle: themeToggleNode(config),
    languageSelect: languageSelectNode(config),
    /**
     * Where the logo points. On a one-pager `#top` scrolls to the top, which is
     * right. Once routed pages exist the logo must go HOME — on `/privacy`,
     * `#top` would just scroll that page up, and a logo that doesn't return you
     * to the home page is a broken convention.
     */
    homeHref: config.pages?.length ? "/" : "#top",
  };
}

/** The hamburger / close button. */
export function MenuButton({
  open,
  onClick,
  className = "",
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-[var(--radius-btn)] text-text",
        className,
      )}
    >
      {open ? <X className="size-6" /> : <Menu className="size-6" />}
    </button>
  );
}

/**
 * The mobile navigation. Three presentations via `mode`:
 * - `"top"`: a dropdown that expands beneath the bar (in-flow, animates height).
 * - `"left"` / `"right"`: a slide-in side panel with a dimmed overlay, portaled
 *   OUT of the `<header>` (a `hide`-transformed header would otherwise become
 *   the containing block for a `fixed` child) but INTO the `[data-theme-scope]`
 *   wrapper — never `document.body`, which sits outside the theme scope and
 *   would resolve every CSS variable to the `:root` fallback palette.
 *
 * The side panel is contained to the page body, like the top dropdown: it
 * starts at the header's bottom edge and stacks BELOW it (`z-40` vs the
 * header's `z-50`), so the bar stays visible and interactive — its own X (the
 * `MenuButton` flips to a close icon while open), the overlay, or Escape close
 * the menu. No chrome of its own.
 *
 * `visibility` controls the breakpoint: `"mobile"` (default) hides it at `lg`;
 * `"always"` keeps it at every width (the `minimal` header's nav lives here).
 */
export function MobileMenu({
  nav,
  config,
  open,
  setOpen,
  mode,
  visibility = "mobile",
}: {
  nav: NavItem[];
  config: SiteConfig;
  open: boolean;
  setOpen: (v: boolean) => void;
  mode: MobileMenuStyle;
  /** `"mobile"` (default) hides the menu at `lg`; `"always"` keeps it at every width. */
  visibility?: "mobile" | "always";
}) {
  // Anchor element: lets us find the enclosing header (to measure where the
  // panel starts) and the theme scope wrapper (the portal target).
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [topPx, setTopPx] = useState(0);

  useEffect(() => {
    const scope = anchorRef.current?.closest<HTMLElement>("[data-theme-scope]");
    setPortalTarget(scope ?? document.body);
  }, []);

  // The panel starts at the header's bottom edge — measured on each open, since
  // the bar height varies (shrink behaviour, two-row centered layout).
  useEffect(() => {
    if (mode === "top" || !open) return;
    const header = anchorRef.current?.closest("header");
    setTopPx(Math.max(0, Math.round(header?.getBoundingClientRect().bottom ?? 0)));
  }, [mode, open]);

  // Escape-to-close + scroll lock while a side panel is open.
  useEffect(() => {
    if (mode === "top" || !open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mode, open, setOpen]);

  const links = (
    <>
      {nav.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className="rounded-[var(--radius-btn)] px-3 py-3 text-base font-medium text-text hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-primary"
        >
          {item.label}
        </a>
      ))}
      {config.header?.cta && (
        <div className="pt-2">
          <CtaButton cta={config.header.cta} className="w-full" />
        </div>
      )}
    </>
  );

  if (mode === "top") {
    return (
      <div
        className={cn(
          "overflow-hidden border-t bg-background",
          visibility === "mobile" && "lg:hidden",
          BORDER,
          "transition-[max-height] duration-[var(--transition-base)] ease-[var(--transition-ease)]",
          open ? "max-h-[32rem]" : "max-h-0 border-t-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">{links}</Container>
      </div>
    );
  }

  // Side panel — portaled out of the (possibly transformed) header, into the
  // theme scope so the palette variables still resolve.
  const side = mode === "left" ? "left-0" : "right-0";
  const closedX = mode === "left" ? "-translate-x-full" : "translate-x-full";

  return (
    <>
      {/* Invisible anchor: stays in the header so `closest()` can find it. */}
      <span ref={anchorRef} className="hidden" />
      {portalTarget &&
        createPortal(
          <div
            className={cn(
              // z-40 keeps the whole thing UNDER the z-50 header: the bar stays
              // visible and its MenuButton (now an X) closes the menu.
              "fixed inset-x-0 bottom-0 z-40",
              visibility === "mobile" && "lg:hidden",
              open ? "" : "pointer-events-none",
            )}
            style={{ top: topPx }}
            aria-hidden={!open}
          >
            {/* Overlay — palette-tinted, click to close. */}
            <div
              onClick={() => setOpen(false)}
              className={cn(
                "absolute inset-0 bg-[color-mix(in_srgb,var(--text)_45%,transparent)] transition-opacity duration-[var(--transition-base)]",
                open ? "opacity-100" : "opacity-0",
              )}
            />
            {/* Panel — no chrome of its own; the header above stays in charge. */}
            <div
              className={cn(
                "absolute inset-y-0 w-[80%] max-w-xs border-t bg-background shadow-[var(--shadow-card-lg)]",
                BORDER,
                side,
                menuTransition,
                open ? "translate-x-0" : closedX,
              )}
            >
              <nav className="flex flex-col gap-1 p-4 pt-5" aria-label="Mobile">
                {links}
              </nav>
            </div>
          </div>,
          portalTarget,
        )}
    </>
  );
}
