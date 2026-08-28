"use client";

import { Component, type ReactNode } from "react";

/**
 * Isolates one section's render failure.
 *
 * Without this, a single throwing section (a malformed config value, a bad
 * media URL, a section component bug) takes down the ENTIRE page with a 500 —
 * on a live client site, the worst possible failure mode. Wrapped, the rest of
 * the page still renders and converts.
 *
 * In development the error is surfaced inline so it can't be missed. In
 * production the section renders nothing at all: a visitor should never see a
 * broken box, and the business would rather be missing one section than be
 * missing a website.
 *
 * Must be a class component — React only supports error boundaries via
 * `componentDidCatch`/`getDerivedStateFromError`.
 */
export class SectionBoundary extends Component<
  { children: ReactNode; name: string },
  { failed: boolean; message?: string }
> {
  state = { failed: false, message: undefined as string | undefined };

  static getDerivedStateFromError(error: unknown) {
    return { failed: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error(`[section:${this.props.name}] failed to render`, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        role="alert"
        className="mx-auto my-4 max-w-3xl rounded-[var(--radius-card)] border border-[#ef4444] bg-[color-mix(in_srgb,#ef4444_8%,transparent)] p-6 text-sm"
      >
        <strong className="font-heading block text-[#ef4444]">
          Section &quot;{this.props.name}&quot; failed to render
        </strong>
        <p className="mt-1 text-muted">{this.state.message}</p>
        <p className="mt-2 text-xs text-muted">
          Shown in development only — in production this section is skipped and the
          rest of the page still renders.
        </p>
      </div>
    );
  }
}
