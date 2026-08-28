import type { LegalProps } from "@/lib/types";
import { Section } from "@/components/ui/Section";

/**
 * Long-form legal document (privacy policy, terms, cookie notice).
 *
 * Single column and measure-constrained on purpose: legal text is read, not
 * skimmed, so it gets a `narrow` container rather than the two-column marketing
 * treatment `about` uses. There is no media slot — a stock-photo placeholder
 * beside a privacy policy reads as unfinished, and most clients have no image
 * for it anyway.
 *
 * Renders its title as the `<h1>`, because it is built for a routed page
 * (`/privacy`, `/terms`) where no hero supplies one. Putting it on the home page
 * beside a hero would give that page two `<h1>`s.
 */
export function Legal({ eyebrow, title, updated, intro, blocks, id }: LegalProps & { id?: string }) {
  const leads = intro ? (Array.isArray(intro) ? intro : [intro]) : [];

  return (
    <Section id={id ?? "legal"} containerSize="narrow">
      <div className="flex flex-col gap-5">
        {eyebrow && (
          <span className="inline-flex w-fit items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-primary/60" aria-hidden />
            {eyebrow}
          </span>
        )}

        <h1 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">{title}</h1>

        {updated && <p className="text-sm text-muted">{updated}</p>}

        {leads.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-muted sm:text-lg">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {blocks.map((block, i) => {
          const paragraphs = Array.isArray(block.body) ? block.body : [block.body];
          return (
            <div key={block.heading ?? i} className="flex flex-col gap-3">
              {block.heading && (
                <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{block.heading}</h2>
              )}
              {paragraphs.map((p, j) => (
                <p key={j} className="text-base leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {block.bullets && block.bullets.length > 0 && (
                <ul className="mt-1 flex flex-col gap-2">
                  {block.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-base leading-relaxed text-muted">
                      <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
