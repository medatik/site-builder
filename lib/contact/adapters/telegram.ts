import type { DeliveryAdapter } from "../types";
import { CHANNEL_TIMEOUT_MS } from "../types";
import { asPlainText } from "../format";

/**
 * Telegram — an instant push to the owner's phone, free.
 *
 * Env (per client):
 *   TELEGRAM_BOT_TOKEN — from @BotFather.
 *   TELEGRAM_CHAT_ID   — the owner's chat/group id (message the bot once, then
 *                        read it from getUpdates; setup is in the docs).
 * Sends plain text (no parse_mode) so no message content ever needs escaping.
 */
export const telegramAdapter: DeliveryAdapter = {
  channel: "telegram",
  label: "Telegram",

  isConfigured(env) {
    return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
  },

  async send(enquiry, ctx) {
    const res = await fetch(
      `https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        signal: AbortSignal.timeout(CHANNEL_TIMEOUT_MS),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ctx.env.TELEGRAM_CHAT_ID,
          text: asPlainText(enquiry, ctx),
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`telegram: API returned ${res.status} ${await res.text().catch(() => "")}`.trim());
    }
    // Telegram returns 200 with { ok: false, description } on logical failures.
    const body = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (body && body.ok === false) {
      throw new Error(`telegram: ${body.description ?? "request rejected"}`);
    }
  },
};
