import { Check } from "lucide-react";
import type { AboutProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";

/** Two-column "about / why us" block with optional highlights and stats. */
export function About({
  eyebrow,
  title,
  body,
  highlights,
  stats,
  media,
  mediaSide = "right",
  id,
}: AboutProps & { id?: string }) {
  const paragraphs = Array.isArray(body) ? body : [body];
  const mediaFirst = mediaSide === "left";

  return (
    <Section id={id ?? "about"}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={cn("relative", mediaFirst ? "lg:order-1" : "lg:order-2")}>
          <Media media={media} aspect="4 / 3" placeholderIcon="users" className="w-full shadow-[var(--shadow-card-lg)]" />
          {stats && stats.length > 0 && (
            <div
              className="mt-5 grid gap-4 rounded-[var(--radius-card)] border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_10%,transparent)] card-surface p-6 shadow-[var(--shadow-card)]"
              style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, minmax(0,1fr))` }}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-heading text-3xl font-extrabold text-primary">{s.value}</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn("flex flex-col gap-5", mediaFirst ? "lg:order-2" : "lg:order-1")}>
          {eyebrow && (
            <span className="inline-flex w-fit items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-6 bg-primary/60" aria-hidden />
              {eyebrow}
            </span>
          )}
          <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">{title}</h2>
          <div className="flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-muted sm:text-lg">
                {p}
              </p>
            ))}
          </div>
          {highlights && highlights.length > 0 && (
            <ul className="mt-1 grid gap-3 sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-[15px] font-medium">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)" }}
                  >
                    <Check className="size-3 text-primary" strokeWidth={3} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}
