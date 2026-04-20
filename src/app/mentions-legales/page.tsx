import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="text-white py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Mentions légales</h1>
          <p className="text-blue-100 text-lg">
            Informations légales relatives à la plateforme Waselli.
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
          Dernière mise à jour : avril 2026
        </p>

        <div className="space-y-6">

          {/* Éditeur */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">1. Éditeur du site</h2>
            <div className="space-y-2 text-dz-gray-600 text-sm leading-relaxed">
              <p><span className="font-semibold text-dz-gray-700">Dénomination sociale :</span> Waselli</p>
              <p><span className="font-semibold text-dz-gray-700">Forme juridique :</span> SARL (Société à Responsabilité Limitée)</p>
              <p><span className="font-semibold text-dz-gray-700">Siège social :</span> Alger, Algérie</p>
              <p><span className="font-semibold text-dz-gray-700">Adresse e-mail :</span>{" "}
                <a href="mailto:contact@waselli.com" className="text-dz-green hover:underline">
                  contact@waselli.com
                </a>
              </p>
              <p><span className="font-semibold text-dz-gray-700">Directeur de publication :</span> Le représentant légal de Waselli</p>
            </div>
          </div>

          {/* Hébergement */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">2. Hébergement</h2>
            <div className="space-y-2 text-dz-gray-600 text-sm leading-relaxed">
              <p><span className="font-semibold text-dz-gray-700">Hébergeur :</span> Vercel Inc.</p>
              <p><span className="font-semibold text-dz-gray-700">Adresse :</span> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
              <p><span className="font-semibold text-dz-gray-700">Site web :</span>{" "}
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-dz-green hover:underline">
                  https://vercel.com
                </a>
              </p>
            </div>
          </div>

          {/* Propriété intellectuelle */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">3. Propriété intellectuelle</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              L&apos;ensemble des éléments constituant le site Waselli (textes, graphiques, logiciels, photographies, images, sons, plans, noms,
              logos, marques, créations et œuvres protégeables diverses) est la propriété exclusive de Waselli ou fait l&apos;objet d&apos;une
              autorisation d&apos;utilisation. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des
              éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Waselli.
              Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive
              d&apos;une contrefaçon et poursuivie conformément à la législation algérienne en vigueur.
            </p>
          </div>

          {/* Responsabilité */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">4. Limitation de responsabilité</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli agit exclusivement en qualité d&apos;intermédiaire technique et de place de marché numérique mettant en relation des expéditeurs et des transporteurs. Waselli n&apos;est en aucun cas transporteur, ni partie au contrat de transport conclu entre les utilisateurs.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Waselli s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Waselli ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              La responsabilité de Waselli ne saurait être engagée pour :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-dz-gray-500 text-sm mb-3">
              <li>Tout dommage direct ou indirect résultant de l&apos;accès au site ou de l&apos;impossibilité d&apos;y accéder ;</li>
              <li>Tout dommage lié au contenu d&apos;un colis expédié via la plateforme ;</li>
              <li>Toute perte, vol, dommage ou retard survenant lors du transport d&apos;un colis ;</li>
              <li>Tout manquement d&apos;un utilisateur à ses obligations légales ou contractuelles ;</li>
              <li>Toute confiscation douanière d&apos;un colis contenant des articles interdits ou non déclarés.</li>
            </ul>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Dans tous les cas où la responsabilité de Waselli serait retenue, celle-ci est limitée au montant de la commission perçue sur la transaction concernée, conformément aux Conditions Générales de Vente.
            </p>
          </div>

          {/* Liens hypertextes */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">5. Liens hypertextes</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Le site Waselli peut contenir des liens vers d&apos;autres sites internet. Waselli n&apos;exerce aucun contrôle sur ces sites et
              décline toute responsabilité quant à leur contenu ou aux éventuels dommages résultant de leur utilisation.
            </p>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              Tout lien hypertexte pointant vers le site Waselli doit faire l&apos;objet d&apos;une autorisation préalable et écrite de Waselli.
              Les demandes d&apos;autorisation peuvent être adressées à{" "}
              <a href="mailto:contact@waselli.com" className="text-dz-green hover:underline">
                contact@waselli.com
              </a>.
            </p>
          </div>

          {/* Droit applicable — strengthened */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">6. Droit applicable et juridiction compétente</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-3">
              Les présentes mentions légales, ainsi que l&apos;ensemble des services de la plateforme Waselli, sont régis exclusivement par la législation algérienne, notamment :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-dz-gray-500 text-sm mb-3">
              <li><strong className="text-dz-gray-700">Loi n° 18-05 du 10 mai 2018</strong> relative au commerce électronique ;</li>
              <li><strong className="text-dz-gray-700">Loi n° 04-15 du 10 novembre 2004</strong> relative aux règles applicables aux pratiques commerciales ;</li>
              <li><strong className="text-dz-gray-700">Loi n° 18-07 du 25 avril 2018</strong> relative à la protection des personnes physiques dans le traitement des données à caractère personnel ;</li>
              <li><strong className="text-dz-gray-700">Loi n° 15-04 du 1er février 2015</strong> fixant les règles générales relatives à la signature électronique et à la certification électronique ;</li>
              <li>Le Code civil algérien et le Code de commerce algérien dans leurs dispositions applicables.</li>
            </ul>
            <p className="text-dz-gray-600 text-sm leading-relaxed">
              En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes mentions légales, les tribunaux compétents du ressort d&apos;Alger seront seuls habilités à en connaître, après tentative obligatoire de médiation amiable d&apos;une durée de 30 jours.
            </p>
          </div>

          {/* Support WhatsApp — NEW */}
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-6">
            <h2 className="text-xl font-bold text-dz-gray-800 mb-4">7. Contact et support</h2>
            <p className="text-dz-gray-600 text-sm leading-relaxed mb-4">
              Pour toute question, réclamation ou demande d&apos;information relative à la plateforme Waselli, nos équipes sont disponibles via les canaux suivants :
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-dz-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-dz-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dz-gray-700 mb-0.5">Email général</p>
                  <a href="mailto:contact@waselli.com" className="text-sm text-dz-green hover:underline">contact@waselli.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dz-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.854a.5.5 0 00.608.62l6.168-1.616A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.695-.505-5.239-1.389l-.374-.214-3.874 1.014 1.036-3.784-.232-.381A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dz-gray-700 mb-0.5">Support WhatsApp</p>
                  <a href="mailto:contact@waselli.com" className="text-sm text-dz-green hover:underline">contact@waselli.com</a>
                  <p className="text-xs text-dz-gray-400 mt-0.5">Disponible du lundi au vendredi, 9h–18h (heure d&apos;Alger)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dz-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-dz-gray-700 mb-0.5">Litiges et réclamations</p>
                  <a href="mailto:litiges@waselli.com" className="text-sm text-dz-green hover:underline">litiges@waselli.com</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Related links */}
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/confidentialite" className="text-dz-green hover:underline font-medium">
            Politique de confidentialité →
          </Link>
          <Link href="/cgv" className="text-dz-green hover:underline font-medium">
            Conditions générales de vente →
          </Link>
          <Link href="/charte-transporteur" className="text-dz-green hover:underline font-medium">
            Charte du transporteur →
          </Link>
        </div>
      </div>
    </div>
  );
}
