import type { ComponentType } from "react";
import type { SectionType } from "@/lib/types";
import { Hero } from "./Hero";
import { Services } from "./Services";
import { About } from "./About";
import { Testimonials } from "./Testimonials";
import { Gallery } from "./Gallery";
import { Pricing } from "./Pricing";
import { Contact } from "./Contact";
import { FAQ } from "./FAQ";
import { Team } from "./Team";
import { Location } from "./Location";
import { CTA } from "./CTA";
import { Legal } from "./Legal";

/**
 * The shared section library. Maps a section `type` to its default component.
 * Props are passed through dynamically, so the map is intentionally loose;
 * per-section prop types are enforced at the config authoring site.
 */
export const sectionComponents: Record<SectionType, ComponentType<any>> = {
  hero: Hero,
  services: Services,
  about: About,
  testimonials: Testimonials,
  gallery: Gallery,
  pricing: Pricing,
  contact: Contact,
  faq: FAQ,
  team: Team,
  location: Location,
  cta: CTA,
  legal: Legal,
};

/**
 * Every renderable section type, derived from the registry itself so runtime
 * validation can never drift from what the engine can actually render.
 */
export const sectionTypes = Object.keys(sectionComponents) as SectionType[];

export {
  Hero,
  Services,
  About,
  Testimonials,
  Gallery,
  Pricing,
  Contact,
  FAQ,
  Team,
  Location,
  CTA,
  Legal,
};
