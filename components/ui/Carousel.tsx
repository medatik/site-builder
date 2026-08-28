"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Generic horizontal carousel built on CSS scroll-snap. Slides are passed as
 * children (they can stay server-rendered); this wrapper only owns the scroll
 * state, so sections keep their zero-JS content.
 *
 * Behavior is automatic: arrows + dots appear only when the track actually
 * overflows. Give slides responsive widths so that when everything fits
 * (e.g. 3 cards at 1/3 width on desktop) there is no overflow and the carousel
 * degrades into a plain row — no config flag needed.
 *
 * RTL: direction is read from computed styles; scrolling uses |scrollLeft|
 * with a direction sign (modern browsers use negative scrollLeft in RTL), and
 * the chevrons mirror via `rtl:-scale-x-100`. Respects reduced motion.
 */

/**
 * Number of distinct snap stops for a track. Pure, so the arithmetic that
 * decides how many dots appear is testable without a DOM.
 *
 * `max` is the scrollable distance (`scrollWidth - clientWidth`); one stop per
 * step, plus the resting position. Returns 1 when nothing overflows, which is
 * what hides the controls entirely.
 */
export function snapPositions(max: number, step: number): number {
  if (max <= 1 || step <= 0) return 1;
  return Math.round(max / step) + 1;
}

/**
 * The dot to mark active. Removing slides shrinks `positions` while the scroll
 * index lingers, and an index past the end matches NO dot — the carousel loses
 * its active marker entirely. Clamping at render time avoids that without a
 * setState-in-effect cascade.
 */
export function clampIndex(index: number, positions: number): number {
  return Math.min(Math.max(index, 0), Math.max(0, positions - 1));
}

export function Carousel({
  children,
  className,
  trackClassName,
  prevLabel = "Previous",
  nextLabel = "Next",
  slideLabel = "Go to item",
}: {
  children: ReactNode[];
  className?: string;
  trackClassName?: string;
  prevLabel?: string;
  nextLabel?: string;
  slideLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [index, setIndex] = useState(0);
  const [positions, setPositions] = useState(1); // distinct snap stops
  const stepRef = useRef(1); // slide width + gap, px
  const rtlRef = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.children;
    if (!slides.length) return;
    rtlRef.current = getComputedStyle(track).direction === "rtl";
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const slideW = (slides[0] as HTMLElement).getBoundingClientRect().width;
    stepRef.current = Math.max(1, slideW + gap);
    const max = track.scrollWidth - track.clientWidth;
    setOverflow(max > 1);
    setPositions(snapPositions(max, stepRef.current));
  }, []);

  // How many slides there are. This is a DEPENDENCY of the measure effect, not
  // just a value: a ResizeObserver on the track fires when the TRACK's own box
  // changes, and adding or removing slides changes `scrollWidth` while leaving
  // that box identical — so RO alone never notices, and the arrows/dots stay
  // stale until something else forces a re-measure. Editing a config's reviews
  // in dev (Fast Refresh preserves state) hits this every time.
  const slideCount = Array.isArray(children) ? children.length : 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    // RO still earns its place: it catches viewport/container resizes, which
    // change how many slides fit. The window listener is a fallback for
    // embedded contexts where RO is throttled or unavailable.
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, slideCount]);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(Math.abs(track.scrollLeft) / stepRef.current));
  }, []);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const target = Math.min(Math.max(i, 0) * stepRef.current, max);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: rtlRef.current ? -target : target,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  // Clamp for RENDERING rather than correcting `index` in an effect. Removing
  // slides shrinks `positions`, and a stale `index` past the end would leave no
  // dot matching — the carousel silently loses its active marker. Deriving it
  // fixes that without a setState-in-effect cascade.
  const active = clampIndex(index, positions);
  const atStart = active <= 0;
  const atEnd = active >= positions - 1;

  return (
    <div className={className}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className={cn(
          "flex snap-x snap-mandatory gap-5 overflow-x-auto py-1",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          trackClassName,
        )}
      >
        {children}
      </div>

      {overflow && (
        <div className="mt-7 flex items-center justify-center gap-4">
          <CarouselArrow onClick={() => goTo(active - 1)} disabled={atStart} label={prevLabel}>
            <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden />
          </CarouselArrow>
          <div className="flex items-center gap-2">
            {Array.from({ length: positions }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${slideLabel} ${i + 1}`}
                aria-current={i === active || undefined}
                className={cn(
                  "h-2 rounded-[var(--radius-pill)] transition-all duration-[var(--transition-base)]",
                  i === active
                    ? "w-5 bg-primary"
                    : "w-2 bg-[color-mix(in_srgb,var(--text)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_45%,transparent)]",
                )}
              />
            ))}
          </div>
          <CarouselArrow onClick={() => goTo(active + 1)} disabled={atEnd} label={nextLabel}>
            <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden />
          </CarouselArrow>
        </div>
      )}
    </div>
  );
}

function CarouselArrow({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-[var(--radius-pill)]",
        "border border-[color-mix(in_srgb,var(--text)_14%,transparent)] text-muted",
        "transition-colors duration-[var(--transition-base)]",
        disabled
          ? "opacity-40"
          : "hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
