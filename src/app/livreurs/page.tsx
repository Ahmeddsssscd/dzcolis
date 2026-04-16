"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ALGERIAN_CITIES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

interface Livreur {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  rating: number;
  review_count: number;
  kyc_status: string;
  avatar_url?: string | null;
  created_at: string;
  listings?: { is_international: boolean; listing_type?: string; status?: string }[];
}

const TRANSPORT_ICONS: Record<string, string> = {
  voiture: "🚗",
  moto: "🏍️",
  camion: "🚛",
  avion: "✈️",
  international: "✈️",
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-dz-gray-200 fill-dz-gray-200"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs text-dz-gray-500 ml-1">
        {count > 0 ? `${rating.toFixed(1)} (${count} ${t("livreurs_reviews")})` : t("livreurs_new")}
      </span>
    </div>
  );
}

function Badge({ type }: { type: string }) {
  const { t } = useI18n();
  const badges: Record<string, { label: string; cls: string }> = {
    verified: { label: t("livreurs_badge_verified"), cls: "bg-green-100 text-green-700 border-green-200" },
    top: { label: t("livreurs_badge_top"), cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    fast: { label: t("livreurs_badge_fast"), cls: "bg-blue-100 text-blue-700 border-blue-200" },
    international: { label: t("livreurs_badge_intl"), cls: "bg-purple-100 text-purple-700 border-purple-200" },
  };
  const b = badges[type];
  if (!b) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.cls}`}>
      {b.label}
    </span>
  );
}

function getLivreurBadges(livreur: Livreur) {
  const badges: string[] = [];
  if (livreur.kyc_status === "approved") badges.push("verified");
  if (livreur.review_count >= 10 && livreur.rating >= 4.5) badges.push("top");
  if (livreur.review_count >= 5 && livreur.rating >= 4.7) badges.push("fast");
  if (livreur.listings?.some((l) => l.is_international)) badges.push("international");
  return badges;
}

function getTransportType(livreur: Livreur): string {
  if (livreur.listings?.some((l) => l.is_international)) return "avion";
  return "voiture";
}

export default function LivreursPage() {
  const { t } = useI18n();
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState(true);
  const [wilaya, setWilaya] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = wilaya ? `/api/livreurs?wilaya=${encodeURIComponent(wilaya)}` : "/api/livreurs";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setLivreurs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wilaya]);

  const filtered = livreurs.filter((l) => {
    if (!search) return true;
    const name = `${l.first_name} ${l.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || l.wilaya?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-dz-gray-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-green-200 text-sm font-medium mb-3 uppercase tracking-widest">{t("livreurs_directory")}</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("livreurs_hero_title")}</h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto mb-8">
            {t("livreurs_hero_subtitle")}
          </p>

          {/* Search + filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t("livreurs_search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-dz-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="px-4 py-3 rounded-xl text-dz-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white min-w-[160px]"
            >
              <option value="">{t("livreurs_all_wilayas")}</option>
              {ALGERIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dz-gray-500">
            {loading
              ? t("livreurs_loading")
              : `${filtered.length} ${filtered.length !== 1 ? t("livreurs_found_plural") : t("livreurs_found_singular")}`}
            {wilaya ? ` ${t("livreurs_at")} ${wilaya}` : ""}
          </p>
          <div className="flex items-center gap-2 text-xs text-dz-gray-400">
            <span className="w-2 h-2 bg-dz-green rounded-full" />
            {t("livreurs_sorted_by_rating")}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-dz-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-dz-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dz-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-dz-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-dz-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-dz-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-dz-gray-700 mb-2">{t("livreurs_none_title")}</h3>
            <p className="text-dz-gray-400 text-sm">{t("livreurs_none_desc")}</p>
            <button onClick={() => { setWilaya(""); setSearch(""); }} className="mt-4 text-dz-green font-medium text-sm hover:underline">
              {t("livreurs_see_all")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((livreur) => {
              const badges = getLivreurBadges(livreur);
              const transport = getTransportType(livreur);
              const initial = (livreur.first_name[0] ?? "?") + (livreur.last_name[0] ?? "");
              const memberYear = new Date(livreur.created_at).getFullYear();

              return (
                <Link
                  key={livreur.id}
                  href={`/livreurs/${livreur.id}`}
                  className="bg-white rounded-2xl border border-dz-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 block group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-dz-green/10 flex items-center justify-center">
                        {livreur.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={livreur.avatar_url} alt={livreur.first_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-dz-green">{initial}</span>
                        )}
                      </div>
                      {/* Transport type badge */}
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white rounded-full border border-dz-gray-100 flex items-center justify-center text-xs shadow-sm">
                        {TRANSPORT_ICONS[transport] ?? "🚗"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dz-gray-800 group-hover:text-dz-green transition-colors truncate">
                        {livreur.first_name} {livreur.last_name[0]}.
                      </h3>
                      <p className="text-xs text-dz-gray-400 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {livreur.wilaya || "Algérie"}
                      </p>
                      <div className="mt-1.5">
                        <StarRating rating={livreur.rating} count={livreur.review_count} />
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {badges.map((b) => <Badge key={b} type={b} />)}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-dz-gray-50">
                    <span className="text-xs text-dz-gray-400">{t("livreurs_member_since")} {memberYear}</span>
                    <span className="text-xs font-semibold text-dz-green group-hover:underline">
                      {t("livreurs_view_profile")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA to become transporter */}
        <div className="mt-14 bg-gradient-to-br from-dz-green to-green-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{t("livreurs_cta_title")}</h3>
          <p className="text-green-100 text-sm mb-5">{t("livreurs_cta_subtitle")}</p>
          <Link href="/transporter" className="inline-block bg-white text-dz-green font-bold px-6 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-sm">
            {t("livreurs_cta_btn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
