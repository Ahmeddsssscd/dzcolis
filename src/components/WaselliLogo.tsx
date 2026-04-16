import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

// viewBox is 320 × 76
// sm / md / lg / xl scale the rendered size proportionally
const sizes = {
  sm: { width: 128, height: 30 },
  md: { width: 192, height: 46 },
  lg: { width: 256, height: 61 },
  xl: { width: 320, height: 76 },
};

export default function WaselliLogo({
  size = "md",
  href = "/",
  className = "",
}: WaselliLogoProps) {
  const { width, height } = sizes[size];

  const svg = (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli – وصّلي"
      role="img"
      className={className}
    >
      <defs>
        {/* Main brand gradient: deep navy → police blue → sky blue */}
        <linearGradient id="wBrand" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="50%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Badge gradient (slightly richer) */}
        <linearGradient id="wBadge" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Subtle sheen for depth on Latin wordmark */}
        <linearGradient id="wSheen" x1="0" y1="0" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </linearGradient>

        {/* Drop shadow for wordmark */}
        <filter id="wDrop" x="-4%" y="-8%" width="115%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f2460" floodOpacity="0.20" />
        </filter>
      </defs>

      {/* ── Badge icon ──────────────────────────────────────────── */}
      {/* Rounded square */}
      <rect x="0" y="8" width="52" height="52" rx="12" fill="url(#wBadge)" />

      {/* Route / road icon: two waypoints connected by a path */}
      {/* Bottom-left dot (origin) */}
      <circle cx="14" cy="48" r="4.5" fill="white" opacity="0.95" />
      {/* Top-right dot (destination) */}
      <circle cx="38" cy="24" r="4.5" fill="white" opacity="0.95" />
      {/* Curved path between them */}
      <path
        d="M14 48 C14 36 38 36 38 24"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Small arrow head at destination */}
      <path
        d="M33 20 L38 24 L34 29"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      />

      {/* ── Latin wordmark "Waselli" ─────────────────────────────── */}
      <text
        x="62"
        y="44"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, sans-serif'
        fontWeight="800"
        fontSize="40"
        letterSpacing="-1"
        fill="url(#wBrand)"
        filter="url(#wDrop)"
      >
        Waselli
      </text>

      {/* Sheen overlay */}
      <text
        x="62"
        y="44"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, sans-serif'
        fontWeight="800"
        fontSize="40"
        letterSpacing="-1"
        fill="url(#wSheen)"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        Waselli
      </text>

      {/* ── Arabic sub-label "وصّلي" ─────────────────────────────── */}
      {/* Sits right-aligned under "Waselli", same end x-position   */}
      <text
        x="313"
        y="68"
        textAnchor="end"
        fontFamily='var(--font-cairo), "Cairo", "Noto Sans Arabic", "Segoe UI", sans-serif'
        fontWeight="700"
        fontSize="17"
        letterSpacing="0.5"
        fill="#3b82f6"
        opacity="0.85"
      >
        وصّلي
      </text>

      {/* Thin separator line between the two scripts */}
      <line x1="62" y1="52" x2="313" y2="52" stroke="#1d4ed8" strokeWidth="0.6" opacity="0.25" />
    </svg>
  );

  if (!href) return svg;

  return (
    <Link
      href={href}
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-dz-green rounded-lg"
    >
      {svg}
    </Link>
  );
}
