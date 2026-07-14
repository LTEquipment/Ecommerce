"use client";

import { useEffect } from "react";

// Catches errors thrown in the root layout itself. Replaces the whole document,
// so it must be fully self-contained (its own <html>/<body>, inline styles).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6F7F8",
          color: "#17191C",
          fontFamily:
            "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#BE1E2D" }}>
            Something went wrong
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: "12px 0 8px" }}>
            We hit an unexpected error.
          </h1>
          <p style={{ color: "#6C737A", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px" }}>
            Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 26px",
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: "#BE1E2D",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error?.digest && (
            <p style={{ fontSize: 12, color: "#9AA0A6", marginTop: 20 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
