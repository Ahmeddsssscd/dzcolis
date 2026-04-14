"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useToast } from "@/lib/context";
import { ALGERIAN_CITIES } from "@/lib/data";

export default function ProfilPage() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/connexion"); return; }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setWilaya(user.wilaya);
  }, [user, router]);

  if (!user) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser({ firstName, lastName, phone, wilaya });
      addToast("Profil mis à jour avec succès", "success");
      setSaving(false);
    }, 500);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-dz-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
            {user.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-green-100 text-sm mt-1">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm bg-white/15 px-3 py-1 rounded-full">
                ⭐ {user.rating.toFixed(1)} · {user.reviews} avis
              </span>
              <span className="text-green-100 text-xs">Membre depuis {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar stats */}
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
            {(() => {
              const score = Math.min(100, 20 + user.rating * 10 + Math.min(user.reviews, 30));
              const level = score >= 80 ? { label: "Elite ✓", color: "text-dz-green", bg: "bg-green-100" }
                : score >= 60 ? { label: "Expert", color: "text-blue-600", bg: "bg-blue-100" }
                : score >= 40 ? { label: "Confirmé", color: "text-orange-600", bg: "bg-orange-100" }
                : { label: "Débutant", color: "text-dz-gray-500", bg: "bg-dz-gray-100" };
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>{level.label}</span>
                    <span className="text-sm font-bold text-dz-gray-900">{score}/100</span>
                  </div>
                  <div className="w-full bg-dz-gray-100 rounded-full h-2">
                    <div className="bg-dz-green h-2 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </>
              );
            })()}
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-xl py-2.5 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Edit form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6">
            <h2 className="font-bold text-dz-gray-900 mb-6">Modifier mes informations</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full border border-dz-gray-100 bg-dz-gray-50 rounded-xl px-3 py-2.5 text-sm text-dz-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-dz-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 5XX XXX XXX"
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">Wilaya</label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white"
              >
                <option value="">Sélectionner une wilaya</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-dz-green text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </form>

          {/* Security section */}
          <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6 mt-4">
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
                <p className="text-sm font-medium text-dz-gray-900">Vérification d'identité</p>
                <p className="text-xs text-dz-gray-400">Augmente votre score de confiance</p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">En attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-dz-gray-900 mb-2">Se déconnecter ?</h3>
            <p className="text-sm text-dz-gray-500 mb-5">Vous devrez vous reconnecter pour accéder à votre compte.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-dz-gray-200 rounded-xl py-2.5 text-sm font-semibold text-dz-gray-700 hover:bg-dz-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
