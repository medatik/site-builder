/**
 * Shared contact constants — imported by both the client form and the server
 * action, so this file must stay free of any server-only imports or
 * module-level side effects (it ends up in the client bundle).
 */
import type { DeliveryChannel } from "@/lib/types";

/** Hidden honeypot field name. Real users never fill it; bots fill everything. */
export const HONEYPOT_FIELD = "_gotcha";

/**
 * Canonical list of delivery channels, as data (the `DeliveryChannel` union is
 * types-only and erased at runtime). `satisfies` keeps it in lockstep with the
 * union; the registry asserts every one has an adapter. Used by the config
 * validator to flag a mistyped channel name.
 */
export const DELIVERY_CHANNELS = [
  "email",
  "telegram",
] as const satisfies readonly DeliveryChannel[];
