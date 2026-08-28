import { Check } from "lucide-react";
import type { HeroProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Backdrop } from "@/components/ui/Backdrop";
import { CtaButton } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

/**
 * VoltEdge-specific hero. Identical to the shared Hero except the media slot
 * drops the rounded/shadowed "card" frame and object-cover crop, so a
 * backgroundless (transparent PNG) cutout can sit directly on the backdrop
 * instead of being boxed and cropped.
 */
export function VoltEdgeHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  bullets,
  primaryCta,
  secondaryCta,
  badges,
  media,
  layout = "split",
  backdrop = "glow",
}: HeroProps) {
  const isCentered = layout === "centered";

  const heading = (
    <h1 className="font-heading text-[clamp(2.4rem,6vw,4.25rem)] font-extrabold leading-[1.03] tracking-tight">
      {title}
      {highlight && (
        <>
          {" "}
          <span className="text-primary">{highlight}</span>
        </>
      )}
    </h1>
  );

  const ctas = (primaryCta || secondaryCta) && (
    <div className={cn("flex flex-wrap gap-3", isCentered && "justify-center")}>
      <CtaButton cta={primaryCta} size="lg" />
      <CtaButton cta={secondaryCta} fallbackVariant="secondary" size="lg" />
    </div>
  );

  const badgeRow = badges && badges.length > 0 && (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2 pt-2", isCentered && "justify-center")}>
      {badges.map((b) => (
        <li key={b} className="flex items-center gap-1.5 text-sm font-medium text-muted">
          <Check className="size-4 text-primary" strokeWidth={2.5} />
          {b}
        </li>
      ))}
    </ul>
  );

  const bulletList = bullets && bullets.length > 0 && (
    <ul className={cn("flex flex-col gap-2.5", isCentered && "mx-auto max-w-md text-left")}>
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-3 text-base leading-relaxed">
          <span
            className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)" }}
          >
            <Check className="size-3 text-primary" strokeWidth={3} />
          </span>
          <span className="text-muted">{b}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="relative isolate overflow-hidden bg-background pt-[calc(var(--section-py)*0.85)] pb-[var(--section-py)]">
      <Backdrop variant={backdrop} />
      <Container className="relative">
        <div
          className={cn(
            "grid items-center gap-12",
            isCentered ? "place-items-center text-center" : "lg:grid-cols-[1.05fr_0.95fr]",
          )}
        >
          <div className={cn("flex flex-col gap-6", isCentered ? "max-w-3xl items-center" : "max-w-2xl")}>
            {eyebrow && (
              <span className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] px-3.5 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </span>
            )}
            {heading}
            {subtitle && (
              <p className={cn("text-lg leading-relaxed text-muted sm:text-xl", isCentered && "max-w-2xl")}>
                {subtitle}
              </p>
            )}
            {bulletList}
            {ctas}
            {badgeRow}
          </div>

          {!isCentered && (
            <div className="relative">
              {/* <div
                className="absolute -inset-4 -z-10 rounded-[var(--radius-media)] opacity-60 blur-2xl"
                style={{ background: "radial-gradient(circle at 50% 40%, color-mix(in srgb,var(--accent) 45%, transparent), transparent 70%)" }}
                aria-hidden
              /> */}
              {media?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.src}
                  alt={media.alt}
                  className="mx-auto w-full max-w-md object-contain drop-shadow-[var(--shadow-card-lg)]"
                  loading="lazy"
                />
              ) : (
                <Media
                  media={media}
                  aspect="4 / 5"
                  placeholderIcon="image"
                  className="w-full shadow-[var(--shadow-card-lg)]"
                />
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
