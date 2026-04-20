"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useListings } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import type { Listing } from "@/lib/supabase/types";
import { ALGERIAN_CITIES } from "@/lib/data";

function TrajetCard({ listing }: { listing: Listing }) {
  const { t } = useI18n();
  const isIntl   = listing.is_international ?? false;
  const currency = isIntl ? "€" : "DA";
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-dz-green/40 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-fit ${isIntl ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-dz-green"}`}>
            {isIntl
              ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> International</>
              : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> National</>
            }
          </span>
          <span className="text-base font-bold text-dz-green">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span>
        </div>
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
            {listing.available_weight} {t("annonces_kg_available")}
          </span>
        </div>
        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-dz-gray-100">
          <p className="text-xs text-dz-gray-400 flex items-center gap-1"><svg className="w-3.5 h-3.5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> {t("annonces_secure_payment")}</p>
          <span className="bg-dz-green group-hover:bg-dz-green-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            {t("annonces_reserve")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function DemandeCard({ listing }: { listing: Listing }) {
  const { t } = useI18n();
  const isIntl   = listing.is_international ?? false;
  const currency = isIntl ? "€" : "DA";
  return (
    <Link href={`/annonces/${listing.id}`} className="block bg-white rounded-2xl border border-dz-gray-200 hover:border-amber-400/60 hover:shadow-lg transition-all overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1 w-fit">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            {t("annonces_request_label")}
          </span>
          <span className="text-base font-bold text-amber-600">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span>
        </div>
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
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-dz-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t("annonces_before")} {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            {listing.available_weight} kg
          </span>
          {isIntl && <span className="text-purple-600 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> International</span>}
        </div>
        <p className="text-sm text-dz-gray-500 line-clamp-2 mb-4">{listing.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-dz-gray-100">
          <p className="text-xs text-dz-gray-400">{t("annonces_budget")} : <span className="font-semibold text-dz-gray-700">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</span></p>
          <span className="bg-amber-500 group-hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            {t("annonces_i_transport")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AnnoncesPage() {
  const { listings, listingsLoading } = useListings();
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const [tab, setTab]       = useState<"trajets" | "demandes">(searchParams.get("tab") === "demandes" ? "demandes" : "trajets");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [fromCity, setFrom] = useState(searchParams.get("from") ?? "");
  const [toCity, setTo]     = useState(searchParams.get("to") ?? "");
  const [intlOnly, setIntl] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "demandes") setTab("demandes");
  }, [searchParams]);

  const base = listings.filter((l) => {
    const type = (l as any).listing_type ?? "trajet";
    return tab === "trajets" ? type === "trajet" : type === "demande";
  });

  const filtered = base.filter((l) => {
    const q = search.toLowerCase();
    return (
      (!q || l.from_city.toLowerCase().includes(q) || l.to_city.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)) &&
      (!fromCity || l.from_city.toLowerCase().includes(fromCity.toLowerCase())) &&
      (!toCity   || l.to_city.toLowerCase().includes(toCity.toLowerCase())) &&
      (!intlOnly || l.is_international)
    );
  });

  const trajetsCount  = listings.filter((l) => ((l as any).listing_type ?? "trajet") === "trajet").length;
  const demandesCount = listings.filter((l) => ((l as any).listing_type ?? "trajet") === "demande").length;

  const plural = filtered.length > 1 ? t("annonces_results_plural") : "";
  const resultLabel = tab === "trajets"
    ? `${filtered.length} ${t("annonces_results_trajets")}${plural} ${t("annonces_results_found")}${plural}`
    : `${filtered.length} ${t("annonces_results_demandes")}${plural} ${t("annonces_results_found")}${plural}`;

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="bg-white border-b border-dz-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-dz-gray-800">{t("annonces_title")}</h1>
          <p className="text-dz-gray-500 mt-1">{t("annonces_subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-dz-gray-200 rounded-2xl p-1.5 w-fit">
          <button onClick={() => setTab("trajets")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "trajets" ? "bg-dz-green text-white shadow-sm" : "text-dz-gray-600 hover:bg-dz-gray-50"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            {t("annonces_tab_trajets")}
            {trajetsCount > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === "trajets" ? "bg-white/20 text-white" : "bg-dz-gray-100 text-dz-gray-600"}`}>{trajetsCount}</span>}
          </button>
          <button onClick={() => setTab("demandes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "demandes" ? "bg-amber-500 text-white shadow-sm" : "text-dz-gray-600 hover:bg-dz-gray-50"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            {t("annonces_tab_demandes")}
            {demandesCount > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === "demandes" ? "bg-white/20 text-white" : "bg-dz-gray-100 text-dz-gray-600"}`}>{demandesCount}</span>}
          </button>
        </div>

        {/* Context banner */}
        {tab === "trajets" ? (
          <div className="bg-dz-green/5 border border-dz-green/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            <div>
              <p className="text-sm font-semibold text-dz-green">{t("annonces_banner_sender_title")}</p>
              <p className="text-xs text-dz-gray-600">{t("annonces_banner_sender_desc")}</p>
            </div>
            <Link href="/envoyer" className="ml-auto text-xs font-semibold text-dz-green hover:underline whitespace-nowrap">{t("annonces_banner_sender_cta")}</Link>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <div>
              <p className="text-sm font-semibold text-amber-700">{t("annonces_banner_trans_title")}</p>
              <p className="text-xs text-dz-gray-600">{t("annonces_banner_trans_desc")}</p>
            </div>
            <Link href="/transporter" className="ml-auto text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap">{t("annonces_banner_trans_cta")}</Link>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-dz-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input type="text" placeholder={t("annonces_filter_search")} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green" />
          <select value={fromCity} onChange={(e) => setFrom(e.target.value)}
            className="px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green text-dz-gray-700">
            <option value="">{t("annonces_filter_from")}</option>
            {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={toCity} onChange={(e) => setTo(e.target.value)}
            className="px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:border-dz-green text-dz-gray-700">
            <option value="">{t("annonces_filter_to")}</option>
            {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-dz-gray-600 cursor-pointer">
            <input type="checkbox" checked={intlOnly} onChange={(e) => setIntl(e.target.checked)} className="accent-dz-green" />
            {t("annonces_filter_intl")}
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
            <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {tab === "trajets"
                ? <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                : <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              }
            </div>
            <h3 className="text-xl font-semibold text-dz-gray-700 mb-2">
              {tab === "trajets" ? t("annonces_empty_trajets") : t("annonces_empty_demandes")}
            </h3>
            <p className="text-dz-gray-500 mb-6">
              {tab === "trajets" ? t("annonces_empty_trajets_desc") : t("annonces_empty_demandes_desc")}
            </p>
            <Link href={tab === "trajets" ? "/transporter" : "/envoyer"}
              className={`text-white px-6 py-3 rounded-xl font-medium transition-colors ${tab === "trajets" ? "bg-dz-green hover:bg-dz-green-light" : "bg-amber-500 hover:bg-amber-600"}`}>
              {tab === "trajets" ? t("annonces_propose_trajet") : t("annonces_publish_demande")}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-dz-gray-500 mb-4">{resultLabel}</p>
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
