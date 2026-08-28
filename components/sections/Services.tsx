import { ArrowUpRight } from "lucide-react";
import type { ServicesProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";

const colClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Grid of service/offering cards. Icon + title + description, optional link. */
export function Services({
  eyebrow,
  title,
  subtitle,
  items,
  columns = 3,
  learnMoreLabel = "Learn more",
  id,
}: ServicesProps & { id?: string }) {
  return (
    <Section id={id ?? "services"} tone="muted">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className={cn("mt-14 grid grid-cols-1 gap-5", colClass[columns])}>
        {items.map((item) => {
          const Wrapper = item.href ? "a" : "div";
          return (
            <Wrapper
              key={item.title}
              {...(item.href ? { href: item.href } : {})}
              className={cn(
                // On a `muted` section the card stays the pure background so it
                // reads as raised; a --card-surface tint here would flatten it
                // (or invert it, for presets whose tint exceeds the muted tone).
                "group relative flex flex-col gap-4 border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-background p-7 transition-all duration-[var(--transition-base)] ease-[var(--transition-ease)]",
                "rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
                item.href &&
                  "hover:[transform:var(--hover-lift-card)] hover:border-primary hover:shadow-[var(--shadow-card-lg)]",
              )}
            >
              <span
                className="flex size-12 items-center justify-center rounded-[var(--radius-btn)] text-primary"
                style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
              >
                <Icon name={item.icon} className="size-6" strokeWidth={2} />
              </span>
              <h3 className="font-heading text-xl font-bold leading-snug">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{item.description}</p>
              {item.href && (
                <span className="mt-auto inline-flex items-center gap-1 pt-1 font-heading text-sm font-semibold text-primary">
                  {learnMoreLabel}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                </span>
              )}
            </Wrapper>
          );
        })}
      </div>
    </Section>
  );
}
