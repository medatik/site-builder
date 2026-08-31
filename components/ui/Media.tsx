import NextImage from "next/image";
import { cn } from "@/lib/cn";
import type { Media as MediaType } from "@/lib/types";
import { Icon } from "./Icon";

/** Absolute URLs point at a host we don't control. */
const isRemote = (src: string) => /^https?:\/\//i.test(src);

/**
 * Renders a client-supplied image, or a themed placeholder when no `src` is
 * given. Demos ship without stock photography — the placeholder is an on-brand
 * gradient panel so the layout still reads as intended and clients can drop in
 * real photos later with zero component changes.
 *
 * Real photos go through `next/image` (responsive srcset + lazy loading +
 * modern formats), which is what keeps a client's 4MB phone snapshot from
 * wrecking LCP. Every caller passes an `aspect`, so the image fills a box of
 * known ratio — no layout shift, no need for intrinsic dimensions in config.
 *
 * Remote (`https://…`) sources render `unoptimized`: optimising them would
 * require every client's host in `next.config.mjs` `remotePatterns`, and a
 * missing entry throws at request time. Unoptimized still gets lazy loading and
 * correct sizing, and it can never break a client's site. Files placed in
 * `public/` (the common case) are optimised normally.
 */
export function Media({
  media,
  className,
  rounded = true,
  placeholderIcon = "image",
  label,
  aspect,
  /** Responsive sizing hint. Default assumes a roughly half-width column. */
  sizes = "(max-width: 768px) 100vw, 50vw",
  /** Set on the LCP image (the hero) to preload it instead of lazy-loading. */
  priority = false,
}: {
  media?: MediaType;
  className?: string;
  rounded?: boolean;
  placeholderIcon?: string;
  label?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const radius = rounded ? "rounded-[var(--radius-media)]" : "";
  if (media?.src) {
    const treatment = media.treatment ?? "none";
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          // `isolate` confines the blend below to this box. Without it the
          // overlay blends with whatever the section painted behind it, so the
          // treatment would change depending on where the image sat.
          treatment !== "none" && "isolate",
          radius,
          className,
        )}
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <NextImage
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          // SVG is passed through for the same reason remote sources are: there
          // is nothing for a raster optimiser to do to a vector, and routing one
          // through /_next/image would require `images.dangerouslyAllowSVG` —
          // which cannot be scoped to our own files. It would apply to every SVG
          // the deployment is ever pointed at, including a client-supplied one.
          // Skipping the optimiser costs nothing here and keeps that flag off.
          unoptimized={isRemote(media.src) || /\.svg($|[?#])/i.test(media.src)}
          className={cn("object-cover", treatment !== "none" && "grayscale")}
        />
        {/* The photo is greyscaled first so its own saturation cannot fight the
            blend; these layers then put the palette back. */}
        {treatment === "tint" && (
          // `color` takes hue and saturation from this layer and luminance from
          // the photo below, so the picture keeps its detail and depth and only
          // its colour comes from the theme.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-color"
            style={{ background: "var(--primary)" }}
          />
        )}
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={media?.alt ?? label ?? "Placeholder image"}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        radius,
        className,
      )}
      style={{
        aspectRatio: aspect,
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, var(--background)), color-mix(in srgb, var(--accent) 22%, var(--background)))",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb,var(--text) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <Icon
          name={placeholderIcon}
          className="size-9 text-[color-mix(in_srgb,var(--text)_45%,transparent)]"
          strokeWidth={1.5}
        />
        {label && (
          <span className="font-heading text-sm font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--text)_60%,transparent)]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
