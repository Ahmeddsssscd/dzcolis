"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaiementEchecPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");

  return (
    <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-dz-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        {/* Error icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">Paiement échoué</h1>
        <p className="text-dz-gray-500 mb-6">
          Votre paiement n&apos;a pas pu être traité. Votre réservation est conservée — vous pouvez réessayer.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-amber-700 font-medium">Causes possibles :</p>
          <ul className="text-xs text-amber-600 mt-1.5 space-y-1 list-disc list-inside">
            <li>Solde insuffisant sur votre carte</li>
            <li>Carte expirée ou informations incorrectes</li>
            <li>Limite quotidienne de transaction atteinte</li>
            <li>Problème de connexion réseau</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          {bookingId && (
            <Link
              href={`/reserver/${bookingId}`}
              className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Réessayer le paiement
            </Link>
          )}
          <Link href="/tableau-de-bord" className="w-full border border-dz-gray-200 text-dz-gray-600 py-3 rounded-xl font-semibold hover:bg-dz-gray-50 transition-colors">
            Mes réservations
          </Link>
          <Link href="/annonces" className="text-sm text-dz-gray-400 hover:text-dz-green transition-colors">
            Retour aux annonces
          </Link>
        </div>
      </div>
    </div>
  );
}
