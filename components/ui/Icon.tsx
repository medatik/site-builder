import { type LucideProps } from "lucide-react";
import type { ReactElement } from "react";
import { FallbackIcon, lookupIcon, normalizeIconName } from "@/lib/icon-map";

/**
 * Render an icon by name (as supplied in a config). Configs may write
 * "shield-check", "shieldCheck" or "ShieldCheck" — all normalize to the same
 * entry — and an unknown name falls back to a neutral glyph so a typo never
 * breaks a build.
 *
 * Names resolve against the CURATED set in `lib/icon-map.ts`, not lucide's full
 * export map: a dynamic lookup over that barrel can't be tree-shaken and cost a
 * 436 KB chunk on every page. Need an icon that isn't there? Add it to the map.
 *
 * A small set of brand glyphs lucide doesn't ship is provided here too, so e.g.
 * `icon: "whatsapp"` renders a real mark.
 */

/**
 * WhatsApp mark. Lucide has no WhatsApp icon, so we ship the official-style
 * filled glyph. It reads `currentColor` and sizes like a lucide icon, so it
 * drops into buttons/socials with no special handling. `strokeWidth` and other
 * lucide-only props are absorbed so they never leak onto the raw <svg>.
 */
function WhatsAppIcon({
  className,
  size = 24,
  color,
  strokeWidth: _sw,
  absoluteStrokeWidth: _asw,
  ...rest
}: LucideProps): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color ?? "currentColor"}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/** Brand glyphs lucide doesn't ship. Keyed by a normalized lowercase name. */
const brandIcons: Record<string, (props: LucideProps) => ReactElement> = {
  whatsapp: WhatsAppIcon,
  wa: WhatsAppIcon,
};

export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  if (!name) return <FallbackIcon {...props} />;
  const brand = brandIcons[normalizeIconName(name)];
  if (brand) return brand(props);
  const Cmp = lookupIcon(name);
  if (!Cmp) {
    if (process.env.NODE_ENV !== "production") {
      // Loud in dev, silent in prod: a missing icon shouldn't break a live site,
      // but it should be obvious while building one.
      console.warn(`[Icon] "${name}" is not in the curated set (lib/icon-map.ts).`);
    }
    return <FallbackIcon {...props} />;
  }
  return <Cmp {...props} />;
}
