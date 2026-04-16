import Link from "next/link";

const senderSteps = [
  { num: "1", title: "Publiez votre annonce", desc: "Décrivez votre colis (photo, dimensions, poids), indiquez le départ et la destination, et proposez un prix." },
  { num: "2", title: "Recevez des offres", desc: "Les transporteurs dont le trajet correspond vous envoient des propositions. Discutez avec eux via la messagerie." },
  { num: "3", title: "Réservez en confiance", desc: "Choisissez le transporteur qui vous convient. Le paiement est sécurisé par Waselli (séquestre)." },
  { num: "4", title: "Confirmez la réception", desc: "Vérifiez votre colis à la livraison et confirmez. Le transporteur est payé automatiquement." },
];

const transporterSteps = [
  { num: "1", title: "Publiez votre trajet", desc: "Indiquez votre itinéraire, la date, le type de véhicule et l'espace disponible." },
  { num: "2", title: "Recevez des demandes", desc: "Les expéditeurs sur votre trajet vous contactent avec leurs colis à transporter." },
  { num: "3", title: "Acceptez et transportez", desc: "Récupérez le colis au point de départ et livrez-le à destination." },
  { num: "4", title: "Recevez votre paiement", desc: "Dès que l'expéditeur confirme la réception, vous recevez 90% du montant." },
];

const faqs = [
  { q: "Combien coûte l'envoi d'un colis ?", a: "Le prix dépend de la taille, du poids et du trajet. En moyenne, Waselli est 60% moins cher que les transporteurs traditionnels. Vous pouvez proposer votre prix." },
  { q: "Comment fonctionne le paiement ?", a: "Le paiement est sécurisé par séquestre. L'argent est bloqué par Waselli et n'est libéré au transporteur qu'après confirmation de la bonne réception du colis." },
  { q: "Mes colis sont-ils assurés ?", a: "Oui ! Tous les envois sont couverts par notre assurance gratuite jusqu'à 50 000 DA. Cette assurance couvre la casse et le vol pendant le transport." },
  { q: "Comment devenir transporteur ?", a: "Inscrivez-vous gratuitement, vérifiez votre identité, et publiez votre premier trajet. C'est simple et rapide." },
  { q: "Quels types de colis puis-je envoyer ?", a: "Tout type de colis : meubles, électroménager, cartons, électronique... Seuls les produits dangereux, illégaux ou périssables sont interdits." },
  { q: "Quelle est la commission de Waselli ?", a: "Waselli prend une commission de 10% sur chaque transaction. Le transporteur reçoit 90% du montant convenu." },
];

export default function CommentCaMarchePage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-dz-green to-dz-green-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Comment ça marche ?</h1>
          <p className="text-green-100 text-lg">
            Waselli connecte les expéditeurs avec des transporteurs qui font déjà le trajet.
            Simple, économique et sécurisé.
          </p>
        </div>
      </section>

      {/* For Senders */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-2 text-center">Pour les expéditeurs</h2>
          <p className="text-dz-gray-500 text-center mb-12">Envoyez un colis en 4 étapes</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {senderSteps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-dz-green text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/envoyer" className="bg-dz-green hover:bg-dz-green-light text-white px-8 py-3 rounded-xl font-medium transition-colors">
              Envoyer un colis
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-dz-gray-200" />

      {/* For Transporters */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-2 text-center">Pour les transporteurs</h2>
          <p className="text-dz-gray-500 text-center mb-12">Gagnez de l&apos;argent en 4 étapes</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {transporterSteps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-dz-gray-800 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/transporter" className="bg-dz-gray-800 hover:bg-dz-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
              Devenir transporteur
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-8 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="bg-dz-gray-50 rounded-xl border border-dz-gray-200 group">
                <summary className="p-5 cursor-pointer font-medium text-dz-gray-800 flex items-center justify-between">
                  {f.q}
                  <svg className="w-5 h-5 text-dz-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-dz-gray-600 leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
