import Link from "next/link";

const domesticRoutes = [
  { zone: "Trajet court (< 100 km)", examples: "Alger–Blida, Oran–Tlemcen", weight1: "800–1 500 DA", weight5: "1 200–2 000 DA", weight20: "2 000–3 500 DA" },
  { zone: "Trajet moyen (100–300 km)", examples: "Alger–Sétif, Oran–Mascara", weight1: "1 000–2 000 DA", weight5: "1 800–3 000 DA", weight20: "3 000–5 000 DA" },
  { zone: "Trajet long (300–600 km)", examples: "Alger–Oran, Alger–Constantine", weight1: "1 500–2 500 DA", weight5: "2 500–4 000 DA", weight20: "4 500–7 000 DA" },
  { zone: "Trajet très long (> 600 km)", examples: "Alger–Tamanrasset, Alger–Béchar", weight1: "2 500–4 000 DA", weight5: "4 000–6 500 DA", weight20: "7 000–12 000 DA" },
];

const internationalRoutes = [
  { country: "France", flag: "🇫🇷", small: "3 500–5 000 DA", medium: "6 000–9 000 DA", large: "12 000–20 000 DA", delay: "4–8 jours" },
  { country: "Espagne", flag: "🇪🇸", small: "3 000–4 500 DA", medium: "5 500–8 000 DA", large: "10 000–18 000 DA", delay: "5–9 jours" },
  { country: "Belgique", flag: "🇧🇪", small: "3 200–4 800 DA", medium: "5 800–8 500 DA", large: "11 000–19 000 DA", delay: "5–8 jours" },
  { country: "Allemagne", flag: "🇩🇪", small: "5 000–7 000 DA", medium: "8 000–12 000 DA", large: "15 000–25 000 DA", delay: "7–12 jours" },
  { country: "Italie", flag: "🇮🇹", small: "2 800–4 200 DA", medium: "5 000–7 500 DA", large: "9 000–16 000 DA", delay: "4–7 jours" },
];

const trustItems = [
  {
    title: "Aucun abonnement",
    desc: "Pas de frais mensuels, pas de frais d'inscription. Vous payez uniquement quand vous envoyez un colis.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: "Prix fixés par les transporteurs",
    desc: "DZColis ne fixe pas les tarifs. Les transporteurs proposent leur prix et vous choisissez l'offre qui vous convient.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    title: "Assurance incluse gratuite",
    desc: "Chaque envoi est couvert automatiquement. Aucun supplément à payer pour l'assurance de base.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Paiement sécurisé",
    desc: "Votre paiement est bloqué en séquestre et libéré uniquement après confirmation de la livraison réussie.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function TarifsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tarifs transparents
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Des prix justes,<br />
            <span className="text-green-300">sans mauvaises surprises</span>
          </h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
            DZColis prélève une commission de 10 % sur chaque transaction. Le transporteur garde 90 % du montant. Aucun abonnement, aucun frais caché.
          </p>
        </div>
      </section>

      {/* Modèle de commission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">Notre modèle de commission</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Simple et transparent : DZColis ne prend que 10 % pour financer la plateforme, l&apos;assurance et le service client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Expéditeur */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all text-center">
              <div className="w-14 h-14 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dz-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-dz-gray-800 mb-2">Expéditeur</h3>
              <p className="text-sm text-dz-gray-500">Vous payez le prix proposé par le transporteur. Assurance incluse gratuitement.</p>
            </div>

            {/* Commission DZColis — highlighted */}
            <div className="bg-dz-green rounded-2xl p-6 text-white text-center shadow-lg shadow-dz-green/20">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1">10 %</div>
              <h3 className="font-semibold mb-2">Commission DZColis</h3>
              <p className="text-sm text-green-100">Couvre la plateforme, l&apos;assurance, le paiement sécurisé et le service client.</p>
            </div>

            {/* Transporteur */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all text-center">
              <div className="w-14 h-14 bg-dz-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-dz-green mb-1">90 %</div>
              <h3 className="font-semibold text-dz-gray-800 mb-2">Transporteur</h3>
              <p className="text-sm text-dz-gray-500">Vous recevez 90 % du prix convenu, viré directement sur votre compte bancaire.</p>
            </div>
          </div>

          {/* Example */}
          <div className="bg-dz-gray-50 rounded-2xl border border-dz-gray-200 p-6">
            <h3 className="font-semibold text-dz-gray-800 mb-4 text-center">Exemple concret</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-dz-gray-800">3 000 DA</div>
                <div className="text-sm text-dz-gray-500">Prix fixé</div>
              </div>
              <svg className="w-6 h-6 text-dz-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <div className="text-2xl font-bold text-dz-red">−300 DA</div>
                <div className="text-sm text-dz-gray-500">Commission DZColis (10 %)</div>
              </div>
              <svg className="w-6 h-6 text-dz-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <div className="text-2xl font-bold text-dz-green">2 700 DA</div>
                <div className="text-sm text-dz-gray-500">Reçu par le transporteur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs domestiques */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">Tarifs indicatifs — Algérie</h2>
            <p className="text-dz-gray-500">
              Les prix varient selon la distance, le poids et la disponibilité des transporteurs. Ces fourchettes sont indicatives.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dz-gray-50 border-b border-dz-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dz-gray-700">Zone / Distance</th>
                    <th className="text-left px-4 py-4 text-sm font-semibold text-dz-gray-700">Exemples</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-gray-700">1–5 kg</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-gray-700">5–20 kg</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-green">+ 20 kg</th>
                  </tr>
                </thead>
                <tbody>
                  {domesticRoutes.map((row, i) => (
                    <tr key={i} className={`border-b border-dz-gray-100 hover:bg-dz-gray-50 transition-colors ${i === domesticRoutes.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4 font-medium text-dz-gray-800 text-sm">{row.zone}</td>
                      <td className="px-4 py-4 text-dz-gray-500 text-sm">{row.examples}</td>
                      <td className="px-4 py-4 text-center text-sm text-dz-gray-700">{row.weight1}</td>
                      <td className="px-4 py-4 text-center text-sm text-dz-gray-700">{row.weight5}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-dz-green">{row.weight20}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-dz-gray-400 mt-3 text-center">
            Fourchettes de prix observées sur la plateforme. Les transporteurs fixent librement leurs tarifs.
          </p>
        </div>
      </section>

      {/* Tarifs internationaux */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Service international
            </div>
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">Tarifs Europe ↔ Algérie</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Envoi de colis entre l&apos;Algérie et 5 pays européens via des transporteurs qui font régulièrement le trajet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {internationalRoutes.map((route) => (
              <div
                key={route.country}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{route.flag}</span>
                  <div>
                    <div className="font-semibold text-dz-gray-800">{route.country}</div>
                    <div className="text-xs text-dz-gray-400">{route.delay} en moyenne</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">Petit colis (1–5 kg)</span>
                    <span className="font-medium text-dz-gray-800">{route.small}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">Moyen (5–20 kg)</span>
                    <span className="font-medium text-dz-gray-800">{route.medium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">Grand (+ 20 kg)</span>
                    <span className="font-medium text-dz-green">{route.large}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-dz-gray-400 mt-4 text-center">
            Frais de douane non inclus. Tarifs indicatifs observés sur la plateforme.
          </p>
        </div>
      </section>

      {/* Assurance */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">Assurance incluse — 0 DA de plus</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Chaque envoi est automatiquement couvert par l&apos;assurance DZColis. Aucun supplément, aucun formulaire à remplir à l&apos;avance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dz-gray-800">Trajets domestiques</h3>
              </div>
              <div className="text-3xl font-bold text-dz-green mb-2">50 000 DA</div>
              <p className="text-sm text-dz-gray-500">Couverture maximale pour tous les envois à l&apos;intérieur de l&apos;Algérie. Casse, vol et perte inclus.</p>
            </div>

            <div className="bg-white rounded-2xl border border-dz-green/30 shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dz-gray-800">Trajets internationaux</h3>
                  <span className="text-xs bg-dz-green text-white px-2 py-0.5 rounded-full">Recommandé</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-dz-green mb-2">100 000 DA</div>
              <p className="text-sm text-dz-gray-500">Couverture étendue pour les envois Europe–Algérie. Idéal pour les objets de valeur, appareils électroniques et cadeaux familiaux.</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/assurance" className="text-dz-green font-medium hover:underline text-sm">
              En savoir plus sur notre assurance &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Pas de frais cachés */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Notre engagement
            </div>
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">Pas de frais cachés</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              La transparence est au coeur de DZColis. Ce que vous voyez est ce que vous payez.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-dz-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-dz-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-dz-green to-dz-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à envoyer votre colis ?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Publiez votre annonce gratuitement et recevez des offres de transporteurs en quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/faq"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Consulter la FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
