"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  available_weight: number;
  price_per_kg: number;
  is_international: boolean;
  status: string;
}

interface LivreurData {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  rating: number;
  review_count: number;
  kyc_status: string;
  avatar_url: string | null;
  created_at: string;
  listings: Listing[];
}

const BADGE_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  verified: { label: "Identité vérifiée", cls: "bg-green-100 text-green-700 border-green-200", icon: "✓" },
  top:      { label: "Top Livreur",       cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "⭐" },
  fast:     { label: "Livraison rapide",  cls: "bg-blue-100 text-blue-700 border-blue-200", icon: "⚡" },
  intl:     { label: "International",    cls: "bg-purple-100 text-purple-700 border-purple-200", icon: "✈️" },
};

function getBadges(l: LivreurData) {
  const b: string[] = [];
  if (l.kyc_status === "approved") b.push("verified");
  if (l.review_count >= 10 && l.rating >= 4.5) b.push("top");
  if (l.review_count >= 5 && l.rating >= 4.7) b.push("fast");
  if (l.listings?.some((li) => li.is_international)) b.push("intl");
  return b;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function LivreurProfileClient({ id }: { id: string }) {
  const [data, setData] = useState<LivreurData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/livreurs/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(`https://www.waselli.com/livreurs/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-dz-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-dz-gray-500">Livreur introuvable.</p>
      <Link href="/livreurs" className="text-dz-green font-medium hover:underline">← Retour à l&apos;annuaire</Link>
    </div>
  );

  const badges = getBadges(data);
  const initial = (data.first_name[0] ?? "?") + (data.last_name[0] ?? "");
  const memberSince = new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const activeListings = data.listings?.filter((l) => l.status === "active") ?? [];
  const profileUrl = `https://www.waselli.com/livreurs/${id}`;

  return (
    <div className="min-h-screen bg-dz-gray-50">

      {/* ── Banner ── */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 h-32" />

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-dz-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-dz-green/10 flex items-center justify-center border-4 border-white shadow-md shrink-0">
              {data.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatar_url} alt={data.first_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-dz-green">{initial}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-dz-gray-900">
                  {data.first_name} {data.last_name[0]}.
                </h1>
                {badges.includes("verified") && (
                  <span className="text-xs font-bold bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">✓ Identité vérifiée</span>
                )}
              </div>

              <p className="text-sm text-dz-gray-400 mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {data.wilaya || "Algérie"} · Membre depuis {memberSince}
              </p>

              <div className="flex items-center gap-3 mb-3">
                <Stars rating={data.rating} />
                <span className="text-sm font-semibold text-dz-gray-700">
                  {data.review_count > 0 ? `${data.rating.toFixed(1)} · ${data.review_count} avis` : "Nouveau livreur"}
                </span>
              </div>

              {/* Other badges */}
              <div className="flex flex-wrap gap-2">
                {badges.filter(b => b !== "verified").map((b) => {
                  const conf = BADGE_CONFIG[b];
                  return (
                    <span key={b} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${conf.cls}`}>
                      {conf.icon} {conf.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Share button */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-sm font-semibold border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-700 hover:text-dz-green px-4 py-2.5 rounded-xl transition-colors"
              >
                {copied ? (
                  <>✓ Lien copié</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager le profil
                  </>
                )}
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Partager sur Facebook
              </a>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Livraisons", value: data.review_count > 0 ? data.review_count : "—" },
            { label: "Note", value: data.review_count > 0 ? `${data.rating.toFixed(1)}/5` : "—" },
            { label: "Annonces actives", value: activeListings.length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-dz-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-dz-gray-800">{s.value}</p>
              <p className="text-xs text-dz-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Active listings ── */}
        <div className="bg-white rounded-2xl border border-dz-gray-100 p-6">
          <h2 className="font-bold text-dz-gray-800 text-lg mb-4">
            Trajets disponibles
            {activeListings.length > 0 && (
              <span className="ml-2 text-sm font-normal text-dz-gray-400">({activeListings.length})</span>
            )}
          </h2>

          {activeListings.length === 0 ? (
            <p className="text-dz-gray-400 text-sm italic py-4 text-center">
              Aucun trajet actif pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {activeListings.map((l) => (
                <Link
                  key={l.id}
                  href={`/annonces/${l.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{l.is_international ? "✈️" : "🚗"}</span>
                    <div>
                      <p className="font-semibold text-dz-gray-800 text-sm group-hover:text-dz-green transition-colors">
                        {l.from_city} → {l.to_city}
                      </p>
                      <p className="text-xs text-dz-gray-400 mt-0.5">
                        {new Date(l.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" · "}{l.available_weight} kg disponibles
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-dz-green text-sm">
                    {l.price_per_kg.toLocaleString("fr-FR")} {l.is_international ? "€" : "DA"}/kg
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/livreurs" className="text-sm text-dz-gray-400 hover:text-dz-green transition-colors">
            ← Retour à l&apos;annuaire des livreurs
          </Link>
        </div>
      </div>
    </div>
  );
}
