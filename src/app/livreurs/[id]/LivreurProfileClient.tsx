"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  is_available?: boolean;
  zones?: string;
  vehicle_photo_url?: string;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
  is_verified_user: boolean;
  created_at: string;
}

const TRANSPORT_LABELS: Record<string, string> = {
  voiture: "Voiture", moto: "Moto", camionnette: "Camionnette",
  camion: "Camion", international: "International",
};
const PRICE_LABELS: Record<string, string> = {
  moins_200: "Moins de 200 DA", "200_500": "200 – 500 DA",
  "500_1000": "500 – 1 000 DA", plus_1000: "Plus de 1 000 DA",
  negociable: "Prix à négocier",
};

function whatsappUrl(phone: string) {
  const n = phone.replace(/\s/g, "").replace(/^0/, "213");
  return `https://wa.me/${n}?text=${encodeURIComponent("Bonjour, j'ai trouvé votre profil sur Waselli et je souhaite vous contacter pour une livraison.")}`;
}

function parseZones(z?: string) {
  return z ? z.split(",").map(s => s.trim()).filter(Boolean) : [];
}

/**
 * Vehicle photos — stored as a single text field for schema compatibility.
 * Carriers can paste one URL, or several separated by comma / pipe / newline.
 * A gallery appears automatically as soon as there are 2+ URLs.
 */
function parseVehiclePhotos(v?: string): string[] {
  if (!v) return [];
  return v
    .split(/[,|\n]/)
    .map(s => s.trim())
    .filter(s => /^https?:\/\//i.test(s));
}

function avg(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

/* ── SVG star ── */
function Star({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#e2e8f0"} strokeWidth="1.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ── Section card ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 ${className}`}>{children}</div>
  );
}

/* ── Section header ── */
function SectionHead({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">{label}</p>
  );
}

export default function LivreurProfileClient({ id }: { id: string }) {
  const [data, setData]     = useState<LivreurData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/livreurs/${id}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    fetch(`/api/livreurs/${id}/reviews`).then(r => r.json()).then(d => { if (Array.isArray(d)) setReviews(d); }).catch(() => {});
  }, [id]);

  // Close lightbox with Escape
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxIndex(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

  function copyLink() {
    navigator.clipboard.writeText(`https://www.waselli.com/livreurs/${id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-7 h-7 border-3 border-dz-green border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-sm text-slate-500 font-medium">Livreur introuvable.</p>
      <Link href="/livreurs" className="text-sm text-dz-green font-semibold hover:underline">Retour à l&apos;annuaire</Link>
    </div>
  );

  const transport  = data.transport_type || "voiture";
  const initial    = (data.first_name[0] ?? "?").toUpperCase() + (data.last_name[0] ?? "").toUpperCase();
  const since      = new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const profileUrl = `https://www.waselli.com/livreurs/${id}`;
  const price      = data.price_range ? PRICE_LABELS[data.price_range] : null;
  const prefersWA  = data.contact_preference === "whatsapp";
  const prefersCall= data.contact_preference === "appel";
  const isAvail    = data.is_available !== false;
  const zones      = parseZones(data.zones);
  const rating     = avg(reviews);
  const photos     = parseVehiclePhotos(data.vehicle_photo_url);
  const heroPhoto  = photos[0];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Vehicle photo as top banner — uses the first photo from the gallery.
          The full gallery (with thumbnails + lightbox) appears below in its
          own card when 2+ photos are on file. */}
      {heroPhoto ? (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative block w-full h-52 md:h-64 overflow-hidden bg-[#0f172a] text-left"
          aria-label="Agrandir la photo du véhicule"
        >
          <Image
            src={heroPhoto}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">
              {TRANSPORT_LABELS[transport] ?? transport}
            </span>
            {photos.length > 1 && (
              <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-md">
                {photos.length} photos
              </span>
            )}
          </div>
        </button>
      ) : (
        <div className="h-28 bg-[#0f172a]" />
      )}

      <div className="max-w-2xl mx-auto px-4 pb-14 -mt-12 space-y-4">

        {/* ── Profile header card ── */}
        <Card className="p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-dz-green/10 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-2xl font-black text-dz-green tracking-tight">{initial}</span>
              </div>
              {isAvail && (
                <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow border-2 border-white">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0" />
                  Disponible
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-0.5">
                {data.first_name} {data.last_name[0]}.
              </h1>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} filled={rating >= s} size={13} />)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">· {reviews.length} avis</span>
                </div>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {data.wilaya || "Algérie"} · Membre depuis {since}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-semibold text-dz-green bg-dz-green/8 border border-dz-green/20 px-2.5 py-1 rounded-md uppercase tracking-wide">
                  {TRANSPORT_LABELS[transport] ?? transport}
                </span>
                {price && (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                    {price}
                  </span>
                )}
                {prefersWA && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    WhatsApp
                  </span>
                )}
                {prefersCall && (
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    Appel direct
                  </span>
                )}
                {!isAvail && (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                    Indisponible
                  </span>
                )}
              </div>
            </div>

            {/* Share */}
            <button onClick={copyLink}
              className="self-start shrink-0 flex items-center gap-1.5 text-xs font-medium border border-slate-200 hover:border-dz-green/40 text-slate-500 hover:text-dz-green px-3.5 py-2 rounded-lg transition-colors">
              {copied ? (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copié</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Partager</>
              )}
            </button>
          </div>
        </Card>

        {/* ── Vehicle gallery ── */}
        {photos.length >= 2 && (
          <Card className="p-6">
            <SectionHead label="Photos du véhicule" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                  aria-label={`Agrandir la photo ${i + 1}`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Cliquez sur une photo pour l&apos;agrandir.</p>
          </Card>
        )}

        {/* ── Zones ── */}
        {zones.length > 0 && (
          <Card className="p-6">
            <SectionHead label="Zones couvertes" />
            <div className="flex flex-wrap gap-2">
              {zones.map((z, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-dz-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {z}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* ── Bio ── */}
        {data.message && (
          <Card className="p-6">
            <SectionHead label="À propos" />
            <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-dz-green/30 pl-4 italic">
              &ldquo;{data.message}&rdquo;
            </p>
          </Card>
        )}

        {/* ── Contact ── */}
        <Card className="p-6">
          <SectionHead label="Contacter ce livreur" />
          <p className="text-sm text-slate-500 mb-5 -mt-1">
            {prefersWA   && "Ce livreur préfère être contacté par WhatsApp."}
            {prefersCall && "Ce livreur préfère être contacté par appel téléphonique."}
            {!prefersWA && !prefersCall && "Contactez ce livreur pour votre prochaine livraison."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {data.phone && prefersWA && (
              <a href={whatsappUrl(data.phone)} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contacter sur WhatsApp
              </a>
            )}
            {data.phone && prefersCall && (
              <a href={`tel:${data.phone.replace(/\s/g, "")}`}
                className="flex-1 flex items-center justify-center gap-2.5 bg-dz-green hover:bg-dz-green-light text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler ce livreur
              </a>
            )}
            {(!data.phone || (!prefersWA && !prefersCall)) && (
              <Link href="/envoyer"
                className="flex-1 flex items-center justify-center gap-2 bg-dz-green hover:bg-dz-green-light text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm">
                Envoyer un colis
              </Link>
            )}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold px-4 py-3 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Partager
            </a>
          </div>
        </Card>

        {/* ── Reviews ── */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <SectionHead label="Avis clients" />
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 -mt-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} filled={rating >= s} size={15} />)}
                  </div>
                  <span className="text-base font-bold text-slate-800">{rating.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">· {reviews.length} avis</span>
                </div>
              )}
            </div>
          </div>

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-dz-green/8 flex items-center justify-center text-xs font-bold text-dz-green shrink-0">
                        {r.reviewer_name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{r.reviewer_name}</span>
                          {r.is_verified_user && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                              Livraison vérifiée
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} filled={r.rating >= s} size={11} />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 shrink-0">
                      {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-slate-500 leading-relaxed mt-2 pl-10">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center">
              <div className="flex justify-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} filled={false} size={18} />)}
              </div>
              <p className="text-sm text-slate-400">Aucun avis pour le moment.</p>
              <p className="text-xs text-slate-300 mt-0.5">Les avis apparaîtront ici après une livraison effectuée.</p>
            </div>
          )}
        </Card>

        <div className="text-center pt-2">
          <Link href="/livreurs" className="text-xs text-slate-400 hover:text-dz-green transition-colors">
            ← Retour à l&apos;annuaire des livreurs
          </Link>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Photo précédente"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Photo suivante"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightboxIndex]}
              alt=""
              width={1600}
              height={1200}
              sizes="90vw"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
            />
            {photos.length > 1 && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
                {lightboxIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
