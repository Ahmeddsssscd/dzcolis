"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth, useListings, useBookings } from "@/lib/context";
import ReviewModal from "@/components/ReviewModal";

// ─── Trust Score helpers ───────────────────────────────────────────────────

function computeTrustScore(rating: number, reviews: number): number {
  const ratingPts = Math.round(rating * 10);          // 0-50
  const reviewPts = Math.min(reviews, 30);             // 0-30
  const bonusPts = rating >= 4.5 ? 10 : 0;
  const base = 20;
  return Math.min(100, base + ratingPts + reviewPts + bonusPts);
}

function trustLevel(score: number): { label: string; badgeCls: string; barCls: string } {
  if (score <= 30) return { label: "Débutant",   badgeCls: "bg-red-100 text-red-700 border-red-200",       barCls: "bg-red-400" };
  if (score <= 60) return { label: "Confirmé",   badgeCls: "bg-orange-100 text-orange-700 border-orange-200", barCls: "bg-orange-400" };
  if (score <= 80) return { label: "Expert",     badgeCls: "bg-blue-100 text-blue-700 border-blue-200",     barCls: "bg-blue-500" };
  return           { label: "Elite ✓",          badgeCls: "bg-green-100 text-green-700 border-green-200",  barCls: "bg-dz-green" };
}

function insuranceAccess(score: number): string[] {
  const plans: string[] = [];
  if (score >= 20) plans.push("Formule Essentielle (jusqu'à 30 000 DA)");
  if (score >= 50) plans.push("Formule Standard (jusqu'à 100 000 DA)");
  if (score >= 75) plans.push("Formule Premium (jusqu'à 500 000 DA)");
  return plans;
}

// ─── Photo upload state per listing ───────────────────────────────────────

interface ListingPhotoState {
  pickupPhoto: string | null;
  deliveryPhoto: string | null;
}

// ─── Shipment confirm state per booking ───────────────────────────────────

interface ConfirmState {
  asking: boolean;
  confirmed: boolean;
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { listings } = useListings();
  const { bookings, getBookingsForUser, updateBookingStatus } = useBookings();
  const router = useRouter();

  // Photo upload state: listingId → { pickupPhoto, deliveryPhoto }
  const [photoState, setPhotoState] = useState<Record<string, ListingPhotoState>>({});
  // Collapsible "Actions DZColis Protect" per listing
  const [expandedListings, setExpandedListings] = useState<Record<string, boolean>>({});
  // Shipment reception confirmation per booking
  const [confirmState, setConfirmState] = useState<Record<string, ConfirmState>>({});
  // Verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Review modal state
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  // Transporter incoming bookings
  const [transporterBookings, setTransporterBookings] = useState<Record<string, unknown>[]>([]);
  const [transporterLoading, setTransporterLoading] = useState(true);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // Refs for file inputs (one pair per listing, keyed by listingId)
  const pickupInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const deliveryInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!user) {
    router.push("/connexion");
    return null;
  }

  const myListings = listings.filter((l) => l.user_id === user.id);
  const myBookings = getBookingsForUser(user.id);
  const activeBookings = myBookings.filter((b) => b.status !== "delivered" && b.status !== "cancelled");

  const trustScore = computeTrustScore(user.rating, user.reviews);
  const level = trustLevel(trustScore);
  const accessiblePlans = insuranceAccess(trustScore);
  const isNewUser = user.reviews === 0 || user.rating === 5.0;

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending:    { text: "En attente", color: "bg-yellow-100 text-yellow-700" },
    accepted:   { text: "Accepté",    color: "bg-blue-100 text-blue-700" },
    in_transit: { text: "En transit", color: "bg-purple-100 text-purple-700" },
    delivered:  { text: "Livré",      color: "bg-green-100 text-green-700" },
    cancelled:  { text: "Annulé",     color: "bg-red-100 text-red-700" },
  };

  // ── helpers ──
  function toggleListing(id: string) {
    setExpandedListings((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleFileUpload(
    listingId: string,
    field: "pickupPhoto" | "deliveryPhoto",
    file: File | undefined
  ) {
    if (!file) return;
    setPhotoState((prev) => ({
      ...prev,
      [listingId]: {
        pickupPhoto: prev[listingId]?.pickupPhoto ?? null,
        deliveryPhoto: prev[listingId]?.deliveryPhoto ?? null,
        [field]: file.name,
      },
    }));
  }

  function askConfirm(bookingId: string) {
    setConfirmState((prev) => ({ ...prev, [bookingId]: { asking: true, confirmed: false } }));
  }

  function doConfirm(bookingId: string) {
    setConfirmState((prev) => ({ ...prev, [bookingId]: { asking: false, confirmed: true } }));
    updateBookingStatus(bookingId, "delivered");
  }

  function cancelConfirm(bookingId: string) {
    setConfirmState((prev) => ({ ...prev, [bookingId]: { asking: false, confirmed: false } }));
  }

  // ── Transporter bookings fetch ──
  useEffect(() => {
    fetch("/api/bookings/transporter")
      .then(r => r.json())
      .then(data => { setTransporterBookings(Array.isArray(data) ? data : []); setTransporterLoading(false); })
      .catch(() => setTransporterLoading(false));
  }, []);

  async function handleTransporterAction(bookingId: string, status: string) {
    setUpdatingBooking(bookingId);
    await fetch("/api/bookings/update-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    fetch("/api/bookings/transporter")
      .then(r => r.json())
      .then(data => setTransporterBookings(Array.isArray(data) ? data : []));
    setUpdatingBooking(null);
  }

  // ── Shipment status tracker steps ──
  const shipmentSteps = ["En attente", "Récupéré", "En route", "Livré", "✅ Confirmé"];
  function stepIndex(status: string): number {
    const map: Record<string, number> = {
      pending: 0, accepted: 1, in_transit: 2, delivered: 3,
    };
    return map[status] ?? 0;
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      {/* ── Review modal ── */}
      {reviewBookingId && (() => {
        const b = myBookings.find(bk => bk.id === reviewBookingId);
        const l = listings.find(li => li.id === b?.listing_id);
        return (
          <ReviewModal
            transporterName="Transporteur"
            transporterAvatar="T"
            onSubmit={(rating, comment) => {
              setReviewedBookings(prev => new Set([...prev, reviewBookingId]));
              setReviewBookingId(null);
              console.log("Review submitted:", { rating, comment, bookingId: reviewBookingId });
            }}
            onClose={() => setReviewBookingId(null)}
          />
        );
      })()}
      {/* ── Verification modal ── */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-dz-gray-800 mb-2">Vérification d&apos;identité</h2>
            <p className="text-dz-gray-500 text-sm mb-4">
              La vérification d&apos;identité vous permet d&apos;accéder aux formules d&apos;assurance Premium et
              d&apos;augmenter votre Score de Confiance DZColis. Préparez une copie de votre carte nationale d&apos;identité.
            </p>
            <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-xl p-4 mb-4 text-sm text-dz-gray-600 space-y-1">
              <p>1. Recto / verso de la CIN</p>
              <p>2. Selfie avec la pièce d&apos;identité</p>
              <p>3. Validation sous 24h par notre équipe</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/kyc"
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 bg-dz-green hover:bg-dz-green-dark text-white py-2.5 rounded-xl font-medium text-sm transition-colors text-center"
              >
                Commencer la vérification
              </Link>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 border border-dz-gray-200 text-dz-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-dz-gray-50 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Verification banner ── */}
        {isNewUser && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚡ Vérifiez votre profil pour accéder aux formules d&apos;assurance Premium et augmenter votre Score de Confiance
            </p>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Vérifier mon identité
            </button>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-dz-gray-800">Bonjour, {user.firstName} !</h1>
              {/* Trust Score Badge */}
              <div className={`flex items-center gap-2 border rounded-full px-3 py-1 text-xs font-semibold ${level.badgeCls}`}>
                <span className="font-bold text-sm">{trustScore}</span>
                <span>{level.label}</span>
              </div>
            </div>
            <p className="text-dz-gray-500 mt-0.5">Bienvenue sur votre tableau de bord</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/envoyer" className="bg-dz-green hover:bg-dz-green-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
              + Envoyer un colis
            </Link>
            <Link href="/transporter" className="border border-dz-gray-200 hover:border-dz-green/30 text-dz-gray-700 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
              + Proposer un trajet
            </Link>
          </div>
        </div>

        {/* ── Trust Score card (full) ── */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-dz-gray-500 uppercase tracking-wide mb-1">Score de Confiance DZColis</p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-dz-gray-800">{trustScore} / 100</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${level.badgeCls}`}>{level.label}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-dz-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${level.barCls}`}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
            <Link
              href="/assurance"
              className="shrink-0 text-xs text-dz-green font-medium hover:underline whitespace-nowrap"
            >
              Comment améliorer mon score ?
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-5">
            <p className="text-sm text-dz-gray-500">Mes annonces</p>
            <p className="text-2xl font-bold text-dz-gray-800 mt-1">{myListings.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-5">
            <p className="text-sm text-dz-gray-500">Réservations actives</p>
            <p className="text-2xl font-bold text-dz-gray-800 mt-1">{activeBookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-5">
            <p className="text-sm text-dz-gray-500">Note moyenne</p>
            <p className="text-2xl font-bold text-dz-gray-800 mt-1 flex items-center gap-1">
              {user.rating}
              <svg className="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-5">
            <p className="text-sm text-dz-gray-500">Membre depuis</p>
            <p className="text-2xl font-bold text-dz-gray-800 mt-1">
              {new Date(user.createdAt).toLocaleDateString("fr-DZ", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column: Listings + Bookings ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* My Listings */}
            <div>
              <h2 className="text-lg font-bold text-dz-gray-800 mb-4">Mes annonces</h2>
              {myListings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dz-gray-200 p-8 text-center">
                  <p className="text-dz-gray-500 mb-4">Vous n&apos;avez pas encore d&apos;annonces</p>
                  <Link href="/envoyer" className="text-dz-green font-medium hover:underline">Publier ma première annonce</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((l) => {
                    const photos = photoState[l.id] ?? { pickupPhoto: null, deliveryPhoto: null };
                    const isExpanded = expandedListings[l.id] ?? false;

                    return (
                      <div key={l.id} className="bg-white rounded-xl border border-dz-gray-200 overflow-hidden">
                        {/* Listing card */}
                        <Link href={`/annonces/${l.id}`} className="block p-4 hover:bg-dz-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.is_international ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                                {l.is_international ? "✈️ International" : "🇩🇿 National"}
                              </span>
                              <h3 className="font-medium text-dz-gray-800 mt-1 text-sm">{l.description.substring(0,40)}</h3>
                              <p className="text-xs text-dz-gray-500 mt-1">{l.from_city} → {l.to_city}</p>
                            </div>
                            <span className="font-bold text-dz-green text-sm">{l.price_per_kg.toLocaleString("fr-FR")} {l.is_international ? "€" : "DA"}</span>
                          </div>
                        </Link>

                        {/* Actions DZColis Protect toggle */}
                        <div className="border-t border-dz-gray-100">
                          <button
                            onClick={() => toggleListing(l.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-dz-green hover:bg-green-50 transition-colors"
                          >
                            <span>🛡️ Actions DZColis Protect</span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 bg-green-50/50">
                              {true ? (
                                /* Transporteur actions */
                                <div className="space-y-3 pt-3">
                                  <p className="text-xs text-dz-gray-500 italic">
                                    Ces photos protègent votre paiement et prouvent la livraison
                                  </p>

                                  {/* Pickup photo */}
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      ref={(el) => { pickupInputRefs.current[l.id] = el; }}
                                      onChange={(e) => handleFileUpload(l.id, "pickupPhoto", e.target.files?.[0])}
                                    />
                                    <button
                                      onClick={() => pickupInputRefs.current[l.id]?.click()}
                                      className="flex items-center gap-2 text-xs font-medium bg-white border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-700 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      📸 Uploader photo de récupération
                                    </button>
                                    {photos.pickupPhoto && (
                                      <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                                        ✓ {photos.pickupPhoto}
                                      </p>
                                    )}
                                  </div>

                                  {/* Delivery photo */}
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      ref={(el) => { deliveryInputRefs.current[l.id] = el; }}
                                      onChange={(e) => handleFileUpload(l.id, "deliveryPhoto", e.target.files?.[0])}
                                    />
                                    <button
                                      onClick={() => deliveryInputRefs.current[l.id]?.click()}
                                      className="flex items-center gap-2 text-xs font-medium bg-white border border-dz-gray-200 hover:border-dz-green/40 text-dz-gray-700 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      📸 Uploader photo de livraison
                                    </button>
                                    {photos.deliveryPhoto && (
                                      <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                                        ✓ {photos.deliveryPhoto}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* Expéditeur actions — find matching booking */
                                (() => {
                                  const relatedBooking = myBookings.find((b) => b.listing_id === l.id);
                                  if (!relatedBooking) {
                                    return (
                                      <p className="pt-3 text-xs text-dz-gray-400 italic">
                                        Aucune réservation liée à cette annonce pour le moment.
                                      </p>
                                    );
                                  }
                                  const bId = relatedBooking!.id;
                                  const cs = confirmState[bId] ?? { asking: false, confirmed: false };
                                  const currentStep = cs.confirmed ? 4 : stepIndex(relatedBooking!.status);

                                  return (
                                    <div className="pt-3 space-y-4">
                                      {/* Step tracker */}
                                      <div className="flex items-center gap-0">
                                        {shipmentSteps.map((step, idx) => (
                                          <div key={step} className="flex items-center flex-1 last:flex-none">
                                            <div className="flex flex-col items-center">
                                              <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                                                  idx <= currentStep
                                                    ? "bg-dz-green border-dz-green text-white"
                                                    : "bg-white border-dz-gray-300 text-dz-gray-400"
                                                }`}
                                              >
                                                {idx <= currentStep ? "✓" : idx + 1}
                                              </div>
                                              <span className={`text-[9px] mt-1 text-center leading-tight max-w-[48px] ${idx <= currentStep ? "text-dz-green font-semibold" : "text-dz-gray-400"}`}>
                                                {step}
                                              </span>
                                            </div>
                                            {idx < shipmentSteps.length - 1 && (
                                              <div className={`flex-1 h-0.5 mb-4 ${idx < currentStep ? "bg-dz-green" : "bg-dz-gray-200"}`} />
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {/* Confirm reception */}
                                      {!cs.confirmed && (
                                        <>
                                          <p className="text-xs text-dz-gray-500 italic">
                                            Cette confirmation libère le paiement au transporteur
                                          </p>
                                          {!cs.asking ? (
                                            <button
                                              onClick={() => askConfirm(bId)}
                                              className="w-full bg-dz-green hover:bg-dz-green-dark text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                                            >
                                              ✅ Confirmer la réception de mon colis
                                            </button>
                                          ) : (
                                            <div className="bg-white border border-dz-gray-200 rounded-xl p-4 space-y-3">
                                              <p className="text-sm font-medium text-dz-gray-800 text-center">
                                                Vous confirmez avoir bien reçu votre colis ?
                                              </p>
                                              <div className="flex gap-3">
                                                <button
                                                  onClick={() => doConfirm(bId)}
                                                  className="flex-1 bg-dz-green hover:bg-dz-green-dark text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                                                >
                                                  Oui, confirmer
                                                </button>
                                                <button
                                                  onClick={() => cancelConfirm(bId)}
                                                  className="flex-1 border border-dz-gray-200 text-dz-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-dz-gray-50 transition-colors"
                                                >
                                                  Non
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {cs.confirmed && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium text-center">
                                          Réception confirmée — paiement libéré au transporteur
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Demandes de livraison reçues ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-dz-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-dz-gray-800">Demandes reçues</h3>
                  {!transporterLoading && transporterBookings.filter(b => b.status === "pending").length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {transporterBookings.filter(b => b.status === "pending").length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-dz-gray-400">Réservations sur vos annonces</p>
              </div>
              {transporterLoading ? (
                <div className="p-8 text-center text-dz-gray-400 text-sm">Chargement…</div>
              ) : transporterBookings.length === 0 ? (
                <div className="p-8 text-center text-dz-gray-400 text-sm">Aucune demande reçue pour l&apos;instant</div>
              ) : (
                <div className="divide-y divide-dz-gray-50">
                  {transporterBookings.map(b => {
                    const bStatus = String(b.status ?? "pending");
                    const statusStyle = statusLabel[bStatus] ?? { text: bStatus, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div key={String(b.id)} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-dz-gray-800">{String(b.from_city ?? "")} → {String(b.to_city ?? "")}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.color}`}>{statusStyle.text}</span>
                          </div>
                          <p className="text-xs text-dz-gray-500">
                            De : <span className="font-medium">{String(b.sender_name ?? "—")}</span>
                            {b.sender_phone ? ` · ${String(b.sender_phone)}` : ""}
                            {" · "}{Number(b.weight ?? 0)}kg · {String(b.content ?? "")}
                          </p>
                          <p className="text-xs text-dz-gray-400 mt-0.5">
                            Réf : <Link href={`/suivi?ref=${encodeURIComponent(String(b.booking_ref ?? ""))}`} className="font-mono text-dz-green hover:underline">{String(b.booking_ref ?? "—")}</Link> · {b.created_at ? new Date(String(b.created_at)).toLocaleDateString("fr-FR") : "—"}
                          </p>
                          {(b.pickup_address as string | null) && (
                            <p className="text-xs text-dz-gray-400 mt-0.5">Adresse : {String(b.pickup_address)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <span className="text-sm font-bold text-dz-gray-800">{Number(b.total_amount ?? 0).toLocaleString("fr-FR")} {(b as any).listings?.is_international ? "€" : "DA"}</span>
                          {bStatus === "pending" && (
                            <>
                              <button disabled={updatingBooking === String(b.id)}
                                onClick={() => handleTransporterAction(String(b.id), "accepted")}
                                className="px-3 py-1.5 bg-dz-green text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                                Accepter
                              </button>
                              <button disabled={updatingBooking === String(b.id)}
                                onClick={() => handleTransporterAction(String(b.id), "cancelled")}
                                className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all">
                                Refuser
                              </button>
                            </>
                          )}
                          {bStatus === "accepted" && (
                            <button disabled={updatingBooking === String(b.id)}
                              onClick={() => handleTransporterAction(String(b.id), "in_transit")}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                              Marquer en route
                            </button>
                          )}
                          {bStatus === "in_transit" && (
                            <button disabled={updatingBooking === String(b.id)}
                              onClick={() => handleTransporterAction(String(b.id), "delivered")}
                              className="px-3 py-1.5 bg-dz-green text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                              Marquer livré
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bookings */}
            <div>
              <h2 className="text-lg font-bold text-dz-gray-800 mb-4">Mes réservations</h2>
              {myBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dz-gray-200 p-8 text-center">
                  <p className="text-dz-gray-500 mb-4">Aucune réservation pour le moment</p>
                  <Link href="/annonces" className="text-dz-green font-medium hover:underline">Parcourir les annonces</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => {
                    const listing = listings.find((l) => l.id === b.listing_id);
                    const status = statusLabel[b.status];
                    return (
                      <div key={b.id} className="bg-white rounded-xl border border-dz-gray-200 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-dz-gray-800 text-sm">{`${listing?.from_city} → ${listing?.to_city}` || "Annonce"}</h3>
                            <p className="text-xs text-dz-gray-500 mt-1">
                              {new Date(b.created_at).toLocaleDateString("fr-DZ")}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        {b.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => updateBookingStatus(b.id, "accepted")} className="text-xs bg-dz-green text-white px-3 py-1.5 rounded-lg font-medium">
                              Accepter
                            </button>
                            <button onClick={() => updateBookingStatus(b.id, "cancelled")} className="text-xs border border-dz-gray-200 text-dz-gray-600 px-3 py-1.5 rounded-lg font-medium">
                              Refuser
                            </button>
                          </div>
                        )}
                        {b.status === "accepted" && (
                          <button onClick={() => updateBookingStatus(b.id, "in_transit")} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium mt-3">
                            Marquer en transit
                          </button>
                        )}
                        {b.status === "in_transit" && (
                          <button onClick={() => updateBookingStatus(b.id, "delivered")} className="text-xs bg-dz-green text-white px-3 py-1.5 rounded-lg font-medium mt-3">
                            Confirmer la livraison
                          </button>
                        )}
                        {b.status === "delivered" && !reviewedBookings.has(b.id) && (
                          <button onClick={() => setReviewBookingId(b.id)} className="text-xs border border-yellow-300 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg font-medium mt-3 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            Laisser un avis
                          </button>
                        )}
                        {b.status === "delivered" && reviewedBookings.has(b.id) && (
                          <p className="text-xs text-dz-green font-medium mt-3 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            Avis publié
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* DZColis Protect insurance widget */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🛡️</span>
                <h3 className="font-bold text-dz-gray-800 text-sm">DZColis Protect</h3>
              </div>

              <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl border text-xs font-semibold ${level.badgeCls}`}>
                <span>Niveau actuel :</span>
                <span>{level.label}</span>
                <span className="font-bold ml-auto">{trustScore}/100</span>
              </div>

              <p className="text-xs text-dz-gray-500 font-semibold uppercase tracking-wide mb-2">
                Formules accessibles
              </p>
              {accessiblePlans.length === 0 ? (
                <p className="text-xs text-dz-gray-400 italic">Augmentez votre score pour débloquer les formules</p>
              ) : (
                <ul className="space-y-1.5 mb-4">
                  {accessiblePlans.map((plan) => (
                    <li key={plan} className="flex items-center gap-2 text-xs text-dz-gray-700">
                      <span className="text-dz-green font-bold">✓</span>
                      {plan}
                    </li>
                  ))}
                </ul>
              )}

              {/* Locked plans hint */}
              {trustScore < 75 && (
                <div className="border-t border-dz-gray-100 pt-3 mt-2">
                  <p className="text-xs text-dz-gray-400 italic mb-1">À débloquer :</p>
                  {trustScore < 50 && (
                    <p className="text-xs text-dz-gray-400">— Formule Standard (score ≥ 50)</p>
                  )}
                  {trustScore < 75 && (
                    <p className="text-xs text-dz-gray-400">— Formule Premium (score ≥ 75)</p>
                  )}
                </div>
              )}

              <Link
                href="/assurance"
                className="mt-4 block text-center text-xs font-semibold text-white bg-dz-green hover:bg-dz-green-dark py-2.5 rounded-xl transition-colors"
              >
                Voir toutes les formules
              </Link>
            </div>

            {/* KYC card */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                </svg>
                <h3 className="font-bold text-dz-gray-800 text-sm">Vérification KYC</h3>
              </div>
              <p className="text-xs text-dz-gray-500 mb-3">Vérifiez votre identité pour transporter des colis et accéder aux assurances Premium.</p>
              <Link href="/kyc" className="block text-center text-xs font-semibold text-white bg-dz-green hover:bg-dz-green-dark py-2.5 rounded-xl transition-colors">
                Vérifier mon identité
              </Link>
            </div>

            {/* Referral card */}
            <div className="bg-white border border-dz-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="font-bold text-dz-gray-800 text-sm">Parrainage</h3>
              </div>
              <p className="text-xs text-dz-gray-500 mb-3">
                Invitez vos amis et gagnez <strong className="text-dz-green">500 DA</strong> par filleul actif.
              </p>
              <div className="bg-dz-gray-50 rounded-xl px-3 py-2.5 mb-3 text-center">
                <p className="text-xs text-dz-gray-400 mb-0.5">Votre code</p>
                <p className="font-bold text-sm tracking-widest font-mono text-dz-gray-800">{user.referralCode || "—"}</p>
              </div>
              <Link
                href="/parrainage"
                className="block text-center text-xs font-semibold text-white bg-dz-green hover:bg-dz-green-dark py-2.5 rounded-xl transition-colors"
              >
                Inviter des amis
              </Link>
            </div>

            {/* Quick tips card */}
            <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-dz-gray-800 text-sm mb-3">Améliorer mon score</h3>
              <ul className="space-y-2 text-xs text-dz-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-dz-green font-bold mt-0.5">+</span>
                  Obtenez des avis positifs de vos correspondants
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dz-green font-bold mt-0.5">+</span>
                  Vérifiez votre identité pour +10 pts de confiance
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dz-green font-bold mt-0.5">+</span>
                  Uploadez les photos de récupération et livraison
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dz-green font-bold mt-0.5">+</span>
                  Confirmez la réception de vos colis rapidement
                </li>
              </ul>
              <Link href="/assurance" className="mt-3 block text-xs text-dz-green font-medium hover:underline">
                En savoir plus →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
