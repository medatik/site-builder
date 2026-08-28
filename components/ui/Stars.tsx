import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Star rating (1–5). Rounds to nearest whole star. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            // `--star`, not `--accent`: a rating is meaningful non-text content
            // and must clear 3:1, which a decorative brand accent needn't.
            i < filled ? "fill-star text-star" : "text-[color-mix(in_srgb,var(--text)_25%,transparent)]",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
