import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

/**
 * Section shell used by every section component. Handles the anchor id, the
 * preset-driven vertical rhythm (`--section-py`) and an optional tinted surface.
 */
export function Section({
  id,
  children,
  className,
  containerSize = "default",
  tone = "default",
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
  /** Background treatment. */
  tone?: "default" | "muted" | "inverted" | "none";
  /** When true, children are rendered without the inner Container. */
  bleed?: boolean;
}) {
  const toneClass =
    tone === "muted"
      ? "bg-[color-mix(in_srgb,var(--text)_4%,var(--background))]"
      : tone === "inverted"
        ? "bg-[color-mix(in_srgb,var(--text)_92%,var(--background))] text-background"
        : tone === "none"
          ? ""
          : "bg-background";

  return (
    <section
      id={id}
      className={cn("py-[var(--section-py)]", toneClass, className)}
    >
      {bleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  );
}
