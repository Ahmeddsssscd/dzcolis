import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import { EUROPEAN_COUNTRIES } from "@/lib/data";

const internationalRoutes = [
  { country: "France", flag: "🇫🇷", route: "Alger → Paris", price: "à partir de 4 500 DA" },
  { country: "Espagne", flag: "🇪🇸", route: "Oran → Madrid", price: "à partir de 3 800 DA" },
  { country: "Belgique", flag: "🇧🇪", route: "Alger → Bruxelles", price: "à partir de 4 200 DA" },
  { country: "Allemagne", flag: "🇩🇪", route: "Alger → Berlin", price: "à partir de 6 500 DA" },
  { country: "Italie", flag: "🇮🇹", route: "Constantine → Milan", price: "à partir de 3 500 DA" },
];

const stats = [
  { value: "50 000+", label: "Utilisateurs" },
  { value: "69 wilayas", label: "Couvertes" },
  { value: "0.2%", label: "Taux de réclamation" },
  { value: "60%", label: "D'économies en moyenne" },
];

const steps = [
  {
    num: "1",
    title: "Publiez votre annonce",
    desc: "Décrivez votre colis, ajoutez une photo, indiquez le départ et l'arrivée.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Recevez des offres",
    desc: "Les transporteurs sur votre trajet vous envoient leurs propositions.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Choisissez et réservez",
    desc: "Comparez les offres, discutez avec le transporteur, et confirmez.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "4",
    title: "Livraison sécurisée",
    desc: "Le paiement est libéré uniquement après confirmation de réception.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Économique",
    desc: "Jusqu'à 60% moins cher que les transporteurs traditionnels grâce au co-transport.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Sécurisé",
    desc: "Paiement séquestre, assurance jusqu'à 50 000 DA, profils vérifiés et avis.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Écologique",
    desc: "Optimisez l'espace libre dans les véhicules en circulation. Moins de trajets à vide.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Tout format",
    desc: "Du petit colis au meuble volumineux, aucune limite de taille. Idéal pour l'électroménager.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

const popularRoutes = [
  { from: "Alger", to: "Oran", price: "à partir de 1 500 DA" },
  { from: "Alger", to: "Constantine", price: "à partir de 1 500 DA" },
  { from: "Oran", to: "Tlemcen", price: "à partir de 800 DA" },
  { from: "Alger", to: "Sétif", price: "à partir de 1 200 DA" },
  { from: "Alger", to: "Béjaïa", price: "à partir de 1 000 DA" },
  { from: "Constantine", to: "Annaba", price: "à partir de 800 DA" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              Nouveau en Algérie
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Envoyez vos colis
              <br />
              <span className="text-green-300">partout en Algérie</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-10 max-w-2xl leading-relaxed">
              DZColis connecte les expéditeurs avec des transporteurs qui font
              déjà le trajet. Économique, écologique et sécurisé.
            </p>

            {/* Search Box */}
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-dz-green">{s.value}</div>
                <div className="text-sm text-dz-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white" id="comment-ca-marche">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Comment ça marche ?</h2>
            <p className="text-dz-gray-500 mt-3 max-w-xl mx-auto">
              En 4 étapes simples, envoyez votre colis partout en Algérie
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center group">
                <div className="w-16 h-16 bg-dz-green/10 text-dz-green rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-dz-green group-hover:text-white transition-colors">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-dz-green mb-2">ÉTAPE {step.num}</div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Pourquoi DZColis ?</h2>
            <p className="text-dz-gray-500 mt-3">La solution de livraison adaptée à l&apos;Algérie</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-dz-gray-50 rounded-2xl p-6 border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 bg-white pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Trajets populaires</h2>
            <p className="text-dz-gray-500 mt-3">Les itinéraires les plus demandés</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularRoutes.map((r) => (
              <Link
                key={`${r.from}-${r.to}`}
                href="/annonces"
                className="flex items-center justify-between p-5 bg-dz-gray-50 rounded-xl border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-dz-green">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-dz-gray-800">
                    {r.from} → {r.to}
                  </span>
                </div>
                <span className="text-sm text-dz-green font-medium">{r.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* International Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              ✈️ Nouveau — Service international
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">
              Envoyez entre l&apos;Algérie et l&apos;Europe
            </h2>
            <p className="text-dz-gray-500 mt-3 max-w-xl mx-auto">
              Des transporteurs vérifiés qui font régulièrement le trajet entre l&apos;Algérie et 5 pays européens
            </p>
            <div className="flex justify-center gap-3 mt-4 text-3xl">
              {EUROPEAN_COUNTRIES.map((c) => (
                <span key={c.code} title={c.name}>{c.flag}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {internationalRoutes.map((r) => (
              <Link
                key={r.country}
                href="/international"
                className="bg-dz-gray-50 rounded-2xl border border-dz-gray-100 hover:border-dz-green/40 hover:shadow-md transition-all p-5 text-center group"
              >
                <div className="text-4xl mb-2">{r.flag}</div>
                <div className="font-semibold text-dz-gray-800 text-sm mb-1">{r.country}</div>
                <div className="text-xs text-dz-gray-500 mb-2">{r.route}</div>
                <div className="text-xs font-medium text-dz-green">{r.price}</div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/international"
              className="bg-dz-green hover:bg-dz-green-light text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-center"
            >
              Voir les transporteurs internationaux
            </Link>
            <Link
              href="/international/devenir-transporteur"
              className="border-2 border-dz-green text-dz-green hover:bg-dz-green/5 px-8 py-3.5 rounded-xl font-semibold transition-colors text-center"
            >
              Devenir transporteur international
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-dz-green to-dz-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à envoyer votre premier colis ?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;Algériens qui utilisent DZColis pour envoyer
            et transporter des colis à travers tout le pays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/transporter"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Devenir transporteur
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
