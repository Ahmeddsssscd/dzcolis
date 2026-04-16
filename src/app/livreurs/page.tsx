"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ALGERIAN_CITIES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

interface Livreur {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  transport_type: string;
  message?: string;
  created_at: string;
}

const TRANSPORT_ICONS: Record<string, string> = {
  voiture:      "🚗",
  moto:         "🏍️",
  camionnette:  "🚐",
  camion:       "🚛",
  avion:        "✈️",
  international:"✈️",
};

const TRANSPORT_LABELS: Record<string, string> = {
  voiture:      "Voiture",
  moto:         "Moto",
  camionnette:  "Camionnette",
  camion:       "Camion",
  avion:        "International",
  international:"International",
};

const TRANSPORT_TYPES = [
  { value: "voiture",      label: "Voiture 🚗" },
  { value: "moto",         label: "Moto 🏍️" },
  { value: "camionnette",  label: "Camionnette 🚐" },
  { value: "camion",       label: "Camion 🚛" },
  { value: "international",label: "International ✈️" },
];

/* ─── Apply modal ──────────────────────────────────────────────── */

function ApplyModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    wilaya: "", transport_type: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/courier-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-dz-green to-dz-green-dark px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Devenir livreur</h2>
            <p className="text-blue-100 text-xs mt-0.5">Rejoignez le réseau Waselli · Réponse sous 48h</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-dz-gray-800 text-xl mb-2">Candidature envoyée !</h3>
              <p className="text-dz-gray-500 text-sm mb-6">
                Nous avons bien reçu votre demande.<br />Notre équipe vous contactera sous 48h.
              </p>
              <button
                onClick={onClose}
                className="bg-dz-green hover:bg-dz-green-light text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Prénom <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                    placeholder="Votre prénom"
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Nom <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                    placeholder="Votre nom"
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="votre@email.com"
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Téléphone <span className="text-red-400">*</span>
                  </label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="0555 000 000"
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Wilaya <span className="text-red-400">*</span>
                  </label>
                  <select name="wilaya" value={form.wilaya} onChange={handleChange} required
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors bg-white">
                    <option value="">Choisir...</option>
                    {ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                    Moyen <span className="text-red-400">*</span>
                  </label>
                  <select name="transport_type" value={form.transport_type} onChange={handleChange} required
                    className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors bg-white">
                    <option value="">Choisir...</option>
                    {TRANSPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5 uppercase tracking-wide">
                  À propos de vous <span className="text-dz-gray-400 font-normal normal-case">(optionnel)</span>
                </label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="Zones couvertes, disponibilités, expérience..."
                  className="w-full px-3.5 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/25 focus:border-dz-green transition-colors resize-none" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi en cours...
                  </>
                ) : "Soumettre ma candidature →"}
              </button>

              <p className="text-center text-xs text-dz-gray-400">
                En soumettant, vous acceptez que Waselli vous contacte par email ou téléphone.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */

export default function LivreursPage() {
  const { t } = useI18n();
  const [livreurs, setLivreurs]   = useState<Livreur[]>([]);
  const [loading, setLoading]     = useState(true);
  const [wilaya, setWilaya]       = useState("");
  const [search, setSearch]       = useState("");
  const [showApply, setShowApply] = useState(false);

  const closeApply = useCallback(() => setShowApply(false), []);

  useEffect(() => {
    setLoading(true);
    const url = wilaya ? `/api/livreurs?wilaya=${encodeURIComponent(wilaya)}` : "/api/livreurs";
    fetch(url)
      .then(r => r.json())
      .then(data => { setLivreurs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [wilaya]);

  const filtered = livreurs.filter(l => {
    if (!search) return true;
    const name = `${l.first_name} ${l.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || l.wilaya?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-dz-gray-50">

      {/* ── Modal ── */}
      {showApply && <ApplyModal onClose={closeApply} />}

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-dz-green to-dz-green-dark text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Annuaire des livreurs
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Trouvez votre livreur</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            Des livreurs vérifiés partout en Algérie — rapides, fiables, disponibles près de chez vous.
          </p>

          {/* Search + filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Rechercher un livreur..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-dz-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
            </div>
            <select value={wilaya} onChange={e => setWilaya(e.target.value)}
              className="px-4 py-3 rounded-xl text-dz-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white min-w-[160px]">
              <option value="">Toutes les wilayas</option>
              {ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dz-gray-500">
            {loading ? "Chargement..." : `${filtered.length} livreur${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
            {wilaya ? ` à ${wilaya}` : ""}
          </p>
          <div className="flex items-center gap-2 text-xs text-dz-gray-400">
            <span className="w-2 h-2 bg-dz-green rounded-full" />
            Triés par date d&apos;inscription
          </div>
        </div>

        {/* Grid */}
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
            <div className="text-5xl mb-4">{livreurs.length === 0 && !search && !wilaya ? "📋" : "🔍"}</div>
            <h3 className="text-lg font-semibold text-dz-gray-700 mb-2">
              {livreurs.length === 0 && !search && !wilaya
                ? "Aucun livreur disponible pour le moment"
                : "Aucun livreur trouvé"}
            </h3>
            <p className="text-dz-gray-400 text-sm mb-6">
              {livreurs.length === 0 && !search && !wilaya
                ? "Soyez le premier à rejoindre notre réseau de livreurs !"
                : "Essayez une autre wilaya ou supprimez le filtre."}
            </p>
            {(search || wilaya) && (
              <button onClick={() => { setWilaya(""); setSearch(""); }}
                className="text-dz-green font-medium text-sm hover:underline mr-4">
                Voir tous les livreurs
              </button>
            )}
            <button onClick={() => setShowApply(true)}
              className="bg-dz-green hover:bg-dz-green-light text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Devenir livreur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(livreur => {
              const transport  = livreur.transport_type || "voiture";
              const initial    = (livreur.first_name[0] ?? "?").toUpperCase() + (livreur.last_name[0] ?? "").toUpperCase();
              const memberYear = new Date(livreur.created_at).getFullYear();

              return (
                <Link key={livreur.id} href={`/livreurs/${livreur.id}`}
                  className="bg-white rounded-2xl border border-dz-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 block group">

                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-dz-green/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-dz-green">{initial}</span>
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white rounded-full border border-dz-gray-100 flex items-center justify-center text-xs shadow-sm">
                        {TRANSPORT_ICONS[transport] ?? "🚗"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dz-gray-800 group-hover:text-dz-green transition-colors truncate">
                        {livreur.first_name} {livreur.last_name[0]}.
                      </h3>
                      <p className="text-xs text-dz-gray-400 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {livreur.wilaya || "Algérie"}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium bg-dz-gray-100 text-dz-gray-600 px-2 py-0.5 rounded-full">
                        {TRANSPORT_ICONS[transport]} {TRANSPORT_LABELS[transport] ?? transport}
                      </span>
                    </div>
                  </div>

                  {livreur.message && (
                    <p className="text-xs text-dz-gray-500 mb-3 line-clamp-2 italic border-l-2 border-dz-gray-200 pl-3">
                      {livreur.message}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-dz-gray-50">
                    <span className="text-xs text-dz-gray-400">Membre depuis {memberYear}</span>
                    <span className="text-xs font-semibold text-dz-green group-hover:underline">
                      Voir le profil →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-14 bg-gradient-to-br from-dz-green to-dz-green-dark rounded-2xl p-8 md:p-10 text-center text-white">
          <div className="text-3xl mb-3">🛵</div>
          <h3 className="text-2xl font-bold mb-2">Vous êtes livreur ?</h3>
          <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
            Rejoignez notre réseau, recevez des commandes directement et développez votre activité.
            Inscription gratuite, réponse sous 48h.
          </p>
          <button
            onClick={() => setShowApply(true)}
            className="inline-flex items-center gap-2 bg-white text-dz-green font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Postuler comme livreur
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>
    </div>
  );
}
