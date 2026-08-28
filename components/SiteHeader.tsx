import type { SiteConfig } from "@/lib/types";
import { headerComponents } from "@/components/headers";

/**
 * Header dispatcher: picks the layout named by `config.header.type` (default
 * `"classic"`) from the registry and renders it. All header layouts live in
 * `components/headers/`; this file just resolves which one. Falls back to
 * `classic` if an unknown type ever slips through.
 */
export function SiteHeader({ config }: { config: SiteConfig }) {
  const Header = headerComponents[config.header?.type ?? "classic"] ?? headerComponents.classic;
  return <Header config={config} />;
}
