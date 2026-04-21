"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useListings } from "@/lib/context";
import { useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import { ALGERIAN_CITIES } from "@/lib/data";

const TRANSPORT_LABELS: Record<string, string> = {
  voiture: "Voiture", moto: "Moto", camionnette: "Camionnette",
  camion: "Camion", international: "International",
};
const PRICE_LABELS: Record<string, string> = {
  moins_200: "Moins de 200 DA", "200_500": "200 – 500 DA",
  "500_1000": "500 – 1 000 DA", plus_1000: "Plus de 1 000 DA",
  negociable: "Prix à négocier",
};
const TRANSPORT_TYPES = [
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "camionnette", label: "Camionnette" },
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

interface CourierApplication {
  id: string;
  status: "pending" | "approved" | "rejected";
  transport_type: string;
  wilaya: string;
  price_range?: string;
  zones?: string;
  message?: string;
  phone?: string;
  contact_preference?: string;
  is_available: boolean;
  created_at: string;
}

export default function ProfilPage() {
  const { user, authLoading, updateUser, logout } = useAuth();
  const { listings } = useListings();
  const { addToast } = useToast();
  const { t } = useI18n();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Courier application management
  const [myApp, setMyApp]           = useState<CourierApplication | null | undefined>(undefined); // undefined = loading
  const [editingApp, setEditingApp] = useState(false);
  const [appForm, setAppForm]       = useState<Partial<CourierApplication>>({});
  const [savingApp, setSavingApp]   = useState(false);
  const [deletingApp, setDeletingApp] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/connexion"); return; }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setWilaya(user.wilaya);
    setPreviewUrl(user.avatarUrl);
    // Load courier application
    fetch("/api/courier-applications/mine")
      .then(async r => {
        if (r.status === 401) return null;
        if (!r.ok) return null;
        const d = await r.json();
        return d ?? null;
      })
      .then(d => setMyApp(d))
      .catch(() => setMyApp(null));
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast(t("profil_image_type_error"), "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast(t("profil_image_size_error"), "error");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadingPhoto(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("userId", user!.id);

      const res  = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'upload.");
      }

      await updateUser({ avatarUrl: data.url });
      setPreviewUrl(data.url);
      addToast(t("profil_photo_updated"), "success");
    } catch (err: unknown) {
      console.error("Avatar upload error:", err);
      setPreviewUrl(user?.avatarUrl ?? null);
      addToast(t("profil_photo_error"), "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Remove avatar ──────────────────────────────────────────────────────────
  async function handleRemoveAvatar() {
    setUploadingPhoto(true);
    try {
      await updateUser({ avatarUrl: null });
      setPreviewUrl(null);
      addToast(t("profil_photo_deleted"), "success");
    } catch {
      addToast(t("profil_photo_delete_error"), "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Save profile info ──────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({ firstName, lastName, phone, wilaya });
      addToast(t("profil_save_success"), "success");
    } catch {
      addToast(t("profil_save_error"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveApp(e: React.FormEvent) {
    e.preventDefault();
    setSavingApp(true);
    try {
      const res = await fetch("/api/courier-applications/mine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setMyApp(updated);
        setEditingApp(false);
        addToast("Annonce mise à jour.", "success");
      } else {
        addToast("Erreur lors de la mise à jour.", "error");
      }
    } catch { addToast("Erreur réseau.", "error"); }
    finally { setSavingApp(false); }
  }

  async function handleDeleteApp() {
    setDeletingApp(true);
    try {
      const res = await fetch("/api/courier-applications/mine", { method: "DELETE" });
      if (res.ok) {
        setMyApp(null);
        setConfirmDelete(false);
        addToast("Annonce supprimée.", "success");
      } else {
        addToast("Erreur lors de la suppression.", "error");
      }
    } catch { addToast("Erreur réseau.", "error"); }
    finally { setDeletingApp(false); }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long",
  });

  // Real activity summary pulled from the listings feed.
  const myListings   = listings.filter((l) => l.user_id === user.id);
  const myTrajets    = myListings.filter((l) => l.listing_type === "trajet").length;
  const myDemandes   = myListings.filter((l) => l.listing_type === "demande").length;
  const myActive     = myListings.filter((l) => l.status === "active").length;
  const myCompleted  = myListings.filter((l) => l.status === "completed").length;
  const latestListing = myListings[0]; // listings are ordered by created_at desc
  const latestListingDate = latestListing
    ? new Date(latestListing.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const hasReviews = user.reviews > 0;
  const score = hasReviews ? Math.min(100, 20 + user.rating * 10 + Math.min(user.reviews, 30)) : 0;
  const level = score >= 80 ? { label: t("profil_level_elite"), color: "text-dz-green", bg: "bg-green-100" }
    : score >= 60 ? { label: t("profil_level_expert"), color: "text-blue-600", bg: "bg-blue-100" }
    : score >= 40 ? { label: t("profil_level_confirmed"), color: "text-orange-600", bg: "bg-orange-100" }
    : { label: t("profil_level_beginner"), color: "text-dz-gray-500", bg: "bg-dz-gray-100" };

  const kycLabel =
    user.kycStatus === "approved" ? t("profil_kyc_approved") :
    user.kycStatus === "submitted" || user.kycStatus === "reviewing" ? t("profil_kyc_reviewing") :
    user.kycStatus === "rejected" ? t("profil_kyc_rejected") :
    t("profil_kyc_pending");

  return (
    <div className="min-h-screen bg-dz-gray-50">

      {/* ── Header banner ── */}
      <div className="relative text-white py-12 overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 flex items-center gap-6">

          {/* Avatar with upload overlay */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={t("profil_change_photo")}
                  width={96}
                  height={96}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-white">{user.avatar}</span>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-dz-gray-50 transition-colors border border-dz-gray-200"
              title={t("profil_change_photo")}
            >
              <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-slate-400 text-sm mt-0.5 truncate">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm bg-white/15 px-3 py-1 rounded-full">
                {hasReviews ? (
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{user.rating.toFixed(1)} · {user.reviews} {t("profil_reviews_received")}</span>
                ) : t("profil_no_reviews")}
              </span>
              <span className="text-slate-400 text-xs">{t("profil_member_since")} {memberSince}</span>
            </div>
            {/* Photo actions */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {uploadingPhoto ? t("profil_uploading") : t("profil_change_photo")}
              </button>
              {previewUrl && !uploadingPhoto && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs bg-white/10 hover:bg-red-500/40 text-white/80 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {t("profil_delete_photo")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-5">
            <h3 className="font-semibold text-dz-gray-900 mb-4 text-sm">{t("profil_activity")}</h3>

            {/* Top-line grid: real counts, not vanity. Dashes until the user has any activity. */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dz-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-dz-green">{myTrajets || "—"}</div>
                <div className="text-[11px] text-dz-gray-500 mt-0.5 leading-tight">{t("profil_my_trajets") || "Trajets proposés"}</div>
              </div>
              <div className="bg-dz-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{myDemandes || "—"}</div>
                <div className="text-[11px] text-dz-gray-500 mt-0.5 leading-tight">{t("profil_my_demandes") || "Colis à envoyer"}</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-dz-gray-500">{t("profil_active_listings") || "Annonces actives"}</span>
                <span className="font-semibold text-dz-gray-900">{myActive || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dz-gray-500">{t("profil_completed_listings") || "Annonces terminées"}</span>
                <span className="font-semibold text-dz-gray-900">{myCompleted || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dz-gray-500">{t("profil_avg_rating")}</span>
                <span className="font-semibold text-dz-gray-900">{hasReviews ? `${user.rating.toFixed(1)}/5` : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dz-gray-500">{t("profil_reviews_received")}</span>
                <span className="font-semibold text-dz-gray-900">{user.reviews > 0 ? user.reviews : "—"}</span>
              </div>
            </div>

            {latestListing && latestListingDate && (
              <div className="mt-4 pt-3 border-t border-dz-gray-100">
                <p className="text-[11px] text-dz-gray-400 mb-1">{t("profil_latest_activity") || "Dernière annonce"}</p>
                <p className="text-xs text-dz-gray-700 font-medium truncate">{latestListing.from_city} → {latestListing.to_city}</p>
                <p className="text-[11px] text-dz-gray-400">{latestListingDate}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-5">
            <h3 className="font-semibold text-dz-gray-900 mb-3 text-sm">{t("profil_trust_score")}</h3>
            {hasReviews ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>{level.label}</span>
                  <span className="text-sm font-bold text-dz-gray-900">{score}/100</span>
                </div>
                <div className="w-full bg-dz-gray-100 rounded-full h-2">
                  <div className="bg-dz-green h-2 rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
                </div>
              </>
            ) : (
              <p className="text-xs text-dz-gray-400 italic leading-relaxed">
                {t("profil_trust_no_reviews")}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-xl py-2.5 transition-colors"
          >
            {t("profil_logout_btn")}
          </button>
        </div>

        {/* ── Edit form ── */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-900 mb-6">{t("profil_edit_title")}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("profil_first_name")}</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("profil_last_name")}</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("profil_email")}</label>
              <input type="email" value={user.email} disabled
                className="w-full border border-dz-gray-100 bg-dz-gray-50 rounded-xl px-3 py-2.5 text-sm text-dz-gray-400 cursor-not-allowed" />
              <p className="text-xs text-dz-gray-400 mt-1">{t("profil_email_note")}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("profil_phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 5XX XXX XXX"
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("profil_wilaya")}</label>
              <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white">
                <option value="">{t("profil_select_wilaya")}</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving}
              className="bg-dz-green text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-dz-green-dark transition-colors disabled:opacity-60">
              {saving ? t("profil_saving") : t("profil_save_btn")}
            </button>
          </form>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-900 mb-4">{t("profil_security")}</h2>
            <div className="flex items-center justify-between py-3 border-b border-dz-gray-100">
              <div>
                <p className="text-sm font-medium text-dz-gray-900">{t("profil_password")}</p>
                <p className="text-xs text-dz-gray-400">{t("profil_password_note")}</p>
              </div>
              <button className="text-xs text-dz-green font-semibold hover:underline">{t("profil_password_change")}</button>
            </div>
            <div className="py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-dz-gray-900">{t("profil_kyc_title")}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  user.kycStatus === "approved" ? "bg-green-100 text-green-700" :
                  user.kycStatus === "submitted" || user.kycStatus === "reviewing" ? "bg-amber-100 text-amber-700" :
                  "bg-orange-100 text-orange-600"
                }`}>{kycLabel}</span>
              </div>

              {/* Pending/reviewing — prominent amber banner */}
              {(user.kycStatus === "submitted" || user.kycStatus === "reviewing") && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Vérification en cours d&apos;examen</p>
                      <p className="text-xs text-amber-600 mt-0.5">Notre équipe vérifie vos documents — réponse sous 24h ouvrables</p>
                    </div>
                  </div>
                  {/* Progress steps */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-dz-green flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <span className="text-xs font-medium text-dz-green">Soumis</span>
                    </div>
                    <div className="flex-1 h-px bg-amber-200" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-amber-700">En examen</span>
                    </div>
                    <div className="flex-1 h-px bg-dz-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-dz-gray-200 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-dz-gray-400" />
                      </div>
                      <span className="text-xs text-dz-gray-400">Activé</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Not verified — prompt */}
              {(user.kycStatus === "none" || !user.kycStatus) && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-dz-gray-400">{t("profil_kyc_note")}</p>
                  <Link href="/kyc" className="text-xs bg-dz-green text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dz-green-dark transition-colors">
                    Vérifier
                  </Link>
                </div>
              )}

              {/* Rejected — re-submit prompt */}
              {user.kycStatus === "rejected" && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-red-600">Vos documents ont été refusés. Veuillez en soumettre de nouveaux.</p>
                  <Link href="/kyc" className="shrink-0 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                    Resoumettre
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Courier application card ── */}
          {myApp === undefined ? null : myApp === null ? (
            <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-dz-gray-900 text-sm mb-1">Vous n&apos;avez pas d&apos;annonce livreur</p>
                <p className="text-xs text-dz-gray-400">Rejoignez le réseau Waselli et commencez à livrer.</p>
              </div>
              <Link href="/livreurs"
                className="shrink-0 bg-dz-green hover:bg-dz-green-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Devenir livreur
              </Link>
            </div>
          ) : myApp.status === "pending" ? (
            /* ── Pending state — big prominent banner ── */
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
              {/* Top status bar */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-800 text-sm">Candidature en cours d&apos;examen</p>
                  <p className="text-xs text-amber-600 mt-0.5">Notre équipe examine votre dossier — réponse sous 48h</p>
                </div>
                <span className="text-[11px] font-bold bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full uppercase tracking-wide">En attente</span>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                    {TRANSPORT_LABELS[myApp.transport_type] ?? myApp.transport_type}
                  </span>
                  <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                    {myApp.wilaya}
                  </span>
                  {myApp.price_range && (
                    <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                      {PRICE_LABELS[myApp.price_range] ?? myApp.price_range}
                    </span>
                  )}
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-dz-green flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-xs font-medium text-dz-green">Envoyée</span>
                  </div>
                  <div className="flex-1 h-px bg-amber-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <span className="text-xs font-semibold text-amber-700">En examen</span>
                  </div>
                  <div className="flex-1 h-px bg-dz-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-dz-gray-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-dz-gray-400" />
                    </div>
                    <span className="text-xs text-dz-gray-400">Décision</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-dz-gray-400">
                    Candidature déposée le {new Date(myApp.created_at).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">
                    Retirer la candidature
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-dz-gray-900 mb-1">Mon annonce livreur</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      myApp.status === "approved"  ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {myApp.status === "approved" ? "Approuvée" : "Refusée"}
                    </span>
                    {myApp.status === "approved" && (
                      <Link href={`/livreurs/${myApp.id}`} className="text-xs text-dz-green font-medium hover:underline flex items-center gap-1">
                        Voir mon profil
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </Link>
                    )}
                  </div>
                </div>
                {!editingApp && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setAppForm({ ...myApp }); setEditingApp(true); }}
                      className="text-xs border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-600 hover:text-dz-green px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Modifier
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs border border-red-100 hover:border-red-300 text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {/* View mode */}
              {!editingApp ? (
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                      {TRANSPORT_LABELS[myApp.transport_type] ?? myApp.transport_type}
                    </span>
                    <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                      {myApp.wilaya}
                    </span>
                    {myApp.price_range && (
                      <span className="bg-dz-gray-50 border border-dz-gray-100 px-3 py-1 rounded-lg text-xs font-medium text-dz-gray-700">
                        {PRICE_LABELS[myApp.price_range] ?? myApp.price_range}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${myApp.is_available ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-dz-gray-50 border-dz-gray-100 text-dz-gray-500"}`}>
                      {myApp.is_available ? "Disponible" : "Indisponible"}
                    </span>
                  </div>
                  {myApp.zones && (
                    <p className="text-xs text-dz-gray-500">Zones : {myApp.zones}</p>
                  )}
                  {myApp.message && (
                    <p className="text-xs text-dz-gray-500 italic line-clamp-2">&ldquo;{myApp.message}&rdquo;</p>
                  )}
                </div>
              ) : (
                /* Edit mode */
                <form onSubmit={handleSaveApp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Type de véhicule</label>
                      <select value={appForm.transport_type ?? ""} onChange={e => setAppForm(p => ({ ...p, transport_type: e.target.value }))}
                        className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white">
                        {TRANSPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Wilaya</label>
                      <select value={appForm.wilaya ?? ""} onChange={e => setAppForm(p => ({ ...p, wilaya: e.target.value }))}
                        className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white">
                        <option value="">Sélectionner</option>
                        {ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Tarif indicatif</label>
                    <select value={appForm.price_range ?? ""} onChange={e => setAppForm(p => ({ ...p, price_range: e.target.value }))}
                      className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white">
                      <option value="">Aucun</option>
                      {PRICE_RANGES.map(pr => <option key={pr.value} value={pr.value}>{pr.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Zones couvertes</label>
                    <input type="text" value={appForm.zones ?? ""} onChange={e => setAppForm(p => ({ ...p, zones: e.target.value }))}
                      placeholder="Alger, Blida, Tipaza"
                      className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Description</label>
                    <textarea value={appForm.message ?? ""} onChange={e => setAppForm(p => ({ ...p, message: e.target.value }))}
                      rows={3} placeholder="Expérience, disponibilités, type de colis acceptés…"
                      className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green resize-none" />
                  </div>
                  {/* Availability toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-9 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${appForm.is_available ? "bg-dz-green" : "bg-dz-gray-200"}`}
                      onClick={() => setAppForm(p => ({ ...p, is_available: !p.is_available }))}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${appForm.is_available ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-dz-gray-800">Disponible immédiatement</span>
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={savingApp}
                      className="bg-dz-green text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-dz-green-dark transition-colors disabled:opacity-60">
                      {savingApp ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button type="button" onClick={() => setEditingApp(false)}
                      className="border border-dz-gray-200 text-dz-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-dz-gray-50 transition-colors">
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete courier ad confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-dz-gray-900 mb-2">Supprimer mon annonce ?</h3>
            <p className="text-sm text-dz-gray-500 mb-5">Votre profil livreur sera retiré du répertoire. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} disabled={deletingApp}
                className="flex-1 border border-dz-gray-200 rounded-xl py-2.5 text-sm font-semibold text-dz-gray-700 hover:bg-dz-gray-50">
                Annuler
              </button>
              <button onClick={handleDeleteApp} disabled={deletingApp}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 disabled:opacity-60">
                {deletingApp ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-dz-gray-900 mb-2">{t("profil_logout_modal_title")}</h3>
            <p className="text-sm text-dz-gray-500 mb-5">{t("profil_logout_modal_desc")}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-dz-gray-200 rounded-xl py-2.5 text-sm font-semibold text-dz-gray-700 hover:bg-dz-gray-50">
                {t("profil_cancel")}
              </button>
              <button onClick={handleLogout}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">
                {t("profil_logout_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
