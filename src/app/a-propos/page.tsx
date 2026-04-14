import Link from "next/link";
import DzColisLogo from "@/components/DzColisLogo";

const values = [
  {
    icon: "🤝",
    title: "Confiance",
    desc: "Chaque transporteur est évalué par la communauté. Les avis, le score de confiance et la vérification d'identité garantissent la sécurité de vos échanges.",
  },
  {
    icon: "💚",
    title: "Écologie",
    desc: "En optimisant les trajets existants, DZColis réduit le nombre de camions vides sur les routes algériennes. Moins d'émissions, plus de sens.",
  },
  {
    icon: "💰",
    title: "Accessibilité",
    desc: "Jusqu'à 60% moins cher que les transporteurs traditionnels. Notre modèle collaboratif rend la livraison accessible à tous, partout en Algérie.",
  },
  {
    icon: "🛡️",
    title: "Sécurité",
    desc: "Paiement séquestre, assurance DZColis Protect, photo de prise en charge et de livraison. Votre colis est protégé à chaque étape.",
  },
];

const team = [
  { avatar: "DZ", name: "À assigner ultérieurement", role: "Fondateur & CEO", bio: "Les informations sur l'équipe fondatrice seront communiquées prochainement." },
  { avatar: "DZ", name: "À assigner ultérieurement", role: "Direction Générale", bio: "Les informations sur l'équipe dirigeante seront communiquées prochainement." },
];

const milestones = [
  { year: "2026", event: "Idée fondatrice — connecter les expéditeurs aux transporteurs qui font déjà le trajet." },
  { year: "2026", event: "Lancement de DZColis avec couverture nationale des 69 wilayas." },
  { year: "2026", event: "Lancement du service international Algérie ↔ Europe (France, Espagne, Belgique, Allemagne, Italie)." },
  { year: "2026", event: "Lancement de DZColis Protect — assurance, score de confiance, photo de livraison." },
];

const stats = [
  { value: "50 000+", label: "Utilisateurs inscrits" },
  { value: "69", label: "Wilayas couvertes" },
  { value: "120 000+", label: "Colis livrés" },
  { value: "60%", label: "D'économies en moyenne" },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-dz-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dz-gray-800 to-dz-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <DzColisLogo size="xl" href="/" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            La livraison collaborative,<br />
            <span className="text-dz-green">made in Algeria</span>
          </h1>
          <p className="text-dz-gray-300 text-lg max-w-2xl mx-auto">
            DZColis connecte les personnes qui ont des colis à envoyer avec des transporteurs qui font déjà le trajet.
            Simple, économique, et pensé pour l'Algérie.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-dz-green text-white py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-green-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">Notre histoire</h2>
          <p className="text-dz-gray-500">Comment tout a commencé</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-8">
          <p className="text-dz-gray-700 leading-relaxed mb-4">
            DZColis est né d'un constat simple : chaque jour, des centaines de camions et fourgons parcourent les routes algériennes avec de l'espace vide. En parallèle, des millions d'Algériens cherchent des solutions pour envoyer des colis entre wilayas — souvent à des prix exorbitants ou sans garantie de sécurité.
          </p>
          <p className="text-dz-gray-700 leading-relaxed mb-4">
            Inspirés par le modèle collaboratif qui a révolutionné le transport de personnes, nous avons créé DZColis en 2026 pour mettre en relation expéditeurs et transporteurs qui font déjà le trajet. Le résultat : des livraisons jusqu'à 60% moins chères, plus écologiques, et sécurisées par notre système DZColis Protect.
          </p>
          <p className="text-dz-gray-700 leading-relaxed">
            Aujourd'hui, DZColis couvre les 69 wilayas d'Algérie et s'étend à l'international vers 5 pays européens. Notre mission reste la même : rendre la livraison accessible, fiable et juste pour tous les Algériens.
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-10 space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-dz-green text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {m.year}
                </div>
                {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-dz-gray-100 my-1" style={{ minHeight: 20 }} />}
              </div>
              <div className="pb-4">
                <p className="text-sm text-dz-gray-700 pt-2">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">Nos valeurs</h2>
            <p className="text-dz-gray-500">Ce qui nous guide chaque jour</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 bg-dz-gray-50 rounded-2xl p-5 border border-dz-gray-100">
                <div className="text-3xl shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-bold text-dz-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-dz-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dz-gray-900 mb-3">L'équipe</h2>
          <p className="text-dz-gray-500">Des Algériens qui construisent pour l'Algérie</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-8 text-center max-w-xs w-full">
              <div className="w-20 h-20 rounded-2xl bg-dz-green text-white font-black text-3xl flex items-center justify-center mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="font-bold text-dz-gray-900 text-lg">{member.name}</h3>
              <p className="text-sm text-dz-green font-medium mt-1">{member.role}</p>
              <p className="text-sm text-dz-gray-500 mt-3 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Rejoignez la communauté DZColis</h2>
          <p className="text-green-100 mb-8">
            Expéditeurs ou transporteurs, faites partie du mouvement qui révolutionne la livraison en Algérie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="bg-white text-dz-green font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
