"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useListings, useBookings, useToast } from "@/lib/context";

const STEPS = ["Résumé", "Détails colis", "Paiement"];

const PAYMENT_METHODS = [
  { id: "edahabia", label: "Edahabia (Algérie Poste)", desc: "Paiement via votre compte Edahabia", flag: "🇩🇿" },
  { id: "cib", label: "Carte CIB", desc: "Carte bancaire algérienne CIB", flag: "🇩🇿" },
];

const INTERNATIONAL_PAYMENT_METHODS = [
  { id: "stripe_card", label: "Visa / Mastercard", desc: "Paiement sécurisé par carte bancaire internationale via Stripe", flag: "💳" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < current ? "bg-dz-green text-white" :
              i === current ? "bg-dz-green text-white ring-4 ring-dz-green/20" :
              "bg-dz-gray-100 text-dz-gray-400"
            }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i <= current ? "text-dz-green" : "text-dz-gray-400"}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? "bg-dz-green" : "bg-dz-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReserverPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const { getListingById } = useListings();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { addToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [parcel, setParcel] = useState({
    weight: "",
    dimensions: "",
    content: "",
    pickupAddress: "",
    recipientName: "",
    recipientPhone: "",
    instructions: "",
    declared: false,
    prohibited: false,
    signature: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const listing = getListingById(listingId);

  useEffect(() => {
    if (!user) router.push("/connexion");
  }, [user, router]);

  if (!user) return null;

  if (!listing) {
    return (
      <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dz-gray-500 mb-4">Annonce introuvable</p>
          <Link href="/annonces" className="text-dz-green font-medium hover:underline">Retour aux annonces</Link>
        </div>
      </div>
    );
  }

  const isIntl      = listing.is_international ?? false;
  const weightKg    = parseFloat(parcel.weight) || 0;
  const transport   = isIntl
    ? Math.round(listing.price_per_kg * weightKg * 100) / 100
    : Math.round(listing.price_per_kg * weightKg);
  const commission  = isIntl
    ? Math.round(transport * 0.1 * 100) / 100
    : Math.round(transport * 0.1);
  const total       = isIntl
    ? Math.round((transport + commission) * 100) / 100
    : transport + commission;
  const currency    = isIntl ? "€" : "DA";

  function updateParcel(field: string, value: string | boolean) {
    setParcel(prev => ({ ...prev, [field]: value }));
  }

  function step1Valid() { return true; }
  function step2Valid() {
    return parcel.weight.trim() && parcel.content.trim() && parcel.pickupAddress.trim()
      && parcel.recipientName.trim() && parcel.recipientPhone.trim()
      && parcel.declared && parcel.prohibited && parcel.signature.trim().length >= 3;
  }
  function step3Valid() { return paymentMethod && termsAccepted; }

  async function handleConfirm() {
    if (!listing) return;
    setSubmitting(true);

    // Step 1: Create booking in DB
    const booking = await createBooking({
      listing_id:      listing.id,
      weight:          weightKg,
      dimensions:      parcel.dimensions || undefined,
      content:         parcel.content,
      pickup_address:  parcel.pickupAddress,
      recipient_name:  parcel.recipientName,
      recipient_phone: parcel.recipientPhone,
      instructions:    parcel.instructions || undefined,
      total_amount:    total,
    });

    if (!booking) {
      setSubmitting(false);
      addToast("Erreur lors de la réservation. Veuillez réessayer.", "error");
      return;
    }

    // Step 2: Route to Stripe (international) or Chargily (domestic)
    const paymentEndpoint = isIntl ? "/api/payment/stripe/create" : "/api/payment/create";
    const res = await fetch(paymentEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, paymentMethod }),
    });
    const json = await res.json();
    if (json.checkout_url) {
      window.location.href = json.checkout_url;
      return;
    } else {
      setSubmitting(false);
      addToast("Erreur de paiement. Réessayez ou contactez le support.", "error");
    }
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href={`/annonces/${listingId}`} className="inline-flex items-center gap-2 text-sm text-dz-gray-500 hover:text-dz-green mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'annonce
        </Link>

        <h1 className="text-2xl font-bold text-dz-gray-800 mb-6">Réserver ce trajet</h1>

        <StepBar current={step} />

        {/* ── STEP 0 — Résumé ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-4">Détails du trajet</h2>

              {/* Route */}
              <div className="flex items-center gap-3 bg-dz-gray-50 rounded-xl p-4 mb-4">
                <div className="flex-1 text-center">
                  <p className="text-xs text-dz-gray-400 mb-1">Départ</p>
                  <p className="font-bold text-dz-gray-800">{listing.from_city}</p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-dz-gray-400 mb-1">Arrivée</p>
                  <p className="font-bold text-dz-gray-800">{listing.to_city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-dz-gray-50 rounded-xl p-3">
                  <p className="text-xs text-dz-gray-400">Date</p>
                  <p className="text-sm font-semibold text-dz-gray-800 mt-0.5">
                    {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="bg-dz-gray-50 rounded-xl p-3">
                  <p className="text-xs text-dz-gray-400">Capacité disponible</p>
                  <p className="text-sm font-semibold text-dz-gray-800 mt-0.5">{listing.available_weight} kg</p>
                </div>
              </div>

              {/* Transporter */}
              <div className="flex items-center gap-3 border-t border-dz-gray-100 pt-4">
                <div className="w-11 h-11 bg-dz-green/10 rounded-full flex items-center justify-center text-sm font-bold text-dz-green flex-shrink-0">
                  {listing.user_id.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-dz-gray-800 text-sm">Transporteur vérifié</p>
                  <div className="flex items-center gap-1 text-xs text-dz-gray-500 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    DZColis vérifié
                  </div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-semibold">Vérifié</span>
                </div>
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-4">Résumé du prix</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-dz-gray-600">
                  <span>Transport ({listing.price_per_kg.toLocaleString("fr-FR")} {currency} × {weightKg || "?"} kg)</span>
                  <span className="font-medium">{transport.toLocaleString("fr-FR")} {currency}</span>
                </div>
                <div className="flex justify-between text-dz-gray-600">
                  <span>Commission DZColis (10%)</span>
                  <span className="font-medium">{commission.toLocaleString("fr-FR")} {currency}</span>
                </div>
                <div className="flex justify-between text-dz-green text-sm">
                  <span>Assurance DZColis Protect</span>
                  <span className="font-semibold">Gratuit</span>
                </div>
                <div className="border-t border-dz-gray-200 pt-2.5 flex justify-between font-bold text-dz-gray-800 text-base">
                  <span>Total</span>
                  <span>{total.toLocaleString("fr-FR")} {currency}</span>
                </div>
              </div>
            </div>

            {/* Protection banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-dz-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Paiement sécurisé par escrow</p>
                <p className="text-xs text-green-700 mt-0.5 leading-relaxed">Votre paiement est bloqué jusqu'à confirmation de réception. Le transporteur n'est payé qu'après votre validation.</p>
              </div>
            </div>

            <button onClick={() => setStep(1)} className="w-full bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity">
              Continuer →
            </button>
          </div>
        )}

        {/* ── STEP 1 — Détails colis ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-5">Informations sur votre colis</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Poids (kg) *</label>
                    <input type="number" min="0.1" step="0.1" value={parcel.weight}
                      onChange={e => updateParcel("weight", e.target.value)}
                      placeholder="ex: 2.5"
                      className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Dimensions (cm)</label>
                    <input type="text" value={parcel.dimensions}
                      onChange={e => updateParcel("dimensions", e.target.value)}
                      placeholder="ex: 30×20×15"
                      className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Contenu du colis *</label>
                  <textarea rows={2} value={parcel.content}
                    onChange={e => updateParcel("content", e.target.value)}
                    placeholder="ex: Vêtements, chaussures, médicaments..."
                    className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Adresse de collecte *</label>
                  <input type="text" value={parcel.pickupAddress}
                    onChange={e => updateParcel("pickupAddress", e.target.value)}
                    placeholder="Adresse complète où le transporteur viendra récupérer le colis"
                    className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"/>
                </div>

                <div className="border-t border-dz-gray-100 pt-4">
                  <p className="text-xs font-bold text-dz-gray-500 uppercase tracking-wide mb-3">Destinataire</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Nom complet *</label>
                      <input type="text" value={parcel.recipientName}
                        onChange={e => updateParcel("recipientName", e.target.value)}
                        placeholder="Prénom Nom"
                        className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Téléphone *</label>
                      <input type="tel" value={parcel.recipientPhone}
                        onChange={e => updateParcel("recipientPhone", e.target.value)}
                        placeholder="+213 5XX XXX XXX"
                        className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"/>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Instructions spéciales (optionnel)</label>
                  <textarea rows={2} value={parcel.instructions}
                    onChange={e => updateParcel("instructions", e.target.value)}
                    placeholder="Fragile, tenir à l'endroit, ne pas plier..."
                    className="w-full px-3 py-2.5 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none"/>
                </div>
              </div>
            </div>

            {/* Legal declaration */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-4">Déclaration légale</h2>

              <div className="space-y-3 mb-5">
                <label className="flex gap-3 cursor-pointer items-start">
                  <input type="checkbox" checked={parcel.declared}
                    onChange={e => updateParcel("declared", e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-dz-green flex-shrink-0"/>
                  <span className="text-sm text-dz-gray-700">Je déclare que le contenu de mon colis est conforme à la description ci-dessus et à la réglementation douanière algérienne.</span>
                </label>
                <label className="flex gap-3 cursor-pointer items-start">
                  <input type="checkbox" checked={parcel.prohibited}
                    onChange={e => updateParcel("prohibited", e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-dz-green flex-shrink-0"/>
                  <span className="text-sm text-dz-gray-700">Je certifie que mon colis ne contient aucun article interdit : armes, drogues, contrefaçons, devises en espèces, explosifs, animaux vivants.</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dz-gray-600 mb-1.5">Signature électronique — tapez votre nom complet *</label>
                <input type="text" value={parcel.signature}
                  onChange={e => updateParcel("signature", e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full px-4 py-3 border-2 border-dz-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green"
                  style={{ fontFamily: "Georgia, serif" }}/>
                <p className="text-xs text-dz-gray-400 mt-1.5">Cette signature électronique a valeur légale conformément à la loi algérienne n° 15-04.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border border-dz-gray-200 text-dz-gray-600 py-3.5 rounded-xl font-semibold hover:bg-dz-gray-50 transition-colors">
                ← Retour
              </button>
              <button onClick={() => { if (step2Valid()) setStep(2); else addToast("Veuillez remplir tous les champs obligatoires et signer", "error"); }}
                className="flex-[2] bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Paiement ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Order recap */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-4">Récapitulatif</h2>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dz-gray-100">
                <div className="w-10 h-10 bg-dz-green/10 rounded-xl flex items-center justify-center text-sm font-bold text-dz-green flex-shrink-0">
                  {listing.from_city.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dz-gray-800 text-sm truncate">{listing.from_city} → {listing.to_city}</p>
                  <p className="text-xs text-dz-gray-500">{new Date(listing.departure_date).toLocaleDateString("fr-DZ")} · {listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dz-gray-600"><span>Transport ({parcel.weight || "?"} kg × {listing.price_per_kg} {currency})</span><span>{transport.toLocaleString("fr-FR")} {currency}</span></div>
                <div className="flex justify-between text-dz-gray-600"><span>Commission (10%)</span><span>{commission.toLocaleString("fr-FR")} {currency}</span></div>
                <div className="flex justify-between text-green-600"><span>Assurance</span><span>Gratuit</span></div>
                <div className="flex justify-between font-bold text-dz-gray-800 text-base border-t border-dz-gray-100 pt-2.5">
                  <span>Total à payer</span><span>{total.toLocaleString("fr-FR")} {currency}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-dz-gray-800 mb-1">Mode de paiement</h2>
              {isIntl && (
                <p className="text-xs text-dz-gray-500 mb-4 flex items-center gap-1.5">
                  <span>💳</span> Paiement international sécurisé via Stripe — montant en euros (€)
                </p>
              )}
              {!isIntl && <div className="mb-4" />}
              <div className="space-y-2.5">
                {(isIntl ? INTERNATIONAL_PAYMENT_METHODS : PAYMENT_METHODS).map(m => (
                  <label key={m.id} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === m.id ? "border-dz-green bg-green-50" : "border-dz-gray-200 hover:border-dz-gray-300"
                  }`}>
                    <input type="radio" name="payment" value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="sr-only"/>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === m.id ? "border-dz-green" : "border-dz-gray-300"
                    }`}>
                      {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-dz-green"/>}
                    </div>
                    <span className="text-lg">{m.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dz-gray-800">{m.label}</p>
                      <p className="text-xs text-dz-gray-500">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-medium">
                    Le paiement est conservé en escrow par DZColis et libéré uniquement après confirmation de réception de votre colis.
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-5">
              <label className="flex gap-3 cursor-pointer items-start">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-dz-green flex-shrink-0"/>
                <span className="text-sm text-dz-gray-700">
                  J&apos;accepte les <Link href="/cgv" className="text-dz-green underline" target="_blank">Conditions Générales de Vente</Link> et la{" "}
                  <Link href="/charte-transporteur" className="text-dz-green underline" target="_blank">Charte Transporteur</Link> de DZColis.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-dz-gray-200 text-dz-gray-600 py-3.5 rounded-xl font-semibold hover:bg-dz-gray-50 transition-colors">
                ← Retour
              </button>
              <button
                onClick={() => { if (step3Valid()) handleConfirm(); else addToast("Choisissez un mode de paiement et acceptez les CGV", "error"); }}
                disabled={submitting}
                className="flex-[2] bg-dz-green hover:opacity-90 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                {submitting ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Traitement...</>
                ) : "Confirmer la réservation"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
