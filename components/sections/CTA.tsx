import type { CtaProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Backdrop } from "@/components/ui/Backdrop";
import { CtaButton } from "@/components/ui/Button";

/** Call-to-action banner. `band` = full-bleed color band; `card` = contained. */
export function CTA({
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "band",
  backdrop = "rays",
  id,
}: CtaProps & { id?: string }) {
  const inner = (
    <div className="relative flex flex-col items-center gap-6 text-center">
      <h2 className="max-w-2xl font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="max-w-xl text-lg leading-relaxed opacity-90">{description}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <CtaButton
          cta={primaryCta}
          className="!bg-[color:var(--background)] !text-primary hover:!brightness-95"
          size="lg"
        />
        <CtaButton
          cta={secondaryCta}
          fallbackVariant="secondary"
          size="lg"
          className="!border-[color-mix(in_srgb,var(--background)_60%,transparent)] !text-[color:var(--background)] hover:!border-[color:var(--background)]"
        />
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <section id={id} className="bg-background py-[var(--section-py)]">
        <Container>
          <div
            className="relative isolate overflow-hidden rounded-[var(--radius-card)] px-6 py-16 text-[color:var(--background)] shadow-[var(--shadow-card-lg)] sm:px-12"
            style={{ background: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--secondary)))" }}
          >
            <Backdrop variant={backdrop} />
            {inner}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id={id}
      className={cn("relative isolate overflow-hidden py-[calc(var(--section-py)*0.9)] text-[color:var(--background)]")}
      style={{ background: "linear-gradient(120deg, var(--primary), color-mix(in srgb, var(--primary) 50%, var(--secondary)))" }}
    >
      <Backdrop variant={backdrop} />
      <Container>{inner}</Container>
    </section>
  );
}
