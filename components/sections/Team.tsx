import type { TeamProps } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Media } from "@/components/ui/Media";
import { Icon } from "@/components/ui/Icon";

const colClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Team / staff grid with photo, role, optional bio, credentials and socials. */
export function Team({
  eyebrow,
  title,
  subtitle,
  members,
  columns = 3,
  id,
}: TeamProps & { id?: string }) {
  return (
    <Section id={id ?? "team"}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className={cn("mt-14 grid grid-cols-1 gap-6", colClass[columns])}>
        {members.map((m) => (
          <div
            key={m.name}
            className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_10%,transparent)] card-surface shadow-[var(--shadow-card)]"
          >
            <Media
              media={m.photo}
              aspect="1 / 1"
              rounded={false}
              placeholderIcon="user"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="flex flex-1 flex-col gap-2 p-6">
              <div>
                <h3 className="font-heading text-lg font-bold leading-tight">{m.name}</h3>
                <p className="text-sm font-medium text-primary">{m.role}</p>
                {m.credentials && (
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{m.credentials}</p>
                )}
              </div>
              {m.bio && <p className="text-sm leading-relaxed text-muted">{m.bio}</p>}
              {m.socials && m.socials.length > 0 && (
                <div className="mt-auto flex gap-2 pt-3">
                  {m.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="flex size-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--text)_14%,transparent)] text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon name={s.icon} className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
