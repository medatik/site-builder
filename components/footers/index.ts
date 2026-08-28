import type { ComponentType } from "react";
import type { FooterType } from "@/lib/types";
import type { FooterProps } from "./parts";
import { ColumnsFooter } from "./ColumnsFooter";
import { MinimalFooter } from "./MinimalFooter";
import { SpotlightFooter } from "./SpotlightFooter";

/**
 * Registry of footer layouts, keyed by `footer.type`. Mirrors the section
 * registry (`components/sections/index.ts`): to add a variant, drop a component
 * next to this file, add its `FooterType` in `lib/types.ts`, and register it
 * here — nothing else changes.
 */
export const footerComponents: Record<FooterType, ComponentType<FooterProps>> = {
  columns: ColumnsFooter,
  minimal: MinimalFooter,
  spotlight: SpotlightFooter,
};

export { ColumnsFooter, MinimalFooter, SpotlightFooter };
export type { FooterProps };
