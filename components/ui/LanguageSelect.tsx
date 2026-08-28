"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LocaleConfig } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Header language selector — a themed dropdown (not a native `<select>`, whose
 * option list can't be styled). Navigates to `?lang=<code>` on pick, so the
 * active locale lives in the URL: every language is a real, crawlable, server-
 * rendered address. Closes on outside-click or Escape.
 */
export function LanguageSelect({
  locales,
  defaultLocale,
  label = "Language",
}: {
  locales: LocaleConfig[];
  defaultLocale: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("lang") ?? defaultLocale;
  const active = locales.find((l) => l.code === current) ?? locales[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep the DOCUMENT's lang/dir in sync with the active locale. The server
  // can only set <html lang> to the default locale (layouts can't read
  // ?lang=), so after a client-side switch we correct it here for screen
  // readers / translation tooling.
  useEffect(() => {
    if (!active) return;
    document.documentElement.lang = active.code;
    document.documentElement.dir = active.dir ?? "ltr";
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(code: string) {
    setOpen(false);
    if (code === current) return;
    const next = new URLSearchParams(params);
    if (code === defaultLocale) next.delete("lang");
    else next.set("lang", code);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-btn)] px-2.5 text-sm font-medium text-text",
          "transition-colors duration-[var(--transition-base)] hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        <Languages className="size-5" aria-hidden />
        <span>{active?.label}</span>
        <ChevronDown className={cn("size-4 transition-transform duration-[var(--transition-base)]", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute end-0 z-50 mt-2 min-w-[9rem] overflow-hidden p-1",
            "rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
            "bg-background shadow-[var(--shadow-card-lg)]",
          )}
        >
          {locales.map((l) => {
            const selected = l.code === current;
            return (
              <li key={l.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(l.code)}
                  dir={l.dir ?? "ltr"}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[var(--radius-btn)] px-3 py-2 text-sm",
                    "transition-colors duration-[var(--transition-base)]",
                    selected
                      ? "font-semibold text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                      : "text-text hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]",
                  )}
                >
                  <span>{l.label}</span>
                  {selected && <Check className="size-4 shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
