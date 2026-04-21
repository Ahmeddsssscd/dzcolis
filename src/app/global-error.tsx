"use client";

/**
 * Root-level error boundary (last resort).
 *
 * Only renders when the root layout itself throws — e.g. a ThemeProvider /
 * LanguageProvider crash. Because the layout never rendered, Next does not
 * wrap us in <html>/<body>, so we have to ship our own.
 *
 * Keep it dead simple: no fonts, no providers, no i18n. It must work even
 * if every non-essential module broke.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: 420, width: "100%", background: "white", borderRadius: 16, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: 32, textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
            ⚠
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
            Service temporairement indisponible
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
            Une erreur est survenue lors du chargement de Waselli. Veuillez réessayer dans quelques instants.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", background: "#f8fafc", borderRadius: 8, padding: "8px 12px", margin: "0 0 20px" }}>
              Code : {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, color: "white", fontWeight: 600, fontSize: 14, background: "#1d4ed8", border: 0, cursor: "pointer" }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
