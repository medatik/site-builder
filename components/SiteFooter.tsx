import type { SiteConfig } from "@/lib/types";
import { footerComponents } from "@/components/footers";

/**
 * Footer dispatcher: picks the layout named by `config.footer.type` (default
 * `"columns"`) from the registry and renders it. All footer layouts live in
 * `components/footers/`; this file just resolves which one. Falls back to
 * `columns` if an unknown type ever slips through.
 */
export function SiteFooter({ config }: { config: SiteConfig }) {
  const Footer = footerComponents[config.footer?.type ?? "columns"] ?? footerComponents.columns;
  return <Footer config={config} />;
}
