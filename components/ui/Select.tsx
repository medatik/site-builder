"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Shared control surface — mirrors the form's text `inputClass` so the custom
 *  trigger sits flush with the native text/email inputs around it. */
const controlBase =
  "flex w-full items-center gap-2 rounded-[var(--radius-btn)] border bg-background px-4 py-3 text-[15px] " +
  "text-start transition-colors outline-none";

/**
 * Themed single-select. Replaces the native `<select>` (whose popup can't be
 * styled) with a button + listbox popover, and mirrors the chosen value into a
 * hidden `<input name>` so the surrounding `<form>`'s FormData is unchanged.
 *
 * Locale/direction are read from the nearest `[lang]`/`[dir]` ancestor (the
 * theme-scope wrapper), so the popover flips correctly under RTL.
 */
export function Select({
  name,
  options,
  placeholder,
  invalid = false,
  onValueChange,
  describedBy,
  defaultValue = "",
}: {
  name: string;
  options: string[];
  placeholder: string;
  /** Render in error state (e.g. required-but-empty on submit). NOTE: `required`
   *  can't live on the hidden input — hidden inputs are barred from native
   *  constraint validation — so the form validates in React and drives this. */
  invalid?: boolean;
  /** Notified on every pick, so the form can clear this field's error. */
  onValueChange?: (value: string) => void;
  /** Id of the error text, announced with the control when invalid. */
  describedBy?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
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

  function choose(v: string) {
    setValue(v);
    setOpen(false);
    onValueChange?.(v);
  }

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        // combobox (not plain button): it's a value-bearing control, which is
        // also what makes aria-invalid valid here.
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        // `combobox` requires a pointer to the popup it owns, or a screen reader
        // announces the control with no way to reach the options.
        aria-controls={listboxId}
        aria-invalid={invalid || undefined}
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
        <span className={cn("flex-1 truncate", !value && "text-[color-mix(in_srgb,var(--text)_45%,transparent)]")}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted transition-transform duration-[var(--transition-base)]", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          dir={dir}
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-auto p-1",
            "rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
            "bg-background shadow-[var(--shadow-card-lg)]",
          )}
        >
          {options.map((o) => {
            const selected = o === value;
            return (
              <li key={o} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(o)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[var(--radius-btn)] px-3 py-2.5 text-start text-[15px]",
                    "transition-colors duration-[var(--transition-base)]",
                    selected
                      ? "font-semibold text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                      : "text-text hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]",
                  )}
                >
                  <span className="truncate">{o}</span>
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
