"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useToast } from "@/lib/context";
import { ALGERIAN_CITIES } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function ProfilPage() {
  const { user, authLoading, updateUser, logout } = useAuth();
  const { addToast } = useToast();
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

    // Validate
    if (!file.type.startsWith("image/")) {
      addToast("Veuillez choisir une image (jpg, png, webp)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image trop grande. Maximum 5 MB.", "error");
      return;
    }

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadingPhoto(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const userId = user?.id;
      if (!userId) return;
      const path = `${userId}.${ext}`;

      // Upload (upsert — overwrites if exists)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`; // bust cache

      // Save to profile
      await updateUser({ avatarUrl: publicUrl });
      setPreviewUrl(publicUrl);
      addToast("Photo de profil mise à jour ✓", "success");
    } catch (err) {
      console.error("Avatar upload error:", err);
      setPreviewUrl(user?.avatarUrl ?? null); // revert preview
      addToast("Erreur lors de l'upload. Réessayez.", "error");
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
      addToast("Photo supprimée", "success");
    } catch {
      addToast("Erreur lors de la suppression", "error");
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
      addToast("Profil mis à jour avec succès ✓", "success");
    } catch {
      addToast("Erreur lors de la sauvegarde", "error");
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

  const score = Math.min(100, 20 + user.rating * 10 + Math.min(user.reviews, 30));
  const level = score >= 80 ? { label: "Elite ✓", color: "text-dz-green", bg: "bg-green-100" }
    : score >= 60 ? { label: "Expert", color: "text-blue-600", bg: "bg-blue-100" }
    : score >= 40 ? { label: "Confirmé", color: "text-orange-600", bg: "bg-orange-100" }
    : { label: "Débutant", color: "text-dz-gray-500", bg: "bg-dz-gray-100" };

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
                <img src={previewUrl} alt="Photo de profil" className="w-full h-full object-cover" />
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
              title="Changer la photo"
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
                ⭐ {user.rating.toFixed(1)} · {user.reviews} avis
              </span>
              <span className="text-green-100 text-xs">Membre depuis {memberSince}</span>
            </div>
            {/* Photo actions */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                {uploadingPhoto ? "Upload…" : "Changer la photo"}
              </button>
              {previewUrl && !uploadingPhoto && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs bg-white/10 hover:bg-red-500/40 text-white/80 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Supprimer
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
            <h3 className="font-semibold text-dz-gray-900 mb-4 text-sm">Votre activité</h3>
            <div className="space-y-3">
              {[
                { icon: "📦", label: "Colis envoyés", value: user.reviews },
                { icon: "⭐", label: "Note moyenne", value: `${user.rating.toFixed(1)}/5` },
                { icon: "✅", label: "Avis reçus", value: user.reviews },
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
            <h3 className="font-semibold text-dz-gray-900 mb-3 text-sm">Score de confiance</h3>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>{level.label}</span>
              <span className="text-sm font-bold text-dz-gray-900">{score}/100</span>
            </div>
            <div className="w-full bg-dz-gray-100 rounded-full h-2">
              <div className="bg-dz-green h-2 rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-xl py-2.5 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* ── Edit form ── */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-900 mb-6">Modifier mes informations</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Prénom</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Nom</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Email</label>
              <input type="email" value={user.email} disabled
                className="w-full border border-dz-gray-100 bg-dz-gray-50 rounded-xl px-3 py-2.5 text-sm text-dz-gray-400 cursor-not-allowed" />
              <p className="text-xs text-dz-gray-400 mt-1">L&apos;email ne peut pas être modifié.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 5XX XXX XXX"
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green" />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Wilaya</label>
              <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white">
                <option value="">Sélectionner une wilaya</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving}
              className="bg-dz-green text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60">
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </form>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-900 mb-4">Sécurité</h2>
            <div className="flex items-center justify-between py-3 border-b border-dz-gray-100">
              <div>
                <p className="text-sm font-medium text-dz-gray-900">Mot de passe</p>
                <p className="text-xs text-dz-gray-400">Dernière modification inconnue</p>
              </div>
              <button className="text-xs text-dz-green font-semibold hover:underline">Modifier</button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-dz-gray-900">Vérification d&apos;identité</p>
                <p className="text-xs text-dz-gray-400">Augmente votre score de confiance</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user.kycStatus === "approved" ? "bg-green-100 text-green-700" :
                user.kycStatus === "submitted" || user.kycStatus === "reviewing" ? "bg-yellow-100 text-yellow-700" :
                "bg-orange-100 text-orange-600"
              }`}>
                {user.kycStatus === "approved" ? "✓ Vérifié" :
                 user.kycStatus === "submitted" ? "En cours d'examen" :
                 user.kycStatus === "reviewing" ? "En cours d'examen" :
                 user.kycStatus === "rejected" ? "Rejeté" : "En attente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-dz-gray-900 mb-2">Se déconnecter ?</h3>
            <p className="text-sm text-dz-gray-500 mb-5">Vous devrez vous reconnecter pour accéder à votre compte.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-dz-gray-200 rounded-xl py-2.5 text-sm font-semibold text-dz-gray-700 hover:bg-dz-gray-50">
                Annuler
              </button>
              <button onClick={handleLogout}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
