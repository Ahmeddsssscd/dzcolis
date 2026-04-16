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
  price_range?: string;
  phone?: string;
  contact_preference?: string;
  created_at: string;
}

const TRANSPORT_ICONS: Record<string, string> = {
  voiture: "🚗", moto: "🏍️", camionnette: "🚐", camion: "🚛", international: "✈️",
};
const TRANSPORT_LABELS: Record<string, string> = {
  voiture: "Voiture", moto: "Moto", camionnette: "Camionnette", camion: "Camion", international: "International",
};
const PRICE_LABELS: Record<string, string> = {
  moins_200: "Moins de 200 DA",
  "200_500": "200 – 500 DA",
  "500_1000": "500 – 1 000 DA",
  plus_1000: "Plus de 1 000 DA",
  negociable: "Prix à négocier",
};

function whatsappLink(phone: string) {
  const n = phone.replace(/\s/g, "").replace(/^0/, "213");
  return `https://wa.me/${n}?text=${encodeURIComponent("Bonjour, j'ai trouvé votre profil sur Waselli et je souhaite vous contacter pour une livraison.")}`;
}

export default function LivreurProfileClient({ id }: { id: string }) {
  const [data, setData]       = useState<LivreurData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    fetch(`/api/livreurs/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
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
      <div className="text-4xl">🔍</div>
      <p className="text-dz-gray-500 font-medium">Livreur introuvable.</p>
      <Link href="/livreurs" className="text-dz-green font-semibold hover:underline text-sm">← Retour à l&apos;annuaire</Link>
    </div>
  );

  const transport   = data.transport_type || "voiture";
  const initial     = (data.first_name[0] ?? "?").toUpperCase() + (data.last_name[0] ?? "").toUpperCase();
  const memberSince = new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const profileUrl  = `https://www.waselli.com/livreurs/${id}`;
  const price       = data.price_range ? PRICE_LABELS[data.price_range] : null;
  const prefersWA   = data.contact_preference === "whatsapp";
  const prefersCall = data.contact_preference === "appel";

  return (
    <div className="min-h-screen bg-dz-gray-50">
      <div className="bg-gradient-to-br from-dz-green to-dz-green-dark h-32" />

      <div className="max-w-3xl mx-auto px-4 -mt-16 pb-12 space-y-5">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-lg border border-dz-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-24 h-24 rounded-2xl bg-dz-green/10 flex items-center justify-center border-4 border-white shadow-md shrink-0">
              <span className="text-3xl font-black text-dz-green">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-dz-gray-900 mb-1">{data.first_name} {data.last_name[0]}.</h1>
              <p className="text-sm text-dz-gray-400 mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {data.wilaya || "Algérie"} · Membre depuis {memberSince}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-dz-green/10 text-dz-green text-xs font-semibold px-3 py-1.5 rounded-full">
                  {TRANSPORT_ICONS[transport]} {TRANSPORT_LABELS[transport] ?? transport}
                </span>
                {price && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    💰 {price}
                  </span>
                )}
                {(prefersWA || prefersCall) && (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    prefersWA
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {prefersWA ? "💬 WhatsApp" : "📞 Appel"}
                  </span>
                )}
              </div>
            </div>
            <button onClick={copyLink}
              className="shrink-0 flex items-center gap-2 text-sm font-medium border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-600 hover:text-dz-green px-4 py-2.5 rounded-xl transition-colors">
              {copied ? "✓ Copié !" : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Partager
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bio */}
        {data.message && (
          <div className="bg-white rounded-2xl border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💬</span> À propos
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed italic border-l-2 border-dz-gray-200 pl-4">
              &ldquo;{data.message}&rdquo;
            </p>
          </div>
        )}

        {/* Contact card */}
        <div className="bg-white rounded-2xl border border-dz-gray-100 p-6">
          <h2 className="font-bold text-dz-gray-800 mb-1 flex items-center gap-2">
            <span className="text-lg">📬</span> Contacter ce livreur
          </h2>
          <p className="text-dz-gray-400 text-sm mb-5">
            {prefersWA  && "Ce livreur préfère être contacté via WhatsApp."}
            {prefersCall && "Ce livreur préfère être contacté par appel téléphonique."}
            {!prefersWA && !prefersCall && "Contactez ce livreur via la plateforme Waselli."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {data.phone && prefersWA && (
              <a href={whatsappLink(data.phone)} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold px-5 py-3.5 rounded-xl transition-colors text-sm shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contacter sur WhatsApp
              </a>
            )}
            {data.phone && prefersCall && (
              <a href={`tel:${data.phone.replace(/\s/g, "")}`}
                className="flex-1 flex items-center justify-center gap-2.5 bg-dz-green hover:bg-dz-green-light text-white font-bold px-5 py-3.5 rounded-xl transition-colors text-sm shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler ce livreur
              </a>
            )}
            {(!data.phone || (!prefersWA && !prefersCall)) && (
              <Link href="/envoyer"
                className="flex-1 flex items-center justify-center gap-2 bg-dz-green hover:bg-dz-green-light text-white font-bold px-5 py-3.5 rounded-xl transition-colors text-sm">
                Envoyer un colis
              </Link>
            )}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold px-4 py-3.5 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Partager
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link href="/livreurs" className="text-sm text-dz-gray-400 hover:text-dz-green transition-colors">
            ← Retour à l&apos;annuaire des livreurs
          </Link>
        </div>
      </div>
    </div>
  );
}
