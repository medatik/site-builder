import type { GalleryProps, GalleryImage } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Media } from "@/components/ui/Media";
import { Carousel } from "@/components/ui/Carousel";

const colClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Masonry uses CSS multi-columns, so the count is a column-count utility. */
const masonryColClass: Record<number, string> = {
  2: "sm:columns-2",
  3: "sm:columns-2 lg:columns-3",
  4: "sm:columns-2 lg:columns-4",
};

/** Carousel slide widths, so `columns` means "how many are visible at once". */
const slideWidth: Record<number, string> = {
  2: "basis-[85%] sm:basis-[48%]",
  3: "basis-[85%] sm:basis-[48%] lg:basis-[31.8%]",
  4: "basis-[85%] sm:basis-[48%] lg:basis-[23.5%]",
};

/**
 * Heights masonry cycles through, so columns stagger instead of forming rows.
 *
 * A real masonry would use each image's intrinsic height, but `Media` renders
 * with `fill` — which needs a sized parent — and a themed placeholder has no
 * natural height at all. Cycling a few ratios gives the staggered look for both
 * real photos and placeholders, and keeps every layout on one component.
 */
const MASONRY_ASPECTS = ["4 / 3", "3 / 4", "1 / 1", "4 / 5", "3 / 2", "1 / 1"];

/**
 * Image gallery — project photos, work samples, before/after.
 *
 * Three arrangements via `layout` (see `GalleryLayout`). `grid` is the default
 * and is unchanged, so every existing config renders exactly as before.
 */
export function Gallery({
  eyebrow,
  title,
  subtitle,
  images,
  columns = 3,
  layout = "grid",
  carouselLabels,
  id,
}: GalleryProps & { id?: string }) {
  return (
    <Section id={id ?? "gallery"} tone="muted">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      {layout === "carousel" ? (
        <Carousel
          className="mt-14"
          prevLabel={carouselLabels?.prev ?? "Previous"}
          nextLabel={carouselLabels?.next ?? "Next"}
          slideLabel={carouselLabels?.goTo ?? "Go to image"}
        >
          {images.map((img, i) => (
            <div key={i} className={cn("shrink-0 snap-start", slideWidth[columns])}>
              <Tile img={img} sizes="(max-width: 640px) 85vw, (max-width: 1024px) 48vw, 32vw" />
            </div>
          ))}
        </Carousel>
      ) : layout === "masonry" ? (
        // CSS columns keep each image's natural height, so portrait and
        // landscape shots coexist without cropping. `break-inside-avoid` stops
        // a tile being split across a column boundary.
        <div className={cn("mt-14 columns-1 gap-4 [column-fill:_balance]", masonryColClass[columns])}>
          {images.map((img, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <Tile
                img={img}
                aspect={MASONRY_ASPECTS[i % MASONRY_ASPECTS.length]}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("mt-14 grid grid-cols-1 gap-4", colClass[columns])}>
          {images.map((img, i) => (
            <Tile key={i} img={img} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ))}
        </div>
      )}
    </Section>
  );
}

/**
 * One image tile. Shared by every layout so hover, captions and the placeholder
 * behave identically — only the surrounding arrangement changes.
 *
 * `aspect` is undefined for masonry (the point is natural heights); the other
 * layouts crop to 4:3 so rows line up.
 */
function Tile({
  img,
  sizes,
  aspect = "4 / 3",
}: {
  img: GalleryImage;
  sizes: string;
  aspect?: string;
}) {
  return (
    <figure className="group relative overflow-hidden rounded-[var(--radius-media)] shadow-[var(--shadow-card)]">
      <Media
        media={img}
        aspect={aspect}
        rounded={false}
        placeholderIcon="camera"
        label={img.label}
        sizes={sizes}
        className="transition-transform duration-500 group-hover:scale-[1.04]"
      />
      {img.caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}
