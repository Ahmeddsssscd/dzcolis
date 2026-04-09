"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useListings, useBookings } from "@/lib/context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { listings } = useListings();
  const { bookings, getBookingsForUser, updateBookingStatus } = useBookings();
  const router = useRouter();

  if (!user) {
    router.push("/connexion");
    return null;
  }

  const myListings = listings.filter((l) => l.user.avatar === user.avatar);
  const myBookings = getBookingsForUser(user.id);
  const activeBookings = myBookings.filter((b) => b.status !== "delivered" && b.status !== "cancelled");

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: "En attente", color: "bg-yellow-100 text-yellow-700" },
    accepted: { text: "Accepté", color: "bg-blue-100 text-blue-700" },
    in_transit: { text: "En transit", color: "bg-purple-100 text-purple-700" },
    delivered: { text: "Livré", color: "bg-green-100 text-green-700" },
    cancelled: { text: "Annulé", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dz-gray-800">Bonjour, {user.firstName} !</h1>
            <p className="text-dz-gray-500 mt-1">Bienvenue sur votre tableau de bord</p>
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

        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Listings */}
          <div>
            <h2 className="text-lg font-bold text-dz-gray-800 mb-4">Mes annonces</h2>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dz-gray-200 p-8 text-center">
                <p className="text-dz-gray-500 mb-4">Vous n&apos;avez pas encore d&apos;annonces</p>
                <Link href="/envoyer" className="text-dz-green font-medium hover:underline">Publier ma première annonce</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((l) => (
                  <Link key={l.id} href={`/annonces/${l.id}`} className="block bg-white rounded-xl border border-dz-gray-200 p-4 hover:border-dz-green/30 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.type === "trip" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                          {l.type === "trip" ? "Trajet" : "Colis"}
                        </span>
                        <h3 className="font-medium text-dz-gray-800 mt-1 text-sm">{l.title}</h3>
                        <p className="text-xs text-dz-gray-500 mt-1">{l.from} → {l.to}</p>
                      </div>
                      <span className="font-bold text-dz-green text-sm">{l.price.toLocaleString()} DA</span>
                    </div>
                  </Link>
                ))}
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
                  const listing = listings.find((l) => l.id === b.listingId);
                  const status = statusLabel[b.status];
                  return (
                    <div key={b.id} className="bg-white rounded-xl border border-dz-gray-200 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-dz-gray-800 text-sm">{listing?.title || "Annonce"}</h3>
                          <p className="text-xs text-dz-gray-500 mt-1">
                            {new Date(b.createdAt).toLocaleDateString("fr-DZ")}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
