import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

/*
 * Pure "Waselli" wordmark — nothing else.
 * No badge, no truck, no Arabic (Arabic doesn't render in SVG text on mobile).
 *
 * fill="currentColor" → adapts to dark/light mode via CSS:
 *   light  →  text-blue-700  (#1d4ed8)
 *   dark   →  dark:text-blue-400  (#60a5fa)
 *
 * viewBox: 190 × 52
 */
const sizes = {
  sm:  { width: 120, height: 33 },
  md:  { width: 165, height: 45 },
  lg:  { width: 220, height: 60 },
  xl:  { width: 285, height: 78 },
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
      viewBox="0 0 190 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli"
      role="img"
      className={className}
    >
      {/* Wordmark — clean, open, readable at every size */}
      <text
        x="0"
        y="42"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="700"
        fontSize="46"
        letterSpacing="0.5"
        fill="currentColor"
      >
        Waselli
      </text>

      {/* Brand dot — small accent mark, always brand blue */}
      <circle cx="184" cy="14" r="5" fill="#1d4ed8" opacity="0.9" />
    </svg>
  );

  if (!href) return svg;

  return (
    <Link
      href={href}
      className="text-blue-700 dark:text-blue-400 inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors"
    >
      {svg}
    </Link>
  );
}
