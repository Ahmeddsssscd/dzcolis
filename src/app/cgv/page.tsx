import Link from "next/link";

export default function CGVPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="text-white py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Conditions Générales de Vente</h1>
          <p className="text-blue-100 text-lg">
            Les règles qui encadrent l&apos;utilisation de la plateforme Waselli et les transactions entre expéditeurs et transporteurs.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-dz-green hover:underline text-sm font-medium">
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <p className="text-dz-gray-500 text-sm mb-10">
          Dernière mise à jour : avril 2026 — Ces conditions s&apos;appliquent à toute utilisation de la plateforme Waselli.
        </p>

        <div className="space-y-6">

          {/* Article 1 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">1.</span>Objet et champ d&apos;application
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Les présentes Conditions Générales de Vente et d&apos;Utilisation (ci-après « CGV ») régissent l&apos;utilisation de la plateforme Waselli, accessible à l&apos;adresse <span className="text-dz-green font-medium">www.waselli.com</span>, et l&apos;ensemble des services proposés par Waselli. Elles constituent le socle contractuel unique régissant les relations entre Waselli et tout utilisateur de la plateforme, qu&apos;il soit expéditeur, transporteur ou simple visiteur.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli est une place de marché collaborative qui met en relation des <strong className="text-dz-gray-700">expéditeurs</strong> souhaitant envoyer des colis avec des <strong className="text-dz-gray-700">transporteurs particuliers ou professionnels</strong> effectuant des trajets correspondants sur le territoire algérien et à l&apos;international.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              <strong className="text-dz-gray-800">Waselli n&apos;est pas un transporteur.</strong> Elle agit exclusivement en tant qu&apos;intermédiaire technique facilitant la mise en relation entre les parties et la sécurisation des paiements. À ce titre, Waselli ne saurait en aucun cas être considérée comme partie au contrat de transport conclu entre l&apos;expéditeur et le transporteur, ni être tenue responsable de l&apos;exécution ou de l&apos;inexécution dudit contrat.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Toute utilisation de la plateforme implique l&apos;acceptation pleine, entière et sans réserve des présentes CGV. Les CGV sont opposables à l&apos;utilisateur dès la création de son compte ou, à défaut, dès la première utilisation de la plateforme.
            </p>
          </div>

          {/* Article 2 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">2.</span>Inscription et compte utilisateur
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              L&apos;accès aux services de Waselli nécessite la création d&apos;un compte utilisateur. L&apos;inscription est gratuite et réservée aux personnes physiques majeures (âgées de 18 ans révolus) ou aux personnes morales régulièrement constituées selon le droit algérien.
            </p>
            <div className="space-y-2 text-dz-gray-600 text-sm leading-relaxed">
              <p>Lors de l&apos;inscription, l&apos;utilisateur s&apos;engage à :</p>
              <ul className="list-disc pl-5 space-y-1 text-dz-gray-500">
                <li>Fournir des informations exactes, complètes, sincères et à jour ;</li>
                <li>Ne pas créer plusieurs comptes pour un même individu ou une même entité ;</li>
                <li>Maintenir la confidentialité de ses identifiants de connexion et ne pas les communiquer à des tiers ;</li>
                <li>Notifier immédiatement Waselli de toute utilisation non autorisée de son compte ;</li>
                <li>Ne pas utiliser le compte d&apos;un tiers sans autorisation expresse de celui-ci.</li>
              </ul>
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              Les transporteurs doivent en outre fournir une copie de leur pièce d&apos;identité nationale valide, leur permis de conduire et la carte grise du véhicule utilisé, afin de compléter la vérification de leur identité (processus KYC — Know Your Customer). Waselli se réserve le droit de suspendre ou de supprimer définitivement tout compte ne respectant pas ces exigences, sans préavis ni indemnité.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              Toute fausse déclaration lors de l&apos;inscription constitue une fraude susceptible d&apos;entraîner des poursuites pénales sur le fondement des articles pertinents du Code pénal algérien.
            </p>
          </div>

          {/* Article 3 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">3.</span>Annonces, colis autorisés et articles strictement interdits
            </h2>
            <div className="space-y-4 text-dz-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">3.1 Annonces d&apos;expéditeurs</h3>
                <p>
                  L&apos;expéditeur peut publier une annonce décrivant le colis à envoyer (nature exacte du contenu, dimensions, poids estimé) en précisant le lieu de départ, la destination et le prix proposé. L&apos;expéditeur garantit que le colis est correctement décrit, licitement emballé et ne contient aucun article interdit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">3.2 Annonces de trajets</h3>
                <p>
                  Le transporteur peut publier un trajet indiquant son itinéraire, la date prévue, le type de véhicule et la capacité disponible. Il s&apos;engage à effectuer le trajet publié dans les délais annoncés et à prévenir immédiatement les expéditeurs concernés en cas de modification ou d&apos;annulation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-2">3.3 Articles strictement interdits</h3>
                <p className="mb-2">Sont strictement interdits sur la plateforme, sans limitation :</p>
                <ul className="list-disc pl-5 space-y-1 text-dz-gray-500">
                  <li>Armes à feu, armes blanches, munitions, explosifs, pièces d&apos;armes et tout matériel de guerre ;</li>
                  <li>Stupéfiants, drogues, substances psychotropes et précurseurs chimiques ;</li>
                  <li>Médicaments soumis à prescription médicale sans ordonnance valide jointe ;</li>
                  <li>Argent liquide, billets de banque, chèques, devises étrangères et valeurs mobilières ;</li>
                  <li>Produits dangereux : acides, produits corrosifs, matières radioactives, gaz sous pression, matières inflammables ou toxiques ;</li>
                  <li>Animaux vivants, espèces protégées et leurs produits dérivés ;</li>
                  <li>Marchandises contrefaites, copies illicites, œuvres piratées ou produits en violation de droits de propriété intellectuelle ;</li>
                  <li>Denrées périssables nécessitant une chaîne du froid non garantie par le transporteur ;</li>
                  <li>Organes humains, sang ou tout tissu biologique ;</li>
                  <li>Matériel de surveillance ou d&apos;espionnage sans autorisation légale ;</li>
                  <li>Pornographie, matériaux pédopornographiques ou tout contenu illicite ;</li>
                  <li>Tout article dont le transport, la détention ou l&apos;importation est interdit par la législation algérienne en vigueur ou par la législation du pays de destination.</li>
                </ul>
                <p className="mt-3 text-dz-gray-600">
                  La publication d&apos;une annonce portant sur un article interdit entraîne la suppression immédiate de l&apos;annonce, la suspension ou la résiliation définitive du compte, et peut faire l&apos;objet d&apos;un signalement aux autorités compétentes. Waselli coopère pleinement avec les autorités judiciaires et douanières algériennes.
                </p>
              </div>
            </div>
          </div>

          {/* Article 4 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">4.</span>Tarifs et commission
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              L&apos;inscription et la publication d&apos;annonces sur Waselli sont entièrement gratuites. Waselli perçoit une <strong className="text-dz-gray-700">commission de 10%</strong> sur le montant de chaque transaction validée entre un expéditeur et un transporteur. Cette commission rémunère les services d&apos;intermédiation, de mise en relation, de sécurisation du paiement et de support client fournis par Waselli.
            </p>
            <div className="bg-dz-gray-50 rounded-xl p-4 text-sm text-dz-gray-600 mb-3">
              <p className="font-semibold text-dz-gray-700 mb-2">Exemple de calcul :</p>
              <ul className="space-y-1 text-dz-gray-500">
                <li>Prix convenu : <strong className="text-dz-gray-700">2 000 DA</strong></li>
                <li>Commission Waselli (10%) : <strong className="text-dz-green">200 DA</strong></li>
                <li>Montant reversé au transporteur : <strong className="text-dz-gray-700">1 800 DA</strong></li>
              </ul>
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Les prix affichés sur la plateforme sont exprimés en Dinars Algériens (DZD). Waselli se réserve le droit de modifier son taux de commission en informant les utilisateurs avec un préavis minimum de 30 jours par email et notification sur la plateforme. La poursuite de l&apos;utilisation de la plateforme après modification vaut acceptation du nouveau taux.
            </p>
          </div>

          {/* Article 5 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">5.</span>Paiement et système de séquestre
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Afin de garantir la sécurité des transactions, Waselli utilise un système de <strong className="text-dz-gray-700">paiement par séquestre</strong> (escrow) fonctionnant comme suit :
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-dz-gray-500 text-sm">
              <li>L&apos;expéditeur règle le montant convenu au moment de la confirmation de la réservation. Ce paiement est obligatoire pour que la réservation soit validée.</li>
              <li>Les fonds sont conservés de manière sécurisée par Waselli pendant toute la durée du transport. Aucune partie ne peut y accéder unilatéralement.</li>
              <li>À la réception du colis, l&apos;expéditeur confirme la bonne livraison sur la plateforme dans un délai maximum de 24 heures.</li>
              <li>Le paiement est alors libéré automatiquement au profit du transporteur (90% du montant, déduction faite de la commission Waselli de 10%).</li>
            </ol>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              En cas de litige non résolu dans un délai de <strong className="text-dz-gray-700">72 heures</strong> suivant la date de livraison prévue, Waselli intervient en tant que médiateur selon la procédure décrite à l&apos;article 10. Les fonds sont maintenus en séquestre jusqu&apos;à résolution définitive du différend.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              Si l&apos;expéditeur ne confirme pas la réception dans les 48 heures suivant la livraison confirmée par le transporteur, le paiement est automatiquement libéré en faveur du transporteur, sauf opposition formelle notifiée au support Waselli avant l&apos;expiration de ce délai.
            </p>
          </div>

          {/* Article 6 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">6.</span>Déclaration de contenu et signature électronique
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Préalablement à toute publication d&apos;annonce d&apos;envoi, l&apos;expéditeur est tenu de compléter une <strong className="text-dz-gray-700">déclaration de contenu</strong> détaillant avec précision la nature, la quantité et la valeur de chaque article contenu dans le colis. Cette déclaration est transmise au transporteur et peut être communiquée aux autorités douanières ou judiciaires compétentes.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              La déclaration de contenu est complétée par une <strong className="text-dz-gray-700">signature électronique</strong> consistant en la saisie du nom complet de l&apos;expéditeur. Conformément à la loi algérienne n°&nbsp;15-04 du 1er février 2015 fixant les règles générales relatives à la signature électronique et à la certification électronique, cette signature électronique a la même valeur juridique qu&apos;une signature manuscrite et emporte les mêmes effets légaux.
            </p>
            <div className="bg-dz-gray-50 rounded-xl p-4 text-sm text-dz-gray-600 mb-3">
              <p className="font-semibold text-dz-gray-700 mb-2">Effets juridiques de la signature électronique :</p>
              <ul className="list-disc pl-5 space-y-1 text-dz-gray-500">
                <li>La signature vaut acceptation irrévocable de la déclaration de contenu ;</li>
                <li>Elle engage personnellement et contractuellement le signataire ;</li>
                <li>Elle est horodatée et conservée par Waselli pendant une durée de 10 ans ;</li>
                <li>Un identifiant unique de déclaration (UUID) est généré et transmis par email à l&apos;expéditeur ;</li>
                <li>Toute déclaration signée est opposable à l&apos;expéditeur devant toute juridiction compétente.</li>
              </ul>
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Toute déclaration inexacte, incomplète ou mensongère constitue une faute contractuelle grave entraînant la résiliation immédiate du compte et peut constituer le délit de fausse déclaration douanière prévu et sanctionné par le Code des douanes algérien, ainsi que d&apos;autres infractions pénales selon la nature des articles dissimulés.
            </p>
          </div>

          {/* Article 7 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">7.</span>Responsabilité de l&apos;expéditeur
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              L&apos;expéditeur est <strong className="text-dz-gray-800">seul et entièrement responsable</strong> du contenu de son colis, de son emballage, de l&apos;exactitude et de l&apos;exhaustivité des informations fournies, ainsi que de la conformité du colis à la législation algérienne et, le cas échéant, à la législation du pays de destination.
            </p>
            <div className="space-y-3 text-dz-gray-600 text-sm leading-relaxed">
              <p>À ce titre, l&apos;expéditeur garantit expressément :</p>
              <ul className="list-disc pl-5 space-y-1 text-dz-gray-500">
                <li>Qu&apos;il est le propriétaire légitime des articles expédiés ou qu&apos;il dispose de l&apos;autorisation de les expédier ;</li>
                <li>Que le contenu déclaré est exact, complet et ne comporte aucune omission intentionnelle ;</li>
                <li>Que le colis ne contient aucun article interdit tel que défini à l&apos;article 3 ;</li>
                <li>Que l&apos;emballage est adapté à la nature des articles et suffisant pour supporter les conditions normales de transport ;</li>
                <li>Que les articles sont conformes aux réglementations douanières applicables.</li>
              </ul>
              <p>
                En cas de contenu non déclaré, illicite ou dangereux, l&apos;expéditeur assume l&apos;entière responsabilité civile et pénale en découlant et s&apos;engage à indemniser Waselli, le transporteur et tout tiers qui subirait un préjudice du fait de ce contenu. Waselli est expressément et irrévocablement dégagée de toute responsabilité pour le contenu des colis.
              </p>
              <p>
                Tout dommage causé par un emballage inadapté, une déclaration inexacte ou un article dangereux non signalé est à la charge exclusive de l&apos;expéditeur. L&apos;expéditeur ne peut pas invoquer l&apos;ignorance du contenu d&apos;un colis qu&apos;il expédie comme moyen d&apos;exonération de sa responsabilité.
              </p>
            </div>
          </div>

          {/* Article 8 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">8.</span>Responsabilité de Waselli
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli agit exclusivement en qualité d&apos;<strong className="text-dz-gray-800">intermédiaire technique</strong> et de place de marché numérique. À ce titre :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-dz-gray-500 text-sm mb-3">
              <li>Waselli n&apos;est pas partie au contrat de transport conclu entre l&apos;expéditeur et le transporteur ;</li>
              <li>Waselli ne contrôle pas physiquement les colis et n&apos;est pas en mesure de vérifier leur contenu ;</li>
              <li>Waselli décline toute responsabilité pour les dommages résultant d&apos;un manquement d&apos;un utilisateur à ses obligations contractuelles ou légales ;</li>
              <li>Waselli décline toute responsabilité pour la perte, le vol, la détérioration ou la confiscation d&apos;un colis dont le contenu est illicite, non conforme ou non déclaré ;</li>
              <li>Waselli décline toute responsabilité pour les retards, annulations ou inexécutions imputables au transporteur.</li>
            </ul>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-orange-800 mb-1">Plafond de responsabilité de Waselli</p>
              <p className="text-orange-700">
                Dans les cas où la responsabilité de Waselli serait malgré tout retenue par une juridiction compétente, cette responsabilité est expressément limitée au montant de la commission perçue par Waselli sur la transaction concernée (soit 10% du montant de la transaction), à l&apos;exclusion de tout dommage indirect, consécutif, accessoire, spécial ou punitif. Ce plafond s&apos;applique indépendamment de la théorie juridique invoquée.
              </p>
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              La responsabilité de Waselli se limite au bon fonctionnement technique de la plateforme et à la bonne gestion du séquestre conformément aux présentes CGV.
            </p>
          </div>

          {/* Article 9 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">9.</span>Force majeure
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli ne saurait être tenue responsable de tout manquement à ses obligations contractuelles résultant d&apos;un événement de force majeure, au sens de l&apos;article 127 du Code civil algérien, c&apos;est-à-dire tout événement imprévisible, irrésistible et extérieur aux parties.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Sont notamment considérés comme cas de force majeure, sans que cette liste soit exhaustive :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-dz-gray-500 text-sm mb-3">
              <li>Catastrophes naturelles : tremblements de terre, inondations, tempêtes, glissements de terrain ;</li>
              <li>Conflits armés, guerres civiles, actes de terrorisme ou émeutes ;</li>
              <li>Grèves générales affectant les secteurs du transport ou des télécommunications ;</li>
              <li>Fermetures de frontières, blocus douaniers ou décisions gouvernementales restrictrices ;</li>
              <li>Pannes majeures des infrastructures internet ou des systèmes de paiement électronique ;</li>
              <li>Épidémies ou pandémies déclarées par les autorités sanitaires compétentes ;</li>
              <li>Toute décision administrative ou judiciaire rendant impossible l&apos;exécution du service.</li>
            </ul>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              En cas de force majeure, Waselli s&apos;engage à informer les utilisateurs dans les meilleurs délais et à prendre toutes les mesures raisonnables pour minimiser les perturbations. Les obligations de Waselli sont suspendues pendant la durée de l&apos;événement de force majeure. Si cet événement dure plus de 60 jours, chacune des parties peut résilier les engagements en cours sans indemnité.
            </p>
          </div>

          {/* Article 10 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">10.</span>Résolution des litiges
            </h2>
            <div className="space-y-3 text-dz-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">10.1 Médiation préalable obligatoire</h3>
                <p>
                  En cas de litige entre utilisateurs ou entre un utilisateur et Waselli, les parties s&apos;engagent à tenter de résoudre le différend à l&apos;amiable avant tout recours judiciaire. À cette fin, Waselli propose un service de <strong className="text-dz-gray-700">médiation interne</strong> accessible depuis la plateforme ou via l&apos;adresse <a href="mailto:litiges@waselli.com" className="text-dz-green hover:underline">litiges@waselli.com</a>.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">10.2 Procédure de médiation</h3>
                <ul className="list-disc pl-5 space-y-1 text-dz-gray-500">
                  <li>La partie lésée notifie son grief par écrit à Waselli avec tous les éléments justificatifs ;</li>
                  <li>Waselli dispose de <strong className="text-dz-gray-700">15 jours ouvrables</strong> pour répondre et proposer une solution ;</li>
                  <li>Les parties disposent ensuite de <strong className="text-dz-gray-700">15 jours supplémentaires</strong> pour accepter ou refuser la solution proposée ;</li>
                  <li>La durée totale de la phase de médiation est de <strong className="text-dz-gray-700">30 jours calendaires</strong> à compter de la première notification ;</li>
                  <li>À l&apos;issue de ce délai sans accord, chaque partie retrouve la liberté de saisir les juridictions compétentes.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">10.3 Juridiction compétente</h3>
                <p>
                  En cas d&apos;échec de la médiation, et conformément à la loi algérienne, les parties reconnaissent la compétence exclusive du <strong className="text-dz-gray-700">Tribunal de Commerce d&apos;Alger</strong> pour tout litige relatif à l&apos;interprétation, à la validité ou à l&apos;exécution des présentes CGV. Le droit algérien est seul applicable à toute contestation relative à la plateforme Waselli.
                </p>
              </div>
            </div>
          </div>

          {/* Article 11 — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">11.</span>Envois internationaux
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli permet la mise en relation pour des envois à destination ou en provenance de l&apos;étranger. Pour ces envois, les dispositions suivantes s&apos;appliquent en complément des présentes CGV :
            </p>
            <div className="space-y-3 text-dz-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">11.1 Responsabilité douanière</h3>
                <p>
                  L&apos;expéditeur est seul responsable du respect des réglementations douanières algériennes et de celles du pays de destination. Il lui appartient de s&apos;informer des restrictions d&apos;importation et d&apos;exportation applicables aux articles expédiés. Waselli n&apos;assume aucune responsabilité en cas de saisie, confiscation ou destruction d&apos;un colis par les autorités douanières de quelque pays que ce soit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">11.2 Droits et taxes de douane</h3>
                <p>
                  Les droits de douane, taxes à l&apos;importation, TVA et autres prélèvements fiscaux exigibles dans le pays de destination sont à la charge exclusive du destinataire ou de l&apos;expéditeur selon les conditions convenues entre eux. Waselli n&apos;intervient à aucun titre dans le règlement de ces sommes et ne saurait en être tenue responsable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">11.3 Articles interdits dans le pays de destination</h3>
                <p>
                  L&apos;expéditeur doit s&apos;assurer que les articles expédiés ne sont pas interdits ou soumis à des restrictions particulières dans le pays de destination. Toute confiscation ou pénalité découlant du non-respect de cette obligation est supportée exclusivement par l&apos;expéditeur. Waselli se réserve le droit de suspendre le compte de tout utilisateur dont les envois auraient fait l&apos;objet d&apos;une saisie douanière.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 mb-1">11.4 Réglementation sur les changes</h3>
                <p>
                  Conformément à la réglementation algérienne sur les changes, les transactions en devises étrangères sont soumises aux règles édictées par la Banque d&apos;Algérie. Waselli ne peut être utilisée pour contourner la réglementation sur les changes ou faciliter des transferts de fonds illicites.
                </p>
              </div>
            </div>
          </div>

          {/* Article 12 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">12.</span>Modification des CGV
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli se réserve le droit de modifier les présentes CGV à tout moment, notamment pour se conformer à toute évolution législative ou réglementaire, ou pour améliorer ses services. Toute modification substantielle sera notifiée aux utilisateurs par email et/ou notification sur la plateforme avec un préavis minimum de <strong className="text-dz-gray-700">30 jours calendaires</strong>.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Les modifications non substantielles (corrections typographiques, reformulations sans impact sur les droits des parties, etc.) peuvent être effectuées sans préavis et prennent effet immédiatement.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              La poursuite de l&apos;utilisation de la plateforme après l&apos;entrée en vigueur des nouvelles CGV vaut acceptation pleine et entière de celles-ci. Si un utilisateur refuse les nouvelles CGV, il doit cesser immédiatement d&apos;utiliser la plateforme et peut demander la clôture de son compte conformément à l&apos;article 13. La version des CGV applicable est toujours celle en vigueur à la date de la transaction concernée.
            </p>
          </div>

          {/* Article 13 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">
              <span className="text-dz-green mr-2">13.</span>Contact et clôture de compte
            </h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Pour toute question relative aux présentes CGV, pour signaler un abus ou pour demander la clôture de votre compte, vous pouvez contacter Waselli aux coordonnées suivantes :
            </p>
            <div className="bg-dz-gray-50 rounded-xl p-4 text-sm space-y-2 text-dz-gray-600 mb-3">
              <p><strong className="text-dz-gray-700">Email :</strong>{" "}
                <a href="mailto:contact@waselli.com" className="text-dz-green hover:underline">contact@waselli.com</a>
              </p>
              <p><strong className="text-dz-gray-700">Litiges :</strong>{" "}
                <a href="mailto:litiges@waselli.com" className="text-dz-green hover:underline">litiges@waselli.com</a>
              </p>
              <p><strong className="text-dz-gray-700">Données personnelles (DPO) :</strong>{" "}
                <a href="mailto:dpo@waselli.com" className="text-dz-green hover:underline">dpo@waselli.com</a>
              </p>
              <p><strong className="text-dz-gray-700">Support WhatsApp :</strong>{" "}
                <a href="mailto:contact@waselli.com" className="text-dz-green hover:underline">contact@waselli.com</a>
              </p>
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Les demandes de clôture de compte sont traitées dans un délai de 10 jours ouvrables. Toute transaction en cours doit être finalisée avant la clôture. Les données sont conservées conformément à la politique de confidentialité et aux obligations légales en matière d&apos;archivage.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="bg-dz-gray-50 rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-3">Questions sur nos CGV ?</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Notre équipe juridique est disponible pour répondre à toutes vos questions relatives aux présentes conditions générales de vente.
            </p>
            <a
              href="mailto:contact@waselli.com"
              className="inline-flex items-center gap-2 bg-dz-green text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-dz-green-dark transition-colors"
            >
              contact@waselli.com
            </a>
          </div>

        </div>

        {/* Related links */}
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/mentions-legales" className="text-dz-green hover:underline font-medium">
            Mentions légales →
          </Link>
          <Link href="/confidentialite" className="text-dz-green hover:underline font-medium">
            Politique de confidentialité →
          </Link>
          <Link href="/charte-transporteur" className="text-dz-green hover:underline font-medium">
            Charte du transporteur →
          </Link>
        </div>
      </div>
    </div>
  );
}
