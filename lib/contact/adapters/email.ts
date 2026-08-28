import type { DeliveryAdapter } from "../types";
import { CHANNEL_TIMEOUT_MS } from "../types";
import { asHtml, asPlainText, subjectLine } from "../format";

/**
 * Email via Resend (https://resend.com) — the universal default.
 *
 * Uses the REST API directly (a `fetch`, no SDK dependency), so the engine stays
 * lean. Reads two env vars, both set per client in their Vercel project:
 *   RESEND_API_KEY — the secret key.
 *   RESEND_FROM    — a verified sender, e.g. `"Acme <hello@acme.com>"`.
 * The recipient comes from config (`delivery.email.to`) or `business.email`, and
 * reply-to is the visitor, so the owner just hits reply.
 */
export const emailAdapter: DeliveryAdapter = {
  channel: "email",
  label: "Resend email",

  isConfigured(env) {
    return Boolean(env.RESEND_API_KEY && env.RESEND_FROM);
  },

  async send(enquiry, ctx) {
    const to = ctx.emailTo;
    if (!to) {
      throw new Error("email: no recipient (set delivery.email.to or business.email)");
    }
    const res = await fetch("https://api.resend.com/emails", {
      signal: AbortSignal.timeout(CHANNEL_TIMEOUT_MS),
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ctx.env.RESEND_FROM,
        to: [to],
        subject: subjectLine(enquiry, ctx),
        html: asHtml(enquiry, ctx),
        text: asPlainText(enquiry, ctx),
        ...(enquiry.replyTo ? { reply_to: enquiry.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      throw new Error(`email: Resend returned ${res.status} ${await res.text().catch(() => "")}`.trim());
    }
  },
};
