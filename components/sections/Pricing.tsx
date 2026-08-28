import { Check } from "lucide-react";
import type { PricingProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaButton } from "@/components/ui/Button";

/** Pricing / package tiers. One tier can be highlighted. */
export function Pricing({
  eyebrow,
  title,
  subtitle,
  tiers,
  note,
  id,
}: PricingProps & { id?: string }) {
  return (
    <Section id={id ?? "pricing"}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div
        className="mx-auto mt-14 grid max-w-5xl gap-6"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))` }}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col gap-6 rounded-[var(--radius-card)] p-8",
              tier.highlighted
                ? "bg-[color-mix(in_srgb,var(--primary)_92%,var(--text))] text-[color:var(--background)] shadow-[var(--shadow-card-lg)] lg:-my-3 lg:py-11"
                : "border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_12%,transparent)] card-surface shadow-[var(--shadow-card)]",
            )}
          >
            {tier.badge && (
              <span
                className={cn(
                  "absolute -top-3 left-8 rounded-[var(--radius-pill)] px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide",
                  tier.highlighted ? "bg-accent text-[color:var(--on-accent)]" : "bg-primary text-[color:var(--on-primary)]",
                )}
              >
                {tier.badge}
              </span>
            )}
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide">{tier.name}</h3>
              <div className="flex items-end gap-1">
                <span className="font-heading text-4xl font-extrabold leading-none">{tier.price}</span>
                {tier.period && (
                  <span className={cn("pb-1 text-sm", tier.highlighted ? "opacity-80" : "text-muted")}>
                    {tier.period}
                  </span>
                )}
              </div>
              {tier.description && (
                <p className={cn("text-sm leading-relaxed", tier.highlighted ? "opacity-85" : "text-muted")}>
                  {tier.description}
                </p>
              )}
            </div>
            <ul className="flex flex-col gap-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check
                    className={cn("mt-0.5 size-4 shrink-0", tier.highlighted ? "text-accent" : "text-primary")}
                    strokeWidth={3}
                  />
                  <span className={tier.highlighted ? "" : "text-text"}>{f}</span>
                </li>
              ))}
            </ul>
            {tier.cta && (
              <div className="mt-auto pt-2">
                <CtaButton
                  cta={tier.cta}
                  fallbackVariant={tier.highlighted ? "secondary" : "primary"}
                  className={cn("w-full", tier.highlighted && "!bg-background !text-primary hover:!brightness-95")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {note && <p className="mt-8 text-center text-sm text-muted">{note}</p>}
    </Section>
  );
}
