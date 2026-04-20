"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const NEXT_STEPS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Le transporteur vous contacte",
    desc: "Vous recevrez un message du transporteur pour organiser la collecte de votre colis.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Remise du colis",
    desc: "Remettez votre colis au transporteur à l'adresse convenue. Il prendra des photos de prise en charge.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Livraison & confirmation",
    desc: "À la réception, confirmez la livraison sur votre tableau de bord. Le paiement est alors libéré au transporteur.",
    color: "bg-green-50 text-dz-green",
  },
];

export default function ConfirmationPage() {
  const [ref, setRef] = useState("");
  const [listing, setListing] = useState<{ title: string; from: string; to: string } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const sessionRef = sessionStorage.getItem("waselli_booking_ref");
    const r = urlRef || sessionRef || "WSL-XXXXXX";
    const l = sessionStorage.getItem("waselli_booking_listing");
    setRef(r);
    if (l) setListing(JSON.parse(l));
  }, [searchParams]);

  return (
    <div className="bg-dz-gray-50 min-h-screen flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mb-2">Réservation confirmée !</h1>
          <p className="text-dz-gray-500 text-sm">Votre colis est entre de bonnes mains.</p>
        </div>

        {/* Booking reference */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-5 mb-4 text-center">
          <p className="text-xs text-dz-gray-400 font-semibold uppercase tracking-wide mb-2">Numéro de réservation</p>
          <p className="text-2xl font-bold tracking-widest font-mono text-dz-gray-800">{ref}</p>
          {listing && (
            <p className="text-xs text-dz-gray-500 mt-2">{listing.from} → {listing.to}</p>
          )}
        </div>

        {/* Escrow notice */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-dz-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Paiement sécurisé en escrow</p>
            <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
              Votre paiement est bloqué par Waselli et ne sera libéré au transporteur qu&apos;après votre confirmation de réception.
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-white border border-dz-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-bold text-dz-gray-800 mb-4">Que se passe-t-il ensuite ?</h2>
          <div className="space-y-4">
            {NEXT_STEPS.map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dz-gray-800">{s.title}</p>
                  <p className="text-xs text-dz-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs — we push the sender into the messaging thread first.
            The live chat with the transporter is where the real
            coordination happens (address confirmation, timing, photos),
            and we want them to treat it as the default next step. */}
        <div className="flex flex-col gap-3">
          <Link href="/messages" className="block text-center bg-dz-green hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-opacity">
            💬 Discuter avec le transporteur
          </Link>
          <Link href="/tableau-de-bord" className="block text-center border border-dz-gray-200 text-dz-gray-700 hover:bg-dz-gray-50 py-3.5 rounded-xl font-semibold transition-colors">
            Voir mes réservations
          </Link>
          <Link href="/suivi" className="block text-center text-dz-gray-500 hover:text-dz-green py-2.5 text-sm transition-colors">
            Suivre mon colis
          </Link>
          <Link href="/annonces" className="block text-center text-dz-gray-400 hover:text-dz-green text-sm transition-colors py-2">
            Parcourir d&apos;autres annonces
          </Link>
        </div>

      </div>
    </div>
  );
}
