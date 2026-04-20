"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/context";
import { EUROPEAN_COUNTRIES, ALGERIAN_CITIES } from "@/lib/data";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

export default function DevenirTransporteurInternationalPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const passportRef = useRef<HTMLInputElement>(null);
  const visaRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const [passportFileName, setPassportFileName] = useState<string | null>(null);
  const [visaFileName, setVisaFileName] = useState<string | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    dateOfBirth: "",
    nationality: "Algérienne",
    europeanAddress: "",
    countryOfResidence: "FR",
    passportNumber: "",
    passportExpiry: "",
    visaType: "Titre de séjour",
    visaExpiry: "",
    routes: [] as string[],
    algerianCities: [] as string[],
    tripFrequency: "Mensuel",
    vehicle: "Fourgon",
    maxWeight: "",
    languages: [] as string[],
    notes: "",
  });

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleRoute = (code: string) => {
    setForm((prev) => ({
      ...prev,
      routes: prev.routes.includes(code)
        ? prev.routes.filter((r) => r !== code)
        : [...prev.routes, code],
    }));
  };

  const toggleCity = (city: string) => {
    setForm((prev) => ({
      ...prev,
      algerianCities: prev.algerianCities.includes(city)
        ? prev.algerianCities.filter((c) => c !== city)
        : [...prev.algerianCities, city],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <p className="text-dz-gray-500 mb-6">Vous devez être connecté pour postuler comme transporteur</p>
          <Link href="/connexion" className="bg-dz-green hover:bg-dz-green-light text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl border border-dz-gray-200 p-10 shadow-sm">
            <div className="w-20 h-20 bg-dz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dz-gray-800 mb-3">Demande envoyée !</h2>
            <p className="text-dz-gray-500 leading-relaxed mb-6">
              Merci <span className="font-semibold text-dz-gray-700">{user.firstName}</span> ! Votre dossier a bien été transmis à notre équipe.
              Nous vous contacterons dans les <span className="font-semibold text-dz-gray-700">48 à 72 heures</span> par téléphone ou par email pour valider votre profil.
            </p>
            <div className="bg-dz-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-3 text-sm text-dz-gray-600">
                <svg className="w-4 h-4 text-dz-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appel sur <span className="font-medium">{user.phone || "votre numéro enregistré"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-dz-gray-600">
                <svg className="w-4 h-4 text-dz-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email sur <span className="font-medium">{user.email}</span>
              </div>
            </div>
            <Link
              href="/international"
              className="block w-full bg-dz-green hover:bg-dz-green-light text-white py-3.5 rounded-xl font-semibold transition-colors"
            >
              Retour à l&apos;international
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Informations personnelles" },
    { num: 2, label: "Documents d'identité" },
    { num: 3, label: "Trajet & véhicule" },
    { num: 4, label: "Vérification" },
  ];

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-dz-gray-800 to-dz-gray-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/international" className="inline-flex items-center gap-1.5 text-sm text-dz-gray-300 hover:text-white mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div>
            <div>
              <h1 className="text-2xl font-bold">Devenir transporteur international</h1>
              <p className="text-dz-gray-300 text-sm mt-0.5">Transportez des colis entre l&apos;Algérie et l&apos;Europe et gagnez de l&apos;argent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 ${step === s.num ? "opacity-100" : step > s.num ? "opacity-70" : "opacity-40"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  step > s.num ? "bg-dz-green text-white" : step === s.num ? "bg-dz-green text-white" : "bg-dz-gray-200 text-dz-gray-500"
                }`}>
                  {step > s.num ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${step === s.num ? "text-dz-gray-800" : "text-dz-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px flex-shrink-0 ${step > s.num ? "bg-dz-green" : "bg-dz-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
                <h2 className="font-semibold text-dz-gray-800 mb-1">Informations personnelles</h2>
                <p className="text-xs text-dz-gray-400 mb-5">Certains champs sont pré-remplis depuis votre profil</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Prénom *</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Nom *</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+33 6 00 00 00 00"
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date de naissance *</label>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => update("dateOfBirth", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Nationalité *</label>
                      <input
                        type="text"
                        value={form.nationality}
                        onChange={(e) => update("nationality", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">Pays de résidence actuel *</label>
                    <select
                      value={form.countryOfResidence}
                      onChange={(e) => update("countryOfResidence", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    >
                      {EUROPEAN_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                      <option value="DZ">Algérie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">Adresse complète en Europe *</label>
                    <input
                      type="text"
                      value={form.europeanAddress}
                      onChange={(e) => update("europeanAddress", e.target.value)}
                      placeholder="Ex: 12 Rue de la Paix, 75001 Paris, France"
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-700">Vos documents sont chiffrés et utilisés uniquement pour la vérification de votre identité. Ils ne seront jamais partagés.</p>
              </div>

              <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-6">
                <h2 className="font-semibold text-dz-gray-800">Documents d&apos;identité</h2>

                {/* Passport */}
                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-3">Photo du passeport (page principale) *</label>
                  <button
                    type="button"
                    onClick={() => passportRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      passportFileName ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/40"
                    }`}
                  >
                    {passportFileName ? (
                      <div className="flex items-center justify-center gap-2 text-dz-green">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{passportFileName}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-dz-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-dz-gray-500">Cliquez pour uploader ou glissez-déposez</p>
                        <p className="text-xs text-dz-gray-400 mt-1">JPG, PNG ou PDF — max 10 MB</p>
                      </>
                    )}
                  </button>
                  <input
                    ref={passportRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setPassportFileName(e.target.files?.[0]?.name ?? null)}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Numéro de passeport *</label>
                      <input
                        type="text"
                        value={form.passportNumber}
                        onChange={(e) => update("passportNumber", e.target.value)}
                        placeholder="Ex: AB123456"
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date d&apos;expiration *</label>
                      <input
                        type="date"
                        value={form.passportExpiry}
                        onChange={(e) => update("passportExpiry", e.target.value)}
                        className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-dz-gray-100 pt-6">
                  {/* Visa / Titre de séjour */}
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Type de document de séjour *</label>
                  <div className="flex gap-3 mb-4">
                    {["Titre de séjour", "Visa long séjour", "Carte de résident", "Nationalité européenne"].map((v) => (
                      <label
                        key={v}
                        className={`flex-1 border rounded-xl p-3 text-center cursor-pointer text-xs font-medium transition-all ${
                          form.visaType === v ? "border-dz-green bg-dz-green/5 text-dz-green" : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="visaType"
                          value={v}
                          checked={form.visaType === v}
                          onChange={(e) => update("visaType", e.target.value)}
                          className="sr-only"
                        />
                        {v}
                      </label>
                    ))}
                  </div>

                  <label className="block text-sm font-medium text-dz-gray-700 mb-3">Photo du document de séjour / visa *</label>
                  <button
                    type="button"
                    onClick={() => visaRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      visaFileName ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/40"
                    }`}
                  >
                    {visaFileName ? (
                      <div className="flex items-center justify-center gap-2 text-dz-green">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{visaFileName}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-dz-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-dz-gray-500">Cliquez pour uploader votre document</p>
                        <p className="text-xs text-dz-gray-400 mt-1">JPG, PNG ou PDF — max 10 MB</p>
                      </>
                    )}
                  </button>
                  <input
                    ref={visaRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setVisaFileName(e.target.files?.[0]?.name ?? null)}
                  />
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-dz-gray-700 mb-1">Date d&apos;expiration du document</label>
                    <input
                      type="date"
                      value={form.visaExpiry}
                      onChange={(e) => update("visaExpiry", e.target.value)}
                      className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700"
                    />
                  </div>
                </div>

                <div className="border-t border-dz-gray-100 pt-6">
                  <label className="block text-sm font-medium text-dz-gray-700 mb-3">Selfie avec votre passeport *</label>
                  <button
                    type="button"
                    onClick={() => selfieRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      selfieFileName ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/40"
                    }`}
                  >
                    {selfieFileName ? (
                      <div className="flex items-center justify-center gap-2 text-dz-green">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{selfieFileName}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-dz-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-dz-gray-500">Tenez votre passeport ouvert à côté de votre visage</p>
                        <p className="text-xs text-dz-gray-400 mt-1">JPG ou PNG — max 10 MB</p>
                      </>
                    )}
                  </button>
                  <input
                    ref={selfieRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSelfieFileName(e.target.files?.[0]?.name ?? null)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-dz-gray-200 text-dz-gray-600 py-4 rounded-xl font-semibold transition-colors hover:border-dz-gray-300">
                  ← Retour
                </button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold transition-colors">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Routes & Vehicle */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-6">
                <h2 className="font-semibold text-dz-gray-800">Trajet & véhicule</h2>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Pays européens où vous opérez *</label>
                  <div className="flex flex-wrap gap-2">
                    {EUROPEAN_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleRoute(c.code)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.routes.includes(c.code)
                            ? "border-dz-green bg-dz-green/5 text-dz-green"
                            : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                        }`}
                      >
                        <span>{c.flag}</span> {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Villes algériennes desservies *</label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {ALGERIAN_CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          form.algerianCities.includes(city)
                            ? "border-dz-green bg-dz-green/5 text-dz-green"
                            : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Fréquence des trajets</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Hebdomadaire", "Bimensuel", "Mensuel", "Occasionnel"].map((f) => (
                      <label
                        key={f}
                        className={`border rounded-xl p-3 text-center cursor-pointer text-xs font-medium transition-all ${
                          form.tripFrequency === f ? "border-dz-green bg-dz-green/5 text-dz-green" : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tripFrequency"
                          value={f}
                          checked={form.tripFrequency === f}
                          onChange={(e) => update("tripFrequency", e.target.value)}
                          className="sr-only"
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Type de véhicule</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Voiture", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg> },
                      { label: "Fourgon", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM3 11V7a2 2 0 012-2h9l4 5v5M3 11h14M3 11V9" /></svg> },
                      { label: "Camionnette", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM3 10V7a1 1 0 011-1h5l3 4M3 10h10m0 0l2-4h3a1 1 0 011 1v3m0 0v3H3" /></svg> },
                      { label: "Camion", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM1 1h14v11H1zM14 6h4l3 3v5h-7V6z" /></svg> },
                    ].map((v) => (
                      <label
                        key={v.label}
                        className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                          form.vehicle === v.label ? "border-dz-green bg-dz-green/5" : "border-dz-gray-200 hover:border-dz-green/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="vehicle"
                          value={v.label}
                          checked={form.vehicle === v.label}
                          onChange={(e) => update("vehicle", e.target.value)}
                          className="sr-only"
                        />
                        <div className={`flex justify-center mb-1 ${form.vehicle === v.label ? "text-dz-green" : "text-dz-gray-400"}`}>{v.icon}</div>
                        <div className="text-xs font-medium text-dz-gray-700">{v.label}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Poids maximum accepté (kg)</label>
                  <input
                    type="number"
                    value={form.maxWeight}
                    onChange={(e) => update("maxWeight", e.target.value)}
                    placeholder="Ex: 150"
                    className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-2">Langues parlées</label>
                  <div className="flex flex-wrap gap-2">
                    {["Arabe", "Français", "Tamazight", "Espagnol", "Allemand", "Italien", "Anglais"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          form.languages.includes(lang)
                            ? "border-dz-green bg-dz-green/5 text-dz-green"
                            : "border-dz-gray-200 text-dz-gray-600 hover:border-dz-green/30"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dz-gray-700 mb-1">Notes supplémentaires</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Ex: Je peux récupérer les colis à domicile, j'ai de l'expérience avec la douane..."
                    className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border-2 border-dz-gray-200 text-dz-gray-600 py-4 rounded-xl font-semibold transition-colors hover:border-dz-gray-300">
                  ← Retour
                </button>
                <button type="button" onClick={() => setStep(4)} className="flex-1 bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold transition-colors">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-5">
                <h2 className="font-semibold text-dz-gray-800">Vérification de votre dossier</h2>

                <div className="space-y-3">
                  {[
                    { label: "Nom complet", value: `${form.firstName} ${form.lastName}` },
                    { label: "Email", value: form.email },
                    { label: "Téléphone", value: form.phone || "—" },
                    { label: "Date de naissance", value: form.dateOfBirth || "—" },
                    { label: "Adresse Europe", value: form.europeanAddress || "—" },
                    { label: "Passeport N°", value: form.passportNumber || "—" },
                    { label: "Type de visa", value: form.visaType },
                    { label: "Pays opérés", value: form.routes.map((r) => EUROPEAN_COUNTRIES.find((c) => c.code === r)?.name).filter(Boolean).join(", ") || "—" },
                    { label: "Villes algériennes", value: form.algerianCities.join(", ") || "—" },
                    { label: "Fréquence", value: form.tripFrequency },
                    { label: "Véhicule", value: form.vehicle },
                    { label: "Poids max", value: form.maxWeight ? `${form.maxWeight} kg` : "—" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm py-2 border-b border-dz-gray-50 last:border-0">
                      <span className="text-dz-gray-500">{row.label}</span>
                      <span className="font-medium text-dz-gray-800 text-right max-w-xs">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Passeport", file: passportFileName },
                    { label: "Document de séjour", file: visaFileName },
                    { label: "Selfie avec passeport", file: selfieFileName },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center gap-2 text-sm">
                      {doc.file ? (
                        <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-dz-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                      )}
                      <span className={doc.file ? "text-dz-gray-700" : "text-dz-gray-400"}>
                        {doc.label}: {doc.file ?? "Non uploadé"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 p-4 bg-dz-green/5 rounded-xl">
                  <svg className="w-5 h-5 text-dz-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs text-dz-gray-600 leading-relaxed">
                    En soumettant ce dossier, vous certifiez que toutes les informations sont exactes et que vous disposez des droits légaux pour effectuer des transports entre l&apos;Algérie et l&apos;Europe. Notre équipe vérifiera votre dossier sous 48–72h.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="flex-1 border-2 border-dz-gray-200 text-dz-gray-600 py-4 rounded-xl font-semibold transition-colors hover:border-dz-gray-300">
                  ← Retour
                </button>
                <button type="submit" className="flex-1 bg-dz-green hover:bg-dz-green-light text-white py-4 rounded-xl font-semibold transition-colors">
                  Envoyer au support ✓
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
