import type { SiteConfig } from "@/lib/types";
import template from "./_template.config";
import voltedge from "./voltedge-electric.config";
import merrick from "./merrick-stone-law.config";
import riverside from "./riverside-family-health.config";

/**
 * Registry of every client config the engine knows about.
 *
 * This is the whole of the multi-tenant wiring: a site is a value in this map,
 * not a folder of code. `NEXT_PUBLIC_ACTIVE_CLIENT` selects which one `/` serves;
 * `/preview` renders the lot. The key must always match the config's own `client`
 * slug, which `tests/config.test.ts` asserts.
 */
export const configs = {
  [template.client]: template,
  [voltedge.client]: voltedge,
  [merrick.client]: merrick,
  [riverside.client]: riverside,
} satisfies Record<string, SiteConfig>;

export type ClientSlug = keyof typeof configs;

export function getConfig(client: string): SiteConfig | undefined {
  return (configs as Record<string, SiteConfig>)[client];
}

export function listClients(): SiteConfig[] {
  return Object.values(configs);
}
