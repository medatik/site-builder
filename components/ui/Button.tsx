import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { CtaLink } from "@/lib/types";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-heading font-semibold tracking-wide " +
  // `--radius-btn-hover` lets a preset morph the button's shape on hover (e.g.
  // "petal" goes from an asymmetric radius to a flat one). Most presets set it
  // equal to --radius-btn, making this a no-op. `transition-all` animates the
  // border-radius change over --transition-base.
  "rounded-[var(--radius-btn)] hover:rounded-[var(--radius-btn-hover)] " +
  "transition-all duration-[var(--transition-base)] " +
  "ease-[var(--transition-ease)] focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-[color:var(--on-primary)] hover:brightness-110 " +
    "hover:[transform:var(--hover-lift-btn)] shadow-[var(--shadow-pop)]",
  secondary:
    "border border-[color-mix(in_srgb,var(--text)_25%,transparent)] text-text " +
    "hover:border-primary hover:text-primary bg-transparent",
  ghost: "text-primary hover:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/** How a CTA href should behave. Also emitted as `data-intent` for styling. */
export type LinkIntent = "call" | "email" | "sms" | "whatsapp" | "external" | "internal";

/**
 * Classify a CTA href. `tel:`, `mailto:`, `sms:` and the `whatsapp:` app scheme
 * are same-tab "app intents"; WhatsApp click-to-chat URLs (`wa.me`,
 * `*.whatsapp.com`) and other web links open in a new tab; on-page anchors and
 * relative paths stay in the same tab.
 */
export function linkIntent(href: string): LinkIntent {
  if (/^tel:/i.test(href)) return "call";
  if (/^mailto:/i.test(href)) return "email";
  if (/^sms:/i.test(href)) return "sms";
  if (/^whatsapp:/i.test(href) || /^https?:\/\/(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)(?:[/?#]|$)/i.test(href))
    return "whatsapp";
  if (/^https?:\/\//i.test(href)) return "external";
  return "internal";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon,
  href,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: string;
  href?: string;
  /** Only applies when there's no `href`. Default `"button"` — pass `"submit"`
   *  for a form's submit control. */
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {icon && <Icon name={icon} className="size-[1.1em]" strokeWidth={2.25} />}
      {children}
    </>
  );
  if (href) {
    const intent = linkIntent(href);
    // Web destinations open in a new tab; app-scheme + on-page links stay put.
    const opensNewTab = intent === "external" || (intent === "whatsapp" && /^https?:/i.test(href));
    return (
      <a
        href={href}
        className={cls}
        data-intent={intent}
        {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} className={cls}>
      {content}
    </button>
  );
}

/** Convenience wrapper that renders a Button from a config `CtaLink`. */
export function CtaButton({
  cta,
  fallbackVariant = "primary",
  size = "md",
  className,
}: {
  cta?: CtaLink;
  fallbackVariant?: Variant;
  size?: Size;
  className?: string;
}) {
  if (!cta) return null;
  return (
    <Button
      href={cta.href}
      variant={cta.variant ?? fallbackVariant}
      size={size}
      icon={cta.icon}
      className={className}
    >
      {cta.label}
    </Button>
  );
}
