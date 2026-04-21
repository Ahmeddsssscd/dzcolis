"use client";

/**
 * Route-level error boundary.
 *
 * Catches any unhandled error thrown in a server or client component inside a
 * route segment and renders a branded fallback instead of Next.js' default
 * grey page. The user gets a reset button (re-runs the route) + a link home.
 *
 * If the root layout itself fails, Next falls back to `global-error.tsx`
 * below — which has to ship its own <html><body> because the layout never
 * rendered.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the console so Vercel captures it in function logs.
    // Sentry / PostHog would hook in here if we add them later.
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Oups, un problème est survenu
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Une erreur inattendue s&apos;est produite. Nos équipes ont été notifiées.
          Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-[11px] text-slate-400 font-mono mb-6 bg-slate-50 rounded-lg px-3 py-2">
            Code : {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center justify-center"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
