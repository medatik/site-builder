/** @type {import('next').NextConfig} */

/**
 * Security headers.
 *
 * Next sets none of these by default and Vercel adds only HSTS, so every client
 * site shipped without them until 2026-08-04.
 *
 * Deliberately NOT a full Content-Security-Policy. A real one would need
 * `script-src` and `style-src`, and `ThemeScope` emits both an inline `<style>`
 * (the scoped palette) and an inline `<script>` (the pre-paint theme restore
 * that stops a dark-mode visitor seeing a white flash). Allowing those means
 * `'unsafe-inline'`, which permits exactly the injected inline script a CSP is
 * meant to stop — so it would cost real risk of breaking a live site and buy
 * almost nothing. Doing it properly means nonces threaded through those two
 * emitters, which is its own piece of work.
 *
 * `frame-ancestors` is the exception: it governs who may embed the page and is
 * unaffected by inline content, so it ships now. It is also the modern
 * replacement for X-Frame-Options, which is kept alongside for older browsers.
 */
const securityHeaders = [
  // Clickjacking. A contact form that can be framed can be overlaid, so a
  // visitor believes they're clicking one thing and submits another.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },

  // Stop the browser second-guessing a declared Content-Type — the classic
  // route to a user-uploaded file being executed as script.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Send the full URL only to ourselves; cross-origin gets the origin alone.
  // A visitor's path can carry `?lang=` and, on a routed page, which service
  // they were reading — not something to hand to every third party.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Deny hardware the engine never uses. Nothing here requests a camera,
  // microphone or location; saying so explicitly means an injected script
  // can't either.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // `components/ui/Media.tsx` renders through next/image, and REMOTE sources
    // are passed `unoptimized` precisely so this list can stay empty: a wildcard
    // here would let anyone use this deployment's /_next/image endpoint as a
    // free image proxy. If a client adopts optimised remote photos, add THAT
    // client's host on its own branch, e.g.:
    //   remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
