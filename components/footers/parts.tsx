import { Phone, Mail, MapPin, Clock } from "lucide-react";
import type { SiteConfig, BusinessInfo, PageConfig } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/**
 * Shared building blocks for footer variants. Each variant composes these so
 * the brand's socials, contact rows, and link feel stay consistent no matter
 * which layout is chosen — and a new variant is mostly arrangement, not
 * re-implementation.
 *
 * Everything here is theme-token driven (palette vars + preset radius/motion),
 * so it adapts across light/dark and every `stylePreset` for free.
 */

/** Every footer variant is a pure function of the whole config. */
export interface FooterProps {
  config: SiteConfig;
}

/** Standard link hover: colour only, timed by the active preset. */
export const linkTransition =
  "transition-colors duration-[var(--transition-base)] ease-[var(--transition-ease)]";

/** The footer's surface: hairline top border + a faint tint off the ink colour. */
export const footerSurface =
  "border-t border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--text)_4%,var(--background))]";

/** Row of circular/pill social buttons. Shape follows `--radius-pill`. */
export function FooterSocials({
  socials,
  className = "",
}: {
  socials: NonNullable<BusinessInfo["socials"]>;
  className?: string;
}) {
  if (!socials.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          className={`flex size-9 items-center justify-center rounded-[var(--radius-pill)] border border-[color-mix(in_srgb,var(--text)_14%,transparent)] text-muted hover:border-primary hover:text-primary ${linkTransition}`}
        >
          <Icon name={s.icon} className="size-4" />
        </a>
      ))}
    </div>
  );
}

/**
 * Links to routed pages that opted OUT of the header nav (`nav: false`) —
 * typically legal pages. Without this they'd have no entry point anywhere on
 * the site, which for a privacy policy defeats the purpose of having one.
 * Pages with `nav: true` already appear in the header and footer quick-nav.
 */
export function FooterPageLinks({ pages }: { pages?: PageConfig[] }) {
  const items = (pages ?? []).filter((p) => p.nav === false);
  if (items.length === 0) return null;
  return (
    <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((p) => (
        <a key={p.slug} href={`/${p.slug}`} className={`hover:text-primary ${linkTransition}`}>
          {p.title}
        </a>
      ))}
    </nav>
  );
}

/** Vertical contact list (phone / email / address / optional hours). */
export function ContactList({
  business,
  showHours = false,
}: {
  business: BusinessInfo;
  showHours?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2.5 text-sm text-muted">
      {business.phone && (
        <li className="flex items-center gap-2.5">
          <Phone className="size-4 shrink-0 text-primary" />
          <a href={`tel:${business.phone.replace(/\s+/g, "")}`} dir="ltr" className={`hover:text-primary rtl:text-end ${linkTransition}`}>
            {business.phone}
          </a>
        </li>
      )}
      {business.email && (
        <li className="flex items-center gap-2.5">
          <Mail className="size-4 shrink-0 text-primary" />
          <a href={`mailto:${business.email}`} dir="ltr" className={`hover:text-primary rtl:text-end ${linkTransition}`}>
            {business.email}
          </a>
        </li>
      )}
      {business.address && (
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span dir="ltr" className="rtl:text-end">{business.address}</span>
        </li>
      )}
      {showHours && business.hours && business.hours.length > 0 && (
        <li className="flex items-start gap-2.5">
          <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="flex flex-col gap-0.5">
            {business.hours.map((h) => (
              <span key={h.days}>
                <span className="font-medium text-text">{h.days}:</span> {h.hours}
              </span>
            ))}
          </span>
        </li>
      )}
    </ul>
  );
}
