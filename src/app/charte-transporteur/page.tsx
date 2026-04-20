"use client";
import Link from "next/link";
import { useState } from "react";

const OBLIGATIONS = [
  {
    icon: "🪪",
    title: "Vérification d'identité",
    items: [
      "Fournir une copie valide de votre carte nationale d'identité ou passeport",
      "Fournir votre permis de conduire (catégorie B minimum)",
      "Fournir la carte grise du véhicule utilisé pour les transports",
      "Permettre à Waselli de vérifier vos documents à tout moment",
    ],
  },
  {
    icon: "box",
    title: "Gestion des colis",
    items: [
      "Récupérer le colis dans l'état décrit par l'expéditeur",
      "Photographier le colis à la récupération et à la livraison",
      "Ne jamais ouvrir, modifier ou substituer un colis",
      "Livrer le colis uniquement à la personne autorisée par l'expéditeur",
      "Signaler immédiatement tout dommage constaté à la récupération",
    ],
  },
  {
    icon: "⏱️",
    title: "Délais et communication",
    items: [
      "Respecter les délais de livraison annoncés lors de la réservation",
      "Informer l'expéditeur de tout retard dans les meilleurs délais",
      "Répondre aux messages dans un délai de 2 heures pendant les heures ouvrables",
      "Confirmer la livraison via l'application dans les 30 minutes suivant la remise",
    ],
  },
  {
    icon: "truck",
    title: "Véhicule et sécurité",
    items: [
      "Utiliser un véhicule en bon état mécanique et légalement en règle",
      "Posséder une assurance véhicule valide et à jour",
      "Ne jamais transporter de passagers non déclarés lors d'un transport de colis",
      "Respecter le Code de la route algérien en toutes circonstances",
    ],
  },
  {
    icon: "⚖️",
    title: "Interdictions absolues",
    items: [
      "Il est strictement interdit d'accepter ou de transporter des articles illicites, même si l'expéditeur en fait la demande",
      "Tout transporteur surpris à transporter des stupéfiants, armes ou marchandises illicites sera définitivement banni et signalé aux autorités",
      "Il est interdit de sous-traiter un transport à un tiers sans accord écrit de Waselli",
      "Toute tentative de fraude ou de manipulation des avis est sanctionnée par la suppression du compte",
    ],
  },
];

export default function CharteTransporteurPage() {
  const [signatureName, setSignatureName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    if (!accepted || !signatureName.trim()) return;
    setSigned(true);
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      {/* Hero */}
      <section className="text-white py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM1 1h14v11H1zM14 6h4l3 3v5h-7V6z" /></svg>
            Charte officielle Waselli
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Charte du Transporteur</h1>
          <p className="text-dz-gray-300 text-lg max-w-xl mx-auto">
            Vos obligations, responsabilités et engagements en tant que transporteur sur la plateforme Waselli.
          </p>
          <p className="text-dz-gray-400 text-sm mt-3">Version 1.0 — Avril 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
          <p className="text-sm text-dz-gray-600 leading-relaxed">
            La présente charte constitue un engagement contractuel entre le transporteur (ci-après «&nbsp;vous&nbsp;») et la société Waselli (ci-après «&nbsp;Waselli&nbsp;»). En vous inscrivant comme transporteur sur la plateforme, vous vous engagez à respecter l&apos;intégralité des règles définies dans ce document. Le non-respect de ces règles peut entraîner la suspension temporaire ou définitive de votre compte, ainsi que des poursuites judiciaires si les faits le justifient.
          </p>
        </div>

        {/* Obligations */}
        {OBLIGATIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-lg font-bold text-dz-gray-800 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-dz-green/10 text-dz-green rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-dz-gray-600">
                  <svg className="w-4 h-4 text-dz-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Liability */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Responsabilité financière du transporteur
          </h2>
          <p className="text-sm text-orange-700 leading-relaxed mb-3">
            En cas de perte, vol ou dommage causé à un colis par négligence avérée du transporteur, Waselli peut retenir le paiement et engager la responsabilité civile du transporteur à hauteur de la valeur déclarée du colis.
          </p>
          <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dz-gray-500">Formule Basique</span>
              <span className="font-medium text-dz-gray-800">Jusqu&apos;à 20 000 DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dz-gray-500">Formule Standard</span>
              <span className="font-medium text-dz-gray-800">Jusqu&apos;à 50 000 DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dz-gray-500">Formule Premium</span>
              <span className="font-medium text-dz-gray-800">Jusqu&apos;à 150 000 DA</span>
            </div>
          </div>
        </div>

        {/* Signature block */}
        {!signed ? (
          <div className="bg-white rounded-2xl border-2 border-dz-green/30 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-dz-gray-800">Signature électronique</h3>
                <p className="text-xs text-dz-gray-500 mt-0.5">En signant, vous confirmez avoir lu et accepté l&apos;intégralité de la charte transporteur Waselli.</p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 accent-dz-green w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-dz-gray-600 leading-relaxed">
                Je reconnais avoir lu et accepté l&apos;intégralité de la Charte du Transporteur Waselli. Je m&apos;engage à respecter toutes les obligations qui y sont définies et reconnais être seul responsable de mes actes en tant que transporteur sur la plateforme.
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">Votre nom complet *</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Prénom NOM"
                className="w-full px-4 py-3 border-b-2 border-dz-gray-300 focus:border-dz-green outline-none bg-dz-gray-50 rounded-t-xl font-medium italic text-lg tracking-wide"
                style={{ fontFamily: "Georgia, serif" }}
              />
            </div>

            <button
              onClick={handleSign}
              disabled={!accepted || !signatureName.trim()}
              className="w-full bg-dz-green hover:bg-dz-green-light text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Signer la charte
            </button>
          </div>
        ) : (
          <div className="bg-dz-green/5 border border-dz-green/30 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-dz-green/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><svg className="w-7 h-7 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
            <h3 className="font-bold text-dz-green text-lg mb-1">Charte signée avec succès</h3>
            <p className="text-sm text-dz-gray-500 mb-2">
              Signature électronique : <strong className="italic" style={{ fontFamily: "Georgia, serif" }}>{signatureName}</strong>
            </p>
            <p className="text-xs text-dz-gray-400">
              Une copie de votre engagement vous a été envoyée par email.
            </p>
            <Link
              href="/transporter"
              className="inline-block mt-4 bg-dz-green text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-dz-green-light transition-colors"
            >
              Commencer à transporter →
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href="/cgv" className="text-sm text-dz-gray-400 hover:text-dz-green transition-colors">
            Consulter les Conditions Générales de Vente →
          </Link>
        </div>

      </div>
    </div>
  );
}
