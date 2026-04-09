"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAuth, useListings, useBookings, useMessages, useToast } from "@/lib/context";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getListingById } = useListings();
  const { user } = useAuth();
  const { createBooking } = useBookings();
  const { getOrCreateConversation, sendMessage } = useMessages();
  const { addToast } = useToast();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState(false);

  const listing = getListingById(id);

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

  const isTrip = listing.type === "trip";

  const handleBook = () => {
    if (!user) { router.push("/connexion"); return; }
    createBooking(listing.id, listing.user.avatar);
    setBooked(true);
    addToast(isTrip ? "Réservation effectuée ! Le transporteur va vous contacter." : "Proposition envoyée ! L'expéditeur va vous contacter.");
  };

  const handleSendMessage = () => {
    if (!user) { router.push("/connexion"); return; }
    if (!message.trim()) return;
    const conv = getOrCreateConversation(listing.user.avatar, listing.id);
    sendMessage(conv.id, message);
    setMessage("");
    addToast("Message envoyé !");
    router.push("/messages");
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/annonces" className="inline-flex items-center gap-1 text-sm text-dz-gray-500 hover:text-dz-green mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isTrip ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                  {isTrip ? "Transporteur" : "Colis à envoyer"}
                </span>
                <span className="text-2xl font-bold text-dz-green">{listing.price.toLocaleString()} DA</span>
              </div>

              <h1 className="text-2xl font-bold text-dz-gray-800 mb-4">{listing.title}</h1>

              {/* Route */}
              <div className="flex items-center gap-4 p-4 bg-dz-gray-50 rounded-xl mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-dz-green rounded-full" />
                  <span className="font-medium text-dz-gray-700">{listing.from}</span>
                </div>
                <svg className="w-6 h-6 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-dz-red rounded-full" />
                  <span className="font-medium text-dz-gray-700">{listing.to}</span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-dz-gray-50 rounded-xl">
                  <p className="text-xs text-dz-gray-500">Date</p>
                  <p className="font-medium text-dz-gray-800 text-sm">
                    {new Date(listing.date).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {listing.weight && (
                  <div className="p-3 bg-dz-gray-50 rounded-xl">
                    <p className="text-xs text-dz-gray-500">Poids</p>
                    <p className="font-medium text-dz-gray-800 text-sm">{listing.weight}</p>
                  </div>
                )}
                {listing.dimensions && (
                  <div className="p-3 bg-dz-gray-50 rounded-xl">
                    <p className="text-xs text-dz-gray-500">Dimensions</p>
                    <p className="font-medium text-dz-gray-800 text-sm">{listing.dimensions}</p>
                  </div>
                )}
                {listing.category && (
                  <div className="p-3 bg-dz-gray-50 rounded-xl">
                    <p className="text-xs text-dz-gray-500">Catégorie</p>
                    <p className="font-medium text-dz-gray-800 text-sm">{listing.category}</p>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-dz-gray-800 mb-2">Description</h3>
              <p className="text-dz-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Insurance info */}
            <div className="bg-dz-green/5 border border-dz-green/20 rounded-2xl p-5 flex items-start gap-3">
              <svg className="w-6 h-6 text-dz-green mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-medium text-dz-gray-800 text-sm">Assurance DZColis incluse</p>
                <p className="text-xs text-dz-gray-600 mt-1">Cet envoi est protégé jusqu&apos;à 50 000 DA contre la casse et le vol.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User card */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center text-lg font-bold">
                  {listing.user.avatar}
                </div>
                <div>
                  <p className="font-semibold text-dz-gray-800">{listing.user.name}</p>
                  <div className="flex items-center gap-1 text-sm text-dz-gray-500">
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {listing.user.rating} ({listing.user.reviews} avis)
                  </div>
                </div>
              </div>

              {booked ? (
                <div className="bg-dz-green/10 text-dz-green text-center py-3 rounded-xl font-medium text-sm">
                  {isTrip ? "Réservé !" : "Proposition envoyée !"}
                </div>
              ) : (
                <button onClick={handleBook} className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors">
                  {isTrip ? "Réserver ce trajet" : "Proposer mon transport"}
                </button>
              )}
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-3">Envoyer un message</h3>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Bonjour, je suis intéressé par votre ${isTrip ? "trajet" : "annonce"}...`}
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none text-sm"
              />
              <button onClick={handleSendMessage} className="w-full mt-3 border border-dz-green text-dz-green hover:bg-dz-green hover:text-white py-2.5 rounded-xl font-medium transition-colors text-sm">
                Envoyer
              </button>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-3 text-sm">Détail du prix</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dz-gray-600">
                  <span>Prix du transport</span>
                  <span>{listing.price.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-dz-gray-600">
                  <span>Commission DZColis (10%)</span>
                  <span>{Math.round(listing.price * 0.1).toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-dz-gray-600">
                  <span>Assurance</span>
                  <span className="text-dz-green">Gratuit</span>
                </div>
                <div className="border-t border-dz-gray-200 pt-2 flex justify-between font-semibold text-dz-gray-800">
                  <span>Total</span>
                  <span>{listing.price.toLocaleString()} DA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
