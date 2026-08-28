import type { Enquiry, DeliveryContext, NotificationLabels } from "./types";
import { DEFAULT_LABELS } from "./types";

/**
 * Render an `Enquiry` for each transport. One place, so every channel presents
 * the same content — a plain-text block (Telegram, and the email's text part)
 * and a branded HTML block (email).
 *
 * All owner-facing wording comes from `ctx.labels`, which the dispatcher
 * resolves from config for the enquiry's locale. Nothing here is hardcoded
 * English except the fallbacks in `DEFAULT_LABELS`.
 */

/** Context is optional for the payload/text helpers, so tests stay terse. */
type Ctx = Partial<Pick<DeliveryContext, "labels" | "brandColor" | "emailIntro" | "dir" | "emailSubject">>;

const labelsOf = (ctx?: Ctx): NotificationLabels => ctx?.labels ?? DEFAULT_LABELS;

function metaRows(e: Enquiry, l: NotificationLabels): [string, string][] {
  const rows: [string, string][] = [[l.received, e.submittedAt]];
  if (e.locale) rows.push([l.language, e.locale]);
  if (e.ip) rows.push([l.ip, e.ip]);
  return rows;
}

/** Subject / title line. */
export function subjectLine(e: Enquiry, ctx?: Ctx): string {
  return ctx?.emailSubject ?? `${labelsOf(ctx).heading} — ${e.siteName}`;
}

/** Plain text — Telegram, and the email's text alternative. */
export function asPlainText(e: Enquiry, ctx?: Ctx): string {
  const l = labelsOf(ctx);
  const body = e.fields.map((f) => `${f.label}: ${f.value}`).join("\n");
  const meta = metaRows(e, l).map(([k, v]) => `${k}: ${v}`);
  return [
    `${l.heading} — ${e.siteName}`,
    ...(ctx?.emailIntro ? ["", ctx.emailIntro] : []),
    "",
    body,
    "",
    ...meta,
  ].join("\n");
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * HTML email.
 *
 * Deliberately old-school: tables, inline styles, no external CSS, no web
 * fonts, no flexbox — Gmail, Outlook and Apple Mail strip or ignore all of
 * that. It is branded with the client's own primary colour so the notification
 * looks like it came from their business, and honours `dir` so an Arabic
 * notification reads right-to-left.
 */
export function asHtml(e: Enquiry, ctx?: Ctx): string {
  const l = labelsOf(ctx);
  const brand = ctx?.brandColor && /^#[0-9a-f]{3,8}$/i.test(ctx.brandColor) ? ctx.brandColor : "#1f6fa8";
  const rtl = ctx?.dir === "rtl";
  const align = rtl ? "right" : "left";

  const fieldRows = e.fields
    .map(
      (f) => `
      <tr>
        <td style="padding:10px 0 0;font:600 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;text-align:${align}">${escapeHtml(f.label)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0 10px;border-bottom:1px solid #e5e7eb;font:400 15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827;text-align:${align}">${escapeHtml(f.value).replace(/\n/g, "<br>")}</td>
      </tr>`,
    )
    .join("");

  const meta = metaRows(e, l)
    .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(v)}`)
    .join(" &nbsp;·&nbsp; ");

  const intro = ctx?.emailIntro
    ? `<p style="margin:0 0 16px;font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#374151;text-align:${align}">${escapeHtml(ctx.emailIntro)}</p>`
    : "";

  const hint =
    l.replyHint && l.replyHint !== "none" && e.replyTo
      ? `<p style="margin:18px 0 0;font:400 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#6b7280;text-align:${align}">${escapeHtml(l.replyHint)}</p>`
      : "";

  return `<!doctype html>
<html dir="${rtl ? "rtl" : "ltr"}">
<body style="margin:0;padding:0;background:#f3f4f6">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td style="background:${brand};padding:18px 24px">
              <div style="font:700 17px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#ffffff;text-align:${align}">${escapeHtml(l.heading)}</div>
              <div style="font:400 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:rgba(255,255,255,.85);text-align:${align}">${escapeHtml(e.siteName)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px">
              ${intro}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${fieldRows}</table>
              ${hint}
              <p style="margin:16px 0 0;font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#9ca3af;text-align:${align}">${meta}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
