import { cn } from "@/lib/cn";

/** Shared eyebrow + title + subtitle block used at the top of most sections. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "text-start items-start";
  return (
    <div className={cn("flex flex-col gap-3 max-w-2xl", alignment, align === "center" && "mx-auto", className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="h-px w-6 bg-primary/60" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
