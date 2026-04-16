"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useListings } from "@/lib/context";
import type { Listing } from "@/lib/supabase/types";
import { ALGERIAN_CITIES } from "@/lib/data";

// ─── Transporter route card (trajet) ────────────────────────────────────────
function TrajetCard({ listing }: { listing: Listing }) {
  const isIntl   = listing.is_international ?? false;
  const currency = isIntl ? "€" : "DA";
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-dz-green/40 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isIntl ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
            {isIntl ? "✈️ International" : "🇩🇿 National"}
          </span>
          <span className="text-base font-bold text-dz-green">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-green rounded-full" />
            <span className="text-sm font-semibold text-dz-gray-800">{listing.from_city}</span>
          </div>
          <svg className="w-4 h-4 text-dz-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-red rounded-full" />
            <span className="text-sm font-semibold text-dz-gray-800">{listing.to_city}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-dz-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {listing.available_weight} kg disponible
          </span>
        </div>

        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-dz-gray-100">
          <p className="text-xs text-dz-gray-400">🛡️ Paiement sécurisé Waselli</p>
          <span className="bg-dz-green group-hover:bg-dz-green-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            Réserver
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Sender request card (demande) ───────────────────────────────────────────
function DemandeCard({ listing }: { listing: Listing }) {
  const isIntl   = listing.is_international ?? false;
  const currency = isIntl ? "€" : "DA";
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-amber-400/60 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">
            📦 Demande d&apos;envoi
          </span>
          <span className="text-base font-bold text-amber-600">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span className="text-sm font-semibold text-dz-gray-800">{listing.from_city}</span>
          </div>
          <svg className="w-4 h-4 text-dz-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-red rounded-full" />
            <span className="text-sm font-semibold text-dz-gray-800">{listing.to_city}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-dz-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Avant le {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {listing.available_weight} kg
          </span>
          {isIntl && (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              ✈️ International
            </span>
          )}
        </div>

        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-dz-gray-100">
          <p className="text-xs text-dz-gray-400">Budget : <span className="font-semibold text-dz-gray-700">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span></p>
          <span className="bg-amber-500 group-hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            Je transporte
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AnnoncesPage() {
  const { listings, listingsLoading } = useListings();
  const searchParams = useSearchParams();

  const [tab, setTab]         = useState<"trajets" | "demandes">(
    searchParams.get("tab") === "demandes" ? "demandes" : "trajets"
  );
  const [search, setSearch]   = useState(searchParams.get("q") ?? "");
  const [fromCity, setFrom]   = useState(searchParams.get("from") ?? "");
  const [toCity, setTo]       = useState(searchParams.get("to") ?? "");
  const [intlOnly, setIntl]   = useState(false);

  // Sync tab from URL param changes
  useEffect(() => {
    if (searchParams.get("tab") === "demandes") setTab("demandes");
  }, [searchParams]);

  const base = listings.filter((l) => {
    const type = (l as any).listing_type ?? "trajet";
    return tab === "trajets" ? type === "trajet" : type === "demande";
  });

  const filtered = base.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || l.from_city.toLowerCase().includes(q) || l.to_city.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchesFrom   = !fromCity || l.from_city.toLowerCase().includes(fromCity.toLowerCase());
    const matchesTo     = !toCity   || l.to_city.toLowerCase().includes(toCity.toLowerCase());
    const matchesIntl   = !intlOnly || l.is_international;
    return matchesSearch && matchesFrom && matchesTo && matchesIntl;
  });

  const trajetsCount  = listings.filter((l) => ((l as any).listing_type ?? "trajet") === "trajet").length;
  const demandesCount = listings.filter((l) => ((l as any).listing_type ?? "trajet") === "demande").length;

  return (
    <div className="bg-dz-gray-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-dz-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-dz-gray-800">Marketplace Waselli</h1>
          <p className="text-dz-gray-500 mt-1">Trouvez un transporteur ou proposez votre colis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-dz-gray-200 rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => setTab("trajets")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "trajets"
                ? "bg-dz-green text-white shadow-sm"
                : "text-dz-gray-600 hover:bg-dz-gray-50"
            }`}
          >
            🚗 Trajets disponibles
            {trajetsCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === "trajets" ? "bg-white/20 text-white" : "bg-dz-gray-100 text-dz-gray-600"}`}>
                {trajetsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("demandes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "demandes"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-dz-gray-600 hover:bg-dz-gray-50"
            }`}
          >
            📦 Demandes d&apos;envoi
            {demandesCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === "demandes" ? "bg-white/20 text-white" : "bg-dz-gray-100 text-dz-gray-600"}`}>
                {demandesCount}
              </span>
            )}
          </button>
        </div>

        {/* Context banner */}
        {tab === "trajets" ? (
          <div className="bg-dz-green/5 border border-dz-green/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl">🚗</span>
            <div>
              <p className="text-sm font-semibold text-dz-green">Vous voulez envoyer un colis ?</p>
              <p className="text-xs text-dz-gray-600">Choisissez un transporteur qui fait déjà votre trajet, réservez et payez en ligne.</p>
            </div>
            <Link href="/envoyer" className="ml-auto text-xs font-semibold text-dz-green hover:underline whitespace-nowrap">
              Publier ma demande →
            </Link>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="text-sm font-semibold text-amber-700">Vous êtes transporteur ?</p>
              <p className="text-xs text-dz-gray-600">Ces personnes attendent quelqu&apos;un qui fait leur trajet. Cliquez sur une demande pour proposer votre service.</p>
            </div>
            <Link href="/transporter" className="ml-auto text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap">
              Publier mon trajet →
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-dz-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text" placeholder="Recherche ville, description..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green"
          />
          <select value={fromCity} onChange={(e) => setFrom(e.target.value)}
            className="px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green text-dz-gray-700">
            <option value="">Ville de départ</option>
            {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={toCity} onChange={(e) => setTo(e.target.value)}
            className="px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green text-dz-gray-700">
            <option value="">Ville d&apos;arrivée</option>
            {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-dz-gray-600 cursor-pointer">
            <input type="checkbox" checked={intlOnly} onChange={(e) => setIntl(e.target.checked)} className="accent-dz-green" />
            International seulement
          </label>
        </div>

        {/* Results */}
        {listingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-dz-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-dz-gray-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-dz-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-dz-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-dz-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{tab === "trajets" ? "🚗" : "📦"}</div>
            <h3 className="text-xl font-semibold text-dz-gray-700 mb-2">
              {tab === "trajets" ? "Aucun trajet trouvé" : "Aucune demande trouvée"}
            </h3>
            <p className="text-dz-gray-500 mb-6">
              {tab === "trajets"
                ? "Aucun transporteur ne fait ce trajet pour l'instant."
                : "Aucune demande d'envoi pour ce trajet pour l'instant."}
            </p>
            <Link
              href={tab === "trajets" ? "/transporter" : "/envoyer"}
              className={`text-white px-6 py-3 rounded-xl font-medium transition-colors ${tab === "trajets" ? "bg-dz-green hover:bg-dz-green-light" : "bg-amber-500 hover:bg-amber-600"}`}
            >
              {tab === "trajets" ? "Proposer un trajet" : "Publier ma demande"}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-dz-gray-500 mb-4">
              {filtered.length} {tab === "trajets" ? "trajet" : "demande"}{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) =>
                tab === "trajets"
                  ? <TrajetCard key={l.id} listing={l} />
                  : <DemandeCard key={l.id} listing={l} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
