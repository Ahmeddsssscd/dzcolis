"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useListings, useToast } from "@/lib/context";
import { ALGERIAN_CITIES, EUROPEAN_COUNTRIES, CATEGORIES } from "@/lib/data";
import Link from "next/link";

type Direction = "eu-dz" | "dz-eu";
type InsuranceTier = "basique" | "standard" | "premium";

function calcInsurancePremium(tier: InsuranceTier, declaredValue: string): number {
  const val = parseFloat(declaredValue) || 0;
  if (val <= 0) return 0;
  if (tier === "basique") return 0;
  if (tier === "standard") return Math.max(300, val * 0.015);
  return Math.max(600, val * 0.03);
}

const INSURANCE_TIERS = [
  {
    id: "basique" as InsuranceTier,
    name: "Formule Basique",
    price: "Gratuit",
    priceMin: undefined,
    coverage: "500 €",
    badge: null,
    features: [
      "Couverture perte totale",
      "Délai de remboursement 15 jours",
      "Support email",
    ],
  },
  {
    id: "standard" as InsuranceTier,
    name: "Formule Standard",
    price: "1.5% valeur déclarée",
    priceMin: "min 2 €",
    coverage: "1 500 €",
    badge: null,
    features: [
      "Couverture casse et perte",
      "Remboursement sous 7 jours",
      "Support téléphonique prioritaire",
    ],
  },
  {
    id: "premium" as InsuranceTier,
    name: "Formule Premium",
    price: "3% valeur déclarée",
    priceMin: "min 5 €",
    coverage: "3 000 €",
    badge: "Recommandé",
    features: [
      "Couverture tous risques internationale",
      "Remboursement sous 48h",
      "Gestionnaire dédié bilingue",
    ],
  },
];

export default function InternationalEnvoyerPage() {
  const { user } = useAuth();
  const { addListing } = useListings();
  const { addToast } = useToast();
  const router = useRouter();

  const [direction, setDirection] = useState<Direction>("eu-dz");
  const [selectedCountry, setSelectedCountry] = useState(EUROPEAN_COUNTRIES[0].code);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Électroménager",
    weight: "",
    dimensions: "",
    declaredValue: "",
    fragile: false,
    europeanCity: "",
    algerianCity: "",
    date: "",
    price: "",
    insuranceTier: "basique" as InsuranceTier,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const country = EUROPEAN_COUNTRIES.find((c) => c.code === selectedCountry) ?? EUROPEAN_COUNTRIES[0];

  const insurancePremium = calcInsurancePremium(form.insuranceTier, form.declaredValue);
  const totalPrice = (parseInt(form.price) || 0) + insurancePremium;

  const fromCity = direction === "eu-dz" ? form.europeanCity : form.algerianCity;
  const toCity = direction === "eu-dz" ? form.algerianCity : form.europeanCity;
  const fromDisplay = fromCity || "—";
  const toDisplay = toCity || "—";

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
          <Link href="/connexion" className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.europeanCity || !form.algerianCity || !form.price || !form.declaredValue) {
      addToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    const fromCity = direction === "eu-dz" ? form.europeanCity : form.algerianCity;
    const toCity   = direction === "eu-dz" ? form.algerianCity : form.europeanCity;

    const result = await addListing({
      user_id: user.id,
      from_city: fromCity,
      to_city: toCity,
      departure_date: form.date || new Date().toISOString().split("T")[0],
      arrival_date: null,
      price_per_kg: parseInt(form.price),
      available_weight: parseFloat(form.weight) || 0,
      description: form.description || `${form.title} — Colis international ${fromCity} → ${toCity}`,
      is_international: true,
      listing_type: "demande",
    });

    if (result) {
      addToast("Annonce internationale publiée avec succès !");
      router.push("/international");
    } else {
      addToast("Erreur lors de la publication. Veuillez réessayer.", "error");
    }
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/international" className="inline-flex items-center gap-1.5 text-sm text-dz-gray-500 hover:text-dz-green mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l&apos;international
          </Link>
          <h1 className="text-3xl font-bold text-dz-gray-800">Publier un colis international</h1>
          <p className="text-dz-gray-500 mt-2">Décrivez votre colis et recevez des offres de transporteurs vérifiés</p>
        </div>

        {/* Direction toggle */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-1.5 flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => setDirection("eu-dz")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              direction === "eu-dz" ? "bg-dz-green text-white" : "text-dz-gray-600 hover:bg-dz-gray-50"
            }`}
          >
            🌍 Europe → 🇩🇿 Algérie
          </button>
          <button
            type="button"
            onClick={() => setDirection("dz-eu")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              direction === "dz-eu" ? "bg-dz-green text-white" : "text-dz-gray-600 hover:bg-dz-gray-50"
            }`}
          >
            🇩🇿 Algérie → 🌍 Europe
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Parcel details */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
              Votre colis
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Titre de l&apos;annonce *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ex: Colis vêtements et affaires personnelles"
                  className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Décrivez le contenu de votre colis..."
                  className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                >
                  {CATEGORIES.filter((c) => c !== "Tous").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => update("weight", e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Dimensions (cm)</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => update("dimensions", e.target.value)}
                    placeholder="L x l x H"
                    className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                  />
                </div>
              </div>

              {/* Declared value */}
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-1">
                  Valeur déclarée (€) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={form.declaredValue}
                    onChange={(e) => update("declaredValue", e.target.value)}
                    placeholder="Ex: 300"
                    className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dz-gray-400 font-medium pointer-events-none">€</span>
                </div>
                <p className="text-xs text-dz-gray-400 mt-1.5 flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cette valeur détermine votre couverture d&apos;assurance. Déclarez la vraie valeur.
                </p>
              </div>

              {/* Fragile toggle */}
              <div>
                <label className="block text-sm font-medium text-dz-gray-700 mb-2">Type de colis</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update("fragile", true)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      form.fragile
                        ? "border-dz-green bg-dz-green/5 text-dz-green"
                        : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/40 hover:bg-dz-gray-50"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 3h6l1 4H8L9 3z" />
                      <path d="M8 7l-2 14h12L16 7" />
                      <path d="M12 11v4" />
                    </svg>
                    Fragile 🫗
                    {form.fragile && (
                      <svg className="w-4 h-4 ml-auto text-dz-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => update("fragile", false)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      !form.fragile
                        ? "border-dz-green bg-dz-green/5 text-dz-green"
                        : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/40 hover:bg-dz-gray-50"
                    }`}
                  >
                    📦 Standard
                    {!form.fragile && (
                      <svg className="w-4 h-4 ml-auto text-dz-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Route */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
              Trajet
            </h2>

            {/* Country selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-2">Pays européen</label>
              <div className="flex flex-wrap gap-2">
                {EUROPEAN_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setSelectedCountry(c.code); update("europeanCity", ""); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedCountry === c.code
                        ? "border-dz-green bg-dz-green/5 text-dz-green"
                        : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                    }`}
                  >
                    <span>{c.flag}</span> {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {direction === "eu-dz" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">
                      Ville de départ ({country.flag} {country.name}) *
                    </label>
                    <select
                      value={form.europeanCity}
                      onChange={(e) => update("europeanCity", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    >
                      <option value="">Sélectionner...</option>
                      {country.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">
                      Ville d&apos;arrivée (🇩🇿 Algérie) *
                    </label>
                    <select
                      value={form.algerianCity}
                      onChange={(e) => update("algerianCity", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    >
                      <option value="">Sélectionner...</option>
                      {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">
                      Ville de départ (🇩🇿 Algérie) *
                    </label>
                    <select
                      value={form.algerianCity}
                      onChange={(e) => update("algerianCity", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    >
                      <option value="">Sélectionner...</option>
                      {ALGERIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">
                      Ville d&apos;arrivée ({country.flag} {country.name}) *
                    </label>
                    <select
                      value={form.europeanCity}
                      onChange={(e) => update("europeanCity", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    >
                      <option value="">Sélectionner...</option>
                      {country.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date souhaitée</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
              />
            </div>
          </div>

          {/* Step 3: Budget */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
              Budget
            </h2>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Prix proposé (€) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="Ex: 15"
                  className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dz-gray-400 font-medium pointer-events-none">€</span>
              </div>
              <p className="text-xs text-dz-gray-400 mt-2">Commission Waselli: 10% — Le transporteur recevra 90% du montant</p>
            </div>
          </div>

          {/* Step 4: Insurance */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-1 flex items-center gap-2">
              <span className="w-7 h-7 bg-dz-green text-white rounded-lg flex items-center justify-center text-xs font-bold">4</span>
              Assurance internationale
            </h2>
            <p className="text-xs text-dz-gray-400 mb-4 ml-9">Protection renforcée pour vos envois transfrontaliers</p>

            <div className="space-y-3">
              {INSURANCE_TIERS.map((tier) => {
                const isSelected = form.insuranceTier === tier.id;
                const premium = calcInsurancePremium(tier.id, form.declaredValue);
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => update("insuranceTier", tier.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "bg-dz-green/5 border-dz-green"
                        : "border-dz-gray-200 hover:border-dz-green/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          isSelected ? "border-dz-green bg-dz-green" : "border-dz-gray-300"
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${isSelected ? "text-dz-green" : "text-dz-gray-800"}`}>
                              {tier.name}
                            </span>
                            {tier.badge && (
                              <span className="text-xs bg-dz-green text-white px-2 py-0.5 rounded-full font-medium">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-dz-gray-500 mt-0.5">
                            Couverture jusqu&apos;à <strong className="text-dz-gray-700">{tier.coverage}</strong>
                          </p>
                          <ul className="mt-2 space-y-1">
                            {tier.features.map((f) => (
                              <li key={f} className="flex items-center gap-1.5 text-xs text-dz-gray-500">
                                <svg className="w-3 h-3 text-dz-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${isSelected ? "text-dz-green" : "text-dz-gray-700"}`}>
                          {tier.id === "basique" ? "Gratuit" : tier.price}
                        </div>
                        {tier.priceMin && (
                          <div className="text-xs text-dz-gray-400">{tier.priceMin}</div>
                        )}
                        {isSelected && tier.id !== "basique" && (
                          <div className="mt-1">
                            {form.declaredValue ? (
                              <span className="text-xs font-semibold text-dz-green bg-dz-green/10 px-2 py-0.5 rounded-lg">
                                Prime: {Math.round(premium * 100) / 100} €
                              </span>
                            ) : (
                              <span className="text-xs text-dz-gray-400">Entrez la valeur déclarée</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live premium display */}
            {form.insuranceTier !== "basique" && (
              <div className={`mt-3 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
                form.declaredValue ? "bg-dz-green/5 text-dz-green" : "bg-dz-gray-50 text-dz-gray-400"
              }`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M12 7h.01M9 7h.01" />
                </svg>
                {form.declaredValue
                  ? <span>Prime calculée: <strong>{Math.round(insurancePremium * 100) / 100} €</strong></span>
                  : <span>Entrez la valeur déclarée pour voir le prix</span>
                }
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="font-semibold text-dz-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Récapitulatif
            </h2>
            <div className="bg-dz-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dz-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                  Trajet
                </span>
                <span className="font-medium text-dz-gray-800">
                  {fromDisplay} → {toDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dz-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valeur déclarée
                </span>
                <span className="font-medium text-dz-gray-800">
                  {form.declaredValue ? `${parseInt(form.declaredValue).toLocaleString("fr-FR")} €` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dz-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Assurance choisie
                </span>
                <span className="font-medium text-dz-gray-800">
                  {INSURANCE_TIERS.find((t) => t.id === form.insuranceTier)?.name} —{" "}
                  <span className="text-dz-green">
                    {form.insuranceTier === "basique" ? "Gratuit" : form.declaredValue ? `${Math.round(insurancePremium * 100) / 100} €` : "à calculer"}
                  </span>
                </span>
              </div>
              <div className="border-t border-dz-gray-200 pt-2.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-dz-gray-800">Total payé</span>
                <span className="font-bold text-dz-green text-base">
                  {form.price
                    ? `${totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-sm"
          >
            Publier mon annonce internationale
          </button>
        </form>
      </div>
    </div>
  );
}
