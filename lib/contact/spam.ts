/**
 * Lightweight spam defences for the contact form. Two cheap layers that stop the
 * overwhelming majority of drive-by bot spam without a CAPTCHA or a dependency.
 *
 * Server-only (the rate limiter holds module state). The client needs just the
 * honeypot field NAME, which lives in the side-effect-free `./constants`.
 */
import { HONEYPOT_FIELD } from "./constants";

export { HONEYPOT_FIELD };

/** A filled honeypot means a bot. The caller should pretend success and drop it,
 *  never reveal the field was checked. */
export function honeypotTripped(data: FormData): boolean {
  return String(data.get(HONEYPOT_FIELD) ?? "").trim().length > 0;
}

/**
 * Best-effort per-key sliding-window rate limit, in memory.
 *
 * Serverless instances don't share memory, so this caps a flood within one warm
 * instance rather than globally — enough to blunt naive abuse. A durable store
 * (e.g. Upstash Redis) is the drop-in upgrade when a client needs a hard limit.
 */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/** Returns true if the request is ALLOWED, false if it should be throttled. */
export function withinRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // crude cap so the map can't grow unbounded
  return true;
}

/**
 * The client IP to rate-limit on.
 *
 * NOT `x-forwarded-for`'s FIRST entry, which is what this used to read. XFF is
 * `client, proxy1, proxy2` and each hop APPENDS on the right — so the leftmost
 * value is whatever the original caller sent, and a caller can send anything.
 *
 * Keying a rate limit on a caller-supplied string means a fresh forged header
 * per request looks like a fresh visitor: unlimited submissions into the
 * client's inbox. Worse, ~5000 forged keys trip the size cap in
 * `withinRateLimit` and clear the map, wiping every real visitor's window too.
 * The same forged value was also reported to the owner as the sender's IP.
 *
 * Preference order:
 *  1. `x-real-ip` — written by the platform's own edge (Vercel, nginx). A
 *     caller's copy is replaced rather than appended to.
 *  2. the LAST `x-forwarded-for` entry — appended by the nearest trusted proxy,
 *     so it is the one hop a caller cannot author.
 *
 * Falling back to `"unknown"` makes every un-identifiable caller share one
 * bucket. That is deliberately strict: the failure mode is throttling too much,
 * not too little.
 */
export function clientIp(h: { get(name: string): string | null }): string {
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const last = h.get("x-forwarded-for")?.split(",").pop()?.trim();
  return last || "unknown";
}
