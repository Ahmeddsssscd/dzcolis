import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

/*
 * viewBox: 320 × 82
 *
 * ┌─────────────┐  Waselli
 * │  delivery   │  ──────────────
 * │  van icon   │  وصّلي
 * └─────────────┘
 *
 * Badge: 68 × 68, starts at (0, 7).
 * Van: side-view silhouette (cargo + cab + wheels), facing right.
 * Wordmark: Plus Jakarta Sans 900, negative tracking, brand gradient.
 * Sub-identity: وصّلي in Cairo 700, right-aligned.
 */
const sizes = {
  sm:  { width: 160, height: 41  },
  md:  { width: 224, height: 57  },
  lg:  { width: 288, height: 74  },
  xl:  { width: 352, height: 90  },
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
      viewBox="0 0 320 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli – وصّلي"
      role="img"
      className={className}
    >
      <defs>
        {/* Badge background: deep navy → police blue, diagonal */}
        <linearGradient
          id="wBadgeBg"
          x1="0" y1="7" x2="68" y2="75"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="60%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Glass highlight on badge — top-left radial spot */}
        <radialGradient
          id="wBadgeHL"
          cx="30%" cy="22%" r="58%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>

        {/* Wordmark: same navy-to-sky sweep */}
        <linearGradient
          id="wText"
          x1="78" y1="0" x2="305" y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="42%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Wordmark top-light sheen */}
        <linearGradient
          id="wSheen"
          x1="0" y1="12" x2="0" y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>

        {/* Badge lift shadow */}
        <filter id="wBadgeF" x="-14%" y="-12%" width="138%" height="134%">
          <feDropShadow
            dx="0" dy="3" stdDeviation="5"
            floodColor="#1e3a8a" floodOpacity="0.38"
          />
        </filter>

        {/* Wordmark shadow */}
        <filter id="wTextF" x="-2%" y="-8%" width="112%" height="140%">
          <feDropShadow
            dx="0" dy="1.5" stdDeviation="2"
            floodColor="#0f2460" floodOpacity="0.16"
          />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════════
          BADGE  68 × 68
          ═══════════════════════════════════════════════════ */}
      <rect x="0" y="7" width="68" height="68" rx="16"
            fill="url(#wBadgeBg)" filter="url(#wBadgeF)" />
      <rect x="0" y="7" width="68" height="68" rx="16"
            fill="url(#wBadgeHL)" />

      {/* ═══════════════════════════════════════════════════
          DELIVERY VAN — side view, facing right
          White silhouette; windows/hubs use badge gradient
          as "knockout" fill so they appear transparent.

          Layout inside badge (x 0–68, y 7–75):
            cargo body  x 6–41   y 30–56
            cab body    x 39–64  y 26–56  (4 px taller = roof step)
            wheels      cy 56    r 6.5
          ═══════════════════════════════════════════════════ */}

      {/* ── Cargo box ── */}
      <rect x="6" y="30" width="35" height="26" rx="3" fill="white" />

      {/* ── Cab (taller, with rounded windshield front corner) ──
          Path: top-left → roof-right → cubic curve (windshield corner)
                → front face down → bottom back to start            */}
      <path
        d="M 39 26 L 54 26 C 62 26 64 30 64 37 L 64 56 L 39 56 Z"
        fill="white"
      />

      {/* ── Windshield glass (shows badge gradient = "transparent") ──
          Follows the same bezier corner as the cab, inset 2 px       */}
      <path
        d="M 46 28 L 53 28 C 60 28 62 31 62 37 L 62 40 L 46 40 Z"
        fill="url(#wBadgeBg)"
      />

      {/* ── Cargo side window ── */}
      <rect x="11" y="33" width="15" height="9" rx="2"
            fill="url(#wBadgeBg)" />

      {/* ── Wheels (white disc + badge-color hub knockout) ── */}
      {/* Rear */}
      <circle cx="16" cy="56" r="7"   fill="white" />
      <circle cx="16" cy="56" r="2.8" fill="url(#wBadgeBg)" />
      {/* Front */}
      <circle cx="51" cy="56" r="7"   fill="white" />
      <circle cx="51" cy="56" r="2.8" fill="url(#wBadgeBg)" />

      {/* ── Road / ground line (subtle) ── */}
      <line x1="6" y1="63" x2="62" y2="63"
            stroke="white" strokeWidth="1.2" opacity="0.18"
            strokeLinecap="round" />

      {/* ── Motion lines (van is moving → speed) ── */}
      <line x1="1"  y1="36" x2="6"  y2="36"
            stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <line x1="0"  y1="41" x2="6"  y2="41"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.45" />
      <line x1="1"  y1="46" x2="6"  y2="46"
            stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />

      {/* ═══════════════════════════════════════════════════
          WORDMARK  "Waselli"
          ═══════════════════════════════════════════════════ */}
      {/* Gradient fill */}
      <text
        x="78" y="50"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="900"
        fontSize="48"
        letterSpacing="-2"
        fill="url(#wText)"
        filter="url(#wTextF)"
      >
        Waselli
      </text>
      {/* Top-light sheen */}
      <text
        x="78" y="50"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="900"
        fontSize="48"
        letterSpacing="-2"
        fill="url(#wSheen)"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        Waselli
      </text>

      {/* ═══════════════════════════════════════════════════
          SEPARATOR + ARABIC SUB-IDENTITY  وصّلي
          ═══════════════════════════════════════════════════ */}
      <line x1="78" y1="57" x2="316" y2="57"
            stroke="#1d4ed8" strokeWidth="0.7" opacity="0.20" />

      <text
        x="316" y="73"
        textAnchor="end"
        fontFamily='var(--font-cairo), "Cairo", "Noto Sans Arabic", "Segoe UI", sans-serif'
        fontWeight="700"
        fontSize="18"
        letterSpacing="0.8"
        fill="#2563eb"
        opacity="0.88"
      >
        وصّلي
      </text>
    </svg>
  );

  if (!href) return svg;

  return (
    <Link
      href={href}
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
    >
      {svg}
    </Link>
  );
}
