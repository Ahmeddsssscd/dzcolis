import Link from "next/link";
import DzColisLogo from "@/components/DzColisLogo";

export default function Footer() {
  return (
    <footer className="bg-dz-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <DzColisLogo size="sm" href="/" />
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
              <li><Link href="/international" className="hover:text-white transition-colors">International 🌍</Link></li>
              <li><Link href="/solutions-business" className="hover:text-white transition-colors">Solutions Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dz-gray-200">Informations</h3>
            <ul className="space-y-2 text-sm text-dz-gray-400">
              <li><Link href="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/assurance" className="hover:text-white transition-colors">Assurance</Link></li>
              <li><Link href="/suivi" className="hover:text-white transition-colors">Suivi de colis</Link></li>
              <li><Link href="/conseils-emballage" className="hover:text-white transition-colors">Conseils emballage</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dz-gray-200">Contact & Support</h3>
            <ul className="space-y-2 text-sm text-dz-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">contact@dzcolis.dz</Link></li>
              <li>Alger, Algérie</li>
              <li><Link href="/a-propos" className="hover:text-white transition-colors">À propos de nous</Link></li>
            </ul>
            {/* WhatsApp support button */}
            <a
              href="https://wa.me/213XXXXXXXXXX?text=Bonjour%20DZColis%2C%20j%27ai%20besoin%20d%27aide."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-[#25D366] hover:bg-[#20B954] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Support WhatsApp
            </a>
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
