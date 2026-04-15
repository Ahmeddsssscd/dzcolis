"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { EUROPEAN_COUNTRIES } from "@/lib/data";
import { useListings } from "@/lib/context";

type Direction = "dz-eu" | "eu-dz";

const EU_CITIES = new Set(EUROPEAN_COUNTRIES.flatMap((c) => c.cities));

export default function InternationalPage() {
  const [direction, setDirection] = useState<Direction>("eu-dz");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { listings: contextListings } = useListings();

  const filteredListings = useMemo(() => {
    return contextListings.filter((l) => {
      if (!l.is_international) return false;

      const fromEU = EU_CITIES.has(l.from_city);
      const toEU   = EU_CITIES.has(l.to_city);
      if (direction === "eu-dz" && !fromEU) return false;
      if (direction === "dz-eu" && !toEU)   return false;

      if (selectedCountry) {
        const country = EUROPEAN_COUNTRIES.find((c) => c.code === selectedCountry);
        if (country) {
          const cityMatch = country.cities.includes(l.from_city) || country.cities.includes(l.to_city);
          if (!cityMatch) return false;
        }
      }
      return true;
    });
  }, [contextListings, direction, selectedCountry]);

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              Service international disponible
            </div>
            <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
              <span className="text-5xl">🇩🇿</span>
              <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="flex gap-2">
                {EUROPEAN_COUNTRIES.map((c) => (
                  <span key={c.code} className="text-4xl">{c.flag}</span>
                ))}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Envoyez entre l&apos;Algérie
              <br />
              <span className="text-green-300">et l&apos;Europe</span>
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Trouvez des transporteurs vérifiés qui font régulièrement le trajet entre
              l&apos;Algérie et la France, l&apos;Espagne, la Belgique, l&apos;Allemagne et l&apos;Italie.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Direction Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-dz-gray-200 rounded-2xl p-1.5 flex gap-1 shadow-sm">
            <button
              onClick={() => { setDirection("eu-dz"); setSelectedCountry(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                direction === "eu-dz"
                  ? "bg-dz-green text-white shadow-sm"
                  : "text-dz-gray-600 hover:bg-dz-gray-50"
              }`}
            >
              <span>🌍</span> Europe → <span>🇩🇿</span> Algérie
            </button>
            <button
              onClick={() => { setDirection("dz-eu"); setSelectedCountry(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                direction === "dz-eu"
                  ? "bg-dz-green text-white shadow-sm"
                  : "text-dz-gray-600 hover:bg-dz-gray-50"
              }`}
            >
              <span>🇩🇿</span> Algérie → <span>🌍</span> Europe
            </button>
          </div>
        </div>

        {/* Country Cards */}
        <div className="mb-8">
          <p className="text-center text-sm text-dz-gray-500 mb-4">Filtrer par pays</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCountry(null)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all ${
                selectedCountry === null
                  ? "border-dz-green bg-dz-green/5 text-dz-green"
                  : "border-dz-gray-200 bg-white text-dz-gray-600 hover:border-dz-green/30"
              }`}
            >
              Tous les pays
            </button>
            {EUROPEAN_COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code === selectedCountry ? null : country.code)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium text-sm transition-all ${
                  selectedCountry === country.code
                    ? "border-dz-green bg-dz-green/5 text-dz-green"
                    : "border-dz-gray-200 bg-white text-dz-gray-600 hover:border-dz-green/30"
                }`}
              >
                <span className="text-xl">{country.flag}</span>
                {country.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white border border-dz-gray-200 rounded-2xl p-6 flex items-center gap-4 hover:border-dz-green/30 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dz-gray-800">Voir les transporteurs</h3>
              <p className="text-sm text-dz-gray-500">Parcourez les transporteurs disponibles sur votre trajet</p>
            </div>
            <a href="#listings" className="text-dz-green font-medium text-sm whitespace-nowrap hover:underline">
              Voir ↓
            </a>
          </div>
          <Link
            href="/international/envoyer"
            className="bg-dz-green text-white rounded-2xl p-6 flex items-center gap-4 hover:bg-dz-green-light transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Publier votre colis</h3>
              <p className="text-sm text-green-200">Postez votre demande et recevez des offres</p>
            </div>
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Listings */}
        <div id="listings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-dz-gray-700">
              Transporteurs disponibles
              <span className="ml-2 text-sm font-normal text-dz-gray-400">
                ({filteredListings.length} résultat{filteredListings.length !== 1 ? "s" : ""})
              </span>
            </h2>
            <Link href="/international/envoyer" className="text-sm text-dz-green font-medium hover:underline">
              + Proposer un trajet
            </Link>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dz-gray-200">
              <div className="text-4xl mb-3">🚐</div>
              <p className="text-dz-gray-500 font-medium">Aucun transporteur disponible pour ce filtre</p>
              <p className="text-sm text-dz-gray-400 mt-1">Essayez un autre pays ou revenez plus tard</p>
              <Link href="/international/envoyer" className="inline-block mt-4 bg-dz-green text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-dz-green-light transition-colors">
                Proposer un trajet
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/annonces/${listing.id}`}
                  className="bg-white rounded-2xl border border-dz-gray-200 p-5 hover:border-dz-green/30 hover:shadow-md transition-all block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-dz-green/10 text-dz-green px-2.5 py-1 rounded-full font-medium">✈️ International</span>
                    <span className="text-lg font-bold text-dz-green">{listing.price_per_kg.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €/kg</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-dz-gray-500 mb-3">
                    <span className="font-medium text-dz-gray-700">{listing.from_city}</span>
                    <span>→</span>
                    <span className="font-medium text-dz-gray-700">{listing.to_city}</span>
                  </div>

                  <p className="text-xs text-dz-gray-500 leading-relaxed mb-4 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-dz-gray-100">
                    <p className="text-xs text-dz-gray-400">
                      {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{listing.available_weight} kg dispo
                    </p>
                    <span className="bg-dz-green text-white text-xs px-3 py-1.5 rounded-xl font-medium">Voir</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Become a transporter banner */}
        <div className="mt-12 bg-gradient-to-r from-dz-gray-800 to-dz-gray-700 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
              ✈️
            </div>
            <div>
              <h3 className="font-bold text-lg">Vous faites régulièrement le trajet Europe ↔ Algérie ?</h3>
              <p className="text-dz-gray-300 text-sm mt-1">
                Devenez transporteur international DZColis et gagnez de l&apos;argent sur vos trajets.
              </p>
            </div>
          </div>
          <Link
            href="/international/devenir-transporteur"
            className="bg-dz-green hover:bg-dz-green-light text-white px-7 py-3.5 rounded-xl font-semibold whitespace-nowrap transition-colors flex-shrink-0"
          >
            Postuler maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
