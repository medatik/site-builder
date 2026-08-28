"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { CtaButton } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

/**
 * Renders `h1` for the first slide and `h2` for the rest — a tiny component
 * purely so the level can vary without duplicating the heading's markup.
 */
function Heading({
  level,
  className,
  children,
}: {
  level: 1 | 2;
  className?: string;
  children: ReactNode;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return <Tag className={className}>{children}</Tag>;
}

/**
 * Full-bleed rotating hero.
 *
 * Slides are stacked and cross-faded rather than scrolled, because a hero
 * banner should never expose a horizontal scrollbar or let a half-slide sit on
 * screen. Only opacity animates, so the transition stays on the compositor.
 *
 * ACCESSIBILITY / MOTION — the parts that are easy to get wrong:
 *  • Autoplay pauses on hover, on keyboard focus anywhere inside, and whenever
 *    the tab is hidden, so a visitor reading a slide never has it yanked away.
 *  • `prefers-reduced-motion` disables autoplay entirely: rotation is motion
 *    the visitor did not ask for, and it is the single most common a11y
 *    complaint about sliders.
 *  • Inactive slides carry `inert`, which is what actually removes their CTAs
 *    from the tab order — this docblock claimed that for a while before the
 *    code did it, and the links stayed focusable. `aria-hidden` alone hides a
 *    slide from a screen reader but leaves it tabbable, which is worse than
 *    either: focus lands somewhere invisible and nothing is announced.
 *  • Only slide 1 renders the page `<h1>`; later slides use `<h2>`, so a
 *    multi-slide hero doesn't give the page several h1s.
 *  • Arrow keys move between slides when the slider has focus.
 */
export function HeroSlider({
  slides,
  autoplayMs = 0,
  labels,
  id,
}: {
  slides: HeroSlide[];
  autoplayMs?: number;
  labels?: { prev?: string; next?: string; goTo?: string };
  id?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (!autoplayMs || autoplayMs < 1000 || count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(t);
  }, [autoplayMs, count, paused]);

  // A background tab shouldn't burn through the slides unseen.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
  };

  return (
    <section
      ref={rootRef}
      id={id ?? "hero"}
      // roleDescription tells a screen reader this is a carousel, not a list.
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
      onKeyDown={onKeyDown}
    >
      {/* The slides stack in a single grid cell rather than being absolutely
          positioned. Absolute slides cannot contribute height, so the region
          was locked to `min-h` and the tallest slide simply overflowed and got
          clipped — which is why reserving space inside a slide did nothing.
          One grid cell makes the height the max of the slides, so every slide
          has somewhere to put its copy. */}
      <div className="relative grid min-h-[clamp(30rem,78vh,46rem)]">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              aria-hidden={!active}
              // `inert` is what actually removes an inactive slide's CTAs from
              // the tab order. Without it this component's own docblock was a
              // lie: the links stayed focusable, so a keyboard user tabbed into
              // invisible buttons — and focus landing inside aria-hidden is an
              // ARIA violation, leaving a screen reader silent while focus sits
              // somewhere unseen. `pointer-events-none` only ever stopped the
              // mouse. One attribute covers keyboard, AT and pointer together.
              inert={!active}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              className={cn(
                "relative [grid-area:1/1] transition-opacity duration-700 ease-[var(--transition-ease)] motion-reduce:transition-none",
                active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {/* The wrapper does the positioning, not `className` on Media.
                  Media's own root is `position: relative` and `cn` is a plain
                  joiner, so passing `absolute` cannot win: Tailwind settles that
                  conflict by STYLESHEET order, where `.relative` comes last —
                  not by the order the classes appear on the element. Left that
                  way the media stayed in normal flow at full height and pushed
                  the copy past the section's `overflow-hidden` edge, so every
                  slide rendered its heading and CTAs invisibly. */}
              <div className="absolute inset-0">
                <Media
                  media={slide.media}
                  rounded={false}
                  placeholderIcon="image"
                  className="size-full [&_img]:object-cover"
                  sizes="100vw"
                  // Only the first slide is the LCP candidate; preloading them
                  // all would fight the first one for bandwidth.
                  priority={i === 0}
                />
              </div>
              {/* Scrim: photos are unpredictable, so text needs a guaranteed
                  contrast floor. Built from the theme's own background so it
                  stays on-brand in both light and dark palettes. */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--background) 88%, transparent), color-mix(in srgb, var(--background) 45%, transparent) 55%, color-mix(in srgb, var(--background) 15%, transparent))",
                }}
              />

              <Container className="relative flex min-h-[clamp(30rem,78vh,46rem)] items-center py-[var(--section-py)]">
                <div
                  className={cn(
                    "flex max-w-2xl flex-col gap-5",
                    slide.align === "center" && "mx-auto items-center text-center",
                    slide.align === "end" && "ms-auto items-end text-end",
                    // Reserve the strip the controls float in — but only the
                    // part the section's own bottom padding doesn't already
                    // cover. The controls are pinned at bottom-8 (32px) and are
                    // size-11 (44px), so they occupy 76px; `--section-py` runs
                    // from 56px (stark) to 136px (soft), so most presets already
                    // have room and a flat reserve would just make the hero
                    // taller for nothing — tall enough, in fact, to push the
                    // controls below the fold, trading one bug for another.
                    // 5.75rem = the 76px strip plus 16px of breathing room.
                    count > 1 && "pb-[max(0px,calc(5.75rem-var(--section-py)))]",
                  )}
                >
                  {slide.eyebrow && (
                    <span className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-3.5 py-1.5 font-heading text-xs font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-sm">
                      {slide.eyebrow}
                    </span>
                  )}
                  {/* Only the FIRST slide is the page's <h1>. Every slide used
                      to render one, so a three-slide hero gave the page three
                      h1s and a nonsense document outline. Keeping it on slide 1
                      (rather than on whichever slide happens to be showing)
                      means the heading a crawler reads never depends on a
                      timer. */}
                  <Heading
                    level={i === 0 ? 1 : 2}
                    className="font-heading text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-text"
                  >
                    {slide.title}
                    {slide.highlight && (
                      <>
                        {" "}
                        <span className="text-primary">{slide.highlight}</span>
                      </>
                    )}
                  </Heading>
                  {slide.subtitle && (
                    <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                      {slide.subtitle}
                    </p>
                  )}
                  {(slide.primaryCta || slide.secondaryCta) && (
                    // Inactive slides must not be reachable by keyboard.
                    <div className={cn("flex flex-wrap gap-3", !active && "invisible")}>
                      <CtaButton cta={slide.primaryCta} size="lg" />
                      <CtaButton cta={slide.secondaryCta} fallbackVariant="secondary" size="lg" />
                    </div>
                  )}
                </div>
              </Container>
            </div>
          );
        })}

        {count > 1 && (
          <Container className="pointer-events-none absolute inset-x-0 bottom-8 z-10">
            <div className="pointer-events-auto flex items-center gap-4">
              <SliderArrow onClick={() => go(index - 1)} label={labels?.prev ?? "Previous slide"}>
                <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden />
              </SliderArrow>
              <SliderArrow onClick={() => go(index + 1)} label={labels?.next ?? "Next slide"}>
                <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden />
              </SliderArrow>
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`${labels?.goTo ?? "Go to slide"} ${i + 1}`}
                    aria-current={i === index || undefined}
                    className={cn(
                      "h-2 rounded-[var(--radius-pill)] transition-all duration-[var(--transition-base)]",
                      i === index
                        ? "w-6 bg-primary"
                        : "w-2 bg-[color-mix(in_srgb,var(--text)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_50%,transparent)]",
                    )}
                  />
                ))}
              </div>
            </div>
          </Container>
        )}
      </div>
    </section>
  );
}

function SliderArrow({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-11 items-center justify-center rounded-[var(--radius-pill)]",
        "border border-[color-mix(in_srgb,var(--text)_18%,transparent)]",
        "bg-[color-mix(in_srgb,var(--background)_70%,transparent)] text-text backdrop-blur-sm",
        "transition-colors duration-[var(--transition-base)]",
        "hover:border-primary hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {children}
    </button>
  );
}
