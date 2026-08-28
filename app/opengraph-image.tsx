import { ImageResponse } from "next/og";
import { getActiveConfig } from "@/lib/client";
import { defaultPalette } from "@/lib/theme";
import { brandFingerprint, monogram } from "@/lib/seo";

/**
 * Social share card (WhatsApp, Facebook, LinkedIn, X), generated from the
 * client's theme + copy. Small businesses share their link constantly — without
 * this the preview is a blank box, which reads as untrustworthy.
 *
 * The fingerprinted `id` matters even more here than on the favicon: chat apps
 * and social platforms cache a share card by URL and re-scrape rarely, so a
 * fixed URL means a rebrand keeps showing the old card to everyone.
 */
/** Static for the same reason as the favicon — see `app/icon.tsx`. */
export const dynamic = "force-static";

/**
 * Fallback only. The real alt text is per-client, set in
 * `generateImageMetadata` below — this constant described every client's card as
 * "Site preview", which is the same shared-constant-where-a-per-client-value-
 * belongs mistake the fixed favicon URL was.
 */
export const alt = "Site preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function taglineFor(config: ReturnType<typeof getActiveConfig>): string {
  return config.seo?.description ?? config.footer?.tagline ?? "";
}

export function generateImageMetadata() {
  const config = getActiveConfig();
  const p = defaultPalette(config.theme);
  return [
    {
      id: brandFingerprint(
        config.client,
        config.siteName,
        monogram(config),
        taglineFor(config),
        p.primary,
        p.background,
        p.text,
      ),
      // Describes what the card actually shows: the business, and its strapline
      // when there is one. Screen readers and link-preview surfaces read this.
      alt: taglineFor(config)
        ? `${config.siteName} — ${taglineFor(config)}`
        : config.siteName,
      size,
      contentType,
    },
  ];
}

export default function OpengraphImage() {
  const config = getActiveConfig();
  const p = defaultPalette(config.theme);
  const tagline = taglineFor(config);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: p.background,
          color: p.text,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: p.primary,
            color: p.background,
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          {monogram(config)}
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          {config.siteName}
        </div>
        {tagline && (
          <div
            style={{
              fontSize: 30,
              marginTop: 24,
              color: p.muted ?? p.text,
              // clamp: ImageResponse has no line-clamp, so trim the source text
              maxWidth: 900,
            }}
          >
            {tagline.length > 120 ? `${tagline.slice(0, 117)}…` : tagline}
          </div>
        )}
        <div style={{ display: "flex", height: 10, marginTop: 56, borderRadius: 999, background: p.primary, width: 240 }} />
      </div>
    ),
    size,
  );
}
