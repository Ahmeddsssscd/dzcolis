import Link from "next/link";

const objectCategories = [
  {
    icon: "📦",
    title: "Cartons & vêtements",
    color: "border-amber-200 bg-amber-50",
    headerBg: "bg-amber-100",
    accentColor: "text-amber-700",
    tips: [
      "Utilisez une double boîte pour les articles volumineux",
      "Emballez les vêtements sous vide pour réduire le volume",
      "Scellez toutes les coutures avec du ruban adhésif renforcé",
      "Protégez les angles avec des renforts cartonnés",
    ],
  },
  {
    icon: "📺",
    title: "Électronique",
    color: "border-blue-200 bg-blue-50",
    headerBg: "bg-blue-100",
    accentColor: "text-blue-700",
    tips: [
      "L'emballage d'origine est idéal — conservez-le",
      "Enveloppez dans du papier bulle antistatique (au moins 3 couches)",
      "Utilisez des sacs antistatiques pour les composants",
      "Apposez obligatoirement l'étiquette « FRAGILE »",
    ],
  },
  {
    icon: "🏠",
    title: "Électroménager",
    color: "border-purple-200 bg-purple-50",
    headerBg: "bg-purple-100",
    accentColor: "text-purple-700",
    tips: [
      "Videz et séchez entièrement les appareils contenant de l'eau",
      "Bloquez les portes, bacs et tambours avec du ruban",
      "Conservez les mousses d'origine pour caler l'appareil",
      "Protégez les éléments saillants (poignées, boutons) séparément",
    ],
  },
  {
    icon: "🛋️",
    title: "Meubles",
    color: "border-orange-200 bg-orange-50",
    headerBg: "bg-orange-100",
    accentColor: "text-orange-700",
    tips: [
      "Démontez toujours quand c'est possible",
      "Protégez les angles avec des mousses d'angle",
      "Emballez les parties en tissu dans du film plastique",
      "Emballez les vis et accessoires dans un sachet étiqueté",
    ],
  },
  {
    icon: "💊",
    title: "Médicaments",
    color: "border-teal-200 bg-teal-50",
    headerBg: "bg-teal-100",
    accentColor: "text-teal-700",
    tips: [
      "Utilisez uniquement des contenants hermétiques et étanches",
      "Joignez une note si la température de transport est critique",
      "Déclarez le contenu sur la plateforme lors de l'envoi",
      "Respectez la législation sur les médicaments à l'international",
    ],
  },
  {
    icon: "💎",
    title: "Objets fragiles",
    color: "border-red-200 bg-red-50",
    headerBg: "bg-red-100",
    accentColor: "text-red-700",
    tips: [
      "Appliquez la technique de la double boîte sans exception",
      "Remplissez 100 % des vides avec des billes de mousse",
      "Marquez « FRAGILE » et les flèches de sens sur les 6 faces",
      "Emballez individuellement chaque pièce si plusieurs objets",
    ],
  },
];

const materials = [
  {
    icon: "🎗️",
    name: "Ruban adhésif renforcé",
    note: "Jamais du simple scotch",
    color: "bg-dz-green/10 border-dz-green/30",
    iconBg: "bg-dz-green/20",
  },
  {
    icon: "🫧",
    name: "Papier bulle",
    note: "Au moins 3 couches",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    icon: "🟩",
    name: "Mousse de protection",
    note: "Pour caler et absorber les chocs",
    color: "bg-emerald-50 border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  {
    icon: "📦",
    name: "Double carton",
    note: "Ondulé double paroi recommandé",
    color: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: "🔗",
    name: "Sangles de fixation",
    note: "Pour colis lourds ou meubles",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
  },
  {
    icon: "🖊️",
    name: "Marker « FRAGILE » rouge",
    note: "Bien visible sur toutes les faces",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
  },
];

const steps = [
  {
    num: "01",
    title: "Choisir la bonne boîte",
    desc: "La boîte doit être 5 cm plus grande que l'objet de chaque côté. Un carton trop juste ne laisse aucune place pour le rembourrage.",
    tip: "Règle des 5 cm",
  },
  {
    num: "02",
    title: "Protéger le fond",
    desc: "Disposez une couche de papier bulle ou de mousse au fond de la boîte avant d'y placer l'objet. C'est la première ligne de défense contre les chocs.",
    tip: "Couche de base obligatoire",
  },
  {
    num: "03",
    title: "Emballer l'objet individuellement",
    desc: "Enveloppez l'objet dans du papier bulle ou de la mousse sur toutes ses faces. Fixez avec du ruban adhésif pour que l'emballage ne se défasse pas.",
    tip: "Toutes les faces couvertes",
  },
  {
    num: "04",
    title: "Remplir les vides",
    desc: "Comblez chaque espace vide avec des journaux froissés, de la mousse ou des billes de calage. Aucun vide ne doit subsister — c'est là que les dommages se produisent.",
    tip: "Zéro vide toléré",
  },
  {
    num: "05",
    title: "Tester la solidité",
    desc: "Fermez la boîte et secouez-la doucement. Si vous sentez l'objet bouger ou entendre du mouvement, rouvrez et ajoutez du rembourrage supplémentaire.",
    tip: "Test du secouage",
  },
  {
    num: "06",
    title: "Fermer avec le motif en H",
    desc: "Appliquez 3 bandes de ruban adhésif renforcé : une bande centrale sur la jonction et deux bandes sur les côtés (motif en H). Répétez sur le fond.",
    tip: "Motif H = 3 bandes",
  },
  {
    num: "07",
    title: "Marquer et orienter",
    desc: "Inscrivez « FRAGILE » si nécessaire sur toutes les faces visibles. Dessinez des flèches indiquant le haut du colis pour que les transporteurs sachent le sens.",
    tip: "6 faces marquées",
  },
];

const donts = [
  {
    icon: "📦",
    text: "Réutiliser des boîtes abîmées, mouillées ou déjà très utilisées",
    desc: "Un carton affaibli ne résiste pas aux empilements pendant le transport.",
  },
  {
    icon: "📰",
    text: "Emballer avec du papier journal comme seule protection",
    desc: "L'encre détériore les surfaces, et le papier journal seul n'absorbe pas les chocs.",
  },
  {
    icon: "🕳️",
    text: "Laisser des vides à l'intérieur de la boîte",
    desc: "Les espaces permettent à l'objet de se déplacer et d'être endommagé au moindre choc.",
  },
  {
    icon: "🎗️",
    text: "Utiliser un seul morceau de ruban adhésif pour fermer",
    desc: "Une seule bande cède facilement. Le motif en H avec 3 bandes est le minimum requis.",
  },
  {
    icon: "📋",
    text: "Oublier de déclarer « fragile » sur la plateforme",
    desc: "Sans déclaration de fragilité sur DZColis, l'assurance peut refuser votre réclamation.",
  },
];

export default function ConseilsEmballagePage() {
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
            Guide officiel DZColis
          </div>
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Conseils d&apos;emballage DZColis</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-10">
            Un emballage soigné protège votre colis contre les dommages et garantit
            la couverture de votre assurance. Suivez ce guide pour expédier en toute confiance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { stat: "99%", label: "des colis bien emballés arrivent sans dommage" },
              { stat: "3×", label: "moins de réclamations avec un emballage double paroi" },
              { stat: "48h", label: "de remboursement garanti si emballage conforme" },
            ].map((s) => (
              <div key={s.stat} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center">
                <div className="text-3xl font-bold mb-1">{s.stat}</div>
                <div className="text-sm text-green-100 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Warning banner */}
        <section>
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div>
              <h2 className="font-bold text-amber-800 text-lg mb-1">Attention — votre assurance est en jeu</h2>
              <p className="text-amber-700 leading-relaxed">
                Un colis mal emballé peut être <strong>refusé par l&apos;assurance</strong> en cas de réclamation.
                En déclarant &quot;fragile&quot; sur la plateforme et en suivant ces conseils, vous êtes pleinement
                couvert par DZColis Protect. Sans cela, nous ne pouvons pas garantir le remboursement.
              </p>
            </div>
          </div>
        </section>

        {/* Règle d'or */}
        <section>
          <div className="relative bg-gradient-to-br from-dz-green/10 to-dz-green-light/10 border-2 border-dz-green/30 rounded-3xl p-8 md:p-10 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-48 h-48 bg-dz-green rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-dz-green rounded-full translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-dz-green text-white rounded-full px-5 py-1.5 text-sm font-bold mb-6">
                ✨ La règle d&apos;or
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800 mb-4">La règle des 5 cm</h2>
              <p className="text-dz-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Laissez toujours <strong className="text-dz-green">5 cm de rembourrage minimum</strong> entre votre
                objet et les parois de la boîte — sur chaque côté, en haut et en bas. Cette marge absorbe les
                chocs et empêche l&apos;objet de toucher les parois lors des manipulations.
              </p>
              <div className="inline-flex items-center justify-center gap-8 bg-white rounded-2xl border border-dz-gray-200 px-8 py-5 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-black text-dz-gray-300">[ &nbsp;</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-dz-gray-400 mb-1">↔ 5 cm min</div>
                  <div className="bg-dz-green/20 border-2 border-dz-green rounded-xl px-6 py-3 text-sm font-bold text-dz-green">
                    Votre objet
                  </div>
                  <div className="text-xs text-dz-gray-400 mt-1">↔ 5 cm min</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-dz-gray-300">&nbsp; ]</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guide par type d'objet */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Guide par type d&apos;objet</h2>
            <p className="text-dz-gray-500 mt-2">Conseils spécifiques selon la nature de ce que vous expédiez</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {objectCategories.map((cat) => (
              <div key={cat.title} className={`rounded-2xl border-2 ${cat.color} overflow-hidden`}>
                <div className={`${cat.headerBg} px-5 py-4 flex items-center gap-3`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className={`font-bold ${cat.accentColor}`}>{cat.title}</h3>
                </div>
                <ul className="px-5 py-4 space-y-2.5">
                  {cat.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-dz-gray-600">
                      <svg className="w-4 h-4 text-dz-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Matériaux recommandés */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Matériaux recommandés</h2>
            <p className="text-dz-gray-500 mt-2">Ce dont vous avez besoin avant de commencer à emballer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {materials.map((mat) => (
              <div key={mat.name} className={`bg-white rounded-2xl border ${mat.color} p-5 flex items-start gap-4`}>
                <div className={`${mat.iconBg} w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                  {mat.icon}
                </div>
                <div>
                  <div className="font-semibold text-dz-gray-800 text-sm">{mat.name}</div>
                  <div className="text-xs text-dz-gray-500 mt-0.5">{mat.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Étapes d'emballage */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800">Étapes d&apos;emballage</h2>
            <p className="text-dz-gray-500 mt-2">Suivez ces 7 étapes dans l&apos;ordre pour un colis parfaitement protégé</p>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.num} className="bg-white rounded-2xl border border-dz-gray-200 p-6 flex items-start gap-5 hover:border-dz-green/30 hover:shadow-sm transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-dz-green text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-bold text-dz-gray-800">{step.title}</h3>
                    <span className="text-xs font-semibold text-dz-green bg-dz-green/10 px-3 py-1 rounded-full w-fit flex-shrink-0">
                      {step.tip}
                    </span>
                  </div>
                  <p className="text-sm text-dz-gray-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block flex-shrink-0 self-center text-dz-gray-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Ce qu'il NE faut PAS faire */}
        <section>
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="text-3xl mb-2">🚫</div>
              <h2 className="text-2xl font-bold text-red-800">Ce qu&apos;il ne faut pas faire</h2>
              <p className="text-red-600 mt-1 text-sm">Ces erreurs courantes peuvent invalider votre assurance</p>
            </div>
            <div className="space-y-4">
              {donts.map((dont) => (
                <div key={dont.text} className="bg-white rounded-xl border border-red-200 p-5 flex items-start gap-4">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-red-800 text-sm mb-0.5">{dont.text}</div>
                    <div className="text-xs text-red-600 leading-relaxed">{dont.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-dz-green to-dz-green-dark rounded-3xl p-10 text-white text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-3">Prêt à envoyer ?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Votre colis est correctement emballé ? Créez votre annonce en quelques minutes
            et choisissez votre couverture d&apos;assurance adaptée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/assurance"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              Voir l&apos;assurance 🛡️
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
