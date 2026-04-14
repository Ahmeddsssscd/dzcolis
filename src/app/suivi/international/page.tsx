"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

// ─── Data ───────────────────────────────────────────────────────────────────

const EU_ROUTES = [
  { from: "Paris", to: "Alger", fromFlag: "🇫🇷", toFlag: "🇩🇿", country: "France" },
  { from: "Madrid", to: "Oran", fromFlag: "🇪🇸", toFlag: "🇩🇿", country: "Espagne" },
  { from: "Bruxelles", to: "Alger", fromFlag: "🇧🇪", toFlag: "🇩🇿", country: "Belgique" },
  { from: "Berlin", to: "Constantine", fromFlag: "🇩🇪", toFlag: "🇩🇿", country: "Allemagne" },
  { from: "Milan", to: "Annaba", fromFlag: "🇮🇹", toFlag: "🇩🇿", country: "Italie" },
  { from: "Alger", to: "Paris", fromFlag: "🇩🇿", toFlag: "🇫🇷", country: "France" },
  { from: "Oran", to: "Madrid", fromFlag: "🇩🇿", toFlag: "🇪🇸", country: "Espagne" },
  { from: "Constantine", to: "Bruxelles", fromFlag: "🇩🇿", toFlag: "🇧🇪", country: "Belgique" },
];

const FIRST_NAMES = ["Mohamed", "Ahmed", "Karim", "Yacine", "Redouane", "Nabil", "Jean", "Carlos", "Luca", "Klaus"];
const LAST_NAMES  = ["Benali", "Khelif", "Meziane", "Rahmani", "Mansouri", "Dupont", "García", "Rossi", "Müller"];
const PACKAGE_TYPES = [
  "Colis standard", "Enveloppe document", "Colis fragile",
  "Électronique", "Vêtements & textiles", "Produits alimentaires",
];

// ─── 6 International Steps (includes Customs) ───────────────────────────────

const INT_STEPS = [
  { label: "Enregistré",   sublabel: "Commande confirmée",   icon: "📋" },
  { label: "Récupéré",     sublabel: "Par le transporteur",  icon: "🚚" },
  { label: "En transit",   sublabel: "Vers pays de destination", icon: "✈️" },
  { label: "Douane",       sublabel: "Contrôle en cours",    icon: "🛃" },
  { label: "En livraison", sublabel: "Dernière étape",       icon: "📍" },
  { label: "Livré",        sublabel: "Confirmé",             icon: "✅" },
];

const CUSTOMS_NOTES = [
  "Vérification documentaire standard (1–3 jours ouvrables)",
  "Contrôle douanier en cours — aucune action requise de votre part",
  "Inspection physique aléatoire — délai habituel 24–48h",
  "Traitement prioritaire actif — dédouanement accéléré",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}
function pickFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

type TrackingData = {
  statusIndex: number;
  route: (typeof EU_ROUTES)[0];
  direction: "eu-dz" | "dz-eu";
  transporter: string;
  rating: string;
  dates: string[];
  estimatedDelivery: string;
  packageWeight: string;
  packageType: string;
  customsNote: string;
  isDzEu: boolean;
};

function generate(code: string): TrackingData {
  const cleaned = code.trim().toUpperCase();
  const hash = hashStr(cleaned);

  const last = cleaned[cleaned.length - 1] ?? "0";
  const d = parseInt(last, 10);
  let statusIndex: number;
  if (isNaN(d)) statusIndex = Math.min(5, last.charCodeAt(0) % 6);
  else if (d <= 1) statusIndex = 0;
  else if (d <= 2) statusIndex = 1;
  else if (d <= 4) statusIndex = 2;
  else if (d <= 5) statusIndex = 3;
  else if (d <= 7) statusIndex = 4;
  else             statusIndex = 5;

  const route      = pickFrom(EU_ROUTES, hash);
  const isDzEu     = route.from === "Alger" || route.from === "Oran" || route.from === "Constantine";
  const direction  = isDzEu ? "dz-eu" : "eu-dz";
  const firstName  = pickFrom(FIRST_NAMES, hash >> 2);
  const lastName   = pickFrom(LAST_NAMES, hash >> 5);
  const ratingRaw  = 4.0 + ((hash % 10) / 10);
  const rating     = ratingRaw.toFixed(1);

  const baseMs     = new Date("2026-04-13").getTime();
  const dayMs      = 86400000;
  const booking    = new Date(baseMs - (5 + (hash % 3)) * dayMs);
  const stepDates: Date[] = [booking];
  const gaps = [1, 2, 1, 2, 1]; // days per step
  for (let i = 0; i < 5; i++) {
    stepDates.push(new Date(stepDates[i].getTime() + gaps[i] * dayMs));
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });
  const fmtTime = (dt: Date, h: number) => {
    const nd = new Date(dt.getTime() + h * 3600000);
    return `${String(nd.getHours()).padStart(2, "0")}:${String((nd.getMinutes() + (hash % 30)) % 60).padStart(2, "0")}`;
  };

  const dates = stepDates.map((dt, i) => `${fmt(dt)} à ${fmtTime(dt, i * 3 + 8)}`);

  return {
    statusIndex,
    route,
    direction,
    transporter: `${firstName} ${lastName}`,
    rating,
    dates,
    estimatedDelivery: fmt(stepDates[5]),
    packageWeight: pickFrom(["0.5 kg", "1.2 kg", "2.5 kg", "4 kg", "7 kg", "12 kg"], hash >> 3),
    packageType: pickFrom(PACKAGE_TYPES, hash >> 6),
    customsNote: pickFrom(CUSTOMS_NOTES, hash >> 8),
    isDzEu,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Stars({ rating }: { rating: string }) {
  const v = parseFloat(rating);
  const full = Math.floor(v);
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= full ? "text-yellow-400" : "text-dz-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="ml-1 text-sm text-dz-gray-600">{rating}</span>
    </span>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function InternationalSuiviPage() {
  const [input, setInput]     = useState("");
  const [data, setData]       = useState<TrackingData | null>(null);
  const [searched, setSearched] = useState<string | null>(null);
  const [error, setError]     = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) { setError("Veuillez entrer un numéro de suivi."); return; }
    if (val.length < 4) { setError("Numéro invalide. Vérifiez votre email de confirmation."); return; }
    setError("");
    setSearched(val.toUpperCase());
    setData(generate(val));
  };

  const statusBadgeColors = [
    "bg-gray-100 text-gray-500",
    "bg-blue-100 text-blue-700",
    "bg-sky-100 text-sky-700",
    "bg-orange-100 text-orange-700",
    "bg-amber-100 text-amber-700",
    "bg-dz-green/10 text-dz-green",
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-gray-800 via-dz-gray-700 to-dz-green-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-20 w-72 h-72 bg-dz-green rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-22 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-5">
            <span>✈️</span> Suivi international
          </div>
          <div className="flex justify-center items-center gap-3 text-4xl mb-5">
            <span>🇩🇿</span>
            <svg className="w-6 h-6 text-dz-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>🇫🇷</span><span>🇪🇸</span><span>🇧🇪</span><span>🇩🇪</span><span>🇮🇹</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Suivez votre colis international
          </h1>
          <p className="text-green-100 text-base md:text-lg max-w-xl mx-auto">
            Algérie ↔ Europe — Suivi complet avec étape douanière en temps réel
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="bg-dz-gray-50 border-b border-dz-gray-200 py-10">
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: INT-2026-XXXX ou INTL-FR-XXXX"
                className="w-full pl-11 pr-4 py-4 text-base border-2 border-dz-gray-200 rounded-xl focus:outline-none focus:border-dz-green bg-white text-dz-gray-800 placeholder-dz-gray-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-dz-green hover:bg-dz-green-light text-white px-8 py-4 rounded-xl font-semibold transition-colors whitespace-nowrap"
            >
              Suivre
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
          <p className="text-xs text-dz-gray-400 mt-3 text-center">
            Numéro envoyé par email après confirmation de votre réservation internationale.
          </p>
        </div>
      </section>

      {/* ── Result ── */}
      {data && searched && (
        <section className="py-10 bg-white">
          <div className="max-w-3xl mx-auto px-4 space-y-5">

            {/* Summary card */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-dz-gray-400 uppercase tracking-wider font-medium mb-1">Numéro de suivi</p>
                  <p className="text-xl font-bold text-dz-gray-800 font-mono tracking-widest">{searched}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold self-start ${statusBadgeColors[data.statusIndex]}`}>
                  <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
                  {INT_STEPS[data.statusIndex].label}
                </span>
              </div>

              {/* Route banner */}
              <div className="bg-dz-gray-50 rounded-xl p-4 flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl">{data.route.fromFlag}</div>
                  <p className="text-xs text-dz-gray-500 mt-1 font-medium">{data.route.from}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-8 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-[10px] text-dz-gray-400 font-medium">INTERNATIONAL</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{data.route.toFlag}</div>
                  <p className="text-xs text-dz-gray-500 mt-1 font-medium">{data.route.to}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-dz-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{data.packageType} · {data.packageWeight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Via <span className="font-medium text-dz-gray-800">{data.route.country}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {data.statusIndex < 5
                      ? <>Livraison prévue : <span className="font-medium text-dz-gray-800">{data.estimatedDelivery}</span></>
                      : <span className="text-dz-green font-medium">✅ Livré</span>
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* 6-step progress */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <h2 className="text-xs font-semibold text-dz-gray-500 uppercase tracking-widest mb-6">Progression</h2>
              <div className="relative min-w-[500px]">
                {/* Background line */}
                <div className="absolute top-5 left-[4%] right-[4%] h-0.5 bg-dz-gray-200 z-0" />
                {/* Progress line */}
                <div
                  className="absolute top-5 left-[4%] h-0.5 bg-dz-green z-0 transition-all duration-700"
                  style={{ width: data.statusIndex === 0 ? "0%" : `${(data.statusIndex / 5) * 92}%` }}
                />
                <div className="relative z-10 flex justify-between">
                  {INT_STEPS.map((step, i) => {
                    const done   = i < data.statusIndex;
                    const active = i === data.statusIndex;
                    const future = i > data.statusIndex;
                    const isCustoms = i === 3;
                    return (
                      <div key={step.label} className="flex flex-col items-center gap-2 w-[16.66%]">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all border-2
                          ${done   ? "bg-dz-green border-dz-green text-white" : ""}
                          ${active ? (isCustoms ? "bg-orange-50 border-orange-400 text-orange-500 shadow-md ring-4 ring-orange-100" : "bg-white border-dz-green text-dz-green shadow-md ring-4 ring-dz-green/10") : ""}
                          ${future ? "bg-white border-dz-gray-200 text-dz-gray-300" : ""}
                        `}>
                          {done ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span>{step.icon}</span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-semibold leading-tight
                            ${active ? (isCustoms ? "text-orange-500" : "text-dz-green") : done ? "text-dz-green-dark" : "text-dz-gray-400"}
                          `}>
                            {step.label}
                          </p>
                          <p className="text-[9px] text-dz-gray-400 leading-tight mt-0.5">{step.sublabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customs callout (shown when at customs step) */}
            {data.statusIndex === 3 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center text-xl shrink-0">🛃</div>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">Colis en cours de dédouanement</p>
                  <p className="text-xs text-orange-700 mt-1 leading-relaxed">{data.customsNote}</p>
                  <p className="text-xs text-orange-600 mt-2">
                    Aucune action requise de votre part. Nous vous notifions dès que le colis sort de la douane.
                    En cas de demande de documents, vous serez contacté par email.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-semibold text-dz-gray-500 uppercase tracking-widest mb-5">Historique</h2>
              <div className="space-y-0">
                {INT_STEPS.slice(0, data.statusIndex + 1)
                  .map((step, i) => {
                    const isLast    = i === data.statusIndex;
                    const isCustoms = i === 3;
                    const labels = [
                      `Commande enregistrée — colis à récupérer à ${data.route.from}`,
                      `Colis récupéré à ${data.route.from} ${data.route.fromFlag}`,
                      `En transit international vers ${data.route.to} ${data.route.toFlag}`,
                      `Arrivée en zone douanière — dédouanement en cours`,
                      `Colis remis au livreur final à ${data.route.to}`,
                      `Colis livré avec succès à ${data.route.to} ${data.route.toFlag} ✅`,
                    ];
                    return (
                      <div key={step.label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                            isLast
                              ? isCustoms ? "bg-orange-400 ring-4 ring-orange-100" : "bg-dz-green ring-4 ring-dz-green/20"
                              : "bg-dz-green"
                          }`} />
                          {i < data.statusIndex && (
                            <div className="w-0.5 bg-dz-gray-200 flex-1 my-1" style={{ minHeight: "2rem" }} />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className={`text-sm font-semibold ${isLast ? (isCustoms ? "text-orange-600" : "text-dz-green") : "text-dz-gray-800"}`}>
                            {labels[i]}
                          </p>
                          <p className="text-xs text-dz-gray-400 mt-0.5">{data.dates[i]}</p>
                        </div>
                      </div>
                    );
                  })
                  .reverse()}
              </div>
            </div>

            {/* Transporter card */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-semibold text-dz-gray-500 uppercase tracking-widest mb-4">Transporteur</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {data.transporter.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dz-gray-800">{data.transporter}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={data.rating} />
                    <span className="text-xs text-dz-gray-400">· Transporteur international vérifié</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-dz-green bg-dz-green/10 px-3 py-1.5 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Identité vérifiée
                </div>
              </div>
              {data.statusIndex < 5 && (
                <div className="mt-4 pt-4 border-t border-dz-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-dz-gray-600">
                    Livraison estimée : <span className="font-medium text-dz-gray-800">{data.estimatedDelivery}</span>
                  </p>
                  <a
                    href="https://wa.me/213XXXXXXXXXX?text=Bonjour%20DZColis%2C%20je%20veux%20suivre%20mon%20colis%20international."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs bg-[#25D366] hover:bg-[#20B954] text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contacter le support
                  </a>
                </div>
              )}
            </div>

            {/* Protection banner */}
            <div className="bg-gradient-to-r from-dz-green/5 to-dz-green/10 border border-dz-green/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-dz-green text-white rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-dz-gray-800 text-sm">Protection internationale incluse</p>
                <p className="text-xs text-dz-gray-500 mt-1 leading-relaxed">
                  Couverture jusqu&apos;à 300 000 DA sur tous les envois internationaux. Paiement séquestre libéré uniquement à la livraison confirmée.
                </p>
                <Link href="/assurance" className="text-xs text-dz-green font-semibold hover:underline mt-2 inline-block">
                  En savoir plus →
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Help section */}
      <section className={`py-12 ${data ? "bg-dz-gray-50" : "bg-white"}`}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center shrink-0 text-xl">📧</div>
            <div>
              <h3 className="font-semibold text-dz-gray-800 mb-1">Pas encore de numéro de suivi ?</h3>
              <p className="text-sm text-dz-gray-500 mb-3">
                Le numéro est envoyé par email après confirmation. Pour les envois internationaux, il commence par <span className="font-mono font-medium text-dz-gray-700">INT-</span> ou <span className="font-mono font-medium text-dz-gray-700">INTL-</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/international" className="text-sm text-dz-green font-semibold hover:underline">
                  Voir les transporteurs internationaux →
                </Link>
                <Link href="/suivi" className="text-sm text-dz-gray-500 hover:text-dz-gray-800 font-medium">
                  Suivi national →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
