"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useListings } from "@/lib/context";
import { CATEGORIES, ALGERIAN_CITIES, type Listing } from "@/lib/data";

function ListingCard({ listing }: { listing: Listing }) {
  const isTrip = listing.type === "trip";
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-dz-green/30 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isTrip ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
            {isTrip ? "Transporteur" : "Colis à envoyer"}
          </span>
          <span className="text-lg font-bold text-dz-green">{listing.price.toLocaleString()} DA</span>
        </div>

        <h3 className="font-semibold text-dz-gray-800 mb-3 line-clamp-2">{listing.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-green rounded-full" />
            <span className="text-sm text-dz-gray-600">{listing.from}</span>
          </div>
          <svg className="w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-dz-red rounded-full" />
            <span className="text-sm text-dz-gray-600">{listing.to}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-xs text-dz-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(listing.date).toLocaleDateString("fr-DZ", { day: "numeric", month: "short" })}
          </span>
          {listing.weight && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {listing.weight}
            </span>
          )}
          {listing.category && <span className="bg-dz-gray-100 px-2 py-0.5 rounded-md">{listing.category}</span>}
        </div>

        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-dz-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center text-xs font-bold">
              {listing.user.avatar}
            </div>
            <div>
              <div className="text-sm font-medium text-dz-gray-800">{listing.user.name}</div>
              <div className="flex items-center gap-1 text-xs text-dz-gray-500">
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {listing.user.rating} ({listing.user.reviews} avis)
              </div>
            </div>
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
  const { listings } = useListings();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "shipment" | "trip">("all");
  const [category, setCategory] = useState("Tous");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  useEffect(() => {
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    if (f) setFromCity(f);
    if (t) setToCity(t);
  }, [searchParams]);

  const filtered = listings.filter((l) => {
    if (filter !== "all" && l.type !== filter) return false;
    if (category !== "Tous" && l.category !== category && l.type !== "trip") return false;
    if (fromCity && l.from !== fromCity) return false;
    if (toCity && l.to !== toCity) return false;
    return true;
  });

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="bg-white border-b border-dz-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dz-gray-800 mb-2">Annonces</h1>
          <p className="text-dz-gray-500">Trouvez un transporteur ou publiez votre demande d&apos;envoi</p>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex bg-dz-gray-100 rounded-xl p-1">
              {([["all", "Tous"], ["shipment", "Colis"], ["trip", "Transporteurs"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === key ? "bg-white text-dz-green shadow-sm" : "text-dz-gray-500 hover:text-dz-gray-700"}`}>
                  {label}
                </button>
              ))}
            </div>
            <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="px-3 py-2 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-700 focus:outline-none focus:ring-2 focus:ring-dz-green/30">
              <option value="">Ville de départ</option>
              {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={toCity} onChange={(e) => setToCity(e.target.value)} className="px-3 py-2 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-700 focus:outline-none focus:ring-2 focus:ring-dz-green/30">
              <option value="">Ville d&apos;arrivée</option>
              {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-700 focus:outline-none focus:ring-2 focus:ring-dz-green/30">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dz-gray-500">{filtered.length} annonce{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}</p>
          <Link href="/envoyer" className="bg-dz-green hover:bg-dz-green-light text-white text-sm px-5 py-2.5 rounded-xl font-medium transition-colors">
            + Publier une annonce
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-dz-gray-700 mb-2">Aucune annonce trouvée</h3>
            <p className="text-sm text-dz-gray-500">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
}
