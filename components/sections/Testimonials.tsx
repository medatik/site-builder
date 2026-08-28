import { Quote } from "lucide-react";
import type { TestimonialsProps, BusinessInfo } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { Carousel } from "@/components/ui/Carousel";
import { RatingBadge } from "@/components/ui/RatingBadge";

/**
 * Customer testimonials with optional ratings + avatars.
 *
 * Renders as a snap carousel: slides are 1-per-view on mobile, 2 on md, 3 on
 * lg — so up to three reviews fill the desktop row exactly (no overflow, no
 * controls; visually the old grid) while a fourth review, or a phone-width
 * screen, overflows the track and the arrows/dots appear automatically.
 *
 * `showRating` adds the `business.rating` badge under the heading: an aggregate
 * from the client's public listing, shown for credibility and linking out so a
 * visitor can verify it. That badge is display-only — the `schema.org` markup
 * (see `lib/seo.ts`) is built from these first-party `items`, never from it.
 */
export function Testimonials({
  eyebrow,
  title,
  subtitle,
  items,
  showRating = false,
  reviewsLabel,
  business,
  id,
}: TestimonialsProps & { id?: string; business?: BusinessInfo }) {
  const single = items.length === 1;
  return (
    <Section id={id ?? "testimonials"}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {showRating && business?.rating && (
        <div className="mt-7 flex justify-center">
          <RatingBadge rating={business.rating} reviewsLabel={reviewsLabel} />
        </div>
      )}
      <Carousel className="mt-14">
        {items.map((t, i) => (
          <figure
            key={i}
            className={cn(
              "flex shrink-0 snap-start flex-col gap-4",
              single
                ? "w-full"
                : "w-[85%] sm:w-[70%] md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]",
              "rounded-[var(--radius-card)] border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_10%,transparent)] card-surface p-7 shadow-[var(--shadow-card)]",
            )}
          >
            <div className="flex items-center justify-between">
              <Quote className="size-7 text-primary/40" strokeWidth={2} />
              {typeof t.rating === "number" && <Stars rating={t.rating} />}
            </div>
            <blockquote className="text-[15px] leading-relaxed text-text">“{t.quote}”</blockquote>
            <figcaption className="mt-auto flex items-center gap-3 pt-2">
              <Avatar name={t.author} media={t.avatar} size="md" />
              <div>
                <div className="font-heading font-semibold leading-tight">{t.author}</div>
                {t.role && <div className="text-sm text-muted">{t.role}</div>}
              </div>
            </figcaption>
          </figure>
        ))}
      </Carousel>
    </Section>
  );
}
