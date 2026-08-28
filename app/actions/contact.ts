"use server";

import { headers } from "next/headers";
import { getActiveConfig } from "@/lib/client";
import { localizeConfig, localeMeta, pickLocale } from "@/lib/i18n";
import { defaultPalette } from "@/lib/theme";
import type { Section, SiteConfig, ContactProps, FormField } from "@/lib/types";
import { deliverEnquiry } from "@/lib/contact/dispatch";
import { honeypotTripped, withinRateLimit, clientIp, HONEYPOT_FIELD } from "@/lib/contact/spam";
import type { Enquiry, EnquiryField } from "@/lib/contact/types";

/**
 * Server action behind the contact form.
 *
 * SECURITY: a server action is a PUBLIC endpoint — anyone can POST any body to
 * it, with no browser and no form involved — so everything arriving here is
 * hostile until proven otherwise. Concretely:
 *   • Values are trusted for CONTENT only. Where an enquiry goes (channels,
 *     recipient, secrets) is read from the server's own config + env, never
 *     from the submission.
 *   • `_section` only selects WHICH contact section's config to read, and an
 *     unrecognised value falls back to the first one — so a spoofed field can
 *     pick among our own sections but can never redirect a lead elsewhere.
 *   • Only fields the section DECLARES are accepted, and every value is
 *     clamped. See `clamp` and step 5.
 */

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "validation"; missing: string[] }
  | { ok: false; reason: "rate" | "delivery" | "unconfigured" };

/** Fields the form adds for control, not content. */
const CONTROL = new Set([HONEYPOT_FIELD, "_section", "_locale"]);

/**
 * Size limits on submitted values.
 *
 * Without a cap a single field could carry megabytes and be forwarded to every
 * provider — burning the client's Resend quota, and blowing past Telegram's
 * hard 4,096-character message limit, which makes that channel fail outright so
 * a genuine enquiry behind it is lost. 4,000 leaves room for the labels and
 * footer inside Telegram's budget.
 */
const MAX_VALUE = 4000;
const MAX_LABEL = 100;
const MAX_EMAIL = 254; // RFC 5321 maximum address length

/**
 * Clamp a value and strip control characters.
 *
 * Control characters go because a value containing them can forge convincing
 * extra rows in the plain-text notification: `"Bob\nPhone: +1 555 SPOOFED"`
 * reads in Telegram exactly like a real Phone field. Newlines (\n) and tabs are
 * kept — real messages have paragraphs — and the rest of the C0 range plus DEL
 * is removed.
 */
function clamp(value: string, max = MAX_VALUE): string {
  // Keep tab (9) and newline (10); drop the rest of the C0 range and DEL (127).
  const clean = Array.from(value)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code === 9 || code === 10 || (code >= 32 && code !== 127);
    })
    .join("");
  return clean.length > max ? `${clean.slice(0, max)}… [truncated]` : clean;
}

const DEFAULT_FIELDS: FormField[] = [
  { name: "name", label: "Full name", required: true },
  { name: "phone", label: "Phone", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "message", label: "How can we help?", type: "textarea", required: true },
];

/** Every contact section in a config (home + any routed pages). */
function contactSections(config: SiteConfig): (ContactProps & { id?: string })[] {
  const all: Section[] = [
    ...config.sections,
    ...(config.pages?.flatMap((p) => p.sections) ?? []),
  ];
  return all
    .filter((s): s is Extract<Section, { type: "contact" }> => s.type === "contact")
    .map((s) => ({ ...s.props, id: s.id ?? "contact" }));
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  // 1. Honeypot — a filled hidden field is a bot. Report success and drop it.
  if (honeypotTripped(formData)) return { ok: true };

  // 2. Rate limit by client IP (best-effort).
  const ip = clientIp(await headers());
  if (!withinRateLimit(ip)) return { ok: false, reason: "rate" };

  // 3. Resolve which contact section this is, for its fields + delivery config.
  //
  //    The config is LOCALISED first, so `delivery.labels` come from the
  //    language the enquiry was submitted in — the owner's notification then
  //    matches the visitor's language for free, through the same translation
  //    overlay that powers the rest of the site. `delivery.locale` pins one
  //    language instead, when the owner always wants the same one.
  const base = getActiveConfig();
  const submitted = String(formData.get("_locale") ?? "").trim();
  const baseSections = contactSections(base);
  const sectionId = String(formData.get("_section") ?? "");
  const pinned = (baseSections.find((s) => s.id === sectionId) ?? baseSections[0])?.delivery?.locale;
  const locale = pickLocale(base, pinned || submitted || undefined);

  const config = localizeConfig(base, locale);
  const sections = contactSections(config);
  const section =
    sections.find((s) => s.id === sectionId) ?? sections[0] ?? undefined;
  const fields = section?.fields ?? DEFAULT_FIELDS;

  // 4. Server-side required-field validation (defence in depth; the client
  //    validates too, but never trust the client).
  const missing = fields
    .filter((f) => f.required && !String(formData.get(f.name) ?? "").trim())
    .map((f) => f.name);
  if (missing.length) return { ok: false, reason: "validation", missing };

  // 5. Build the normalised enquiry.
  //
  //    ONLY the fields this section DECLARES are accepted. An earlier version
  //    also swept up every extra `formData` entry, which let anyone POST
  //    unlimited attacker-named rows straight into the owner's inbox and
  //    spreadsheet. The config is the contract: to collect a new field, declare
  //    it there.
  const seen = new Set<string>();
  const enquiryFields: EnquiryField[] = [];
  for (const f of fields) {
    if (seen.has(f.name) || CONTROL.has(f.name)) continue;
    const value = clamp(String(formData.get(f.name) ?? "").trim());
    if (!value) continue;
    seen.add(f.name);
    enquiryFields.push({ name: f.name, label: clamp(f.label, MAX_LABEL), value });
  }

  const enquiry: Enquiry = {
    siteName: config.siteName,
    fields: enquiryFields,
    replyTo: clamp(String(formData.get("email") ?? "").trim(), MAX_EMAIL) || undefined,
    locale: submitted || undefined,
    submittedAt: new Date().toISOString(),
    ip: ip === "unknown" ? undefined : ip,
  };

  // 6. Fan out to every configured channel. Presentation comes from the SITE
  //    (its palette brands the email; the notification locale's direction flips
  //    it for RTL) rather than from the delivery block, so a client gets a
  //    branded, correctly-oriented notification with no extra configuration.
  const result = await deliverEnquiry(enquiry, section?.delivery, config.business, process.env, {
    brandColor: defaultPalette(config.theme).primary,
    dir: localeMeta(config, locale).dir,
  });
  if (result.ok) return { ok: true };
  return { ok: false, reason: result.unconfigured ? "unconfigured" : "delivery" };
}
