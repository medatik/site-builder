import type { ContactDelivery, BusinessInfo, TextDir } from "@/lib/types";
import type { Enquiry, DeliveryResult, ChannelOutcome, DeliveryContext, Env } from "./types";
import { DEFAULT_LABELS } from "./types";
import { resolveAdapters } from "./registry";
import { asPlainText } from "./format";

/** How the notification should LOOK, derived from the site (not from config's
 *  delivery block): the theme's primary colour and the locale's direction. */
export interface DeliveryPresentation {
  brandColor?: string;
  dir?: TextDir;
}

/**
 * Fan an enquiry out to every configured channel.
 *
 * Each channel is attempted independently (`allSettled`), so one provider's
 * outage never blocks the others, and the result is OK if *any* channel
 * accepted it. The whole thing is best-effort delivery with honest reporting,
 * not a transaction.
 *
 * The distinction that matters: `unconfigured` (no channel wired up at all) is a
 * SETUP mistake, reported separately from a send failure. In development we log
 * the enquiry instead so the form is testable with zero secrets; in production
 * an unconfigured form reports an error rather than silently dropping a lead.
 */
export async function deliverEnquiry(
  enquiry: Enquiry,
  delivery: ContactDelivery | undefined,
  business: BusinessInfo | undefined,
  env: Env = process.env,
  presentation?: DeliveryPresentation,
): Promise<DeliveryResult> {
  const { active, skipped } = resolveAdapters(delivery?.channels, env);

  if (skipped.length && env.NODE_ENV !== "production") {
    console.warn(`[contact] channels requested but not configured (missing env): ${skipped.join(", ")}`);
  }

  if (active.length === 0) {
    if (env.NODE_ENV !== "production") {
      // Dev fallback: no secrets needed to exercise the whole flow.
      console.info(
        `[contact] no channel configured — logging enquiry (dev only):\n` +
          asPlainText(enquiry, { labels: { ...DEFAULT_LABELS, ...(delivery?.labels ?? {}) } }),
      );
      return { ok: true, unconfigured: true, outcomes: [] };
    }
    return { ok: false, unconfigured: true, outcomes: [] };
  }

  const ctx: DeliveryContext = {
    env,
    // Recipient precedence, most specific first:
    //   CONTACT_EMAIL_TO (env)  — per-DEPLOYMENT override. Lets a client send
    //     leads somewhere other than their public address, or point a preview
    //     deployment at a test inbox, with no config edit. Same reasoning as
    //     every other channel's target living in env.
    //   delivery.email.to       — per-SITE choice, in config.
    //   business.email          — the public address, as a sane default.
    emailTo: env.CONTACT_EMAIL_TO ?? delivery?.email?.to ?? business?.email,
    emailSubject: delivery?.email?.subject,
    emailIntro: delivery?.email?.intro,
    // Config wording over the English defaults, so a formatter never sees undefined.
    labels: { ...DEFAULT_LABELS, ...(delivery?.labels ?? {}) },
    brandColor: presentation?.brandColor,
    dir: presentation?.dir,
  };

  const settled = await Promise.allSettled(active.map((a) => a.send(enquiry, ctx)));
  const outcomes: ChannelOutcome[] = settled.map((r, i) => {
    const channel = active[i].channel;
    if (r.status === "fulfilled") return { channel, ok: true };
    const error = r.reason instanceof Error ? r.reason.message : String(r.reason);
    console.error(`[contact] ${active[i].label} failed:`, error);
    return { channel, ok: false, error };
  });

  return { ok: outcomes.some((o) => o.ok), unconfigured: false, outcomes };
}
