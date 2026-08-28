import type { DeliveryChannel } from "@/lib/types";
import type { DeliveryAdapter, Env } from "./types";
import { DELIVERY_CHANNELS } from "./constants";
import { emailAdapter } from "./adapters/email";
import { telegramAdapter } from "./adapters/telegram";

/**
 * The delivery-channel registry — the same union + map + dispatch shape as the
 * section/header/footer registries. Adding a channel (WhatsApp, SMS, an SMTP
 * mailer…) is three steps: add its name to `DeliveryChannel` in lib/types.ts,
 * write an adapter in `./adapters/`, and register it here. Nothing else changes.
 */
export const deliveryAdapters: Record<DeliveryChannel, DeliveryAdapter> = {
  email: emailAdapter,
  telegram: telegramAdapter,
};

/** Every channel the engine knows how to deliver on. Derived from the canonical
 *  list so the validator and the registry can never disagree. */
export const deliveryChannels = DELIVERY_CHANNELS;

/**
 * The adapters to actually attempt for this deployment.
 *
 * `requested` is the config's `delivery.channels` (or undefined = "all"). We
 * intersect that with the channels whose env vars are actually present, so:
 *   - turning a channel on can be done purely by setting its env var, and
 *   - naming a channel you haven't wired up is a harmless no-op.
 * Unconfigured requested channels are returned separately so the caller can warn.
 */
export function resolveAdapters(
  requested: readonly DeliveryChannel[] | undefined,
  env: Env,
): { active: DeliveryAdapter[]; skipped: DeliveryChannel[] } {
  const wanted = requested ?? deliveryChannels;
  const active: DeliveryAdapter[] = [];
  const skipped: DeliveryChannel[] = [];
  for (const channel of wanted) {
    const adapter = deliveryAdapters[channel];
    if (!adapter) continue;
    if (adapter.isConfigured(env)) active.push(adapter);
    else skipped.push(channel);
  }
  return { active, skipped };
}
