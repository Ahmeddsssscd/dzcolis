import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-dz-green to-dz-green-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Politique de confidentialité</h1>
          <p className="text-green-100 text-lg">
            Comment Waselli collecte, utilise et protège vos données personnelles.
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
          Dernière mise à jour : avril 2026 — Waselli s&apos;engage à protéger votre vie privée conformément
          au Règlement Général sur la Protection des Données (RGPD) et à la législation algérienne en vigueur.
        </p>

        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">1. Responsable du traitement</h2>
            <div className="space-y-2 text-dz-gray-600 text-sm leading-relaxed">
              <p>Le responsable du traitement de vos données personnelles est :</p>
              <div className="bg-dz-gray-50 rounded-xl p-4 mt-2 space-y-1 text-dz-gray-600 text-sm">
                <p><span className="font-semibold text-dz-gray-700">Société :</span> Waselli</p>
                <p><span className="font-semibold text-dz-gray-700">Adresse :</span> Alger, Algérie</p>
                <p>
                  <span className="font-semibold text-dz-gray-700">DPO (Délégué à la Protection des Données) :</span>{" "}
                  <a href="mailto:dpo@waselli.com" className="text-dz-green hover:underline">dpo@waselli.com</a>
                </p>
                <p>
                  <span className="font-semibold text-dz-gray-700">Contact général :</span>{" "}
                  <a href="mailto:contact@waselli.com" className="text-dz-green hover:underline">contact@waselli.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">2. Données collectées</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Dans le cadre de la fourniture de nos services, Waselli collecte les catégories de données suivantes :
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-dz-gray-700 text-sm mb-2">2.1 Données d&apos;identification</h3>
                <ul className="list-disc pl-5 text-dz-gray-500 text-sm space-y-1">
                  <li>Nom et prénom</li>
                  <li>Adresse e-mail</li>
                  <li>Numéro de téléphone</li>
                  <li>Photo de profil (facultative)</li>
                  <li>Documents d&apos;identité (pour la vérification des transporteurs : CNI, permis de conduire)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 text-sm mb-2">2.2 Données de transaction</h3>
                <ul className="list-disc pl-5 text-dz-gray-500 text-sm space-y-1">
                  <li>Informations relatives aux annonces publiées (colis, trajets)</li>
                  <li>Historique des transactions et montants échangés</li>
                  <li>Coordonnées bancaires pour les virements (transporteurs)</li>
                  <li>Évaluations et avis laissés sur la plateforme</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 text-sm mb-2">2.3 Données de navigation</h3>
                <ul className="list-disc pl-5 text-dz-gray-500 text-sm space-y-1">
                  <li>Adresse IP et données de localisation approximative</li>
                  <li>Type de navigateur et système d&apos;exploitation</li>
                  <li>Pages consultées et durée de visite</li>
                  <li>Données issues des cookies (voir section 8)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-dz-gray-700 text-sm mb-2">2.4 Données de communication</h3>
                <ul className="list-disc pl-5 text-dz-gray-500 text-sm space-y-1">
                  <li>Messages échangés via la messagerie interne de la plateforme</li>
                  <li>Correspondances avec le support client</li>
                  <li>Notifications et historique de communication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">3. Finalités et bases légales du traitement</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-dz-gray-200">
                    <th className="pb-3 pr-4 font-semibold text-dz-gray-700">Finalité</th>
                    <th className="pb-3 font-semibold text-dz-gray-700">Base légale</th>
                  </tr>
                </thead>
                <tbody className="text-dz-gray-500 divide-y divide-dz-gray-100">
                  <tr>
                    <td className="py-3 pr-4">Création et gestion du compte utilisateur</td>
                    <td className="py-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Facilitation des mises en relation et des transactions</td>
                    <td className="py-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Vérification d&apos;identité (KYC)</td>
                    <td className="py-3">Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Gestion du séquestre et des paiements</td>
                    <td className="py-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Service client et gestion des litiges</td>
                    <td className="py-3">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Amélioration de la plateforme et analyses statistiques</td>
                    <td className="py-3">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Envoi de communications commerciales et newsletters</td>
                    <td className="py-3">Consentement</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Prévention de la fraude et sécurité de la plateforme</td>
                    <td className="py-3">Intérêt légitime / Obligation légale</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">4. Partage des données</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli ne vend jamais vos données personnelles à des tiers. Nous pouvons partager certaines données dans les cas suivants :
            </p>
            <div className="space-y-3 text-dz-gray-600 text-sm leading-relaxed">
              <div className="flex gap-3">
                <span className="text-dz-green font-bold mt-0.5">→</span>
                <p><strong className="text-dz-gray-700">Avec les autres utilisateurs :</strong> certaines informations de profil (prénom, photo, évaluations, ville) sont visibles par les autres membres dans le cadre d&apos;une mise en relation.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-dz-green font-bold mt-0.5">→</span>
                <p><strong className="text-dz-gray-700">Avec nos prestataires techniques :</strong> hébergement (Vercel), paiement sécurisé, outils d&apos;analyse d&apos;audience, messagerie — dans le strict cadre de leurs missions et sous contrat.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-dz-green font-bold mt-0.5">→</span>
                <p><strong className="text-dz-gray-700">Avec les autorités compétentes :</strong> sur réquisition judiciaire ou en cas de suspicion de fraude, conformément aux obligations légales en vigueur.</p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">5. Durée de conservation</h2>
            <div className="space-y-2 text-dz-gray-600 text-sm leading-relaxed">
              <p>Vos données sont conservées pendant les durées suivantes :</p>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-dz-gray-500">
                <li>
                  <strong className="text-dz-gray-700">Données de compte actif :</strong> pendant toute la durée de la relation contractuelle, puis supprimées dans un délai de 3 ans après la clôture du compte.
                </li>
                <li>
                  <strong className="text-dz-gray-700">Données de transaction :</strong> 10 ans à compter de la date de transaction, conformément aux obligations comptables et fiscales.
                </li>
                <li>
                  <strong className="text-dz-gray-700">Documents d&apos;identité (KYC) :</strong> 5 ans après la fin de la relation contractuelle, conformément à la réglementation anti-blanchiment.
                </li>
                <li>
                  <strong className="text-dz-gray-700">Données de navigation et cookies :</strong> 13 mois maximum à compter du dépôt.
                </li>
                <li>
                  <strong className="text-dz-gray-700">Messages de support :</strong> 3 ans à compter de la dernière interaction.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">6. Vos droits sur vos données</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Conformément au RGPD et à la législation algérienne applicable, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { right: "Droit d'accès", desc: "Obtenir une copie de vos données personnelles que nous détenons." },
                { right: "Droit de rectification", desc: "Corriger les données inexactes ou incomplètes vous concernant." },
                { right: "Droit à l'effacement", desc: "Demander la suppression de vos données, sous réserve des obligations légales de conservation." },
                { right: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré et lisible par machine." },
                { right: "Droit d'opposition", desc: "Vous opposer au traitement de vos données à des fins de prospection commerciale." },
                { right: "Droit à la limitation", desc: "Demander la suspension temporaire du traitement de vos données." },
              ].map((item) => (
                <div key={item.right} className="bg-dz-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-dz-gray-700 text-sm mb-1">{item.right}</p>
                  <p className="text-dz-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-4">
              Pour exercer l&apos;un de ces droits, contactez notre DPO à{" "}
              <a href="mailto:dpo@waselli.com" className="text-dz-green hover:underline font-medium">dpo@waselli.com</a>.
              Nous nous engageons à répondre dans un délai de <strong className="text-dz-gray-700">30 jours</strong> à compter de la réception de votre demande.
            </p>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">7. Sécurité des données</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
              personnelles contre tout accès non autorisé, perte, destruction ou divulgation accidentelle :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-dz-gray-500 text-sm">
              <li>Chiffrement des données en transit (TLS/HTTPS) et au repos ;</li>
              <li>Authentification à deux facteurs disponible pour tous les comptes ;</li>
              <li>Accès aux données strictement limité au personnel habilité ;</li>
              <li>Audits de sécurité réguliers et tests de vulnérabilité ;</li>
              <li>Hébergement sécurisé sur infrastructure Vercel avec redondance géographique.</li>
            </ul>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-3">
              En cas de violation de données susceptible d&apos;engendrer un risque élevé pour vos droits et libertés,
              vous en serez informé dans les meilleurs délais conformément aux exigences du RGPD.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">8. Cookies et technologies similaires</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Waselli utilise des cookies et technologies similaires pour améliorer votre expérience sur la plateforme.
            </p>
            <div className="space-y-3">
              {[
                {
                  type: "Cookies essentiels",
                  color: "bg-dz-green",
                  desc: "Indispensables au fonctionnement de la plateforme (authentification, panier, séquestre). Ne peuvent pas être désactivés.",
                },
                {
                  type: "Cookies analytiques",
                  color: "bg-dz-gray-400",
                  desc: "Nous aident à comprendre comment les visiteurs utilisent le site (ex. : Google Analytics anonymisé). Soumis à votre consentement.",
                },
                {
                  type: "Cookies de préférences",
                  color: "bg-dz-gray-300",
                  desc: "Mémorisent vos préférences (langue, région, affichage). Soumis à votre consentement.",
                },
              ].map((cookie) => (
                <div key={cookie.type} className="flex gap-3 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cookie.color}`} />
                  <div>
                    <p className="font-semibold text-dz-gray-700 text-sm">{cookie.type}</p>
                    <p className="text-dz-gray-500 text-xs leading-relaxed">{cookie.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-dz-gray-600 text-sm leading-relaxed mt-4">
              Vous pouvez gérer vos préférences en matière de cookies à tout moment via notre bandeau de gestion des
              cookies ou depuis les paramètres de votre navigateur. Le refus des cookies non essentiels n&apos;affecte
              pas l&apos;accès aux services de la plateforme.
            </p>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">9. Transferts internationaux de données</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Dans le cadre de l&apos;hébergement par Vercel Inc. (États-Unis) et de l&apos;utilisation de certains prestataires
              techniques, vos données peuvent être transférées en dehors de l&apos;Union Européenne et de l&apos;Algérie.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Ces transferts sont encadrés par des garanties appropriées, notamment les Clauses Contractuelles Types
              (CCT) approuvées par la Commission Européenne, afin de garantir un niveau de protection équivalent à celui
              offert par le RGPD. Vous pouvez obtenir une copie de ces garanties en contactant notre DPO.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">10. Mineurs</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Les services de Waselli sont réservés aux personnes majeures (18 ans ou plus). Waselli ne collecte pas
              sciemment de données personnelles relatives à des mineurs. Si vous êtes parent ou tuteur et que vous
              pensez que votre enfant nous a fourni des données, contactez-nous immédiatement à{" "}
              <a href="mailto:dpo@waselli.com" className="text-dz-green hover:underline">dpo@waselli.com</a> afin
              que nous procédions à leur suppression.
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">11. Modifications de la politique de confidentialité</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Waselli se réserve le droit de modifier la présente politique de confidentialité à tout moment.
              Toute modification substantielle vous sera notifiée par e-mail et via une alerte sur la plateforme
              au moins 30 jours avant son entrée en vigueur. Nous vous invitons à consulter régulièrement cette
              page pour rester informé(e) de nos pratiques en matière de protection des données.
            </p>
          </div>

          {/* DPO Contact */}
          <div className="bg-dz-gray-50 rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-3">Contacter notre DPO</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Pour toute question relative à la protection de vos données ou pour exercer vos droits, contactez
              notre Délégué à la Protection des Données :
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:dpo@waselli.com"
                className="inline-flex items-center gap-2 bg-dz-green text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-dz-green-dark transition-colors"
              >
                dpo@waselli.com
              </a>
              <a
                href="mailto:contact@waselli.com"
                className="inline-flex items-center gap-2 bg-white border border-dz-gray-200 text-dz-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-dz-gray-50 transition-colors"
              >
                contact@waselli.com
              </a>
            </div>
            <p className="text-dz-gray-400 text-xs mt-4">
              Vous disposez également du droit d&apos;introduire une réclamation auprès de l&apos;autorité de contrôle
              compétente (CNIL en France, ou autorité équivalente dans votre pays de résidence).
            </p>
          </div>
        </div>

        {/* Related links */}
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/mentions-legales" className="text-dz-green hover:underline font-medium">
            Mentions légales →
          </Link>
          <Link href="/cgv" className="text-dz-green hover:underline font-medium">
            Conditions générales de vente →
          </Link>
        </div>
      </div>
    </div>
  );
}
