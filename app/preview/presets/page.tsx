import type { Metadata } from "next";
import Link from "next/link";
import { getActiveConfig } from "@/lib/client";
import type { StylePreset } from "@/lib/types";
import { ThemeScope } from "@/components/ThemeScope";
import { SectionRenderer } from "@/components/SectionRenderer";

export const metadata: Metadata = {
  title: "Style presets — Showcase Engine",
  description: "The same sections rendered under every style preset.",
};

/**
 * Every style preset, rendering the SAME content, side by side.
 *
 * Presets are pure token sets (radius, shadow, spacing, motion), so the only
 * honest way to review one is to see real sections under it. This also gives
 * `stark`, `toybox` and `petal` their first standing exercise — they were
 * implemented but assigned to no demo, so nothing rendered them.
 *
 * Internal tooling: `/preview` is disallowed in robots.txt and nothing on a
 * client site links here, so this route can't affect a client's page or SEO.
 * Multiple `ThemeScope`s on one page is the scoping model working as designed.
 */
const PRESETS: StylePreset[] = ["sharp", "rounded", "soft", "stark", "toybox", "petal"];

export default function PresetsPage() {
  const config = getActiveConfig();
  // A representative slice: cards + icons + buttons is where preset tokens show.
  const sample = config.sections.filter((s) => s.type === "services" || s.type === "cta").slice(0, 2);
  const sections = sample.length > 0 ? sample : config.sections.slice(0, 1);

  return (
    <main className="min-h-screen bg-slate-50 py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="mx-auto mb-10 max-w-5xl px-6">
        <Link href="/preview" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          ← Gallery
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Style presets</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          The same sections from <strong>{config.siteName}</strong>, rendered under each preset.
          Only radius, shadow, spacing and motion change — the content and components are identical.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {PRESETS.map((preset) => (
          <section key={preset}>
            <h2 className="mx-auto mb-3 max-w-5xl px-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {preset}
            </h2>
            <div className="overflow-hidden border-y border-slate-200">
              <ThemeScope
                theme={{ ...config.theme, stylePreset: preset }}
                // Unique per instance: ThemeScope emits `#site-<id>` scoped CSS.
                scopeId={`preset-${preset}`}
              >
                {sections.map((section, i) => (
                  <SectionRenderer
                    key={`${preset}-${section.type}-${i}`}
                    section={section}
                    client={config.client}
                    business={config.business}
                    siteName={config.siteName}
                  />
                ))}
              </ThemeScope>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
