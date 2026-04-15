"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useListings } from "@/lib/context";
import type { Listing } from "@/lib/supabase/types";
import { ALGERIAN_CITIES } from "@/lib/data";

function ListingCard({ listing }: { listing: Listing }) {
  const isIntl     = listing.is_international ?? false;
  const currency   = isIntl ? "€" : "DA";
  const priceTotal = isIntl
    ? Math.round(listing.price_per_kg * listing.available_weight * 100) / 100
    : Math.round(listing.price_per_kg * listing.available_weight);
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-dz-green/30 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isIntl ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
            {isIntl ? "✈️ International" : "🇩🇿 National"}
          </span>
          <span className="text-lg font-bold text-dz-green">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-green rounded-full" />
            <span className="text-sm font-medium text-dz-gray-700">{listing.from_city}</span>
          </div>
          <svg className="w-4 h-4 text-dz-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-red rounded-full" />
            <span className="text-sm font-medium text-dz-gray-700">{listing.to_city}</span>
          </div>
        </div>

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
            {listing.available_weight} kg dispo
          </span>
        </div>

        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-dz-gray-100">
          <div className="text-xs text-dz-gray-400">
            Total estimé : <span className="font-semibold text-dz-gray-700">{priceTotal.toLocaleString("fr-FR")} {currency}</span>
          </div>
          <span className="bg-dz-green hover:bg-dz-green-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            Voir
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AnnoncesPage() {
  const { listings, listingsLoading } = useListings();
  const searchParams = useSearchParams();
  const [search, setSearch]   = useState(searchParams.get("q") ?? "");
  const [fromCity, setFrom]   = useState(searchParams.get("from") ?? "");
  const [toCity, setTo]       = useState(searchParams.get("to") ?? "");
  const [intlOnly, setIntl]   = useState(false);

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || l.from_city.toLowerCase().includes(q) || l.to_city.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchesFrom   = !fromCity || l.from_city.toLowerCase().includes(fromCity.toLowerCase());
    const matchesTo     = !toCity   || l.to_city.toLowerCase().includes(toCity.toLowerCase());
    const matchesIntl   = !intlOnly || l.is_international;
    return matchesSearch && matchesFrom && matchesTo && matchesIntl;
  });

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-dz-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-dz-gray-800">Annonces de transport</h1>
          <p className="text-dz-gray-500 mt-1">Trouvez un transporteur pour votre colis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-dz-gray-200 p-4 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text" placeholder="Recherche..." value={search} onChange={(e) => setSearch(e.target.value)}
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

        {/* Grid */}
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
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-dz-gray-700 mb-2">Aucune annonce trouvée</h3>
            <p className="text-dz-gray-500 mb-6">Essayez de modifier vos filtres ou revenez plus tard.</p>
            <Link href="/transporter" className="bg-dz-green text-white px-6 py-3 rounded-xl font-medium hover:bg-dz-green-light transition-colors">
              Proposer un trajet
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-dz-gray-500 mb-4">{filtered.length} annonce{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
