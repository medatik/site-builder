import { ImageResponse } from "next/og";
import { getActiveConfig } from "@/lib/client";
import { defaultPalette } from "@/lib/theme";
import { brandFingerprint, monogram } from "@/lib/seo";

/**
 * Favicon, generated from the client's own theme — their monogram on their
 * primary colour. Every client gets a branded icon with zero configuration and
 * no asset to produce; supply `public/favicon.ico` to override.
 *
 * The `id` from `generateImageMetadata` is what keeps this correct across
 * clients and rebrands — see `brandFingerprint` for why a fixed URL was a bug.
 */
/**
 * `generateImageMetadata` introduces a `[__metadata_id__]` segment, which makes
 * Next treat the route as dynamic and render it per request. Every input is
 * known at build time, so pin it back to static: without this the icon is a
 * function invocation instead of a prerendered file.
 */
export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export function generateImageMetadata() {
  const config = getActiveConfig();
  const palette = defaultPalette(config.theme);
  return [
    {
      // Every value the image below is drawn from. Change any of them and the
      // URL changes, so caches refetch instead of serving last year's icon.
      id: brandFingerprint(
        config.client,
        monogram(config),
        palette.primary,
        palette.background,
      ),
      size,
      contentType,
    },
  ];
}

export default function Icon() {
  const config = getActiveConfig();
  const palette = defaultPalette(config.theme);
  const mark = monogram(config);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: palette.primary,
          color: palette.background,
          fontSize: mark.length > 1 ? 30 : 40,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        {mark}
      </div>
    ),
    size,
  );
}
