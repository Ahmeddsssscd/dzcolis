import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

/*
 * Pure wordmark — no badge, no icon, no truck.
 * Just "Waselli" in premium typography with brand gradient.
 *
 * viewBox: 210 × 64
 *   "Waselli"  — x=0, y=46, fontSize=52, weight=900, tracking=-2.5
 *   "وصّلي"    — x=208, y=62, textAnchor=end, small Arabic subtitle
 */
const sizes = {
  sm:  { width: 131, height: 40 },
  md:  { width: 175, height: 53 },
  lg:  { width: 236, height: 72 },
  xl:  { width: 298, height: 91 },
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
      viewBox="0 0 210 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli"
      role="img"
      className={className}
    >
      <defs>
        {/* Brand gradient: deep navy → police blue → sky */}
        <linearGradient
          id="wGrad"
          x1="0" y1="0" x2="210" y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="40%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Top-light sheen — letter surfaces catch light from above */}
        <linearGradient
          id="wSheen"
          x1="0" y1="0" x2="0" y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="45%"  stopColor="#ffffff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>

        {/* Wordmark shadow — depth without heaviness */}
        <filter id="wShadow" x="-2%" y="-8%" width="110%" height="140%">
          <feDropShadow
            dx="0" dy="1.5" stdDeviation="2"
            floodColor="#0f2460" floodOpacity="0.16"
          />
        </filter>
      </defs>

      {/* ── Wordmark "Waselli" ─────────────────────────────────────
          Weight 900, letter-spacing -2.5 → luxury brand feel.
          Gradient fill + sheen overlay gives the letters depth.   */}
      <text
        x="0"
        y="46"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="900"
        fontSize="52"
        letterSpacing="-2.5"
        fill="url(#wGrad)"
        filter="url(#wShadow)"
      >
        Waselli
      </text>

      {/* Sheen pass */}
      <text
        x="0"
        y="46"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="900"
        fontSize="52"
        letterSpacing="-2.5"
        fill="url(#wSheen)"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        Waselli
      </text>

      {/* ── Arabic sub-identity "وصّلي" ────────────────────────────
          Right-aligned. Cairo font. Same blue family, lighter weight.
          Acts as a bilingual signature — not a label.              */}
      <line
        x1="0" y1="52"
        x2="208" y2="52"
        stroke="#1d4ed8"
        strokeWidth="0.6"
        opacity="0.18"
      />
      <text
        x="208"
        y="63"
        textAnchor="end"
        fontFamily='var(--font-cairo), "Cairo", "Noto Sans Arabic", sans-serif'
        fontWeight="600"
        fontSize="15"
        letterSpacing="0.5"
        fill="#2563eb"
        opacity="0.82"
      >
        وصّلي
      </text>
    </svg>
  );

  if (!href) return svg;

  return (
    <Link
      href={href}
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
    >
      {svg}
    </Link>
  );
}
