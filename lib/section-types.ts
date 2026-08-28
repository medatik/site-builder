import type { SectionType } from "./types";

/**
 * Canonical runtime list of section types.
 *
 * A leaf module on purpose: the config validator needs the section-type names,
 * but importing them from `@/components/sections` (which imports every section
 * COMPONENT) drags the whole component graph — including the contact form's
 * server action — into the validator's import chain and forms a cycle
 * (validate-config ← lib/client ← contact action ← Contact ← sections registry
 * ← validate-config). Importing the bare list from here instead breaks it.
 *
 * `satisfies` keeps every entry a real `SectionType`; a test asserts this list
 * and the component registry stay in lockstep, so neither can drift.
 */
export const SECTION_TYPES = [
  "hero",
  "services",
  "about",
  "testimonials",
  "gallery",
  "pricing",
  "contact",
  "faq",
  "team",
  "location",
  "cta",
  "legal",
] as const satisfies readonly SectionType[];
