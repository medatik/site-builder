import { describe, it, expect, vi, afterEach } from "vitest";
import { deliverEnquiry } from "@/lib/contact/dispatch";
import { resolveAdapters, deliveryChannels } from "@/lib/contact/registry";
import { honeypotTripped, withinRateLimit, clientIp, HONEYPOT_FIELD } from "@/lib/contact/spam";
import { asPlainText, asHtml, subjectLine } from "@/lib/contact/format";
import { emailAdapter } from "@/lib/contact/adapters/email";
import { telegramAdapter } from "@/lib/contact/adapters/telegram";
import { validateConfig } from "@/lib/validate-config";
import { DEFAULT_LABELS } from "@/lib/contact/types";
import type { Enquiry } from "@/lib/contact/types";

/**
 * The contact-delivery framework. The failure modes worth pinning down are the
 * ones that lose a real lead silently: a channel that looks on but isn't wired,
 * a secret leaking into config, or a submission dropped without a trace.
 */

const enquiry: Enquiry = {
  siteName: "Acme Plumbing",
  fields: [
    { name: "name", label: "Full name", value: "Jane Doe" },
    { name: "email", label: "Email", value: "jane@example.com" },
    { name: "message", label: "Message", value: "Leak under the sink <urgent>" },
  ],
  replyTo: "jane@example.com",
  submittedAt: "2026-01-01T10:00:00.000Z",
};

describe("registry: which channels are attempted", () => {
  it("only activates a channel whose env vars are present", () => {
    const env = { RESEND_API_KEY: "x", RESEND_FROM: "a@b.com" };
    const { active, skipped } = resolveAdapters(undefined, env);
    expect(active.map((a) => a.channel)).toEqual(["email"]);
    expect(skipped).toContain("telegram");
  });

  it("respects an explicit channel list from config", () => {
    const env = { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1", RESEND_API_KEY: "x", RESEND_FROM: "a@b" };
    const { active } = resolveAdapters(["telegram"], env);
    expect(active.map((a) => a.channel)).toEqual(["telegram"]);
  });

  it("every declared channel has a registered adapter", () => {
    expect(deliveryChannels.every((c) => resolveAdapters([c], {
      RESEND_API_KEY: "x", RESEND_FROM: "f", TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1",
    }).active.length === 1)).toBe(true);
  });
});

describe("spam defences", () => {
  it("detects a filled honeypot", () => {
    const bot = new FormData(); bot.set(HONEYPOT_FIELD, "http://spam");
    const human = new FormData();
    expect(honeypotTripped(bot)).toBe(true);
    expect(honeypotTripped(human)).toBe(false);
  });

  it("throttles after the per-key limit", () => {
    const key = `test-${Math.random()}`;
    const allowed = Array.from({ length: 7 }, () => withinRateLimit(key));
    expect(allowed.slice(0, 5).every(Boolean)).toBe(true); // first 5 pass
    expect(allowed.slice(5).some((v) => v === false)).toBe(true); // then throttled
  });
});

describe("dispatch: fan-out and honest reporting", () => {
  const RealFetch = global.fetch;
  afterEach(() => { global.fetch = RealFetch; vi.restoreAllMocks(); });

  it("delivers on every configured channel", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    const env = {
      NODE_ENV: "production",
      RESEND_API_KEY: "k", RESEND_FROM: "Acme <a@acme.com>",
      TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1",
    };

    const res = await deliverEnquiry(enquiry, { channels: ["email", "telegram"] }, { email: "owner@acme.com" }, env);
    expect(res.ok).toBe(true);
    expect(res.outcomes.map((o) => o.channel).sort()).toEqual(["email", "telegram"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("resolves the email recipient env → config → business.email", async () => {
    const sentTo = async (env: Record<string, string | undefined>, delivery?: Parameters<typeof deliverEnquiry>[1]) => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock as unknown as typeof fetch;
      await deliverEnquiry(enquiry, delivery ?? { channels: ["email"] }, { email: "public@acme.com" }, {
        NODE_ENV: "production", RESEND_API_KEY: "k", RESEND_FROM: "a@acme.com", ...env,
      });
      return JSON.parse(fetchMock.mock.calls[0][1].body as string).to[0];
    };

    // business.email is the default…
    expect(await sentTo({})).toBe("public@acme.com");
    // …config overrides it…
    expect(await sentTo({}, { channels: ["email"], email: { to: "config@acme.com" } })).toBe("config@acme.com");
    // …and CONTACT_EMAIL_TO wins over both, so a deployment can be redirected
    // (e.g. at a test inbox) with no config edit.
    expect(await sentTo({ CONTACT_EMAIL_TO: "env@acme.com" }, { channels: ["email"], email: { to: "config@acme.com" } }))
      .toBe("env@acme.com");
  });

  it("still succeeds if one channel fails, and records the failure", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) // email ok
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "down" }); // telegram down
    global.fetch = fetchMock as unknown as typeof fetch;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const env = {
      NODE_ENV: "production",
      RESEND_API_KEY: "k", RESEND_FROM: "a@acme.com",
      TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1",
    };

    const res = await deliverEnquiry(enquiry, { channels: ["email", "telegram"] }, { email: "owner@acme.com" }, env);
    expect(res.ok).toBe(true); // email got through
    expect(res.outcomes.find((o) => o.channel === "telegram")?.ok).toBe(false);
  });

  it("reports UNCONFIGURED in production (never a silent drop)", async () => {
    const env = { NODE_ENV: "production" };
    const res = await deliverEnquiry(enquiry, undefined, undefined, env);
    expect(res.ok).toBe(false);
    expect(res.unconfigured).toBe(true);
  });

  it("logs and succeeds in dev with no channel configured", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const env = { NODE_ENV: "development" };
    const res = await deliverEnquiry(enquiry, undefined, undefined, env);
    expect(res.ok).toBe(true);
    expect(res.unconfigured).toBe(true);
    expect(info).toHaveBeenCalled();
  });
});

describe("adapters build the right request", () => {
  const RealFetch = global.fetch;
  afterEach(() => { global.fetch = RealFetch; });

  it("email posts to Resend with reply-to = the visitor", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;
    await emailAdapter.send(enquiry, {
      env: { RESEND_API_KEY: "sk", RESEND_FROM: "Acme <a@acme.com>" }, labels: DEFAULT_LABELS,
      emailTo: "owner@acme.com",
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer sk" });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.to).toEqual(["owner@acme.com"]);
    expect(body.reply_to).toBe("jane@example.com");
  });

  it("email throws with no recipient rather than sending nowhere", async () => {
    await expect(
      emailAdapter.send(enquiry, { env: { RESEND_API_KEY: "sk", RESEND_FROM: "a@b" }, labels: DEFAULT_LABELS }),
    ).rejects.toThrow(/recipient/);
  });

  it("telegram surfaces an API-level rejection (200 + ok:false)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: false, description: "chat not found" }) }) as unknown as typeof fetch;
    await expect(
      telegramAdapter.send(enquiry, { env: { TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1" }, labels: DEFAULT_LABELS }),
    ).rejects.toThrow(/chat not found/);
  });
});

describe("formatting", () => {
  it("HTML escapes user input (no injection)", () => {
    expect(asHtml(enquiry)).toContain("&lt;urgent&gt;");
    expect(asHtml(enquiry)).not.toContain("<urgent>");
  });

  it("plain text lists every field", () => {
    expect(asPlainText(enquiry)).toContain("Full name: Jane Doe");
  });
});

describe("hostile input is contained", () => {
  // The formatters are the last line of defence before content reaches an
  // owner's inbox, spreadsheet or phone. Each case here is a real technique.

  it("escapes HTML so a submitted payload can't execute in the email", () => {
    const html = asHtml({
      ...enquiry,
      fields: [{ name: "m", label: "Message", value: "<img src=x onerror=alert(1)><script>alert(2)</script>" }],
    });
    // No live tag survives; the payload renders as visible text.
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes a hostile field LABEL too (labels are config- or form-derived)", () => {
    const html = asHtml({ ...enquiry, fields: [{ name: "x", label: "<script>x</script>", value: "v" }] });
    expect(html).not.toContain("<script>");
  });

  it("rejects a junk brand colour rather than injecting it into a style attribute", () => {
    const html = asHtml(enquiry, { brandColor: "red;background:url(https://evil)" });
    expect(html).not.toContain("evil");
  });

  it("does not pollute Object.prototype via a __proto__ field name", () => {
    asHtml({ ...enquiry, fields: [{ name: "__proto__", label: "__proto__", value: "polluted" }] });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("sends reply_to as a JSON string, so CRLF can't forge a mail header", async () => {
    const capture = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = capture as unknown as typeof fetch;
    await deliverEnquiry(
      { ...enquiry, replyTo: "a@b.com\r\nBcc: victim@evil.com" },
      { channels: ["email"] },
      { email: "owner@acme.com" },
      { NODE_ENV: "production", RESEND_API_KEY: "k", RESEND_FROM: "f@acme.com" },
    );
    const body = JSON.parse(capture.mock.calls[0][1].body as string);
    expect(typeof body.reply_to).toBe("string"); // never interpolated into headers
    global.fetch = RealFetchForSecurity;
  });
  const RealFetchForSecurity = global.fetch;
});

describe("a hanging channel cannot stall the visitor", () => {
  const RealFetch = global.fetch;
  afterEach(() => { global.fetch = RealFetch; vi.restoreAllMocks(); });

  it("passes an abort signal to every channel's fetch", async () => {
    // Without this a dead provider hangs on the OS TCP timeout (~60s) and the
    // visitor waits, staring at a spinner. Seen live when Telegram's bot API
    // became unreachable: the whole submission took ~1 minute.
    const seen: (AbortSignal | undefined)[] = [];
    global.fetch = vi.fn(async (_url: unknown, init: RequestInit) => {
      seen.push(init?.signal ?? undefined);
      return { ok: true, json: async () => ({ ok: true }) };
    }) as unknown as typeof fetch;

    await deliverEnquiry(enquiry, undefined, { email: "o@acme.com" }, {
      NODE_ENV: "production",
      RESEND_API_KEY: "k", RESEND_FROM: "a@acme.com",
      TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1",
    });

    // Counted off the registry, not a literal: adding or removing a channel
    // must not quietly leave this assertion checking a subset.
    expect(seen).toHaveLength(deliveryChannels.length);
    expect(seen.every((s) => s instanceof AbortSignal)).toBe(true);
  });

  it("records a timed-out channel as failed while the others still deliver", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn(async (url: unknown) => {
      if (String(url).includes("telegram")) {
        throw Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
      }
      return { ok: true, json: async () => ({ ok: true }) };
    }) as unknown as typeof fetch;

    const res = await deliverEnquiry(enquiry, { channels: ["email", "telegram"] }, { email: "o@acme.com" }, {
      NODE_ENV: "production",
      RESEND_API_KEY: "k", RESEND_FROM: "a@acme.com",
      TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1",
    });

    expect(res.ok).toBe(true); // the lead was still captured by email
    expect(res.outcomes.find((o) => o.channel === "telegram")?.ok).toBe(false);
    expect(res.outcomes.find((o) => o.channel === "telegram")?.error).toMatch(/timeout/i);
    expect(res.outcomes.find((o) => o.channel === "email")?.ok).toBe(true);
  });
});

describe("notification wording and branding", () => {
  const ar = {
    labels: {
      heading: "طلب جديد",
      received: "تاريخ الاستلام",
      language: "اللغة",
      ip: "IP",
      replyHint: "رد على هذا البريد للتواصل مباشرة مع المرسل.",
    },
    dir: "rtl" as const,
  };

  it("uses config labels instead of the English defaults", () => {
    const text = asPlainText(enquiry, ar);
    expect(text).toContain("طلب جديد");
    expect(text).toContain("تاريخ الاستلام:");
    expect(text).not.toContain("New enquiry");
    expect(text).not.toContain("Received:");
  });

  it("falls back to English when no labels are configured", () => {
    expect(asPlainText(enquiry)).toContain("New enquiry");
    expect(subjectLine(enquiry)).toBe("New enquiry — Acme Plumbing");
  });

  it("localises the subject line too, and an explicit subject still wins", () => {
    expect(subjectLine(enquiry, ar)).toBe("طلب جديد — Acme Plumbing");
    expect(subjectLine(enquiry, { ...ar, emailSubject: "Custom" })).toBe("Custom");
  });

  it("flips the HTML to RTL for a right-to-left notification", () => {
    expect(asHtml(enquiry, ar)).toContain('dir="rtl"');
    expect(asHtml(enquiry, ar)).toContain("text-align:right");
    expect(asHtml(enquiry)).toContain('dir="ltr"');
  });

  it("brands the email with the site's primary colour", () => {
    expect(asHtml(enquiry, { brandColor: "#8A2733" })).toContain("background:#8A2733");
    // A junk value must not be injected into the style attribute.
    expect(asHtml(enquiry, { brandColor: "red; background:url(evil)" })).not.toContain("evil");
  });

  it("renders a custom intro when configured", () => {
    expect(asHtml(enquiry, { emailIntro: "Call back within the hour." })).toContain("Call back within the hour.");
    expect(asPlainText(enquiry, { emailIntro: "Call back within the hour." })).toContain("Call back within the hour.");
    expect(asHtml(enquiry)).not.toContain("Call back");
  });

  it("omits the reply hint when set to none", () => {
    const hidden = { labels: { ...DEFAULT_LABELS, replyHint: "none" } };
    expect(asHtml(enquiry, hidden)).not.toContain("none");
    expect(asHtml(enquiry)).toContain("Reply to this email");
  });

  it("still escapes user input after the redesign", () => {
    expect(asHtml(enquiry)).toContain("&lt;urgent&gt;");
    expect(asHtml(enquiry)).not.toContain("<urgent>");
  });
});

describe("validator catches a mistyped channel", () => {
  const base = {
    client: "acme", siteName: "Acme", logo: { alt: "Acme" },
    theme: { stylePreset: "rounded", fonts: { heading: "Poppins", body: "Inter" }, colorsLight: { primary: "#000" } },
  };
  it("flags an unknown channel (a silently-lost lead)", () => {
    const cfg = { ...base, sections: [{ type: "contact", enabled: true, props: { title: "Contact", delivery: { channels: ["emial"] } } }] };
    expect(validateConfig(cfg).join()).toMatch(/channel "emial" is unknown/);
  });
  it("accepts a correctly-spelled channel", () => {
    const cfg = { ...base, sections: [{ type: "contact", enabled: true, props: { title: "Contact", delivery: { channels: ["email", "telegram"] } } }] };
    expect(validateConfig(cfg)).toEqual([]);
  });
});

/**
 * The rate-limit key must not be attacker-authored.
 *
 * This read `x-forwarded-for`'s FIRST entry. XFF is `client, proxy1, proxy2`
 * with each hop appending on the RIGHT, so the leftmost value is whatever the
 * caller sent. A fresh forged header per request looked like a fresh visitor —
 * unlimited submissions into the client's inbox — and ~5000 forged keys tripped
 * the size cap in `withinRateLimit`, clearing the map and wiping real visitors'
 * windows too. The same forged string was reported to the owner as the sender's
 * IP, in a notification the privacy policy promises records the real one.
 */
describe("clientIp: the rate-limit key cannot be forged by the caller", () => {
  const h = (map: Record<string, string>) => ({
    get: (name: string) => map[name.toLowerCase()] ?? null,
  });

  it("ignores a forged leftmost x-forwarded-for entry", () => {
    const ip = clientIp(h({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" }));
    expect(ip, "must take the proxy-appended hop, not the caller's").toBe("203.0.113.9");
    expect(ip).not.toBe("1.2.3.4");
  });

  it("prefers x-real-ip, which the edge writes rather than forwards", () => {
    expect(clientIp(h({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4" }))).toBe(
      "203.0.113.9",
    );
  });

  it("does not let a forged header mint a fresh key per request", () => {
    // The attack: vary the leftmost entry every request to dodge the limit.
    const keys = ["9.9.9.1", "9.9.9.2", "9.9.9.3"].map((forged) =>
      clientIp(h({ "x-forwarded-for": `${forged}, 203.0.113.9` })),
    );
    expect(new Set(keys).size, "all requests must collapse to ONE key").toBe(1);
  });

  it("falls back to a single shared bucket rather than to something open", () => {
    // Strict on purpose: throttling too much beats not throttling at all.
    expect(clientIp(h({}))).toBe("unknown");
    expect(clientIp(h({ "x-forwarded-for": "   " }))).toBe("unknown");
  });
});
