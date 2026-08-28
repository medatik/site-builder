import type { FloatingAction } from "@/lib/types";
import { cn } from "@/lib/cn";
import { linkIntent } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * A single floating action button pinned to a screen corner. Fully config-driven
 * (see `FloatingAction`): content (icon/label/href), corner placement, colour,
 * and whether it shows at all. Link behaviour (new tab, WhatsApp, etc.) reuses
 * the same `linkIntent` logic as the CTA buttons, and it inherits the active
 * theme so it matches whichever client is rendering.
 */
const variantStyles: Record<NonNullable<FloatingAction["variant"]>, string> = {
  primary: "bg-primary text-[color:var(--on-primary)]",
  secondary: "bg-secondary text-[color:var(--on-secondary)]",
  accent: "bg-accent text-[color:var(--on-accent)]",
  whatsapp: "bg-[#25D366] text-white",
};

export function FloatingButton({ action }: { action?: FloatingAction }) {
  if (!action || action.enabled === false || !action.href) return null;

  const x = action.position?.x ?? "right";
  const y = action.position?.y ?? "bottom";
  const intent = linkIntent(action.href);
  const variant = action.variant ?? (intent === "whatsapp" ? "whatsapp" : "primary");
  const opensNewTab = intent === "external" || (intent === "whatsapp" && /^https?:/i.test(action.href));

  return (
    <a
      href={action.href}
      aria-label={action.label}
      title={action.label}
      data-intent={intent}
      {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "fixed z-40 flex items-center gap-2.5 font-heading font-semibold shadow-[var(--shadow-pop)]",
        "transition-transform duration-[var(--transition-base)] ease-[var(--transition-ease)]",
        "hover:[transform:var(--hover-lift-btn)] hover:brightness-110",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variantStyles[variant],
        action.showLabel
          ? "rounded-[var(--radius-pill)] px-5 py-3.5 text-sm"
          : "size-14 justify-center rounded-full",
        // Vertical corner (top clears the sticky header).
        y === "bottom" ? "bottom-5 sm:bottom-6" : "top-24 sm:top-28",
        // Horizontal corner.
        x === "right" ? "right-5 sm:right-6" : "left-5 sm:left-6",
      )}
    >
      <Icon
        name={action.icon ?? "message-circle"}
        className={action.showLabel ? "size-5" : "size-6"}
        strokeWidth={2.25}
      />
      {action.showLabel && <span>{action.label}</span>}
    </a>
  );
}
