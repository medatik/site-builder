"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Same control surface as `Select`/text inputs so the trigger sits flush. */
const controlBase =
  "flex w-full items-center gap-2 rounded-[var(--radius-btn)] border bg-background px-4 py-3 text-[15px] " +
  "text-start transition-colors outline-none";

/** Localised chrome. Config placeholders win; these cover the built-in demo
 *  locales and fall back to English for anything else. */
const STRINGS: Record<string, { placeholder: string; today: string; clear: string }> = {
  en: { placeholder: "Select a date", today: "Today", clear: "Clear" },
  fr: { placeholder: "Choisir une date", today: "Aujourd’hui", clear: "Effacer" },
  ar: { placeholder: "اختر تاريخًا", today: "اليوم", clear: "مسح" },
};

function stringsFor(locale: string) {
  return STRINGS[locale.slice(0, 2).toLowerCase()] ?? STRINGS.en;
}

/** 0=Sun … 6=Sat. Prefer the locale's real week start, fall back sensibly. */
function firstWeekday(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info?.firstDay) return info.firstDay % 7; // 7(Sun)→0 … 1(Mon)→1
  } catch {
    /* Intl.Locale unsupported — use the fallback below */
  }
  const l = locale.slice(0, 2).toLowerCase();
  if (l === "en") return 0; // Sunday
  if (l === "ar") return 6; // Saturday
  return 1; // Monday
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Themed date picker. Replaces the native `<input type="date">` (whose calendar
 * popup is entirely browser-chrome) with a fully theme-token'd calendar, and
 * mirrors the value into a hidden `<input name>` in the same `YYYY-MM-DD` format
 * a native date input submits, so a wired-up backend sees identical data.
 *
 * Locale/direction come from the nearest `[lang]`/`[dir]` ancestor: month names,
 * weekday order and week start all follow the active language.
 */
export function DatePicker({
  name,
  placeholder,
  invalid = false,
  onValueChange,
  describedBy,
}: {
  name: string;
  placeholder?: string;
  /** Render in error state (e.g. required-but-empty on submit). NOTE: `required`
   *  can't live on the hidden input — hidden inputs are barred from native
   *  constraint validation — so the form validates in React and drives this. */
  invalid?: boolean;
  /** Notified on pick/clear, so the form can clear this field's error. */
  onValueChange?: (value: string) => void;
  /** Id of the error text, announced with the control when invalid. */
  describedBy?: string;
}) {
  const [locale, setLocale] = useState("en");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [value, setValue] = useState(""); // ISO or ""
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = ref.current?.closest("[lang]")?.getAttribute("lang");
    if (lang) setLocale(lang);
    const d = ref.current?.closest("[dir]")?.getAttribute("dir");
    if (d === "rtl" || d === "ltr") setDir(d);
  }, []);

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

  const t = stringsFor(locale);
  const selected = value ? new Date(value + "T00:00:00") : null;

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(view.y, view.m, 1)),
    [locale, view],
  );

  const weekdays = useMemo(() => {
    const start = firstWeekday(locale);
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2023-01-01 is a Sunday — a stable anchor to name each weekday.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + ((start + i) % 7))));
  }, [locale]);

  const cells = useMemo(() => {
    const start = firstWeekday(locale);
    const first = new Date(view.y, view.m, 1);
    const lead = (first.getDay() - start + 7) % 7;
    const gridStart = new Date(view.y, view.m, 1 - lead);
    return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }, [locale, view]);

  function pick(d: Date) {
    const v = iso(d);
    setValue(v);
    setOpen(false);
    onValueChange?.(v);
  }
  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const triggerLabel = selected
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(selected)
    : placeholder || t.placeholder;

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        // No aria-invalid: it isn't valid on role=button. The error is conveyed
        // by the red border plus the aria-describedby error text (role="alert").
        aria-describedby={describedBy}
        className={cn(
          controlBase,
          open
            ? "border-primary ring-2 ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
            : invalid
              ? "border-[#ef4444] ring-1 ring-[#ef4444]/40"
              : "border-[color-mix(in_srgb,var(--text)_18%,transparent)] hover:border-[color-mix(in_srgb,var(--text)_30%,transparent)]",
        )}
      >
        <Calendar className="size-4 shrink-0 text-muted" aria-hidden />
        <span className={cn("flex-1 truncate", !selected && "text-[color-mix(in_srgb,var(--text)_45%,transparent)]")}>
          {triggerLabel}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          dir={dir}
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-2 min-w-[17rem] p-3",
            "rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
            "bg-background shadow-[var(--shadow-card-lg)]",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-heading text-sm font-semibold capitalize text-text">{monthLabel}</span>
            <div className="flex items-center gap-1">
              <CalNav onClick={() => shift(-1)} label="Previous month">
                <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
              </CalNav>
              <CalNav onClick={() => shift(1)} label="Next month">
                <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </CalNav>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weekdays.map((w, i) => (
              <div key={i} className="pb-1 text-center text-xs font-medium text-muted">
                {w}
              </div>
            ))}
            {cells.map((d) => {
              const inMonth = d.getMonth() === view.m;
              const isToday = sameDay(d, today);
              const isSel = selected && sameDay(d, selected);
              return (
                <button
                  key={iso(d)}
                  type="button"
                  onClick={() => pick(d)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-[var(--radius-btn)] text-sm tabular-nums transition-colors",
                    !inMonth && "text-[color-mix(in_srgb,var(--text)_35%,transparent)]",
                    inMonth && !isSel && "text-text hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]",
                    isToday && !isSel && "font-semibold text-primary",
                    isSel && "bg-primary font-semibold text-[color:var(--background)]",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] pt-2">
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="rounded-[var(--radius-btn)] px-2 py-1 text-sm text-muted transition-colors hover:text-text"
            >
              {t.clear}
            </button>
            <button
              type="button"
              onClick={() => pick(today)}
              className="rounded-[var(--radius-btn)] px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
            >
              {t.today}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalNav({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-[var(--radius-btn)] text-muted transition-colors hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] hover:text-text"
    >
      {children}
    </button>
  );
}
