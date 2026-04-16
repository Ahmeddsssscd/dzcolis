import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

/*
 * viewBox: 320 × 82
 *
 * ┌──────────┐  Waselli
 * │  badge   │  ────────
 * │  icon    │  وصّلي
 * └──────────┘
 *
 * Badge is 68 × 68, starts at (0, 7).
 * Wordmark baseline at y = 50, Arabic baseline at y = 70.
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
        {/* ── Gradients ── */}

        {/* Badge background: diagonal navy → electric blue */}
        <linearGradient
          id="wBadgeBg"
          x1="0" y1="0" x2="68" y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="55%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Badge inner highlight: glossy top-left spot */}
        <radialGradient
          id="wBadgeHL"
          cx="28%" cy="22%" r="62%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </radialGradient>

        {/* Wordmark text: deep navy → bright blue → sky */}
        <linearGradient
          id="wText"
          x1="78" y1="0" x2="300" y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#1e3a8a" />
          <stop offset="45%"  stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Wordmark sheen: subtle top-light reflection */}
        <linearGradient
          id="wSheen"
          x1="0" y1="14" x2="0" y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="48%"  stopColor="#ffffff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </linearGradient>

        {/* ── Filters ── */}

        {/* Badge lift shadow */}
        <filter id="wBadgeF" x="-15%" y="-12%" width="140%" height="136%">
          <feDropShadow
            dx="0" dy="3" stdDeviation="5"
            floodColor="#1e3a8a" floodOpacity="0.40"
          />
        </filter>

        {/* Wordmark crisp shadow */}
        <filter id="wTextF" x="-2%" y="-8%" width="112%" height="140%">
          <feDropShadow
            dx="0" dy="1.5" stdDeviation="2"
            floodColor="#0f2460" floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════════════
          BADGE  (68 × 68, rounded 16px corners)
          ═══════════════════════════════════════════════════════ */}

      {/* Shadow layer */}
      <rect x="0" y="7" width="68" height="68" rx="16"
            fill="url(#wBadgeBg)"
            filter="url(#wBadgeF)" />

      {/* Glass highlight overlay */}
      <rect x="0" y="7" width="68" height="68" rx="16"
            fill="url(#wBadgeHL)" />

      {/* ── Route icon (white) ──────────────────────────────── */}

      {/* Origin: solid dot — "package picked up" */}
      <circle cx="16" cy="55" r="5.5" fill="white" />

      {/* Route arc: smooth bezier, bottom-left → top-right
          M 16 55  = origin
          C 16 28  = CP1 (pull straight up from origin)
            54 44  = CP2 (pull from below-right, giving the arc body)
            54 17  = destination
          Result: a bold sweeping S-curve like a delivery arc */}
      <path
        d="M 16 55 C 16 28, 54 44, 54 17"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Destination: open-V arrowhead pointing UP.
          Tangent at end-point (54,17) is from CP2 (54,44) → (54,17) = straight up.
          Arrow legs at 45°: (48,24) and (60,24) */}
      <path
        d="M 48 24 L 54 17 L 60 24"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ═══════════════════════════════════════════════════════
          WORDMARK  "Waselli"
          ═══════════════════════════════════════════════════════ */}

      {/* Main fill — brand gradient */}
      <text
        x="78"
        y="50"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="900"
        fontSize="48"
        letterSpacing="-2"
        fill="url(#wText)"
        filter="url(#wTextF)"
      >
        Waselli
      </text>

      {/* Sheen overlay — gives the text a glossy, lit-from-top feel */}
      <text
        x="78"
        y="50"
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

      {/* ═══════════════════════════════════════════════════════
          DIVIDER + ARABIC SUB-IDENTITY  "وصّلي"
          ═══════════════════════════════════════════════════════ */}

      {/* Thin rule — visually separates Latin from Arabic */}
      <line
        x1="78" y1="57"
        x2="316" y2="57"
        stroke="#1d4ed8"
        strokeWidth="0.7"
        opacity="0.22"
      />

      {/* Arabic wordmark: right-aligned to same edge as English text end.
          Cairo is loaded via --font-cairo CSS variable. */}
      <text
        x="316"
        y="73"
        textAnchor="end"
        fontFamily='var(--font-cairo), "Cairo", "Noto Sans Arabic", "Segoe UI", sans-serif'
        fontWeight="700"
        fontSize="18"
        letterSpacing="0.8"
        fill="#2563eb"
        opacity="0.90"
      >
        وصّلي
      </text>

      {/* Subtle dot accent between the two identities — left anchor point */}
      <circle cx="78" cy="65" r="2" fill="#1d4ed8" opacity="0.35" />
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
