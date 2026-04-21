"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALGERIAN_CITIES } from "@/lib/data";
import { useAuth } from "@/lib/context";
import PhoneInput from "@/components/PhoneInput";

interface Livreur {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  transport_type: string;
  message?: string;
  price_range?: string;
  is_available?: boolean;
  zones?: string;
  created_at: string;
}

const TRANSPORT_LABELS: Record<string, string> = {
  voiture: "Voiture", moto: "Moto", camionnette: "Camionnette",
  camion: "Camion", international: "International",
};

const TRANSPORT_FILTERS = [
  { value: "", label: "Tous les types" },
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "camion", label: "Camion" },
  { value: "international", label: "International" },
];

const TRANSPORT_TYPES = [
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "camion", label: "Camion" },
  { value: "international", label: "International" },
];

const PRICE_RANGES = [
  { value: "moins_200", label: "Moins de 200 DA" },
  { value: "200_500", label: "200 – 500 DA" },
  { value: "500_1000", label: "500 – 1 000 DA" },
  { value: "plus_1000", label: "Plus de 1 000 DA" },
  { value: "negociable", label: "Prix à négocier" },
];

function priceLabel(val?: string) {
  return PRICE_RANGES.find(p => p.value === val)?.label ?? null;
}

function parseZones(zones?: string): string[] {
  if (!zones) return [];
  return zones.split(",").map(z => z.trim()).filter(Boolean).slice(0, 4);
}

/* ── Icons ──────────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconPin = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const IconCamera = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconMail = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconWhatsApp = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const IconArrow = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/* ── Spinner ─────────────────────────────────────────────────────── */
const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/* ── Field wrapper ───────────────────────────────────────────────── */
const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">
      {label}{required && <span className="text-dz-red ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-dz-green/20 focus:border-dz-green transition-colors bg-white";

/* ── Apply modal ─────────────────────────────────────────────────── */
interface ApplyModalUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wilaya: string;
}

function ApplyModal({ onClose, prefill }: { onClose: () => void; prefill?: ApplyModalUser | null }) {
  const [form, setForm] = useState({
    first_name: prefill?.firstName ?? "",
    last_name:  prefill?.lastName  ?? "",
    email:      prefill?.email     ?? "",
    phone:      prefill?.phone     ?? "",
    wilaya:     prefill?.wilaya    ?? "",
    transport_type: "", price_range: "",
    contact_preference: "", zones: "", message: "", is_available: true,
  });
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function set(name: string, value: string | boolean) {
    setForm(p => ({ ...p, [name]: value }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    set(name, type === "checkbox" ? (e.target as HTMLInputElement).checked : value);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("Fichier trop grand — maximum 8 Mo."); return; }
    setVehiclePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehiclePhoto) { setError("Une photo du véhicule est requise."); return; }
    setSubmitting(true); setError("");
    try {
      // 1. Upload photo via server-side API (avoids browser CORS / Storage RLS issues)
      const fd = new FormData();
      fd.append("file", vehiclePhoto);
      const uploadRes = await fetch("/api/upload/vehicle-photo", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error || "Erreur lors de l'envoi de la photo.");
        setSubmitting(false);
        return;
      }
      const vehiclePhotoUrl = uploadData.url as string;

      // 2. Submit application with photo URL
      const res = await fetch("/api/courier-applications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicle_photo_url: vehiclePhotoUrl }),
      });
      if (res.ok) { setSuccess(true); }
      else { const d = await res.json().catch(() => ({})); setError(d.error || "Une erreur est survenue."); }
    } catch { setError("Erreur réseau — réessayez."); }
    finally { setSubmitting(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Candidature livreur</h2>
            <p className="text-xs text-slate-400 mt-0.5">Réponse de notre équipe sous 48 heures</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Candidature reçue</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">Notre équipe examinera votre dossier et vous contactera dans les 48 heures.</p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mb-6 text-left flex items-start gap-3 max-w-xs mx-auto">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vous pouvez suivre le statut de votre candidature depuis{" "}
                  <a href="/profil" className="text-dz-green font-semibold hover:underline">votre profil</a>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a href="/profil"
                  className="bg-dz-green hover:bg-dz-green-light text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors text-center">
                  Voir mon profil
                </a>
                <button onClick={onClose} className="border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Pre-filled notice */}
              {prefill && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3.5 py-2.5 text-xs text-blue-700">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations pré-remplies depuis votre compte Waselli
                </div>
              )}

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" required>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Votre prénom"
                    className={`${inputCls} ${prefill?.firstName ? "bg-slate-50 text-slate-500" : ""}`} />
                </Field>
                <Field label="Nom" required>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Votre nom"
                    className={`${inputCls} ${prefill?.lastName ? "bg-slate-50 text-slate-500" : ""}`} />
                </Field>
              </div>

              {/* Contact row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" required>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@exemple.com"
                    readOnly={!!prefill?.email}
                    className={`${inputCls} ${prefill?.email ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`} />
                </Field>
                <Field label="Téléphone" required>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    required
                  />
                </Field>
              </div>

              {/* Contact preference */}
              <Field label="Préférence de contact" required>
                <div className="grid grid-cols-2 gap-2.5 mt-0.5">
                  {[
                    { value: "whatsapp", label: "WhatsApp", sub: "Message" },
                    { value: "appel", label: "Appel téléphonique", sub: "Appel direct" },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      form.contact_preference === opt.value
                        ? "border-dz-green bg-dz-green/5 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <input type="radio" name="contact_preference" value={opt.value} checked={form.contact_preference === opt.value} onChange={handleChange} required className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${form.contact_preference === opt.value ? "border-dz-green bg-dz-green" : "border-slate-300"}`}>
                        {form.contact_preference === opt.value && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Field>

              {/* Wilaya + Transport */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Wilaya" required>
                  <select name="wilaya" value={form.wilaya} onChange={handleChange} required className={inputCls}>
                    <option value="">Sélectionner</option>
                    {ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Type de véhicule" required>
                  <select name="transport_type" value={form.transport_type} onChange={handleChange} required className={inputCls}>
                    <option value="">Sélectionner</option>
                    {TRANSPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Vehicle photo — wrap in <label> so the native file input
                  drives click + keyboard activation (space/enter). No
                  onClick/ref needed; a11y tree stays clean. */}
              <Field label="Photo du véhicule" required>
                <label
                  className={`relative block border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden group focus-within:ring-2 focus-within:ring-dz-green/30 ${
                    photoPreview ? "border-dz-green" : "border-slate-200 hover:border-dz-green/40"
                  }`}
                >
                  {photoPreview ? (
                    <div className="relative">
                      <Image
                        src={photoPreview}
                        alt="Aperçu du véhicule"
                        width={600}
                        height={160}
                        unoptimized
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium bg-slate-900/60 px-3 py-1.5 rounded-full">Changer la photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-9 gap-2 text-slate-400">
                      <IconCamera />
                      <p className="text-sm font-medium mt-1">Cliquer pour ajouter une photo</p>
                      <p className="text-xs text-slate-300">JPG ou PNG, maximum 8 Mo</p>
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    aria-label="Téléverser une photo du véhicule"
                    className="sr-only"
                  />
                </label>
              </Field>

              {/* Zones */}
              <Field label="Zones couvertes" hint="Séparez les villes par des virgules — ex : Alger, Blida, Tipaza">
                <input type="text" name="zones" value={form.zones} onChange={handleChange} placeholder="Alger, Blida, Tipaza" className={inputCls} />
              </Field>

              {/* Price */}
              <Field label="Tarif indicatif">
                <select name="price_range" value={form.price_range} onChange={handleChange} className={inputCls}>
                  <option value="">Sélectionner une fourchette</option>
                  {PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>

              {/* Message */}
              <Field label="À propos de vous">
                <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="Expérience, disponibilités, type de colis acceptés..."
                  className={`${inputCls} resize-none`} />
              </Field>

              {/* Availability toggle — the <label> wraps the real checkbox
                  so click + keyboard (space) work natively. The visual
                  pill is purely presentational. */}
              <label className="flex items-center gap-3.5 py-3 px-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-dz-green/30">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className={`w-9 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                    form.is_available ? "bg-dz-green" : "bg-slate-200"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.is_available ? "translate-x-4" : "translate-x-0.5"}`} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">Disponible immédiatement</p>
                  <p className="text-xs text-slate-400">Votre profil s&apos;affiche en tête avec l&apos;indicateur de disponibilité</p>
                </div>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? <><Spinner /> Envoi en cours…</> : "Soumettre ma candidature"}
              </button>
              <p className="text-center text-[11px] text-slate-400">
                En soumettant, vous acceptez que Waselli vous contacte par email ou téléphone.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function LivreursPage() {
  const { user, authLoading } = useAuth();
  const [livreurs, setLivreurs]     = useState<Livreur[]>([]);
  const [loading, setLoading]       = useState(true);
  const [wilaya, setWilaya]         = useState("");
  const [search, setSearch]         = useState("");
  const [transportFilter, setTrans] = useState("");
  const [availableOnly, setAvail]   = useState(false);
  const [showApply, setShowApply]   = useState(false);
  const closeApply = useCallback(() => setShowApply(false), []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (wilaya) params.set("wilaya", wilaya);
    if (availableOnly) params.set("available", "1");
    fetch(`/api/livreurs${params.toString() ? "?" + params : ""}`)
      .then(r => r.json())
      .then(d => { setLivreurs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [wilaya, availableOnly]);

  const filtered = livreurs.filter(l => {
    const name = `${l.first_name} ${l.last_name}`.toLowerCase();
    const ms = !search || name.includes(search.toLowerCase()) || l.wilaya?.toLowerCase().includes(search.toLowerCase());
    const mt = !transportFilter || l.transport_type === transportFilter;
    return ms && mt;
  });

  const availCount = livreurs.filter(l => l.is_available !== false).length;
  const hasFilters = !!(search || wilaya || transportFilter || availableOnly);

  return (
    <div className="min-h-screen bg-slate-50">
      {showApply && (
        <ApplyModal
          onClose={closeApply}
          prefill={!authLoading && user ? {
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            phone:     user.phone,
            wilaya:    user.wilaya,
          } : null}
        />
      )}

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-slate-400 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-dz-green rounded-full" />
              Réseau de livreurs certifiés
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              Trouvez un livreur<br className="hidden md:block" /> de confiance
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto mb-10">
              Des professionnels vérifiés dans toute l&apos;Algérie — disponibles, fiables et réactifs.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Nom, wilaya…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 placeholder:text-slate-400 shadow-lg"
                />
              </div>
              <select
                value={wilaya}
                onChange={e => setWilaya(e.target.value)}
                className="px-4 py-3 bg-white text-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 min-w-[160px] shadow-lg"
              >
                <option value="">Toutes les wilayas</option>
                {ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {TRANSPORT_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTrans(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                transportFilter === f.value
                  ? "bg-dz-green text-white border-dz-green"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
              }`}>
              {f.label}
            </button>
          ))}
          <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />
          <button
            onClick={() => setAvail(v => !v)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              availableOnly
                ? "bg-dz-green text-white border-dz-green"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            }`}>
            <span className={`w-2 h-2 rounded-full transition-colors ${availableOnly ? "bg-white" : "bg-dz-green-light"}`} />
            Disponibles maintenant
            {!availableOnly && availCount > 0 && (
              <span className="text-[11px] font-semibold bg-dz-green/10 text-dz-green border border-dz-green/20 px-1.5 py-0.5 rounded-full">{availCount}</span>
            )}
          </button>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading ? "Chargement…" : (
              <>{filtered.length} <span className="text-slate-400">livreur{filtered.length !== 1 ? "s" : ""}{wilaya ? ` à ${wilaya}` : ""}</span></>
            )}
          </p>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setWilaya(""); setTrans(""); setAvail(false); }}
              className="text-xs text-slate-400 hover:text-dz-green transition-colors">
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-2">
              {!livreurs.length && !hasFilters ? "Aucun livreur pour le moment" : "Aucun résultat"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {!livreurs.length && !hasFilters ? "Soyez le premier à rejoindre notre réseau." : "Modifiez vos critères de recherche."}
            </p>
            {!livreurs.length && !hasFilters && (
              <button onClick={() => setShowApply(true)}
                className="bg-dz-green hover:bg-dz-green-light text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                Devenir livreur
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(livreur => {
              const initial = (livreur.first_name[0] ?? "?").toUpperCase() + (livreur.last_name[0] ?? "").toUpperCase();
              const year    = new Date(livreur.created_at).getFullYear();
              const price   = priceLabel(livreur.price_range);
              const zones   = parseZones(livreur.zones);
              const isAvail = livreur.is_available !== false;

              return (
                <Link key={livreur.id} href={`/livreurs/${livreur.id}`}
                  className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md hover:border-slate-200 transition-all duration-200 block group">

                  <div className="flex items-start gap-3.5 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-dz-green/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-dz-green">{initial}</span>
                      </div>
                      {isAvail && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm group-hover:text-dz-green transition-colors truncate">
                        {livreur.first_name} {livreur.last_name[0]}.
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <IconPin className="w-3 h-3 shrink-0" />
                        {livreur.wilaya || "Algérie"}
                      </p>
                    </div>

                    {/* Transport badge */}
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                      {TRANSPORT_LABELS[livreur.transport_type] ?? livreur.transport_type}
                    </span>
                  </div>

                  {/* Tags row */}
                  {(price || zones.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {price && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          {price}
                        </span>
                      )}
                      {zones.map((z, i) => (
                        <span key={i} className="text-[11px] font-medium text-dz-green bg-dz-green/5 border border-dz-green/15 px-2 py-0.5 rounded-md">
                          {z}
                        </span>
                      ))}
                    </div>
                  )}

                  {livreur.message && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {livreur.message}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="text-[11px] text-slate-300">Depuis {year}</span>
                    <span className="text-xs font-medium text-dz-green flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Voir le profil <IconArrow />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Livreur CTA ── */}
        <div className="mt-14 rounded-2xl p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Rejoignez le réseau Waselli</h3>
              <p className="text-slate-400 text-sm">Inscription gratuite — réponse sous 48 heures.</p>
            </div>
            <button onClick={() => setShowApply(true)}
              className="shrink-0 inline-flex items-center gap-2 bg-dz-green hover:bg-dz-green-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              <IconPlus />
              Postuler maintenant
            </button>
          </div>
        </div>

        {/* ── Professionals CTA ── */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Vous êtes un professionnel ?</h3>
            <p className="text-slate-500 text-sm">Restaurant, boutique, entreprise — contactez-nous pour une solution dédiée.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="mailto:pro@waselli.com"
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
              <IconMail /> Email
            </a>
            <a href="https://wa.me/213000000000?text=Bonjour%2C+je+suis+un+professionnel+int%C3%A9ress%C3%A9+par+les+services+Waselli+pro."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
              <IconWhatsApp /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modal-in {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-enter { animation: modal-in 0.22s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </div>
  );
}
