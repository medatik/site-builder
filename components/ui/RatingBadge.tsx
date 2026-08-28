import { Star } from "lucide-react";
import type { PublicRating } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Public rating badge — "★★★★★ 4.8 · 127 reviews on Google".
 *
 * Renders `business.rating`, which is hand-typed config data, not an API
 * response (see `PublicRating` for why). Purely presentational: this never
 * emits structured data, because a rating copied from another platform must not
 * be marked up as the site's own.
 *
 * Stars fill FRACTIONALLY. Rounding 4.8 up to five solid stars overstates the
 * business's rating, which is exactly the kind of small dishonesty that erodes
 * trust when a visitor clicks through to the real listing.
 */
export function RatingBadge({
  rating,
  className,
  reviewsLabel = "reviews on",
}: {
  rating: PublicRating;
  className?: string;
  /** Text between the count and the source. Localise via the section's props. */
  reviewsLabel?: string;
}) {
  // A client who hasn't collected reviews yet — or a config still carrying the
  // template's zeros — would otherwise render "0.0 · 0 reviews on Google",
  // which is worse than showing nothing at all.
  if (!rating.count || rating.count < 1 || !rating.value) return null;

  const value = Math.max(0, Math.min(5, rating.value));
  const source = rating.source ?? "Google";
  const label = `${value.toFixed(1)} out of 5, ${rating.count} ${reviewsLabel} ${source}`;

  const body = (
    <>
      <span className="relative inline-flex shrink-0" aria-hidden>
        {/* Base: five empty stars. */}
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 text-[color-mix(in_srgb,var(--text)_22%,transparent)]" strokeWidth={1.5} />
          ))}
        </span>
        {/* Overlay clipped to the exact fraction — 4.8 shows 96% width.
            Rounded because 4.9/5*100 is 98.00000000000001 in binary floating
            point, and that artifact would ship into the DOM. */}
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${Math.round((value / 5) * 10000) / 100}%` }}
        >
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 shrink-0 fill-star text-star" strokeWidth={1.5} />
            ))}
          </span>
        </span>
      </span>

      <span className="font-heading text-sm font-bold text-text">{value.toFixed(1)}</span>
      <span className="text-sm text-muted">
        · {rating.count} {reviewsLabel} {source}
      </span>
    </>
  );

  const shell = cn(
    "inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)]",
    "border border-[color-mix(in_srgb,var(--text)_12%,transparent)] card-surface",
    "px-4 py-2 transition-colors duration-[var(--transition-base)]",
    className,
  );

  // Linking to the real listing is what makes the number verifiable rather than
  // a claim — always offer it when a URL exists.
  if (rating.url) {
    return (
      <a
        href={rating.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={cn(shell, "hover:border-primary")}
      >
        {body}
      </a>
    );
  }
  return (
    <div className={shell} aria-label={label} role="img">
      {body}
    </div>
  );
}
