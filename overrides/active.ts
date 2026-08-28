import type { OverrideMap } from "./registry";
import { VoltEdgeHero } from "./voltedge-electric/Hero";

/**
 * Client-owned override registrations.
 *
 * VoltEdge replaces the shared `hero` with its own component; every other
 * section on every other site falls through to the engine default. This file is
 * the only place a per-client component is ever wired in.
 */
export const overrides: OverrideMap = {
  "voltedge-electric": { hero: VoltEdgeHero },
};
