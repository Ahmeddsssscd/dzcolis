"use client";
import { useState, useEffect, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const STATUS_INDEX: Record<string, number> = {
  pending:    0,
  accepted:   1,
  in_transit: 2,
  delivered:  3,
  cancelled:  -1,
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-gray-100 text-gray-600",
  accepted:   "bg-blue-100 text-blue-700",
  in_transit: "bg-yellow-100 text-yellow-700",
  delivered:  "bg-dz-green/10 text-dz-green",
  cancelled:  "bg-red-100 text-red-600",
};

interface TrackingResult {
  booking_ref: string;
  status: string;
  total_amount: number;
  weight: number;
  content: string;
  recipient_name: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  from_city: string;
  to_city: string;
  departure_date: string;
  transporter: {
    name: string;
    rating: number;
    review_count: number;
    verified: boolean;
  } | null;
}

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-DZ", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Suspense wrapper — Next.js 16 requires any component that reads the URL
// via `useSearchParams()` to be inside a <Suspense> boundary, otherwise
// the entire route gets pushed to client-side rendering and the static
// shell flashes blank on first paint. Keeping the hook in a child lets
// the parent prerender the loading fallback.
export default function SuiviPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-dz-gray-500 text-sm">Chargement…</div>
        </div>
      }
    >
      <SuiviPageContent />
    </Suspense>
  );
}

function SuiviPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("ref") ?? "");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Steps for the progress tracker — labels flow through i18n so the
  // badge switches language along with the rest of the UI.
  const STEPS = [
    { label: t("status_pending"),    sublabel: t("status_pending_long"),   icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label: t("status_accepted"),   sublabel: t("status_accepted_long"),  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg> },
    { label: t("status_in_transit"), sublabel: t("status_in_transit_long"), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg> },
    { label: t("status_delivered"),  sublabel: t("status_delivered_long"),  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  ];

  const STATUS_LABEL: Record<string, string> = {
    pending:    t("status_pending_long"),
    accepted:   t("status_accepted_long"),
    in_transit: t("status_in_transit_long"),
    delivered:  t("status_delivered_long"),
    cancelled:  t("status_cancelled_long"),
  };

  // Auto-search if ref is in URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setInputValue(ref);
      fetchTracking(ref);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTracking = async (ref: string) => {
    if (!ref.trim()) { setError("Veuillez entrer un numéro de suivi."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/tracking?ref=${encodeURIComponent(ref.trim())}`);
      if (res.status === 404) {
        setError("Numéro de suivi introuvable. Vérifiez votre email de confirmation.");
      } else if (!res.ok) {
        setError("Erreur lors de la recherche. Réessayez.");
      } else {
        setResult(await res.json());
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetchTracking(inputValue);
  };

  const statusIdx = result ? (STATUS_INDEX[result.status] ?? 0) : 0;

  return (
    <>
      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Suivi en temps réel
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">Suivez votre colis</h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Entrez votre numéro de suivi reçu par email pour voir le statut de votre livraison
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-dz-gray-50 dark:bg-dz-gray-900 border-b border-dz-gray-200 dark:border-dz-gray-700 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-dz-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: DZ-2026-XXXX"
                className="w-full pl-11 pr-4 py-4 text-base border-2 border-dz-gray-200 dark:border-dz-gray-600 rounded-xl focus:outline-none focus:border-dz-green bg-white dark:bg-dz-gray-800 text-dz-gray-800 dark:text-white placeholder-dz-gray-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-dz-green hover:bg-dz-green-light disabled:opacity-60 text-white px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : "Suivre"}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="py-10 bg-dz-gray-50 dark:bg-dz-gray-900">
          <div className="max-w-3xl mx-auto px-4 space-y-6">

            {/* Header */}
            <div className="bg-white dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-dz-gray-500 dark:text-dz-gray-400 uppercase tracking-wider font-medium mb-1">Numéro de suivi</p>
                  <p className="text-xl font-bold text-dz-gray-800 dark:text-white font-mono tracking-wide">{result.booking_ref}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold self-start sm:self-auto ${STATUS_COLOR[result.status] ?? "bg-gray-100 text-gray-600"}`}>
                  <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
                  {STATUS_LABEL[result.status] ?? result.status}
                </span>
              </div>

              {result.status === "cancelled" ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Cette réservation a été annulée. Contactez-nous si vous avez des questions.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-dz-gray-600 dark:text-dz-gray-300">
                    <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>
                      <span className="font-medium text-dz-gray-800 dark:text-white">{result.from_city}</span>
                      <span className="mx-1 text-dz-gray-400">→</span>
                      <span className="font-medium text-dz-gray-800 dark:text-white">{result.to_city}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-dz-gray-600 dark:text-dz-gray-300">
                    <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>{result.content} · {result.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-dz-gray-600 dark:text-dz-gray-300">
                    <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Destinataire : <span className="font-medium text-dz-gray-800 dark:text-white">{result.recipient_name}</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {result.status !== "cancelled" && (
              <div className="bg-white dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-dz-gray-700 dark:text-dz-gray-300 uppercase tracking-wider mb-6">Progression</h2>
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-dz-gray-200 dark:bg-dz-gray-600 z-0" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-dz-green z-0 transition-all duration-700"
                    style={{ width: statusIdx === 0 ? "0px" : `calc(${(statusIdx / 3) * 100}% - 10px)` }}
                  />
                  <div className="relative z-10 flex justify-between">
                    {STEPS.map((step, i) => {
                      const done = i < statusIdx;
                      const active = i === statusIdx;
                      const future = i > statusIdx;
                      return (
                        <div key={step.label} className="flex flex-col items-center gap-2" style={{ width: "25%" }}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all border-2
                            ${done ? "bg-dz-green border-dz-green text-white" : ""}
                            ${active ? "bg-white dark:bg-dz-gray-700 border-dz-green text-dz-green shadow-md shadow-dz-green/20 ring-4 ring-dz-green/10" : ""}
                            ${future ? "bg-white dark:bg-dz-gray-700 border-dz-gray-200 dark:border-dz-gray-600 text-dz-gray-400" : ""}
                          `}>
                            {done ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : step.icon}
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className={`text-xs font-semibold leading-tight ${active ? "text-dz-green" : done ? "text-dz-green-dark" : "text-dz-gray-400"}`}>{step.label}</p>
                            <p className="text-[10px] text-dz-gray-400 leading-tight mt-0.5">{step.sublabel}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-dz-gray-700 dark:text-dz-gray-300 uppercase tracking-wider mb-5">Historique</h2>
              <div className="space-y-0">
                {[
                  { label: "Réservation créée", date: result.created_at, icon: "📦", show: true },
                  { label: "Accepté par le transporteur", date: result.accepted_at, icon: "✅", show: ["accepted","in_transit","delivered"].includes(result.status) },
                  { label: `Colis en transit vers ${result.to_city}`, date: result.in_transit_at, icon: "🚗", show: ["in_transit","delivered"].includes(result.status) },
                  { label: `Livré avec succès à ${result.to_city} 🎉`, date: result.delivered_at, icon: "🎉", show: result.status === "delivered" },
                ].filter(e => e.show).reverse().map((event, i, arr) => {
                  const isFirst = i === 0;
                  return (
                    <div key={event.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isFirst ? "bg-dz-green text-white shadow-md shadow-dz-green/30" : "bg-dz-gray-100 dark:bg-dz-gray-700 text-dz-gray-400"}`}>
                          {event.icon}
                        </div>
                        {i < arr.length - 1 && <div className="w-0.5 bg-dz-gray-200 dark:bg-dz-gray-600 flex-1 my-1" style={{ minHeight: "2rem" }} />}
                      </div>
                      <div className="pb-5 pt-1">
                        <p className={`text-sm font-semibold ${isFirst ? "text-dz-green" : "text-dz-gray-800 dark:text-white"}`}>{event.label}</p>
                        <p className="text-xs text-dz-gray-400 mt-0.5">{fmt(event.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transporter */}
            {result.transporter && (
              <div className="bg-white dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-dz-gray-700 dark:text-dz-gray-300 uppercase tracking-wider mb-4">Transporteur</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-dz-green/10 rounded-full flex items-center justify-center text-dz-green font-bold text-lg shrink-0">
                    {result.transporter.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dz-gray-800 dark:text-white">{result.transporter.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm text-dz-gray-600 dark:text-dz-gray-300">{result.transporter.rating?.toFixed(1)} ({result.transporter.review_count} avis)</span>
                    </div>
                  </div>
                  {result.transporter.verified && (
                    <span className="text-xs text-dz-green bg-dz-green/10 px-3 py-1.5 rounded-full font-medium">✓ Vérifié</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link href="/messages" className="flex-1 flex items-center justify-center gap-2 bg-dz-green hover:bg-dz-green-light text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Contacter
                  </Link>
                  <Link href="/contact" className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Signaler un problème
                  </Link>
                </div>
              </div>
            )}

            {/* Amount + Waselli Protection */}
            <div className="bg-dz-green/5 dark:bg-dz-green/10 border border-dz-green/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-dz-gray-600 dark:text-dz-gray-300">Montant total</p>
                  <p className="text-2xl font-bold text-dz-green">{result.total_amount.toLocaleString()} DA</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dz-gray-500 dark:text-dz-gray-400">Paiement séquestre</p>
                  <p className="text-sm font-medium text-dz-gray-700 dark:text-dz-gray-200">
                    {result.status === "delivered" ? "✅ Libéré au transporteur" : "🔒 Sécurisé par Waselli"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-dz-green/20">
                <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-xs font-semibold text-dz-green">Protégé par Waselli</span>
                <span className="text-xs text-dz-gray-500 dark:text-dz-gray-400">— couverture jusqu&apos;à 50 000 DA contre perte et casse</span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Info section */}
      <section className="py-14 bg-white dark:bg-dz-gray-900">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="bg-dz-gray-50 dark:bg-dz-gray-800 border border-dz-gray-200 dark:border-dz-gray-700 rounded-2xl p-7 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-dz-gray-800 dark:text-white text-base mb-1">Pas de numéro de suivi ?</h3>
              <p className="text-sm text-dz-gray-500 dark:text-dz-gray-400 leading-relaxed mb-3">
                Votre numéro est envoyé par email dès la confirmation de votre réservation. Vérifiez vos spams.
              </p>
              <Link href="/annonces" className="inline-flex items-center gap-1.5 text-sm font-medium text-dz-green hover:text-dz-green-light transition-colors">
                Parcourir les annonces
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
