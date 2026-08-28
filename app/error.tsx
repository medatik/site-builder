"use client";

import { useEffect } from "react";

/**
 * Route-level fallback: catches anything the per-section boundaries don't (a
 * failure in the header, footer, or theme layer). Deliberately dependency-free
 * and inline-styled — it must render even if the theme layer is what broke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route] render failed", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
      <p style={{ color: "#666", maxWidth: "34rem" }}>
        This page couldn&apos;t be displayed. Please try again — if it keeps happening,
        contact us by phone.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "0.5rem",
          border: "1px solid #ccc",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
      {process.env.NODE_ENV !== "production" && (
        <pre style={{ marginTop: "1rem", color: "#ef4444", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
          {error.message}
        </pre>
      )}
    </main>
  );
}
