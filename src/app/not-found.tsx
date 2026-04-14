import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dz-gray-50 flex flex-col items-center justify-center px-4 text-center">
      {/* SVG illustration — map pin / lost package */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        className="w-32 h-32 mb-8 opacity-80"
        aria-hidden="true"
      >
        {/* Box body */}
        <rect x="20" y="50" width="80" height="55" rx="6" fill="#dce5de" />
        {/* Box lid */}
        <path d="M14 50 L60 30 L106 50 Z" fill="#b8c9bc" />
        {/* Lid crease */}
        <line x1="60" y1="30" x2="60" y2="50" stroke="#8fa896" strokeWidth="2" />
        {/* Tape strip */}
        <rect x="44" y="50" width="32" height="8" rx="2" fill="#006233" opacity="0.6" />
        {/* Question mark on box */}
        <text
          x="60"
          y="90"
          textAnchor="middle"
          fontSize="28"
          fontWeight="bold"
          fill="#4a5e50"
          fontFamily="Arial, sans-serif"
        >
          ?
        </text>
      </svg>

      {/* Big 404 */}
      <h1 className="text-8xl sm:text-9xl font-extrabold text-dz-green leading-none tracking-tight">
        404
      </h1>

      {/* Fun French headline */}
      <p className="mt-4 text-2xl sm:text-3xl font-bold text-dz-gray-700">
        Cette page s&apos;est perdue en chemin...
      </p>

      {/* Subtext */}
      <p className="mt-3 max-w-md text-base text-dz-gray-500 leading-relaxed">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
        Votre colis, lui, arrivera à destination — mais pas cette URL.
      </p>

      {/* Action buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dz-green text-white font-semibold text-sm hover:bg-dz-green-dark transition-colors shadow-sm"
        >
          ← Retour à l&apos;accueil
        </Link>
        <Link
          href="/annonces"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-dz-gray-300 bg-white text-dz-gray-700 font-semibold text-sm hover:border-dz-green hover:text-dz-green transition-colors shadow-sm"
        >
          Voir les annonces →
        </Link>
      </div>

      {/* Subtle footer note */}
      <p className="mt-16 text-xs text-dz-gray-400">
        DZColis · La livraison collaborative en Algérie
      </p>
    </div>
  );
}
