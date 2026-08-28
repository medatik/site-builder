"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { FaqProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Accordion FAQ. First item open by default. */
export function FAQ({ eyebrow, title, subtitle, items, id }: FaqProps & { id?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id={id ?? "faq"} tone="muted" containerSize="narrow">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="mt-12 flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={cn(
                // `muted` section — keep the pure background so the card reads as
                // raised (see the note in Services.tsx / globals.css).
                "overflow-hidden rounded-[var(--radius-card)] border-[length:var(--card-border-width)] bg-background transition-colors duration-[var(--transition-base)] ease-[var(--transition-ease)]",
                isOpen ? "border-primary" : "border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
              >
                <span className="font-heading text-lg font-semibold">{item.question}</span>
                <Plus
                  className={cn(
                    "size-5 shrink-0 text-primary transition-transform duration-[var(--transition-base)] ease-[var(--transition-ease)]",
                    isOpen && "rotate-45",
                  )}
                  strokeWidth={2.5}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-[var(--transition-base)] ease-[var(--transition-ease)]",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-[15px] leading-relaxed text-muted">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
