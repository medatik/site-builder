import type { BusinessInfo, Section } from "@/lib/types";
import { sectionComponents } from "@/components/sections";
import { getOverride } from "@/overrides/registry";
import { SectionBoundary } from "@/components/SectionBoundary";

/**
 * Renders a single configured section:
 *   1. Skips it when `enabled` is false.
 *   2. Prefers a client-specific override, falling back to the shared default.
 *   3. Passes the section's props, plus shared `business`/`siteName` that a few
 *      sections (contact, etc.) opt into.
 */
export function SectionRenderer({
  section,
  client,
  business,
  siteName,
}: {
  section: Section;
  client: string;
  business?: BusinessInfo;
  siteName: string;
}) {
  if (!section.enabled) return null;

  const Component = getOverride(client, section.type) ?? sectionComponents[section.type];
  if (!Component) return null;

  const id = section.id ?? section.type;
  return (
    // One failing section must not 500 the whole page — see SectionBoundary.
    <SectionBoundary name={id}>
      <Component {...section.props} id={id} business={business} siteName={siteName} />
    </SectionBoundary>
  );
}
