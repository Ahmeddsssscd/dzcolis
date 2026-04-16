"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth, useToast } from "@/lib/context";
import { createClient } from "@/lib/supabase/client";
import type { Listing, Profile } from "@/lib/supabase/types";

type ListingRow = Listing;
type ProfileRow = Profile;

export default function ListingDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [sendingMsg, setSendingMsg] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const [listing, setListing]       = useState<ListingRow | null>(null);
  const [transporter, setTransporter] = useState<ProfileRow | null>(null);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: l } = await supabase
        .from("listings").select("*").eq("id", id).single();
      const listing = l as ListingRow | null;
      if (listing) {
        setListing(listing);
        const { data: p } = await supabase
          .from("profiles").select("*").eq("id", listing.user_id).single();
        setTransporter(p as ProfileRow | null);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = () => {
    if (!user) { router.push("/connexion"); return; }
    router.push(`/reserver/${id}`);
  };

  const sendMsg = async (text: string) => {
    if (!user) { router.push("/connexion"); return; }
    if (!text.trim() || !transporter || sendingMsg) return;
    setSendingMsg(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          other_user_id: transporter.id,
          listing_id: id,
          text: text.trim(),
        }),
      });
      if (res.ok) {
        setMessage("");
        addToast("Message envoyé !");
        router.push("/messages");
      } else {
        addToast("Erreur lors de l'envoi du message", "error");
      }
    } catch {
      addToast("Erreur lors de l'envoi du message", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendMessage = () => sendMsg(message);

  const handleProposeTrajet = () => {
    if (!user) { router.push("/connexion"); return; }
    const proposal = `Bonjour, je fais le trajet ${listing?.from_city} → ${listing?.to_city} et je peux transporter votre colis. Dites-moi quand vous êtes disponible pour qu'on s'organise.`;
    sendMsg(proposal);
  };

  if (loading) {
    return (
      <div className="bg-dz-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-dz-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-dz-gray-200 rounded w-1/4 mb-4" />
              <div className="h-8 bg-dz-gray-200 rounded w-3/4 mb-6" />
              <div className="h-24 bg-dz-gray-200 rounded" />
            </div>
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 animate-pulse h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-dz-gray-800 mb-2">Annonce introuvable</h2>
          <Link href="/annonces" className="text-dz-green hover:underline">Retour aux annonces</Link>
        </div>
      </div>
    );
  }

  const isIntl        = listing.is_international ?? false;
  const isDemande     = (listing as any).listing_type === "demande";
  const currency      = isIntl ? "€" : "DA";
  const priceTotal    = isIntl
    ? Math.round(listing.price_per_kg * listing.available_weight * 100) / 100
    : Math.round(listing.price_per_kg * listing.available_weight);
  const ownerInitials = transporter
    ? ((transporter.first_name?.[0] ?? "") + (transporter.last_name?.[0] ?? "")).toUpperCase() || "?"
    : "?";
  const ownerName = transporter
    ? `${transporter.first_name} ${transporter.last_name}`
    : isDemande ? "Expéditeur" : "Transporteur";

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={isIntl ? "/international" : isDemande ? "/annonces?tab=demandes" : "/annonces"} className="inline-flex items-center gap-1 text-sm text-dz-gray-500 hover:text-dz-green mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isIntl ? "Retour à l'international" : isDemande ? "Retour aux demandes" : "Retour aux annonces"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isDemande ? (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">📦 Demande d&apos;envoi</span>
                  ) : (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${listing.is_international ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                      {listing.is_international ? "✈️ International" : "🇩🇿 National"}
                    </span>
                  )}
                </div>
                <span className={`text-2xl font-bold ${isDemande ? "text-amber-600" : "text-dz-green"}`}>
                  {listing.price_per_kg.toLocaleString("fr-FR")} {currency}/kg
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 p-4 bg-dz-gray-50 rounded-xl mb-6">
                <div className="text-center">
                  <div className="w-3 h-3 bg-dz-green rounded-full mx-auto mb-1" />
                  <span className="font-semibold text-dz-gray-800 text-sm">{listing.from_city}</span>
                </div>
                <svg className="w-8 h-5 text-dz-green flex-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="text-center">
                  <div className="w-3 h-3 bg-dz-red rounded-full mx-auto mb-1" />
                  <span className="font-semibold text-dz-gray-800 text-sm">{listing.to_city}</span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-dz-gray-50 rounded-xl">
                  <p className="text-xs text-dz-gray-500 mb-1">Départ</p>
                  <p className="font-medium text-dz-gray-800 text-sm">
                    {new Date(listing.departure_date).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="p-3 bg-dz-gray-50 rounded-xl">
                  <p className="text-xs text-dz-gray-500 mb-1">Poids disponible</p>
                  <p className="font-medium text-dz-gray-800 text-sm">{listing.available_weight} kg</p>
                </div>
                <div className="p-3 bg-dz-gray-50 rounded-xl">
                  <p className="text-xs text-dz-gray-500 mb-1">Prix au kg</p>
                  <p className="font-medium text-dz-green text-sm">{listing.price_per_kg.toLocaleString("fr-FR")} {currency}</p>
                </div>
              </div>

              <h3 className="font-semibold text-dz-gray-800 mb-2">Description</h3>
              <p className="text-dz-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Insurance */}
            <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-5 flex items-start gap-3">
              <svg className="w-6 h-6 text-dz-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-medium text-dz-gray-800 text-sm">Assurance Waselli incluse</p>
                <p className="text-xs text-dz-gray-600 mt-1">{isIntl ? "Cet envoi est protégé jusqu'à 500 € contre la casse et le vol." : "Cet envoi est protégé jusqu'à 50 000 DA contre la casse et le vol."}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transporter card */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${isDemande ? "bg-amber-50 text-amber-600" : "bg-dz-green/10 text-dz-green"}`}>
                  {ownerInitials}
                </div>
                <div>
                  <p className="text-xs text-dz-gray-400 mb-0.5">{isDemande ? "Expéditeur" : "Transporteur"}</p>
                  <p className="font-semibold text-dz-gray-800">{ownerName}</p>
                  <div className="flex items-center gap-1 text-sm text-dz-gray-500">
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {transporter?.rating ?? "—"} ({transporter?.review_count ?? 0} avis)
                  </div>
                  {transporter?.kyc_status === "approved" && (
                    <span className="text-xs text-dz-green flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944..." />
                      </svg>
                      Identité vérifiée
                    </span>
                  )}
                </div>
              </div>

              {isDemande ? (
                <div className="space-y-2">
                  <p className="text-xs text-dz-gray-500 mb-3">Vous faites ce trajet ? Cliquez pour envoyer votre proposition directement à l&apos;expéditeur.</p>
                  <button
                    onClick={handleProposeTrajet}
                    disabled={sendingMsg}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors">
                    {sendingMsg ? "Envoi en cours..." : "Je propose mon trajet"}
                  </button>
                </div>
              ) : (
                <button onClick={handleBook}
                  className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors">
                  Réserver ce trajet
                </button>
              )}
            </div>

            {/* Message */}
            <div id="msg-box" className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-3 text-sm">
                {isDemande ? "Proposer votre trajet" : "Envoyer un message"}
              </h3>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder={isDemande ? "Bonjour, je fais ce trajet et je peux transporter votre colis..." : "Bonjour, je suis intéressé par votre trajet..."}
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none text-sm" />
              <button onClick={handleSendMessage} disabled={sendingMsg}
                className="w-full mt-3 border border-dz-green text-dz-green hover:bg-dz-green hover:text-white disabled:opacity-50 py-2.5 rounded-xl font-medium transition-colors text-sm">
                {sendingMsg ? "Envoi..." : "Envoyer"}
              </button>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-3 text-sm">Détail du prix</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dz-gray-600">
                  <span>{listing.price_per_kg.toLocaleString("fr-FR")} {currency} × {listing.available_weight} kg</span>
                  <span>{priceTotal.toLocaleString("fr-FR")} {currency}</span>
                </div>
                <div className="flex justify-between text-dz-gray-600">
                  <span>Commission Waselli (10%)</span>
                  <span>{(Math.round(priceTotal * 0.1 * 100) / 100).toLocaleString("fr-FR")} {currency}</span>
                </div>
                <div className="flex justify-between text-dz-gray-600">
                  <span>Assurance</span>
                  <span className="text-dz-green">Gratuit</span>
                </div>
                <div className="border-t border-dz-gray-200 pt-2 flex justify-between font-semibold text-dz-gray-800">
                  <span>Total estimé</span>
                  <span>{(Math.round(priceTotal * 1.1 * 100) / 100).toLocaleString("fr-FR")} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
