import Link from "next/link";
import ContactForm from "./ContactForm";

const targetAudience = [
  {
    icon: "🛍️",
    title: "E-commerce",
    desc: "Boutiques en ligne qui expédient régulièrement vers toute l'Algérie. Optimisez vos coûts et fidélisez vos clients.",
  },
  {
    icon: "🏭",
    title: "Fabricants & distributeurs",
    desc: "Livraisons B2B entre wilayas à grande échelle. Des transporteurs fiables pour vos marchandises professionnelles.",
  },
  {
    icon: "🏪",
    title: "Commerçants",
    desc: "Envois ponctuels ou récurrents sans contrainte d'abonnement. Payez uniquement ce que vous expédiez.",
  },
  {
    icon: "🏢",
    title: "Grandes entreprises",
    desc: "Logistique de déménagement d'entreprise, transfert de matériel et livraison de masse inter-wilayas.",
  },
];

const advantages = [
  "Tarifs négociés selon volume",
  "Tableau de bord entreprise dédié",
  "Facturation mensuelle groupée",
  "Transporteurs dédiés et vérifiés",
  "Assurance renforcée jusqu'à 500 000 DA",
  "Suivi en temps réel de toutes les livraisons",
  "Support prioritaire 7j/7",
  "Rapports et statistiques mensuels",
  "API disponible pour intégration",
  "Équipe dédiée à votre compte",
];

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    subtitle: "Pour commencer sans engagement",
    highlighted: false,
    features: [
      "Jusqu'à 20 envois / mois",
      "Tableau de bord basique",
      "Support par email",
      "Assurance standard incluse",
      "Accès marketplace transporteurs",
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/inscription",
  },
  {
    name: "Pro",
    price: "Sur devis",
    subtitle: "Le choix des équipes en croissance",
    highlighted: true,
    badge: "Populaire",
    features: [
      "Envois illimités",
      "Transporteurs dédiés",
      "Facturation mensuelle groupée",
      "Support téléphonique prioritaire",
      "Rapports mensuels détaillés",
      "Tableau de bord avancé",
      "Assurance renforcée",
    ],
    cta: "Demander un devis",
    ctaHref: "/contact",
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    subtitle: "Pour les organisations à volume élevé",
    highlighted: false,
    features: [
      "Tout ce qui est inclus dans Pro",
      "Accès API complet",
      "Account manager dédié",
      "SLA de livraison garanti",
      "Assurance sur mesure",
      "Intégration ERP / WMS",
      "Contrat-cadre personnalisé",
    ],
    cta: "Nous contacter",
    ctaHref: "/contact",
  },
];

const testimonials = [
  {
    name: "Asma Benyahia",
    role: "Gérante — Boutique Tendance, Oran",
    initials: "AB",
    text: "Depuis que nous utilisons DZColis Business, nos délais de livraison ont diminué de 30 %. La facturation mensuelle simplifiée nous fait gagner un temps précieux. Je recommande vivement à toutes les boutiques en ligne.",
  },
  {
    name: "Mourad Chekroun",
    role: "Responsable logistique — Groupe Chekroun Distribution, Constantine",
    initials: "MC",
    text: "En tant que distributeur inter-wilayas, la fiabilité des transporteurs est essentielle. DZColis nous propose des transporteurs vérifiés et un suivi en temps réel. Notre taux de livraison réussie a atteint 97 %.",
  },
  {
    name: "Rania Medjkoune",
    role: "Directrice e-commerce — AlgerShop, Alger",
    initials: "RM",
    text: "L'API de DZColis s'est intégrée facilement à notre plateforme en moins d'une journée. Les rapports mensuels nous aident à optimiser nos coûts et notre account manager est toujours disponible. Une solution sérieuse.",
  },
];

const steps = [
  {
    num: "01",
    title: "Contactez-nous",
    desc: "Remplissez le formulaire ci-dessous ou appelez-nous directement. Notre équipe commerciale vous répond sous 24h.",
  },
  {
    num: "02",
    title: "Étude de vos besoins",
    desc: "Un consultant dédié analyse votre volume, vos destinations et vos contraintes pour vous proposer la solution adaptée.",
  },
  {
    num: "03",
    title: "Mise en place sous 48h",
    desc: "Accès à votre tableau de bord, transporteurs affectés, facturation configurée. Vous êtes opérationnel en 48 heures.",
  },
];

const faqs = [
  {
    q: "Quel est le minimum de commandes requis ?",
    a: "Aucun minimum imposé pour commencer. Le plan Starter est gratuit jusqu'à 20 envois par mois. À partir du plan Pro, nous adaptons l'offre à votre volume réel, qu'il soit de 50 ou de 5 000 envois mensuels.",
  },
  {
    q: "Comment fonctionne la facturation business ?",
    a: "Pour les plans Pro et Enterprise, toutes vos livraisons du mois sont regroupées en une seule facture émise en fin de mois. Vous bénéficiez d'un délai de paiement de 30 jours et pouvez régler par virement bancaire ou chèque.",
  },
  {
    q: "Peut-on intégrer DZColis à notre système informatique ?",
    a: "Oui. Nous proposons une API REST complète (disponible à partir du plan Enterprise) permettant d'intégrer DZColis à votre ERP, CMS e-commerce ou WMS. Notre équipe technique vous accompagne dans l'intégration.",
  },
  {
    q: "Quels sont les délais de livraison garantis ?",
    a: "Pour les plans Enterprise, nous établissons un SLA (accord de niveau de service) sur mesure. En règle générale, les livraisons intra-wilaya sont effectuées en 24h, et inter-wilayas en 24–72h selon la distance.",
  },
];

export default function SolutionsBusinessPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-dz-gray-800 to-dz-gray-900 text-white overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 0), radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 0)", backgroundSize: "40px 40px" }}
          />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-dz-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-dz-green/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-dz-green/20 border border-dz-green/30 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-dz-green-light font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Solutions B2B
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            DZColis pour les<br />
            <span className="text-dz-green-light">entreprises</span>
          </h1>
          <p className="text-lg md:text-xl text-dz-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Des solutions de livraison adaptées aux besoins de votre entreprise.
            Économique, fiable et à grande échelle.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { icon: "🏢", label: "500+ entreprises" },
              { icon: "⚡", label: "48h setup" },
              { icon: "🎯", label: "Support dédié" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium"
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-dz-green hover:bg-dz-green-dark text-white px-8 py-4 rounded-xl font-semibold transition-colors text-base shadow-lg shadow-dz-green/30"
          >
            Nous contacter
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Who is it for ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Pour qui ?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-3">
              Une solution pour chaque profil
            </h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Quelle que soit la taille ou l&apos;activité de votre entreprise, DZColis Business s&apos;adapte à vos contraintes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {targetAudience.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2 text-base">{item.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avantages business ────────────────────────────────────── */}
      <section className="py-20 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                Avantages exclusifs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-4">
                Tout ce dont votre entreprise a besoin
              </h2>
              <p className="text-dz-gray-500 leading-relaxed mb-6">
                DZColis Business va bien au-delà d&apos;une simple plateforme de livraison.
                Nous devenons votre partenaire logistique à long terme.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-dz-green text-white hover:bg-dz-green-dark px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Parler à un expert
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advantages.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-white rounded-xl border border-dz-gray-200 px-4 py-3 hover:border-dz-green/30 transition-colors"
                >
                  <div className="w-5 h-5 bg-dz-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-dz-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans business ────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Nos offres
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-3">Plans Business</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Choisissez le plan adapté à votre volume ou contactez-nous pour un devis personnalisé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  plan.highlighted
                    ? "bg-dz-green text-white shadow-xl shadow-dz-green/25 scale-105"
                    : "bg-white border border-dz-gray-200 hover:border-dz-green/30 hover:shadow-md transition-all"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-dz-green text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-dz-gray-800"}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-dz-green"}`}>
                    {plan.price}
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-green-100" : "text-dz-gray-500"}`}>
                    {plan.subtitle}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "bg-white/25" : "bg-dz-green/10"
                      }`}>
                        <svg
                          className={`w-2.5 h-2.5 ${plan.highlighted ? "text-white" : "text-dz-green"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={plan.highlighted ? "text-green-50" : "text-dz-gray-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-white text-dz-green hover:bg-green-50"
                      : "bg-dz-green text-white hover:bg-dz-green-dark"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-20 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-3">
              Ils nous font confiance
            </h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Plus de 500 entreprises algériennes optimisent leur logistique avec DZColis Business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                <p className="text-sm text-dz-gray-600 leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-dz-gray-100">
                  <div className="w-10 h-10 bg-dz-green rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{t.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-dz-gray-800 text-sm">{t.name}</div>
                    <div className="text-xs text-dz-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to get started ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              Démarrage
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-3">
              Opérationnel en 3 étapes
            </h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              Un processus d&apos;intégration simple et rapide, sans paperasse excessive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-dz-gray-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(50% + 2rem)" }} />
                )}
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-dz-gray-800 rounded-2xl flex flex-col items-center justify-center mx-auto mb-5 shadow-lg">
                    <span className="text-dz-green text-xs font-bold uppercase tracking-wider">Étape</span>
                    <span className="text-white text-2xl font-bold leading-none">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-dz-gray-800 text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-dz-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ business ──────────────────────────────────────────── */}
      <section className="py-20 bg-dz-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-3">
              Questions fréquentes
            </h2>
            <p className="text-dz-gray-500">
              Vous avez d&apos;autres questions ? Contactez notre équipe commerciale.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-dz-green/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dz-gray-800 mb-2">{faq.q}</h3>
                    <p className="text-sm text-dz-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final — contact form ───────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-dz-gray-800 to-dz-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-dz-green/20 border border-dz-green/30 text-dz-green-light rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Parlons de votre projet
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Prêt à optimiser votre logistique ?
            </h2>
            <p className="text-dz-gray-300 max-w-xl mx-auto">
              Remplissez ce formulaire et notre équipe commerciale vous contacte sous 24 heures pour une étude personnalisée.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <ContactForm />
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-dz-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Réponse sous 24h
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sans engagement
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Étude gratuite
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
