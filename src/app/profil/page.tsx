"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import { ALGERIAN_CITIES } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function ProfilPage() {
  const { user, authLoading, updateUser, logout } = useAuth();
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/connexion"); return; }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setWilaya(user.wilaya);
    setPreviewUrl(user.avatarUrl);
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
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const userId = user?.id;
      if (!userId) return;
      const path = `${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

      await updateUser({ avatarUrl: publicUrl });
      setPreviewUrl(publicUrl);
      addToast(t("profil_photo_updated"), "success");
    } catch (err) {
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

  function handleLogout() {
    logout();
    router.push("/");
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long",
  });

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
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-6">

          {/* Avatar with upload overlay */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={t("profil_change_photo")} className="w-full h-full object-cover" />
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
            <p className="text-green-100 text-sm mt-0.5 truncate">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm bg-white/15 px-3 py-1 rounded-full">
                {hasReviews ? `⭐ ${user.rating.toFixed(1)} · ${user.reviews} ${t("profil_reviews_received")}` : t("profil_no_reviews")}
              </span>
              <span className="text-green-100 text-xs">{t("profil_member_since")} {memberSince}</span>
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
            <div className="space-y-3">
              {[
                { icon: "📦", label: t("profil_packages_sent"), value: user.reviews > 0 ? user.reviews : "—" },
                { icon: "⭐", label: t("profil_avg_rating"), value: hasReviews ? `${user.rating.toFixed(1)}/5` : "—" },
                { icon: "✅", label: t("profil_reviews_received"), value: user.reviews > 0 ? user.reviews : "—" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-dz-gray-500 flex items-center gap-2">
                    <span>{s.icon}</span>{s.label}
                  </span>
                  <span className="text-sm font-semibold text-dz-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
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
              className="bg-dz-green text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60">
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
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-dz-gray-900">{t("profil_kyc_title")}</p>
                <p className="text-xs text-dz-gray-400">{t("profil_kyc_note")}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user.kycStatus === "approved" ? "bg-green-100 text-green-700" :
                user.kycStatus === "submitted" || user.kycStatus === "reviewing" ? "bg-yellow-100 text-yellow-700" :
                "bg-orange-100 text-orange-600"
              }`}>
                {kycLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

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
