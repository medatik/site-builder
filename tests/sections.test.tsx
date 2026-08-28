import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { sectionComponents, Gallery, Hero, Testimonials } from "@/components/sections";
import { sectionSkeletons } from "@/scripts/section-skeletons";
import { SECTION_TYPES } from "@/lib/section-types";
import { snapPositions, clampIndex } from "@/components/ui/Carousel";
import type { Section, SectionType } from "@/lib/types";

/**
 * Smoke tests for the section registry.
 *
 * These exist because of the multi-tenant model: every site shares one set of
 * section components, so a section that throws does not break one site — it
 * breaks all of them at once. That is the cost of sharing 100% of the code, and
 * cheap render coverage is what pays for it.
 */

const business = {
  phone: "+1 (555) 000-0000",
  email: "hello@example.com",
  address: "123 Main Street, Your City",
  hours: [{ days: "Mon–Fri", hours: "9:00am – 5:00pm" }],
};

const types = Object.keys(sectionComponents) as SectionType[];

describe("section registry", () => {
  it("every section type has a skeleton (add:section can scaffold all of them)", () => {
    const skeletonTypes = new Set(sectionSkeletons.map((s) => s.type));
    const missing = types.filter((t) => !skeletonTypes.has(t));
    expect(missing, `section types with no skeleton: ${missing.join(", ")}`).toEqual([]);
  });

  it("every skeleton maps to a real section type", () => {
    const unknown = sectionSkeletons.map((s) => s.type).filter((t) => !types.includes(t));
    expect(unknown, `skeletons for unknown types: ${unknown.join(", ")}`).toEqual([]);
  });

  it("the validator's SECTION_TYPES list matches the registry (no drift)", () => {
    // SECTION_TYPES lives in a leaf module so the validator avoids an import
    // cycle; this keeps it honest against the actual registry.
    expect([...SECTION_TYPES].sort()).toEqual([...types].sort());
  });
});

describe("section rendering", () => {
  it.each(sectionSkeletons.map((s) => [s.type, s] as const))(
    "%s renders without throwing",
    (type, skeleton) => {
      const Component = sectionComponents[type];
      // Props are a discriminated union; the registry erases the correlation,
      // so spreading them needs the same widening the renderer uses.
      const props = (skeleton as Section).props as unknown as Record<string, unknown>;
      const html = renderToStaticMarkup(
        <Component {...props} id={type} business={business} siteName="Test Co" />,
      );
      expect(html.length).toBeGreaterThan(0);
    },
  );

  it("sections that take an id render it as an anchor", () => {
    // Anchors are what the nav links to — a section silently dropping its id
    // (as Hero once did) breaks in-page navigation with no error.
    for (const skeleton of sectionSkeletons) {
      const Component = sectionComponents[skeleton.type];
      // Props are a discriminated union; the registry erases the correlation,
      // so spreading them needs the same widening the renderer uses.
      const props = (skeleton as Section).props as unknown as Record<string, unknown>;
      const html = renderToStaticMarkup(
        <Component {...props} id={skeleton.type} business={business} siteName="Test Co" />,
      );
      expect(html, `${skeleton.type} did not emit id="${skeleton.type}"`).toContain(
        `id="${skeleton.type}"`,
      );
    }
  });
});

describe("gallery layouts", () => {
  const images = [
    { alt: "one", label: "One", caption: "First" },
    { alt: "two", label: "Two" },
    { alt: "three", label: "Three" },
  ];
  const render = (props: Record<string, unknown>) =>
    renderToStaticMarkup(
      <Gallery title="Work" images={images} {...props} id="gallery" />,
    );

  it("renders every image in all three layouts", () => {
    for (const layout of ["grid", "carousel", "masonry"] as const) {
      const html = render({ layout });
      expect(html, `${layout} dropped an image`).toContain("First");
      expect((html.match(/figure/g) ?? []).length, `${layout} tile count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("defaults to grid, so existing configs are unchanged", () => {
    expect(render({})).toBe(render({ layout: "grid" }));
  });

  it("only the carousel layout ships the scroll track", () => {
    expect(render({ layout: "carousel" })).toContain("snap-x");
    expect(render({ layout: "grid" })).not.toContain("snap-x");
  });

  it("masonry staggers heights instead of using one uniform crop", () => {
    const html = render({ layout: "masonry" });
    expect(html).toContain("break-inside-avoid");
    // More than one aspect-ratio in play is what makes it read as masonry.
    const ratios = new Set(html.match(/aspect-ratio:[^;"]+/g) ?? []);
    expect(ratios.size).toBeGreaterThan(1);
  });
});

describe("hero slider", () => {
  it("renders each slide's copy", () => {
    const html = renderToStaticMarkup(
      <Hero
        title="Base"
        layout="slider"
        slides={[
          { title: "Slide one", subtitle: "First offer" },
          { title: "Slide two", subtitle: "Second offer" },
        ]}
        id="hero"
      />,
    );
    expect(html).toContain("Slide one");
    expect(html).toContain("Slide two");
    expect(html).toContain('aria-roledescription="carousel"');
  });

  it("falls back to the top-level copy when slides are missing", () => {
    // Switching layout before authoring slides must degrade, not blow up.
    const html = renderToStaticMarkup(
      <Hero title="Only headline" subtitle="Sub" layout="slider" id="hero" />,
    );
    expect(html).toContain("Only headline");
  });

  it("hides inactive slides from assistive tech", () => {
    const html = renderToStaticMarkup(
      <Hero title="B" layout="slider" slides={[{ title: "A" }, { title: "B" }]} id="hero" />,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("makes inactive slides inert, so their CTAs leave the tab order", () => {
    // `aria-hidden` alone hides a slide from a screen reader but leaves its
    // links tabbable — the worst combination, because focus then sits on an
    // invisible control that is announced as nothing. The component's docblock
    // claimed this behaviour for a while before the code did it.
    const html = renderToStaticMarkup(
      <Hero
        title="B"
        layout="slider"
        slides={[
          { title: "A", primaryCta: { label: "Visible CTA", href: "#a" } },
          { title: "B", primaryCta: { label: "Hidden CTA", href: "#b" } },
        ]}
        id="hero"
      />,
    );
    // Slide 0 is active on first render, so exactly one slide is inert.
    expect((html.match(/inert=""/g) ?? []).length).toBe(1);
  });

  it("renders exactly one h1 no matter how many slides there are", () => {
    // Every slide used to render an <h1>, so a three-slide hero gave the page
    // three of them. The h1 also stays on slide 1 rather than following the
    // active slide, so what a crawler reads never depends on a timer.
    const html = renderToStaticMarkup(
      <Hero
        title="Base"
        layout="slider"
        slides={[{ title: "First" }, { title: "Second" }, { title: "Third" }]}
        id="hero"
      />,
    );
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
    expect((html.match(/<h2/g) ?? []).length).toBe(2);
    expect(html.slice(html.indexOf("<h1"), html.indexOf("</h1>"))).toContain("First");
  });

  it("does not affect the default split layout", () => {
    const html = renderToStaticMarkup(<Hero title="Plain" id="hero" />);
    expect(html).not.toContain("aria-roledescription");
  });
});

describe("rating badge", () => {
  const rating = { value: 4.8, count: 127, url: "https://g.page/x", source: "Google" };
  const render = (props: Record<string, unknown>, biz?: Record<string, unknown>) =>
    renderToStaticMarkup(
      <Testimonials title="Reviews" items={[{ quote: "q", author: "A", rating: 5 }]}
        business={biz as never} id="testimonials" {...props} />,
    );

  it("is hidden unless showRating is set", () => {
    expect(render({}, { rating })).not.toContain("127");
  });

  it("shows value, count and source, linking to the listing", () => {
    const html = render({ showRating: true }, { rating });
    expect(html).toContain("4.8");
    expect(html).toContain("127");
    expect(html).toContain("Google");
    expect(html).toContain("https://g.page/x");
  });

  it("fills stars fractionally rather than rounding 4.8 up to five", () => {
    // 4.8/5 = 96% — an honest badge, not five solid stars.
    expect(render({ showRating: true }, { rating })).toContain("width:96%");
  });

  it("degrades quietly when the client has no rating configured", () => {
    expect(() => render({ showRating: true }, {})).not.toThrow();
    expect(render({ showRating: true }, {})).not.toContain("reviews on");
  });

  it("localises the reviews label", () => {
    expect(render({ showRating: true, reviewsLabel: "avis sur" }, { rating })).toContain("avis sur");
  });
});

describe("carousel paging maths", () => {
  // Extracted from the component so the arithmetic behind the dots is testable
  // without a DOM (the suite runs in `environment: "node"`).
  const step = 100; // slide width + gap, px

  it("hides controls when nothing overflows", () => {
    expect(snapPositions(0, step)).toBe(1);
    expect(snapPositions(1, step)).toBe(1);
  });

  it("adds one stop per scrollable step", () => {
    // 6 slides, 3 visible → 3 steps of overflow → 4 stops.
    expect(snapPositions(300, step)).toBe(4);
    expect(snapPositions(100, step)).toBe(2);
  });

  it("never divides by a zero step", () => {
    expect(snapPositions(500, 0)).toBe(1);
  });

  it("keeps a dot active after slides are REMOVED", () => {
    // Was at stop 5; the list shrank to 2 stops. Without clamping, `i === index`
    // matches no rendered dot and the carousel loses its active marker.
    expect(clampIndex(5, 2)).toBe(1);
  });

  it("leaves a valid index untouched, and floors negatives", () => {
    expect(clampIndex(2, 4)).toBe(2);
    expect(clampIndex(-3, 4)).toBe(0);
  });

  it("survives an empty track", () => {
    expect(clampIndex(3, 0)).toBe(0);
  });
});

describe("rating badge hides rather than showing an empty score", () => {
  const render = (rating: Record<string, unknown>) =>
    renderToStaticMarkup(
      <Testimonials title="Reviews" showRating items={[{ quote: "q", author: "A", rating: 5 }]}
        business={{ rating } as never} id="testimonials" />,
    );

  it("renders nothing for a client with no reviews yet", () => {
    // The template ships zeros; "0.0 · 0 reviews on Google" is worse than silence.
    expect(render({ value: 0, count: 0, source: "Google" })).not.toContain("reviews on");
    expect(render({ value: 4.8, count: 0, source: "Google" })).not.toContain("reviews on");
  });

  it("still renders a real rating", () => {
    expect(render({ value: 4.8, count: 12, source: "Google" })).toContain("reviews on");
  });
});

/**
 * `cn` is a plain joiner, not `tailwind-merge`. So when a component hardcodes a
 * position on its root and a caller passes a different one, BOTH land on the
 * element, and the winner is decided by STYLESHEET order — where `.relative`
 * comes after `.absolute` — not by the order written on the element.
 *
 * That is invisible to every other check here: the markup is correct, the types
 * are correct, nothing throws, and jsdom has no layout to measure. It shipped in
 * `HeroSlider`, where the media stayed in normal flow at full height and pushed
 * the copy past the section's `overflow-hidden` edge — a hero that rendered its
 * heading, subtitle and CTAs completely invisibly, on a page whose whole job is
 * that hero.
 *
 * A conflict of this shape is never deliberate, so it can simply be banned.
 */
const POSITIONS = ["static", "fixed", "absolute", "relative", "sticky"];

function conflictingPositions(html: string): string[] {
  const bad: string[] = [];
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    // Variant-prefixed utilities (`md:absolute`) are conditional and legitimate;
    // only bare ones compete for the same cascade slot.
    const hit = m[1].split(/\s+/).filter((c) => POSITIONS.includes(c));
    if (hit.length > 1) bad.push(hit.join(" + ") + '  in  class="' + m[1] + '"');
  }
  return bad;
}

describe("no element carries two position utilities", () => {
  it.each(sectionSkeletons.map((s) => [s.type, s] as const))("%s", (type, skeleton) => {
    const Component = sectionComponents[type];
    const props = (skeleton as Section).props as unknown as Record<string, unknown>;
    const html = renderToStaticMarkup(
      <Component {...props} id={type} business={business} siteName="Test Co" />,
    );
    const bad = conflictingPositions(html);
    expect(bad, bad.join("\n")).toEqual([]);
  });

  it("hero slider — the layout the bug actually shipped in", () => {
    const html = renderToStaticMarkup(
      <Hero
        id="hero"
        layout="slider"
        title="Headline"
        slides={[
          {
            title: "Healthcare that",
            highlight: "listens first.",
            subtitle: "Unhurried visits.",
            primaryCta: { label: "Book", href: "#contact" },
            media: { src: "", alt: "A provider talking with a patient" },
            align: "start",
          },
          { title: "Second slide", media: { src: "", alt: "Second" } },
        ]}
      />,
    );
    expect(html).toContain("listens first.");
    const bad = conflictingPositions(html);
    expect(bad, bad.join("\n")).toEqual([]);
  });
});
