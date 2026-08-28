import type { Metadata } from "next";
import Link from "next/link";
import { listClients } from "@/lib/client";
import { defaultPalette, resolvePalettes } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Showcase Engine — Demo Gallery",
  description: "Live demos generated from the shared showcase engine.",
};

/**
 * Engine-branded gallery of every client demo. Deliberately un-themed (neutral
 * chrome) so it frames the client sites rather than competing with them.
 */
export default function GalleryPage() {
  const clients = listClients();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16 sm:py-24" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="mb-14 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Showcase Engine
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          One codebase. Every one of these sites.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Each demo below is generated from a single config file on top of 100% shared code —
          different colors, fonts, style preset, and sections, zero forked components.
        </p>
        <Link
          href="/preview/presets"
          className="mt-6 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:text-slate-900"
        >
          Compare style presets →
        </Link>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {clients.map((c) => {
          const enabled = c.sections.filter((s) => s.enabled).map((s) => s.type);
          const p = defaultPalette(c.theme);
          const { hasBoth } = resolvePalettes(c.theme);
          return (
            <Link
              key={c.client}
              href={`/preview/${c.client}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-28 items-center gap-4 px-6" style={{ background: p.background }}>
                <span
                  className="flex size-12 items-center justify-center rounded-xl text-lg font-extrabold"
                  style={{
                    background: p.primary,
                    color: p.background,
                    fontFamily: `"${c.theme.fonts.heading}", system-ui, sans-serif`,
                  }}
                >
                  {c.logo.monogram ?? c.siteName[0]}
                </span>
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: p.text, fontFamily: `"${c.theme.fonts.heading}", system-ui, sans-serif` }}
                >
                  {c.siteName}
                </span>
                {hasBoth && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    Light + Dark
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <p className="text-sm leading-relaxed text-slate-600">{c.seo?.description}</p>

                <div className="flex items-center gap-1.5">
                  {(["primary", "secondary", "accent", "background", "text"] as const).map((k) => (
                    <span
                      key={k}
                      title={`${k}: ${p[k]}`}
                      className="size-6 rounded-full border border-slate-200"
                      style={{ background: p[k] }}
                    />
                  ))}
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                  <div>
                    <dt className="inline font-semibold text-slate-700">Preset:</dt>{" "}
                    <dd className="inline capitalize">{c.theme.stylePreset}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-slate-700">Sections:</dt>{" "}
                    <dd className="inline">{enabled.length}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="inline font-semibold text-slate-700">Fonts:</dt>{" "}
                    <dd className="inline">
                      {c.theme.fonts.heading} / {c.theme.fonts.body}
                    </dd>
                  </div>
                </dl>

                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-slate-900 group-hover:gap-2">
                  View live demo →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        The root route <code className="rounded bg-slate-100 px-1.5 py-0.5">/</code> renders whichever
        client is set in <code className="rounded bg-slate-100 px-1.5 py-0.5">NEXT_PUBLIC_ACTIVE_CLIENT</code>.
      </footer>
    </main>
  );
}
