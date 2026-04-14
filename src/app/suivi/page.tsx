"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

// Algerian cities pool for route generation
const CITIES = [
  "Alger", "Oran", "Constantine", "Annaba", "Béjaïa", "Sétif",
  "Tlemcen", "Batna", "Blida", "Biskra", "Tizi Ouzou", "Skikda",
  "Chlef", "Mostaganem", "Médéa", "Jijel", "Boumerdès", "Msila",
  "Relizane", "Tiaret", "Laghouat", "Ghardaïa", "Ouargla", "Tamanrasset",
];

// Transporter first/last names pool
const FIRST_NAMES = ["Mohamed", "Ahmed", "Karim", "Yacine", "Redouane", "Nabil", "Sofiane", "Hamza", "Bilal", "Rachid"];
const LAST_NAMES = ["Benali", "Khelif", "Boudiaf", "Meziane", "Rahmani", "Cherif", "Mansouri", "Zidane", "Boukhari", "Ouali"];

type TrackingStatus = {
  statusIndex: number;
  statusLabel: string;
  fromCity: string;
  toCity: string;
  transporterName: string;
  rating: string;
  dates: string[];
  estimatedDelivery: string;
  packageWeight: string;
  packageType: string;
};

const STEPS = [
  { label: "En attente", sublabel: "De récupération", icon: "📦" },
  { label: "Récupéré", sublabel: "Par le transporteur", icon: "🚚" },
  { label: "En transit", sublabel: "Vers destination", icon: "🛣️" },
  { label: "En livraison", sublabel: "Dernière étape", icon: "📍" },
  { label: "Livré", sublabel: "Confirmé", icon: "✅" },
];

const PACKAGE_TYPES = ["Colis standard", "Enveloppe document", "Colis fragile", "Électroménager", "Vêtements", "Alimentation"];

// Simple deterministic hash from string
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

function generateTrackingData(trackingNumber: string): TrackingStatus {
  const cleaned = trackingNumber.trim().toUpperCase();
  const hash = hashStr(cleaned);

  // Last char of the tracking number determines status
  const lastChar = cleaned[cleaned.length - 1] ?? "0";
  const lastDigit = parseInt(lastChar, 10);
  let statusIndex: number;
  if (isNaN(lastDigit)) {
    // Fall back to char code
    statusIndex = Math.min(4, lastChar.charCodeAt(0) % 5);
  } else if (lastDigit <= 1) {
    statusIndex = 0;
  } else if (lastDigit <= 3) {
    statusIndex = 1;
  } else if (lastDigit <= 5) {
    statusIndex = 2;
  } else if (lastDigit <= 7) {
    statusIndex = 3;
  } else {
    statusIndex = 4;
  }

  const statusLabel = STEPS[statusIndex].label;

  // Pick two distinct cities
  const cityA = pickFrom(CITIES, hash);
  const cityBIdx = (hash % CITIES.length + 1 + (hash >> 4) % 5) % CITIES.length;
  const cityB = CITIES[cityBIdx] !== cityA ? CITIES[cityBIdx] : CITIES[(cityBIdx + 1) % CITIES.length];

  // Transporter
  const firstName = pickFrom(FIRST_NAMES, hash >> 2);
  const lastName = pickFrom(LAST_NAMES, hash >> 5);
  const transporterName = `${firstName} ${lastName}`;

  // Rating between 4.0 and 5.0
  const ratingRaw = 4.0 + ((hash % 10) / 10);
  const rating = ratingRaw.toFixed(1);

  // Generate timeline dates working backwards from "today" (2026-04-12)
  // Base date: booking date = today minus (4 - statusIndex) * 1-2 days ago
  const baseMs = new Date("2026-04-12").getTime();
  const dayMs = 86400000;
  const bookingOffset = (4 + (hash % 3)) * dayMs; // 4-6 days ago
  const bookingDate = new Date(baseMs - bookingOffset);

  const stepDates: Date[] = [];
  stepDates.push(bookingDate); // step 0 date
  for (let i = 1; i < 5; i++) {
    const gap = (1 + (hash + i) % 2) * dayMs; // 1-2 days per step
    stepDates.push(new Date(stepDates[i - 1].getTime() + gap));
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });
  const fmtTime = (d: Date, offsetH: number) => {
    const nd = new Date(d.getTime() + offsetH * 3600000);
    const h = String(nd.getHours()).padStart(2, "0");
    const m = String(nd.getMinutes() + (hash % 30)).padStart(2, "0");
    return `${h}:${parseInt(m) > 59 ? String(parseInt(m) - 30).padStart(2, "0") : m}`;
  };

  const dates = stepDates.map((d, i) => `${fmt(d)} à ${fmtTime(d, i * 2 + 8)}`);

  // Estimated delivery = step 4 date
  const estimatedDelivery = fmt(stepDates[4]);

  // Weight
  const weights = ["0.5 kg", "1.2 kg", "2.5 kg", "4 kg", "7.5 kg", "12 kg", "18 kg"];
  const packageWeight = pickFrom(weights, hash >> 3);

  const packageType = pickFrom(PACKAGE_TYPES, hash >> 6);

  return {
    statusIndex,
    statusLabel,
    fromCity: cityA,
    toCity: cityB,
    transporterName,
    rating,
    dates,
    estimatedDelivery,
    packageWeight,
    packageType,
  };
}

function StarRating({ rating }: { rating: string }) {
  const val = parseFloat(rating);
  const full = Math.floor(val);
  const half = val - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= full ? "text-yellow-400" : star === full + 1 && half ? "text-yellow-300" : "text-dz-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-medium text-dz-gray-600">{rating}</span>
    </span>
  );
}

export default function SuiviPage() {
  const [inputValue, setInputValue] = useState("");
  const [searchedNumber, setSearchedNumber] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingStatus | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) {
      setError("Veuillez entrer un numéro de suivi.");
      return;
    }
    if (val.length < 4) {
      setError("Le numéro de suivi semble invalide. Vérifiez votre email de confirmation.");
      return;
    }
    setError("");
    setSearchedNumber(val);
    setTrackingData(generateTrackingData(val));
  };

  const statusColors = [
    "bg-dz-gray-200 text-dz-gray-500",   // En attente
    "bg-blue-100 text-blue-700",          // Récupéré
    "bg-yellow-100 text-yellow-700",      // En transit
    "bg-orange-100 text-orange-700",      // En livraison
    "bg-dz-green/10 text-dz-green",       // Livré
  ];

  const statusBadgeLabel = trackingData
    ? trackingData.statusIndex === 4
      ? "Livré"
      : trackingData.statusIndex === 3
      ? "En cours de livraison"
      : trackingData.statusIndex === 2
      ? "En transit"
      : trackingData.statusIndex === 1
      ? "Récupéré par le transporteur"
      : "En attente de récupération"
    : "";

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green to-dz-green-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Suivi en temps réel
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Suivez votre colis
          </h1>
          <p className="text-green-100 text-base md:text-lg max-w-xl mx-auto">
            Entrez votre numéro de suivi pour voir l&apos;état de votre livraison
          </p>
        </div>
      </section>

      {/* Search Box */}
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: DZ-2026-XXXX"
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
            <p className="mt-3 text-sm text-dz-red flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Tracking Result */}
      {trackingData && searchedNumber && (
        <section className="py-10 bg-white">
          <div className="max-w-3xl mx-auto px-4 space-y-6">

            {/* Header card */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-dz-gray-500 uppercase tracking-wider font-medium mb-1">Numéro de suivi</p>
                  <p className="text-xl font-bold text-dz-gray-800 font-mono tracking-wide">{searchedNumber.toUpperCase()}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold self-start sm:self-auto ${statusColors[trackingData.statusIndex]}`}>
                  <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
                  {statusBadgeLabel}
                </span>
              </div>

              {/* Route + meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-dz-gray-600">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    <span className="font-medium text-dz-gray-800">{trackingData.fromCity}</span>
                    <span className="mx-1 text-dz-gray-400">→</span>
                    <span className="font-medium text-dz-gray-800">{trackingData.toCity}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-dz-gray-600">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{trackingData.packageType} · {trackingData.packageWeight}</span>
                </div>
                <div className="flex items-center gap-2 text-dz-gray-600">
                  <svg className="w-4 h-4 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {trackingData.statusIndex < 4 ? (
                      <>Livraison prévue le <span className="font-medium text-dz-gray-800">{trackingData.estimatedDelivery}</span></>
                    ) : (
                      <>Livré le <span className="font-medium text-dz-green">{trackingData.dates[4]?.split(" à ")[0]}</span></>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-dz-gray-700 uppercase tracking-wider mb-6">Progression</h2>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-dz-gray-200 z-0" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-dz-green z-0 transition-all duration-700"
                  style={{ width: trackingData.statusIndex === 0 ? "0px" : `calc(${(trackingData.statusIndex / 4) * 100}% - 10px)` }}
                />
                <div className="relative z-10 flex justify-between">
                  {STEPS.map((step, i) => {
                    const done = i < trackingData.statusIndex;
                    const active = i === trackingData.statusIndex;
                    const future = i > trackingData.statusIndex;
                    return (
                      <div key={step.label} className="flex flex-col items-center gap-2" style={{ width: "20%" }}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all border-2
                            ${done ? "bg-dz-green border-dz-green text-white" : ""}
                            ${active ? "bg-white border-dz-green text-dz-green shadow-md shadow-dz-green/20 ring-4 ring-dz-green/10" : ""}
                            ${future ? "bg-white border-dz-gray-200 text-dz-gray-400" : ""}
                          `}
                        >
                          {done ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span>{step.icon}</span>
                          )}
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className={`text-xs font-semibold leading-tight ${active ? "text-dz-green" : done ? "text-dz-green-dark" : "text-dz-gray-400"}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-dz-gray-400 leading-tight mt-0.5">{step.sublabel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Mobile step labels */}
              <div className="flex justify-between mt-3 sm:hidden">
                {STEPS.map((step, i) => {
                  const done = i < trackingData.statusIndex;
                  const active = i === trackingData.statusIndex;
                  return (
                    <p key={step.label} className={`text-[10px] font-medium text-center w-[20%] leading-tight ${active ? "text-dz-green" : done ? "text-dz-green-dark" : "text-dz-gray-400"}`}>
                      {step.label}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-dz-gray-700 uppercase tracking-wider mb-5">Historique des événements</h2>
              <div className="space-y-0">
                {STEPS.slice(0, trackingData.statusIndex + 1)
                  .map((step, i) => {
                    const isLast = i === trackingData.statusIndex;
                    return (
                      <div key={step.label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${isLast ? "bg-dz-green ring-4 ring-dz-green/20" : "bg-dz-green-dark"}`} />
                          {i < trackingData.statusIndex && (
                            <div className="w-0.5 bg-dz-gray-200 flex-1 my-1" style={{ minHeight: "2rem" }} />
                          )}
                        </div>
                        <div className={`pb-5 ${i < trackingData.statusIndex ? "" : ""}`}>
                          <p className={`text-sm font-semibold ${isLast ? "text-dz-green" : "text-dz-gray-800"}`}>
                            {i === 0 && "Commande enregistrée — En attente de récupération"}
                            {i === 1 && `Colis récupéré à ${trackingData.fromCity}`}
                            {i === 2 && `En transit vers ${trackingData.toCity}`}
                            {i === 3 && `Colis en cours de livraison à ${trackingData.toCity}`}
                            {i === 4 && `Colis livré avec succès à ${trackingData.toCity}`}
                          </p>
                          <p className="text-xs text-dz-gray-400 mt-0.5">{trackingData.dates[i]}</p>
                        </div>
                      </div>
                    );
                  })
                  .reverse()}
              </div>
            </div>

            {/* Transporter info */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-dz-gray-700 uppercase tracking-wider mb-4">Transporteur assigné</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dz-green/10 rounded-full flex items-center justify-center text-dz-green font-bold text-lg shrink-0">
                  {trackingData.transporterName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dz-gray-800">{trackingData.transporterName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={trackingData.rating} />
                    <span className="text-xs text-dz-gray-400">· Profil vérifié</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-dz-green bg-dz-green/10 px-3 py-1.5 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Identité vérifiée
                </div>
              </div>
              {trackingData.statusIndex < 4 && (
                <div className="mt-4 pt-4 border-t border-dz-gray-100 flex items-center justify-between">
                  <div className="text-sm text-dz-gray-600">
                    <span className="font-medium text-dz-gray-800">Livraison estimée :</span>{" "}
                    {trackingData.estimatedDelivery}
                  </div>
                  <div className="text-xs text-dz-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mise à jour en temps réel
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* No tracking number section */}
      <section className={`py-14 ${trackingData ? "bg-dz-gray-50" : "bg-white"}`}>
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="bg-white border border-dz-gray-200 rounded-2xl p-7 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-dz-gray-800 text-base mb-1">Pas encore de numéro de suivi ?</h3>
              <p className="text-sm text-dz-gray-500 leading-relaxed mb-3">
                Votre numéro de suivi est envoyé automatiquement par email dès que vous confirmez une réservation avec un transporteur. Vérifiez votre boîte de réception et vos spams.
              </p>
              <Link
                href="/annonces"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-dz-green hover:text-dz-green-light transition-colors"
              >
                Parcourir les annonces
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* International tracking link */}
          <Link
            href="/suivi/international"
            className="flex items-center gap-4 bg-white border border-dz-gray-200 hover:border-dz-green/40 hover:shadow-md transition-all rounded-2xl p-5 group"
          >
            <div className="w-12 h-12 bg-dz-gray-800 text-white rounded-xl flex items-center justify-center text-xl shrink-0">✈️</div>
            <div className="flex-1">
              <p className="font-semibold text-dz-gray-800 text-sm">Suivi de colis international</p>
              <p className="text-xs text-dz-gray-500 mt-0.5">Algérie ↔ France · Espagne · Belgique · Allemagne · Italie</p>
            </div>
            <svg className="w-5 h-5 text-dz-gray-400 group-hover:text-dz-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Insurance info box */}
      <section className="pb-14 bg-dz-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gradient-to-r from-dz-green/5 to-dz-green/10 border border-dz-green/20 rounded-2xl p-7 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 bg-dz-green text-white rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-dz-green/10 text-dz-green rounded-full px-3 py-0.5 text-xs font-semibold mb-2">
                Protection incluse
              </div>
              <h3 className="font-semibold text-dz-gray-800 text-base mb-1">
                Votre colis est assuré par DZColis Protect
              </h3>
              <p className="text-sm text-dz-gray-500 leading-relaxed mb-3">
                Chaque envoi est couvert jusqu&apos;à 50 000 DA en cas de perte, dommage ou retard. Notre paiement séquestre garantit que votre argent n&apos;est libéré qu&apos;à la livraison confirmée.
              </p>
              <Link
                href="/assurance"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-dz-green hover:text-dz-green-light transition-colors"
              >
                En savoir plus sur DZColis Protect
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
