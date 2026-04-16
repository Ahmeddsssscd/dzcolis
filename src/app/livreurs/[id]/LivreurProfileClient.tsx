"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LivreurData {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  transport_type: string;
  message?: string;
  created_at: string;
}

const TRANSPORT_ICONS: Record<string, string> = {
  voiture: "🚗",
  moto: "🏍️",
  camionnette: "🚐",
  camion: "🚛",
  avion: "✈️",
  international: "✈️",
};

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

  const initial = (data.first_name[0] ?? "?") + (data.last_name[0] ?? "");
  const memberSince = new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const profileUrl = `https://www.waselli.com/livreurs/${id}`;
  const transport = data.transport_type || "voiture";

  return (
    <div className="min-h-screen bg-dz-gray-50">

      {/* ── Banner ── */}
      <div className="bg-gradient-to-br from-dz-green to-dz-green-dark h-32" />

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-12">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-dz-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-dz-green/10 flex items-center justify-center border-4 border-white shadow-md shrink-0">
              <span className="text-3xl font-black text-dz-green">{initial}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-dz-gray-900 mb-1">
                {data.first_name} {data.last_name[0]}.
              </h1>

              <p className="text-sm text-dz-gray-400 mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {data.wilaya || "Algérie"} · Membre depuis {memberSince}
              </p>

              {/* Transport type badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-dz-green/10 text-dz-green text-sm font-semibold px-3 py-1.5 rounded-full">
                  <span>{TRANSPORT_ICONS[transport] ?? "🚗"}</span>
                  <span className="capitalize">{transport}</span>
                </span>
              </div>
            </div>

            {/* Share buttons */}
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

        {/* ── Bio / Message section ── */}
        {data.message && (
          <div className="bg-white rounded-2xl border border-dz-gray-100 p-6 mb-6">
            <h2 className="font-bold text-dz-gray-800 text-lg mb-3">À propos</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed italic">
              &ldquo;{data.message}&rdquo;
            </p>
          </div>
        )}

        {/* ── Contact section ── */}
        <div className="bg-white rounded-2xl border border-dz-gray-100 p-6 mb-6">
          <h2 className="font-bold text-dz-gray-800 text-lg mb-3">Contacter ce transporteur</h2>
          <p className="text-dz-gray-500 text-sm mb-4">
            Intéressé(e) ? Contactez ce transporteur via Waselli pour organiser votre envoi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/envoyer"
              className="inline-flex items-center justify-center gap-2 bg-dz-green hover:bg-dz-green-light text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-700 hover:text-dz-green font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Créer un compte
            </Link>
          </div>
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
