"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useListings, useToast } from "@/lib/context";
import { ALGERIAN_CITIES } from "@/lib/data";
import Link from "next/link";

export default function TransporterPage() {
  const { user } = useAuth();
  const { addListing } = useListings();
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    from: "", to: "", date: "", vehicle: "Voiture", maxWeight: "", price: "", description: "", recurring: false,
  });

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  if (!user) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dz-gray-800 mb-2">Connectez-vous d&apos;abord</h2>
          <p className="text-dz-gray-500 mb-6">Vous devez être connecté pour proposer un trajet</p>
          <Link href="/connexion" className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-medium transition-colors">Se connecter</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.price) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    addListing({
      type: "trip",
      title: `Trajet ${form.from} → ${form.to} - ${form.vehicle}`,
      description: form.description || `${form.vehicle} disponible. ${form.recurring ? "Trajet régulier." : ""}`,
      from: form.from,
      to: form.to,
      date: form.date || new Date().toISOString().split("T")[0],
      price: parseInt(form.price),
      weight: form.maxWeight ? `jusqu'à ${form.maxWeight} kg` : undefined,
      user: {
        name: `${user.firstName} ${user.lastName[0]}.`,
        rating: user.rating,
        reviews: user.reviews,
        avatar: user.avatar,
      },
    });

    addToast("Trajet publié avec succès !");
    router.push("/annonces");
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dz-gray-800">Proposer un trajet</h1>
          <p className="text-dz-gray-500 mt-2">Vous faites un trajet ? Rentabilisez-le en transportant des colis</p>
        </div>

        <div className="bg-gradient-to-r from-dz-green to-dz-green-light text-white rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-2">Gagnez de l&apos;argent en voyageant</h3>
          <p className="text-green-100 text-sm mb-4">Les transporteurs DZColis gagnent en moyenne 3 000 - 8 000 DA par trajet</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">90%</div>
              <div className="text-xs text-green-200">Pour vous</div>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">48</div>
              <div className="text-xs text-green-200">Wilayas</div>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">7j/7</div>
              <div className="text-xs text-green-200">Disponible</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
              Votre trajet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Départ *</label>
                <select value={form.from} onChange={(e) => update("from", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">Sélectionner...</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Arrivée *</label>
                <select value={form.to} onChange={(e) => update("to", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">Sélectionner...</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date du trajet</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700" />
            </div>
            <label className="flex items-center gap-2 text-sm text-dz-gray-700 mt-4">
              <input type="checkbox" checked={form.recurring} onChange={(e) => update("recurring", e.target.checked)} className="accent-dz-green" />
              Trajet régulier (chaque semaine)
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
              Votre véhicule
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Voiture", "Fourgon", "Camionnette", "Camion"].map((v) => (
                <label key={v} className={`border rounded-xl p-4 text-center cursor-pointer transition-colors ${form.vehicle === v ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/30"}`}>
                  <input type="radio" name="vehicle" value={v} checked={form.vehicle === v} onChange={(e) => update("vehicle", e.target.value)} className="sr-only" />
                  <div className="text-2xl mb-1">
                    {v === "Voiture" ? "🚗" : v === "Fourgon" ? "🚐" : v === "Camionnette" ? "🛻" : "🚛"}
                  </div>
                  <div className="text-sm font-medium text-dz-gray-700">{v}</div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Poids maximum accepté (kg)</label>
              <input type="number" value={form.maxWeight} onChange={(e) => update("maxWeight", e.target.value)} placeholder="Ex: 100" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
              Tarif
            </h2>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Tarif minimum (DA) *</label>
              <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Ex: 1500" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Description / Notes</label>
              <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Ex: Grand espace disponible..." className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold text-lg transition-colors">
            Publier mon trajet
          </button>
        </form>
      </div>
    </div>
  );
}
