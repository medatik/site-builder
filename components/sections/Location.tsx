import { MapPin, Phone, Clock } from "lucide-react";
import type { LocationProps, BusinessInfo } from "@/lib/types";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/**
 * Map + address + hours. Builds a keyless Google Maps embed from the address.
 *
 * `address`/`phone`/`hours` inherit from the global `business` block when the
 * section omits them, so contact details live in one place. Set them on the
 * section only to override (e.g. a second office). Translated `hours` are still
 * supplied per-locale via the section's translation overlay.
 */
export function Location({
  eyebrow,
  title,
  subtitle,
  address,
  mapEmbedUrl,
  phone,
  hours,
  directionsUrl,
  directionsLabel = "Get directions",
  infoLabels,
  business,
  id,
}: LocationProps & { id?: string; business?: BusinessInfo }) {
  const resolvedAddress = address ?? business?.address ?? "";
  const resolvedPhone = phone ?? business?.phone;
  const resolvedHours = hours ?? business?.hours;
  const embed =
    mapEmbedUrl ?? `https://maps.google.com/maps?q=${encodeURIComponent(resolvedAddress)}&z=14&output=embed`;
  const directions =
    directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(resolvedAddress)}`;
  const labels = {
    address: infoLabels?.address ?? "Address",
    phone: infoLabels?.phone ?? "Phone",
    hours: infoLabels?.hours ?? "Hours",
  };

  return (
    <Section id={id ?? "location"} tone="muted">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-stretch">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
          <ul className="flex flex-col gap-5">
            <li className="flex items-start gap-4">
              <IconChip>
                <MapPin className="size-5" />
              </IconChip>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">{labels.address}</div>
                {/* dir="ltr" isolates a Latin address so RTL bidi can't scramble it. */}
                <div dir="ltr" className="text-[15px] leading-relaxed text-text rtl:text-end">{resolvedAddress}</div>
              </div>
            </li>
            {resolvedPhone && (
              <li className="flex items-start gap-4">
                <IconChip>
                  <Phone className="size-5" />
                </IconChip>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">{labels.phone}</div>
                  <a
                    href={`tel:${resolvedPhone.replace(/\s+/g, "")}`}
                    dir="ltr"
                    className="block text-[15px] text-text hover:text-primary rtl:text-end"
                  >
                    {resolvedPhone}
                  </a>
                </div>
              </li>
            )}
            {resolvedHours && resolvedHours.length > 0 && (
              <li className="flex items-start gap-4">
                <IconChip>
                  <Clock className="size-5" />
                </IconChip>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">{labels.hours}</div>
                  <div className="flex flex-col gap-0.5 text-[15px] text-text">
                    {resolvedHours.map((h) => (
                      <span key={h.days}>
                        <span className="font-medium">{h.days}:</span> {h.hours}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            )}
          </ul>
          <Button href={directions} variant="secondary" icon="navigation" className="w-fit">
            {directionsLabel}
          </Button>
        </div>

        <div className="min-h-[22rem] overflow-hidden rounded-[var(--radius-media)] border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_10%,transparent)] shadow-[var(--shadow-card)]">
          <iframe
            title={`Map showing ${resolvedAddress}`}
            src={embed}
            className="h-full min-h-[22rem] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Section>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-btn)] text-primary"
      style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
    >
      {children}
    </span>
  );
}
