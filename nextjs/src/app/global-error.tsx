"use client";

import { useEffect } from "react";

/**
 * The boundary of last resort.
 *
 * It replaces the root layout rather than rendering inside it, which is what makes it the
 * only place that has to supply its own `<html>` and `<body>`. It also means none of the
 * usual styling is loaded: `globals.css` is imported by the layout this has just replaced,
 * so the few rules here are written inline. That is not a shortcut, it is the only thing
 * that works at this level.
 *
 * Reached only when the root layout itself throws, which should be close to never.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global] root layout failed", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0a0a0a",
          color: "#d4e4f0",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          gap: "1rem",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>The site could not load</h1>
        <p style={{ color: "#94a3b8", margin: 0, maxWidth: "32rem" }}>
          Something failed before the page could be drawn. Reloading usually clears it.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            backgroundColor: "#05e4fc",
            border: "none",
            borderRadius: "0.5rem",
            color: "#03181d",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 600,
            padding: "0.65rem 1.25rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
