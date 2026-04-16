import Link from "next/link";

const tiers = [
  {
    name: "Basique",
    price: "Gratuit",
    coverage: "20 000 DA",
    coverageInt: "500 €",
    color: "border-dz-gray-200",
    badge: null,
    scoreRequired: "0",
    features: [
      "Photo obligatoire à la récupération",
      "Double confirmation de livraison",
      "Couverture perte totale",
      "Remboursement sous 15 jours",
      "Support email",
    ],
  },
  {
    name: "Standard",
    price: "1% valeur déclarée",
    priceMin: "min 150 DA / 1 €",
    coverage: "50 000 DA",
    coverageInt: "1 500 €",
    color: "border-blue-200",
    badge: null,
    scoreRequired: "31",
    features: [
      "Tout ce qui est inclus en Basique",
      "Couverture casse + perte + vol",
      "Remboursement sous 7 jours",
      "Support téléphonique prioritaire",
      "Rapport d'incident automatique",
    ],
  },
  {
    name: "Premium",
    price: "2% valeur déclarée",
    priceMin: "min 300 DA / 2 €",
    coverage: "150 000 DA",
    coverageInt: "3 000 €",
    color: "border-dz-green",
    badge: "Recommandé",
    scoreRequired: "61",
    features: [
      "Tout ce qui est inclus en Standard",
      "Rapport de police auto-généré",
      "Remboursement garanti sous 48h",
      "Gestionnaire de sinistre dédié",
      "Couverture documents douaniers",
    ],
  },
];

const covered = [
  { icon: "💥", label: "Casse accidentelle", desc: "Dommages survenus pendant le transport" },
  { icon: "🔓", label: "Vol", desc: "Vol du colis pendant la prise en charge" },
  { icon: "❌", label: "Perte", desc: "Colis introuvable à la livraison" },
  { icon: "💧", label: "Dommages eau", desc: "Dégâts causés par l'humidité ou les intempéries" },
];

const notCovered = [
  { icon: "🚫", label: "Contenu interdit", desc: "Objets interdits non déclarés (armes, drogues...)" },
  { icon: "📦", label: "Mauvais emballage", desc: "Fragile non déclaré ou emballage insuffisant" },
  { icon: "💰", label: "Valeur sous-déclarée", desc: "Remboursement limité à la valeur déclarée" },
  { icon: "⏰", label: "Réclamation tardive", desc: "Signalement après le délai de 48h" },
  { icon: "🌊", label: "Force majeure", desc: "Catastrophes naturelles, guerre, grève" },
  { icon: "💎", label: "Objets non déclarés", desc: "Bijoux, espèces, documents officiels non déclarés" },
];

const trustLevels = [
  { label: "Débutant", range: "0 – 30", textColor: "text-red-700", bg: "bg-red-50", access: "Formule Basique uniquement — couverture 20 000 DA / 500 €" },
  { label: "Confirmé", range: "31 – 60", textColor: "text-orange-700", bg: "bg-orange-50", access: "Formules Basique + Standard — couverture jusqu'à 50 000 DA / 1 500 €" },
  { label: "Expert", range: "61 – 80", textColor: "text-blue-700", bg: "bg-blue-50", access: "Toutes formules — couverture jusqu'à 150 000 DA / 3 000 €" },
  { label: "Elite ✓", range: "81 – 100", textColor: "text-dz-green", bg: "bg-dz-green/5", access: "Toutes formules + accès prioritaire support + couverture 150 000 DA / 3 000 € max" },
];

const scoreFactors = [
  { pts: "+20", label: "Profil vérifié avec pièce d'identité" },
  { pts: "+15", label: "Transporteur international vérifié (passeport + visa)" },
  { pts: "+10", label: "Compte actif depuis plus de 3 mois" },
  { pts: "+2", label: "Par livraison réussie (max +30 pts)" },
  { pts: "+1", label: "Par avis positif reçu ≥ 4 étoiles" },
  { pts: "+10", label: "Note moyenne ≥ 4,5 étoiles" },
];

export default function AssurancePage() {
  return (
    <div className="bg-dz-gray-50 min-h-screen">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            Inclus gratuitement dans chaque envoi
          </div>
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Waselli Protect</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Le système de confiance complet qui protège chaque colis, chaque transporteur,
            et chaque centime — du départ à la livraison.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "📸", label: "Photos horodatées" },
              { icon: "💰", label: "Paiement séquestre" },
              { icon: "✅", label: "Double confirmation" },
              { icon: "⚡", label: "Remboursement rapide" },
            ].map((b) => (
              <div key={b.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-sm font-semibold">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* How it works */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Comment ça marche ?</h2>
            <p className="text-dz-gray-500 mt-2">Chaque livraison suit ce processus de protection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: "📸", title: "Photo à la récupération", desc: "Le transporteur prend une photo horodatée et géolocalisée du colis au moment de la prise en charge. Preuve irréfutable de l'état initial." },
              { step: "2", icon: "🔒", title: "Argent en séquestre", desc: "Le montant est bloqué sur un compte sécurisé pendant tout le transport. Ni le transporteur ni personne d'autre n'y a accès avant la livraison confirmée." },
              { step: "3", icon: "📸", title: "Photo à la livraison", desc: "À la remise du colis, le transporteur envoie une photo avec le destinataire visible. Preuve de livraison datée et localisée." },
              { step: "4", icon: "✅", title: "Double confirmation", desc: "Le destinataire confirme la réception dans l'app. C'est seulement à ce moment que le transporteur est payé. Pas de confirmation = argent bloqué." },
            ].map((s) => (
              <div key={s.step} className="text-center group">
                <div className="w-16 h-16 bg-dz-green/10 text-dz-green rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:bg-dz-green group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-dz-green mb-2">ÉTAPE {s.step}</div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Insurance tiers */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Formules d&apos;assurance</h2>
            <p className="text-dz-gray-500 mt-2">Choisissez la protection adaptée à votre colis au moment de l&apos;envoi</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative bg-white rounded-2xl border-2 ${tier.color} p-6 ${tier.badge ? "shadow-lg" : ""}`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dz-green text-white text-xs font-bold px-4 py-1 rounded-full">
                    {tier.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-dz-gray-800">{tier.name}</h3>
                  <div className="text-dz-green font-semibold mt-1">{tier.price}</div>
                  {"priceMin" in tier && tier.priceMin && <div className="text-xs text-dz-gray-400">{tier.priceMin}</div>}
                </div>
                <div className="bg-dz-gray-50 rounded-xl p-3 mb-4">
                  <div className="text-xs text-dz-gray-500 mb-1">Couverture nationale</div>
                  <div className="text-xl font-bold text-dz-gray-800">{tier.coverage}</div>
                  <div className="text-xs text-dz-gray-500 mt-2 mb-1">Couverture internationale</div>
                  <div className="text-xl font-bold text-dz-gray-800">{tier.coverageInt}</div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dz-gray-600">
                      <svg className="w-4 h-4 text-dz-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-dz-gray-100 text-xs text-dz-gray-400">
                  Score requis: {tier.scoreRequired}+ points
                </div>
              </div>
            ))}
          </div>
          {/* International Premium */}
          <div className="bg-dz-gray-800 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">✈️</div>
              <div>
                <div className="font-bold text-lg">International Premium</div>
                <div className="text-dz-gray-300 text-sm">3% valeur déclarée — min 25 € — Couverture 5 000 €</div>
              </div>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-dz-gray-300">
              {["Couverture tous risques internationale", "Gestionnaire dédié bilingue", "Documents douaniers inclus", "Remboursement 48h garanti"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Trust Score */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Score de Confiance Waselli</h2>
            <p className="text-dz-gray-500 mt-2">Plus votre score est élevé, plus votre couverture est grande</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-4">Comment augmenter votre score</h3>
              <div className="space-y-3">
                {scoreFactors.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-dz-green bg-dz-green/10 px-2.5 py-1 rounded-lg min-w-[48px] text-center">{f.pts}</span>
                    <span className="text-sm text-dz-gray-600">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
              <h3 className="font-semibold text-dz-gray-800 mb-4">Niveaux et avantages</h3>
              <div className="space-y-3">
                {trustLevels.map((l) => (
                  <div key={l.label} className={`${l.bg} rounded-xl p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${l.textColor}`}>{l.label}</span>
                      <span className="text-xs text-dz-gray-500">{l.range} pts</span>
                    </div>
                    <p className="text-xs text-dz-gray-600">{l.access}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Covered / Not covered */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-dz-gray-800 mb-6">✅ Ce qui est couvert</h2>
              <div className="space-y-3">
                {covered.map((c) => (
                  <div key={c.label} className="bg-white rounded-xl border border-dz-gray-200 p-4 flex items-start gap-3 hover:border-dz-green/30 transition-colors">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <div className="font-semibold text-dz-gray-800 text-sm">{c.label}</div>
                      <div className="text-xs text-dz-gray-500 mt-0.5">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dz-gray-800 mb-6">❌ Ce qui n&apos;est pas couvert</h2>
              <div className="space-y-3">
                {notCovered.map((c) => (
                  <div key={c.label} className="bg-white rounded-xl border border-dz-gray-200 p-4 flex items-start gap-3">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <div className="font-semibold text-dz-gray-800 text-sm">{c.label}</div>
                      <div className="text-xs text-dz-gray-500 mt-0.5">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Police report */}
        <section>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1 text-sm font-medium mb-4">
                  🚓 Exclusif Waselli
                </div>
                <h2 className="text-2xl font-bold text-dz-gray-800 mb-3">Rapport de police automatique</h2>
                <p className="text-dz-gray-600 leading-relaxed mb-4">
                  En cas de sinistre, vous n&apos;avez plus à chercher les informations du transporteur.
                  Waselli génère automatiquement un rapport pré-rempli contenant toutes les
                  informations nécessaires pour votre déclaration.
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Nom complet et coordonnées du transporteur",
                    "Numéro de pièce d'identité / passeport",
                    "Trajet effectué avec dates et heures exactes",
                    "Photos horodatées de pickup et livraison",
                    "Valeur déclarée du colis",
                    "Historique des messages échangés",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-dz-gray-600">
                      <svg className="w-4 h-4 text-dz-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-dz-gray-500 italic">
                  Disponible dans les formules Standard et Premium. Requis pour toute réclamation supérieure à 10 000 DA (ou 70 €).
                </p>
              </div>
              {/* Mock report card */}
              <div className="w-full md:w-64 bg-dz-gray-50 rounded-2xl border border-dz-gray-200 p-5 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-dz-green rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">DZ</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-dz-gray-800">Waselli Protect</div>
                    <div className="text-xs text-dz-gray-400">Rapport de sinistre</div>
                  </div>
                </div>
                {[
                  { label: "Transporteur", value: "████████ ██." },
                  { label: "Téléphone", value: "+213 ███ ███ ███" },
                  { label: "Pièce d'identité", value: "████████████" },
                  { label: "Trajet", value: "Alger → Oran" },
                  { label: "Date", value: "12 avril 2026" },
                  { label: "Valeur déclarée", value: "45 000 DA" },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col mb-2.5">
                    <span className="text-xs text-dz-gray-400">{row.label}</span>
                    <span className="text-xs font-medium text-dz-gray-700 blur-sm select-none">{row.value}</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-dz-gray-200 text-xs text-dz-green font-medium text-center">
                  ✓ Certifié par Waselli
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Claim process */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Procédure de réclamation</h2>
            <p className="text-dz-gray-500 mt-2">Simple, rapide et entièrement documentée</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "📱", title: "Déclarez dans l'app", desc: "Signalez le problème dans votre tableau de bord sous 48h après la livraison prévue. Décrivez le sinistre et joignez les photos.", note: "Délai: 48h max" },
              { step: "2", icon: "📋", title: "Rapport automatique", desc: "Pour les réclamations > 10 000 DA (70 €), Waselli génère automatiquement le rapport de police pré-rempli. Déposez-le au commissariat le plus proche.", note: "Formules Standard & Premium" },
              { step: "3", icon: "💳", title: "Remboursement", desc: "Après vérification, le remboursement est effectué selon votre formule : 48h (Premium), 7 jours (Standard), ou 15 jours (Basique).", note: "Selon formule choisie" },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-dz-gray-200 p-6">
                <div className="w-10 h-10 bg-dz-green text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  {s.step}
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed mb-4">{s.desc}</p>
                <div className="text-xs font-medium text-dz-green bg-dz-green/10 px-3 py-1 rounded-full w-fit">{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-dz-green to-dz-green-dark rounded-3xl p-10 text-white text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold mb-3">Expédiez en toute sécurité</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Waselli Protect est inclus automatiquement dans chaque envoi.
            Choisissez votre formule au moment de la publication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/envoyer" className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors">
              Envoyer un colis
            </Link>
            <Link href="/international" className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors">
              Service international ✈️
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
