"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PaiementSuccesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking");
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { router.push("/"); return; }
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    db.from("bookings").select("booking_ref, payment_status").eq("id", bookingId).single()
      .then(({ data }: { data: { booking_ref: string; payment_status: string } | null }) => {
        if (data) setBookingRef(data.booking_ref);
        setLoading(false);
      });
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dz-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-dz-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">Paiement réussi !</h1>
        <p className="text-dz-gray-500 mb-4">Votre réservation a été confirmée et le transporteur a été notifié.</p>

        {bookingRef && (
          <div className="bg-dz-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-dz-gray-500 mb-1">Référence de réservation</p>
            <p className="text-xl font-bold text-dz-green tracking-wide">{bookingRef}</p>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-dz-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Fonds sécurisés par escrow</p>
              <p className="text-xs text-green-700 mt-0.5">Votre paiement est bloqué jusqu&apos;à confirmation de réception. Vous serez remboursé si le colis n&apos;est pas livré.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/tableau-de-bord" className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3 rounded-xl font-semibold transition-colors">
            Voir mes réservations
          </Link>
          <Link href="/annonces" className="w-full border border-dz-gray-200 text-dz-gray-600 py-3 rounded-xl font-semibold hover:bg-dz-gray-50 transition-colors">
            Retour aux annonces
          </Link>
        </div>
      </div>
    </div>
  );
}
