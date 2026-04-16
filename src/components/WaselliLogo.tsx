import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

const sizes = {
  sm:  { width: 116, height: 32 },
  md:  { width: 155, height: 42 },
  lg:  { width: 200, height: 55 },
  xl:  { width: 265, height: 72 },
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
      viewBox="0 0 265 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli"
      role="img"
      className={className}
    >
      <defs>
        <linearGradient id="wBrand" x1="0" y1="0" x2="265" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#005229" />
          <stop offset="55%"  stopColor="#00a651" />
          <stop offset="100%" stopColor="#00c85d" />
        </linearGradient>
        <linearGradient id="wSheen" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
        </linearGradient>
        <filter id="wDrop" x="-2%" y="-5%" width="110%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#003d1f" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Small arrow icon — "W" accent */}
      <g transform="translate(0, 12)">
        <rect width="28" height="28" rx="7" fill="url(#wBrand)" />
        {/* Arrow pointing right inside box */}
        <path d="M8 14 L16 8 L16 12 L21 12 L21 16 L16 16 L16 20 Z" fill="white" opacity="0.95" />
      </g>

      {/* "Waselli" wordmark */}
      <text
        x="36"
        y="57"
        fontFamily='"Segoe UI", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1.5"
        fill="url(#wBrand)"
        filter="url(#wDrop)"
      >
        Waselli
      </text>

      {/* Sheen overlay */}
      <text
        x="36"
        y="57"
        fontFamily='"Segoe UI", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1.5"
        fill="url(#wSheen)"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        Waselli
      </text>

      {/* Green dot accent after text */}
      <circle cx="259" cy="57" r="5" fill="#00a651" opacity="0.8" />
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
