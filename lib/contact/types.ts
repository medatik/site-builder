import type { DeliveryChannel } from "@/lib/types";

/** The subset of the environment adapters read. Looser than `NodeJS.ProcessEnv`
 *  (which requires `NODE_ENV`), and `process.env` is assignable to it. */
export type Env = Record<string, string | undefined>;

/**
 * Server-side contract for the contact-delivery framework.
 *
 * A normalised `Enquiry` is produced once by the server action, then handed to
 * every configured channel's adapter. Adapters never see raw FormData or the
 * request — only this shape — so a new channel can't accidentally trust
 * client-supplied routing.
 */

/** One submitted field, already resolved to a human label. */
export interface EnquiryField {
  name: string;
  label: string;
  value: string;
}

/** A normalised contact submission, ready to deliver on any channel. */
export interface Enquiry {
  /** The site it came from (for subject lines / message headers). */
  siteName: string;
  /** Fields in the order the form declared them, empty ones dropped. */
  fields: EnquiryField[];
  /** Visitor's email, if a field named "email" was submitted — used as the
   *  email channel's reply-to so the owner can just hit reply. */
  replyTo?: string;
  /** Active locale code, if the site is multilingual. */
  locale?: string;
  /** When it was received (ISO). */
  submittedAt: string;
  /** Best-effort visitor IP, for the message footer (never for routing). */
  ip?: string;
}

/**
 * A delivery channel. The whole framework is: a union of channel names
 * (`DeliveryChannel` in lib/types.ts) → a registry of these adapters → a
 * dispatcher that fans an `Enquiry` out to every configured one. Adding a
 * channel is writing one of these and registering it.
 */
export interface DeliveryAdapter {
  /** Matches a `DeliveryChannel`. */
  channel: DeliveryChannel;
  /** Human name for logs / dev warnings, e.g. "Resend email". */
  label: string;
  /**
   * Is this channel usable in THIS deployment? Checks its own env vars (secrets
   * and targets live in env, never config). An unconfigured channel is skipped,
   * not attempted — so listing a channel you haven't wired up is harmless.
   */
  isConfigured(env: Env): boolean;
  /**
   * Deliver the enquiry, or throw. `to` is the resolved recipient for channels
   * that take one from config (email); others read their target from env.
   * Throwing is how a failure is reported — the dispatcher catches per-channel
   * so one channel's outage never blocks the others.
   */
  send(enquiry: Enquiry, ctx: DeliveryContext): Promise<void>;
}

/**
 * Wording of the owner-facing notification, already resolved (config value or
 * English default), so formatters never deal with `undefined`.
 */
export interface NotificationLabels {
  heading: string;
  received: string;
  language: string;
  ip: string;
  /** `"none"` omits the hint entirely. */
  replyHint: string;
}

/**
 * How long any one channel may take before it is abandoned.
 *
 * Every adapter passes this to `fetch`, because without it an unreachable
 * provider hangs on the OS-level TCP timeout — roughly a minute — and the
 * VISITOR waits the whole time staring at a spinner before the form responds.
 * Seen live: Telegram's bot API became unreachable on one network and a
 * submission took ~60s even though the other three channels had already
 * succeeded. A slow channel must cost the visitor seconds, not minutes.
 *
 * `Promise.allSettled` runs channels in parallel, so this is the ceiling for
 * the whole submission, not per channel.
 */
export const CHANNEL_TIMEOUT_MS = 8000;

/** English fallbacks. Config (and its per-locale overlay) overrides these. */
export const DEFAULT_LABELS: NotificationLabels = {
  heading: "New enquiry",
  received: "Received",
  language: "Language",
  ip: "IP",
  replyHint: "Reply to this email to respond directly to the sender.",
};

/** Non-secret, per-send context resolved from config by the dispatcher. */
export interface DeliveryContext {
  env: Env;
  /** Resolved email recipient — `CONTACT_EMAIL_TO` ?? `delivery.email.to` ?? `business.email`. */
  emailTo?: string;
  /** Optional custom email subject from config. */
  emailSubject?: string;
  /** Optional sentence rendered above the fields in the email. */
  emailIntro?: string;
  /** Notification wording, already merged over the English defaults. */
  labels: NotificationLabels;
  /** The site's primary colour, used to brand the HTML email. */
  brandColor?: string;
  /** Writing direction of the notification's language — `rtl` flips the email. */
  dir?: "ltr" | "rtl";
}

/** Result of one channel's attempt (for aggregation + logging). */
export interface ChannelOutcome {
  channel: DeliveryChannel;
  ok: boolean;
  error?: string;
}

/** What the dispatcher returns to the action. */
export interface DeliveryResult {
  /** True if at least one configured channel accepted the enquiry. */
  ok: boolean;
  /** True when no channel was configured at all (distinct from a send failure —
   *  the action treats this as a setup error, not a transient one). */
  unconfigured: boolean;
  outcomes: ChannelOutcome[];
}
