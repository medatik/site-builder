"use client";

import { useEffect, useRef, useState } from "react";
import type { ThemeMode } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/**
 * Light/dark theme toggle for the header. It flips the `data-mode` attribute on
 * the nearest theme wrapper (`[data-theme-scope]`) — the scoped CSS in
 * `ThemeScope` does the actual re-coloring — and remembers the choice per
 * client in localStorage. Icons default to moon (in light) / sun (in dark) but
 * are overridable from config.
 */
export function ThemeToggle({
  iconLight = "moon",
  iconDark = "sun",
  label = "Toggle theme",
  className,
}: {
  iconLight?: string;
  iconDark?: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<ThemeMode | null>(null);

  const scope = () =>
    ref.current?.closest<HTMLElement>("[data-theme-scope]") ?? null;

  // Sync the icon to whatever mode is actually applied (the restore script may
  // have changed it before hydration).
  useEffect(() => {
    const el = scope();
    if (el) setMode((el.getAttribute("data-mode") as ThemeMode) ?? "light");
  }, []);

  const toggle = () => {
    const el = scope();
    if (!el) return;
    const next: ThemeMode = el.getAttribute("data-mode") === "dark" ? "light" : "dark";
    el.setAttribute("data-mode", next);
    setMode(next);

    try {
      const id = el.id.replace(/^site-/, "");
      localStorage.setItem(`themeMode:${id}`, next);
    } catch {
      /* storage unavailable — the switch still works for this session */
    }

    // Keep the browser UI (address bar) color in step, if a meta tag exists.
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(el).getPropertyValue("--background").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  };

  // Show the icon for the CURRENT mode; before mount fall back to the light icon.
  const icon = mode === "dark" ? iconDark : iconLight;

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-[var(--radius-btn)] text-text",
        "transition-colors duration-[var(--transition-base)] ease-[var(--transition-ease)]",
        "hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Icon name={icon} className="size-5" />
    </button>
  );
}
