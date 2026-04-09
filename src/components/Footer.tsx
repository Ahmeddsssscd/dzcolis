import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dz-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-dz-green rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DZ</span>
              </div>
              <span className="text-xl font-bold">
                DZ<span className="text-dz-green-light">Colis</span>
              </span>
            </div>
            <p className="text-dz-gray-400 text-sm leading-relaxed">
              La première plateforme de livraison collaborative en Algérie.
              Expédiez malin, voyagez utile.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-dz-gray-200">Services</h3>
            <ul className="space-y-2 text-sm text-dz-gray-400">
              <li><Link href="/envoyer" className="hover:text-white transition-colors">Envoyer un colis</Link></li>
              <li><Link href="/transporter" className="hover:text-white transition-colors">Devenir transporteur</Link></li>
              <li><Link href="/annonces" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dz-gray-200">Informations</h3>
            <ul className="space-y-2 text-sm text-dz-gray-400">
              <li><Link href="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/assurance" className="hover:text-white transition-colors">Assurance</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dz-gray-200">Contact</h3>
            <ul className="space-y-2 text-sm text-dz-gray-400">
              <li>contact@dzcolis.dz</li>
              <li>+213 (0) 555 123 456</li>
              <li>Alger, Algérie</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <div className="w-9 h-9 bg-dz-gray-700 rounded-lg flex items-center justify-center hover:bg-dz-green transition-colors cursor-pointer">
                <span className="text-xs font-bold">FB</span>
              </div>
              <div className="w-9 h-9 bg-dz-gray-700 rounded-lg flex items-center justify-center hover:bg-dz-green transition-colors cursor-pointer">
                <span className="text-xs font-bold">IG</span>
              </div>
              <div className="w-9 h-9 bg-dz-gray-700 rounded-lg flex items-center justify-center hover:bg-dz-green transition-colors cursor-pointer">
                <span className="text-xs font-bold">TW</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dz-gray-700 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-dz-gray-500">
          <p>&copy; 2026 DZColis. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
