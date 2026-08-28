import type { ComponentType } from "react";
import type { HeaderType } from "@/lib/types";
import type { HeaderProps } from "./parts";
import { ClassicHeader } from "./ClassicHeader";
import { CenteredHeader } from "./CenteredHeader";
import { MinimalHeader } from "./MinimalHeader";

/**
 * Registry of header layouts, keyed by `header.type`. Mirrors the section and
 * footer registries: to add a variant, drop a component next to this file, add
 * its `HeaderType` in `lib/types.ts`, and register it here — the dispatcher
 * (`SiteHeader.tsx`) and everything else are untouched. Shared behaviour (scroll
 * state, mobile menu) lives in `parts.tsx`, so a variant is layout only.
 */
export const headerComponents: Record<HeaderType, ComponentType<HeaderProps>> = {
  classic: ClassicHeader,
  centered: CenteredHeader,
  minimal: MinimalHeader,
};

export { ClassicHeader, CenteredHeader, MinimalHeader };
export type { HeaderProps };
