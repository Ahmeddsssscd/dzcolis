"use client";

import { useState } from "react";
import Link from "next/link";

type FaqItem = {
  q: string;
  a: string;
};

type FaqCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 text-dz-green transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-dz-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const categories: FaqCategory[] = [
  {
    id: "general",
    title: "Général",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        q: "Qu'est-ce que DZColis ?",
        a: "DZColis est une plateforme collaborative de livraison de colis en Algérie. Elle met en relation des expéditeurs qui ont besoin d'envoyer un colis avec des transporteurs (particuliers ou professionnels) qui font déjà le trajet. Grâce au co-transport, les coûts sont réduits de 40 à 60 % par rapport aux transporteurs traditionnels.",
      },
      {
        q: "Comment DZColis est-il différent d'un service de livraison classique ?",
        a: "Contrairement aux agences de transport classiques, DZColis s'appuie sur des transporteurs qui effectuent déjà un trajet prévu. Vous profitez de la place disponible dans leur véhicule. C'est économique pour l'expéditeur, rentable pour le transporteur, et écologique pour tout le monde. De plus, le paiement est sécurisé par séquestre : le transporteur n'est payé qu'après confirmation de la livraison.",
      },
      {
        q: "DZColis couvre-t-il toute l'Algérie ?",
        a: "Oui, DZColis couvre les 48 wilayas d'Algérie. Grâce à notre réseau croissant de transporteurs, la plupart des trajets interwilayas sont disponibles. Les grandes villes comme Alger, Oran, Constantine, Annaba, Sétif et Béjaïa bénéficient du plus grand nombre d'offres.",
      },
      {
        q: "Dois-je créer un compte pour utiliser DZColis ?",
        a: "Vous pouvez consulter les annonces et les transporteurs sans compte. En revanche, pour publier une annonce d'envoi, contacter un transporteur ou proposer vos services, vous devez créer un compte gratuit. L'inscription prend moins de 2 minutes.",
      },
    ],
  },
  {
    id: "expediteurs",
    title: "Expéditeurs",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    items: [
      {
        q: "Comment envoyer un colis via DZColis ?",
        a: "C'est simple en 4 étapes : (1) Créez une annonce en décrivant votre colis, votre ville de départ et d'arrivée, et votre budget. (2) Les transporteurs sur ce trajet vous envoient des propositions. (3) Vous choisissez l'offre qui vous convient et confirmez. (4) Vous payez en ligne — le montant est bloqué en séquestre et libéré uniquement après que vous ayez confirmé la bonne réception du colis.",
      },
      {
        q: "Quels types de colis puis-je envoyer ?",
        a: "Vous pouvez envoyer des colis de toute taille : petits paquets, électroménager, meubles, matériaux de construction, pièces automobiles, vêtements, produits alimentaires non périssables, etc. Certains articles sont interdits : substances illicites, matières dangereuses, armes, produits contrefaits. Consultez nos conditions générales pour la liste complète des articles prohibés.",
      },
      {
        q: "Comment fonctionne le paiement pour les expéditeurs ?",
        a: "Quand vous acceptez l'offre d'un transporteur, vous payez en ligne (carte bancaire, CIB, virement). Le montant est bloqué sur un compte séquestre DZColis. Le transporteur ne reçoit l'argent que lorsque vous confirmez avoir bien reçu votre colis en bon état. En cas de problème, notre équipe médiation intervient.",
      },
      {
        q: "Que se passe-t-il si mon colis arrive endommagé ou ne arrive pas ?",
        a: "En cas de dommage ou de perte, vous bénéficiez de l'assurance DZColis (incluse gratuitement) couvrant jusqu'à 50 000 DA pour les trajets domestiques et 100 000 DA pour l'international. Signalez le problème dans les 48 heures suivant la livraison via votre tableau de bord. Notre équipe traite les réclamations sous 5 jours ouvrables.",
      },
    ],
  },
  {
    id: "transporteurs",
    title: "Transporteurs",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    items: [
      {
        q: "Comment devenir transporteur sur DZColis ?",
        a: "Inscrivez-vous gratuitement, puis accédez à la section \"Devenir transporteur\". Vous renseignerez votre véhicule, vos trajets habituels et vos disponibilités. Une vérification d'identité (photo de permis et de carte d'identité) est requise pour activer votre profil transporteur. Une fois validé, vous commencez à recevoir des demandes.",
      },
      {
        q: "Combien puis-je gagner en tant que transporteur ?",
        a: "Vous fixez vous-même vos tarifs et votre disponibilité. DZColis prélève une commission de seulement 10 % par transaction — vous gardez 90 % du montant. À titre d'exemple, un trajet Alger–Oran facturé 3 000 DA vous rapporte 2 700 DA nets. Les transporteurs actifs gagnent en moyenne entre 15 000 et 40 000 DA de revenus complémentaires par mois.",
      },
      {
        q: "Dois-je être un transporteur professionnel ?",
        a: "Non, les particuliers sont les bienvenus. Si vous faites régulièrement un trajet en voiture personnelle ou avec un véhicule utilitaire, vous pouvez rentabiliser votre trajet en transportant des colis. Pour les véhicules commerciaux (camionnettes, fourgons), nous recommandons d'avoir les autorisations légales requises pour le transport de marchandises.",
      },
      {
        q: "Comment suis-je payé en tant que transporteur ?",
        a: "Après confirmation de livraison par l'expéditeur, le montant est automatiquement viré sur votre solde DZColis. Vous pouvez demander un virement vers votre compte bancaire algérien (CPA, BNA, BEA, Badr, etc.) à tout moment. Le délai de virement est de 1 à 3 jours ouvrables.",
      },
    ],
  },
  {
    id: "international",
    title: "International",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        q: "Quels pays européens sont desservis ?",
        a: "DZColis couvre actuellement 5 pays européens : la France, l'Espagne, la Belgique, l'Allemagne et l'Italie. Ces pays concentrent la plus grande diaspora algérienne en Europe. D'autres destinations (Portugal, Pays-Bas, Royaume-Uni) sont en cours d'ajout. Les transporteurs font régulièrement l'aller-retour Algérie–Europe et peuvent emmener vos colis.",
      },
      {
        q: "Quelles sont les formalités douanières pour un colis international ?",
        a: "Pour les envois personnels (famille à famille) d'une valeur inférieure à 300 EUR, les formalités sont simplifiées. L'expéditeur doit fournir une liste descriptive du contenu et sa valeur estimée. Certains produits sont soumis à restrictions à l'import ou à l'export (médicaments, devises, denrées alimentaires). Le transporteur est responsable de la déclaration douanière à la frontière.",
      },
      {
        q: "Les délais de livraison internationale sont-ils garantis ?",
        a: "Les délais ne sont pas garantis au sens contractuel, mais chaque transporteur indique une fourchette de dates estimées lors de sa proposition. En moyenne, les délais constatés sont : France 4–8 jours, Espagne 5–9 jours, Belgique 5–8 jours, Allemagne 7–12 jours, Italie 4–7 jours. L'assurance internationale couvre jusqu'à 100 000 DA en cas de perte ou de dommage.",
      },
    ],
  },
  {
    id: "paiement-securite",
    title: "Paiement & Sécurité",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    items: [
      {
        q: "Quels moyens de paiement sont acceptés ?",
        a: "DZColis accepte les cartes CIB (Carte Interbancaire Algérienne), les virements bancaires depuis les principales banques algériennes (BNA, CPA, BEA, Badr, CNEP, Société Générale Algérie), ainsi que les paiements via Dahabia. Pour les utilisateurs en Europe, les cartes Visa et Mastercard sont acceptées pour les envois internationaux.",
      },
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. DZColis respecte la réglementation algérienne sur la protection des données personnelles. Vos informations ne sont jamais revendues à des tiers. Les numéros de téléphone sont masqués jusqu'à confirmation d'une transaction. Nos serveurs sont hébergés en Algérie et sécurisés avec un chiffrement SSL/TLS. Vous pouvez demander la suppression de votre compte à tout moment.",
      },
      {
        q: "Comment DZColis garantit-il la fiabilité des transporteurs ?",
        a: "Chaque transporteur passe par une vérification d'identité (CNI + permis de conduire). Après chaque livraison, l'expéditeur laisse un avis public. Les transporteurs avec un score inférieur à 3.5/5 après 10 avis sont suspendus automatiquement. Notre équipe de modération examine les signalements sous 24 heures. Vous pouvez voir le taux de réussite, le nombre de livraisons et les avis de chaque transporteur avant de choisir.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-dz-gray-200 rounded-xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-dz-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 pr-4">
          <CheckIcon />
          <span className="font-medium text-dz-gray-800">{item.q}</span>
        </div>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 bg-white border-t border-dz-gray-100">
          <p className="text-dz-gray-600 leading-relaxed pl-8">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Questions fréquentes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Tout ce que vous devez<br />
            <span className="text-green-300">savoir sur DZColis</span>
          </h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto leading-relaxed">
            Retrouvez les réponses aux questions les plus fréquentes sur notre service. Vous ne trouvez pas votre réponse ? Contactez notre équipe.
          </p>
        </div>
      </section>

      {/* Navigation rapide par catégorie */}
      <div className="bg-white border-b border-dz-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-dz-gray-600 hover:bg-dz-green/10 hover:text-dz-green transition-colors"
              >
                <span className="text-dz-green">{cat.icon}</span>
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="bg-dz-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {categories.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <h2 className="text-2xl font-bold text-dz-gray-800">{cat.title}</h2>
                <span className="text-sm text-dz-gray-400 font-medium">
                  {cat.items.length} question{cat.items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-3">
                {cat.items.map((item, i) => {
                  const key = `${cat.id}-${i}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-dz-green to-dz-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Vous avez encore des questions ?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Notre équipe est disponible 7j/7 pour vous aider. Vous pouvez aussi commencer directement et envoyer votre premier colis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/inscription"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
