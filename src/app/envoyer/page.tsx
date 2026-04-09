"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useListings, useToast } from "@/lib/context";
import { ALGERIAN_CITIES, CATEGORIES } from "@/lib/data";
import Link from "next/link";

export default function EnvoyerPage() {
  const { user } = useAuth();
  const { addListing } = useListings();
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", description: "", category: "Électroménager", weight: "", dimensions: "",
    from: "", to: "", date: "", price: "", insurance: true,
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
          <p className="text-dz-gray-500 mb-6">Vous devez être connecté pour publier une annonce</p>
          <Link href="/connexion" className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-medium transition-colors">Se connecter</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.from || !form.to || !form.price) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    addListing({
      type: "shipment",
      title: form.title,
      description: form.description,
      from: form.from,
      to: form.to,
      date: form.date || new Date().toISOString().split("T")[0],
      price: parseInt(form.price),
      weight: form.weight ? `${form.weight} kg` : undefined,
      dimensions: form.dimensions || undefined,
      category: form.category,
      user: {
        name: `${user.firstName} ${user.lastName[0]}.`,
        rating: user.rating,
        reviews: user.reviews,
        avatar: user.avatar,
      },
    });

    addToast("Annonce publiée avec succès !");
    router.push("/annonces");
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dz-gray-800">Envoyer un colis</h1>
          <p className="text-dz-gray-500 mt-2">Décrivez votre colis et recevez des offres de transporteurs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
              Votre colis
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Titre de l&apos;annonce *</label>
                <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex: Machine à laver Samsung 8kg" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décrivez votre colis..." className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Catégorie</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  {CATEGORIES.filter((c) => c !== "Tous").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Poids (kg)</label>
                  <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="Ex: 30" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Dimensions (cm)</label>
                  <input type="text" value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} placeholder="L x l x H" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
              Trajet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Ville de départ *</label>
                <select value={form.from} onChange={(e) => update("from", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">Sélectionner...</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Ville d&apos;arrivée *</label>
                <select value={form.to} onChange={(e) => update("to", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
                  <option value="">Sélectionner...</option>
                  {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date souhaitée</label>
              <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
              Budget
            </h2>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Prix proposé (DA) *</label>
              <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="Ex: 2500" className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
              <p className="text-xs text-dz-gray-400 mt-2">Commission DZColis: 10% — Le transporteur recevra 90% du montant</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <div className="flex items-start gap-3 p-4 bg-dz-green/5 rounded-xl">
              <input type="checkbox" checked={form.insurance} onChange={(e) => update("insurance", e.target.checked)} className="mt-1 accent-dz-green" />
              <div>
                <p className="text-sm font-medium text-dz-gray-800">Assurance DZColis — jusqu&apos;à 50 000 DA</p>
                <p className="text-xs text-dz-gray-500 mt-1">Protection contre la casse et le vol pendant le transport. Inclus gratuitement.</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold text-lg transition-colors">
            Publier mon annonce
          </button>
        </form>
      </div>
    </div>
  );
}
