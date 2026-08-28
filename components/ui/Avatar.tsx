import { cn } from "@/lib/cn";
import type { Media } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/**
 * Circular avatar. Uses a supplied photo, otherwise renders the person's
 * initials on a themed disc — keeps team/testimonial layouts intact without
 * stock headshots.
 */
export function Avatar({
  name,
  media,
  size = "md",
  className,
}: {
  name: string;
  media?: Media;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "lg" ? "size-16" : size === "sm" ? "size-10" : "size-12";
  if (media?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.src}
        alt={media.alt}
        className={cn("rounded-full object-cover", dim, className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full font-heading font-bold text-[color:var(--background)]",
        dim,
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--accent) 70%, var(--primary)))",
      }}
    >
      {initials(name)}
    </div>
  );
}
