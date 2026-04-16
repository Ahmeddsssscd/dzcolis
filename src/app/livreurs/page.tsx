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
        if (!Array.isArray(data)) { setLivreurs([]); setLoading(false); return; }
        setLivreurs(data);
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
      <div className="bg-gradient-to-br from-dz-green to-dz-green-dark text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm font-medium mb-3 uppercase tracking-widest">{t("livreurs_directory")}</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("livreurs_hero_title")}</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
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
            <h3 className="text-lg font-semibold text-dz-gray-700 mb-2">
              {livreurs.length === 0 && !search && !wilaya
                ? "Aucun transporteur approuvé pour le moment. Revenez bientôt !"
                : t("livreurs_none_title")}
            </h3>
            <p className="text-dz-gray-400 text-sm">{t("livreurs_none_desc")}</p>
            {(search || wilaya) && (
              <button onClick={() => { setWilaya(""); setSearch(""); }} className="mt-4 text-dz-green font-medium text-sm hover:underline">
                {t("livreurs_see_all")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((livreur) => {
              const transport = livreur.transport_type || "voiture";
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
                      <div className="w-14 h-14 rounded-xl bg-dz-green/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-dz-green">{initial}</span>
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
                      <p className="text-xs text-dz-gray-500 mt-1 flex items-center gap-1">
                        <span>{TRANSPORT_ICONS[transport] ?? "🚗"}</span>
                        <span className="capitalize">{transport}</span>
                      </p>
                    </div>
                  </div>

                  {/* Message preview */}
                  {livreur.message && (
                    <p className="text-xs text-dz-gray-500 mb-3 line-clamp-2 italic">
                      &ldquo;{livreur.message}&rdquo;
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-dz-gray-50">
                    <span className="text-xs text-dz-gray-400">{t("livreurs_member_since")} {memberYear}</span>
                    <span className="text-xs font-semibold text-dz-green group-hover:underline">
                      {t("livreurs_view_profile")} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Application form ── */}
        <ApplicationForm />

        {/* CTA to become transporter */}
        <div className="mt-8 bg-gradient-to-br from-dz-green to-dz-green-dark rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{t("livreurs_cta_title")}</h3>
          <p className="text-blue-100 text-sm mb-5">{t("livreurs_cta_subtitle")}</p>
          <Link href="/transporter" className="inline-block bg-white/10 text-white border border-white/20 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 hover:text-dz-green transition-colors text-sm">
            {t("livreurs_cta_btn")}
          </Link>
        </div>
      </div>
    </div>
  );
}

const TRANSPORT_TYPES = [
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "camionnette", label: "Camionnette" },
  { value: "camion", label: "Camion" },
  { value: "international", label: "International / Avion" },
];

function ApplicationForm() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    wilaya: "", transport_type: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
        setForm({ first_name: "", last_name: "", email: "", phone: "", wilaya: "", transport_type: "", message: "" });
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
    <div className="mt-14">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-dz-gray-200" />
        <h2 className="text-lg font-bold text-dz-gray-700 whitespace-nowrap px-2">
          Vous êtes transporteur ? Rejoignez notre réseau
        </h2>
        <div className="flex-1 h-px bg-dz-gray-200" />
      </div>

      <div className="bg-white rounded-2xl border border-dz-gray-100 p-8 shadow-sm max-w-2xl mx-auto">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-dz-green font-semibold text-lg">
              ✓ Candidature envoyée ! Nous vous contacterons sous 48h.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 text-dz-green text-sm font-medium hover:underline"
            >
              Soumettre une autre candidature
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="0555 000 000"
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Wilaya <span className="text-red-500">*</span>
                </label>
                <select
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors bg-white"
                >
                  <option value="">Sélectionner une wilaya</option>
                  {ALGERIAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                  Type de transport <span className="text-red-500">*</span>
                </label>
                <select
                  name="transport_type"
                  value={form.transport_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors bg-white"
                >
                  <option value="">Sélectionner un type</option>
                  {TRANSPORT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
                Message / Description <span className="text-dz-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Parlez-nous de votre expérience, vos zones de couverture, vos disponibilités..."
                className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                "Soumettre ma candidature"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
