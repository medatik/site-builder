import type { BackdropVariant } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Decorative, purely-CSS background layer for heroes and banners. It is fully
 * generic: the look is produced from the active theme's `--primary`/`--accent`
 * variables plus a `variant`, so the same component reads as a technical
 * blueprint grid on one site and a soft organic glow on another with zero
 * niche-specific code.
 *
 * Every layer's opacity is `calc()`'d against `--backdrop-intensity` (set per
 * `data-mode` in `paletteCssVars`, same pattern as `--shadow-color`) instead of
 * a fixed number. A wash tuned to look right on a light palette would otherwise
 * read at a different visual weight on a dark one, because a lighter tint color
 * against a dark surface reads as more prominent at the same raw opacity than a
 * darker tint against a light surface.
 */
export function Backdrop({
  variant = "glow",
  className,
}: {
  variant?: BackdropVariant;
  className?: string;
}) {
  if (variant === "none") return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {variant === "grid" && (
        <>
          <div
            className="absolute inset-0"
            style={{
              opacity: "calc(0.18 * var(--backdrop-intensity, 1))",
              backgroundImage:
                "linear-gradient(color-mix(in srgb,var(--accent) 55%,transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb,var(--accent) 55%,transparent) 1px, transparent 1px)",
              backgroundSize: "clamp(38px, 5vw, 64px) clamp(38px, 5vw, 64px)",
              maskImage: "radial-gradient(120% 80% at 70% 0%, #000 30%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(120% 80% at 70% 0%, #000 30%, transparent 78%)",
            }}
          />
          <div
            className="absolute -right-24 -top-24 size-[36rem] rounded-full blur-3xl"
            style={{
              opacity: "calc(0.4 * var(--backdrop-intensity, 1))",
              background: "radial-gradient(circle, var(--primary), transparent 62%)",
            }}
          />
        </>
      )}

      {variant === "glow" && (
        <>
          <div
            className="absolute -left-32 -top-24 size-[40rem] rounded-full blur-3xl"
            style={{
              opacity: "calc(0.5 * var(--backdrop-intensity, 1))",
              background: "radial-gradient(circle, color-mix(in srgb,var(--primary) 55%, transparent), transparent 65%)",
            }}
          />
          <div
            className="absolute -right-24 top-24 size-[34rem] rounded-full blur-3xl"
            style={{
              opacity: "calc(0.45 * var(--backdrop-intensity, 1))",
              background: "radial-gradient(circle, color-mix(in srgb,var(--accent) 55%, transparent), transparent 65%)",
            }}
          />
        </>
      )}

      {variant === "rays" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: "calc(0.12 * var(--backdrop-intensity, 1))",
            background:
              "repeating-conic-gradient(from 90deg at 50% 0%, var(--primary) 0deg 4deg, transparent 4deg 12deg)",
            maskImage: "radial-gradient(80% 60% at 50% 0%, #000, transparent 70%)",
            WebkitMaskImage: "radial-gradient(80% 60% at 50% 0%, #000, transparent 70%)",
          }}
        />
      )}

      {variant === "contour" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: "calc(0.6 * var(--backdrop-intensity, 1))",
            background:
              "radial-gradient(circle at 50% 138%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 55%), repeating-radial-gradient(circle at 50% 138%, color-mix(in srgb, var(--primary) 26%, transparent) 0 1.5px, transparent 1.5px 22px)",
            maskImage: "radial-gradient(circle at 50% 138%, #000 42%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 138%, #000 42%, transparent 80%)",
          }}
        />
      )}

      {variant === "halftone" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: "calc(0.5 * var(--backdrop-intensity, 1))",
            background:
              "radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%), radial-gradient(circle, color-mix(in srgb, var(--primary) 55%, transparent) 0 1.6px, transparent 2.2px)",
            backgroundSize: "100% 100%, 13px 13px",
            backgroundRepeat: "no-repeat, repeat",
            maskImage: "radial-gradient(circle at 100% 0%, #000, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at 100% 0%, #000, transparent 72%)",
          }}
        />
      )}

      {/*
       * The four animated variants below carry `data-backdrop-anim`. Their `animation`
       * is declared ONLY inside `@media (prefers-reduced-motion: no-preference)` in
       * globals.css — motion is opt-in, matching `.reveal`. Their inline
       * background-position is deliberately set to the animation's FIRST KEYFRAME so the
       * reduced-motion (frozen) state is the intended composition, not a default 0 0.
       */}
      {variant === "aurora" && (
        <div
          data-backdrop-anim="aurora"
          className="absolute inset-0"
          style={{
            opacity: "calc(0.68 * var(--backdrop-intensity, 1))",
            background:
              "linear-gradient(115deg, transparent 12%, color-mix(in srgb, var(--primary) 34%, transparent) 36%, transparent 56%), linear-gradient(158deg, transparent 42%, color-mix(in srgb, var(--accent) 30%, transparent) 64%, transparent 84%)",
            backgroundSize: "200% 200%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0% 50%, 100% 50%",
            filter: "blur(16px)",
            maskImage: "linear-gradient(to bottom, #000, transparent 94%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 94%)",
          }}
        />
      )}

      {variant === "bokeh" && (
        <div
          data-backdrop-anim="bokeh"
          className="absolute inset-0"
          style={{
            opacity: "calc(0.7 * var(--backdrop-intensity, 1))",
            background:
              "radial-gradient(circle at 12% 32%, color-mix(in srgb, var(--accent) 42%, transparent) 0, transparent 22px), radial-gradient(circle at 28% 72%, color-mix(in srgb, var(--primary) 34%, transparent) 0, transparent 34px), radial-gradient(circle at 52% 22%, color-mix(in srgb, var(--accent) 30%, transparent) 0, transparent 15px), radial-gradient(circle at 70% 58%, color-mix(in srgb, var(--primary) 30%, transparent) 0, transparent 40px), radial-gradient(circle at 88% 34%, color-mix(in srgb, var(--accent) 38%, transparent) 0, transparent 24px), radial-gradient(circle at 44% 88%, color-mix(in srgb, var(--primary) 24%, transparent) 0, transparent 26px), radial-gradient(circle at 80% 82%, color-mix(in srgb, var(--accent) 26%, transparent) 0, transparent 18px)",
            filter: "blur(2px)",
            // Promote to its own compositor layer: the animation only moves `transform`,
            // so the 7 blurred gradients rasterize once instead of repainting per frame.
            willChange: "transform",
          }}
        />
      )}

      {variant === "beam" && (
        <div
          data-backdrop-anim="beam"
          className="absolute inset-0"
          style={{
            opacity: "calc(0.62 * var(--backdrop-intensity, 1))",
            background:
              "linear-gradient(102deg, transparent 32%, color-mix(in srgb, var(--primary) 24%, transparent) 46%, color-mix(in srgb, var(--accent) 20%, transparent) 53%, transparent 67%)",
            backgroundSize: "260% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0% 0",
            maskImage: "linear-gradient(to bottom, transparent, #000 38% 62%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 38% 62%, transparent)",
          }}
        />
      )}

      {variant === "scanline" && (
        <div
          data-backdrop-anim="scanline"
          className="absolute inset-0"
          style={{
            opacity: "calc(0.55 * var(--backdrop-intensity, 1))",
            background:
              "linear-gradient(0deg, transparent, color-mix(in srgb, var(--accent) 22%, transparent) 50%, transparent), repeating-linear-gradient(0deg, color-mix(in srgb, var(--primary) 20%, transparent) 0 1px, transparent 1px 5px)",
            backgroundSize: "100% 55%, 100% 5px",
            backgroundRepeat: "no-repeat, repeat",
            backgroundPosition: "0 -55%, 0 0",
            maskImage: "radial-gradient(ellipse at 50% 46%, #000 34%, transparent 82%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 46%, #000 34%, transparent 82%)",
          }}
        />
      )}
    </div>
  );
}
