import type { ComponentType } from "react";
import type { SectionType } from "@/lib/types";
import { overrides } from "./active";

/**
 * Per-client section overrides — ENGINE PLUMBING (shared on `main`).
 *
 * This file defines the override *type* and lookup. The actual registrations
 * live in `./active.ts`, which is CLIENT-OWNED. Splitting them means the engine
 * can evolve this plumbing freely without ever clobbering a client's own
 * registrations.
 *
 * The renderer checks the map first and falls back to the shared default when
 * no override exists — so one-off customizations stay isolated from the engine
 * and never touch /components/sections.
 */
export type OverrideMap = Partial<
  Record<string, Partial<Record<SectionType, ComponentType<any>>>>
>;

/** Look up a client-specific override component for a section type. */
export function getOverride(
  client: string,
  type: SectionType,
): ComponentType<any> | undefined {
  return overrides[client]?.[type];
}
