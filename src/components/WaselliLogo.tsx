import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

/*
 * Pure wordmark — no badge, no icon.
 *
 * Design decisions vs previous version:
 *   • weight 700 (not 900) — elegant, not forced
 *   • letterSpacing +1 (open, breathable — readable at all sizes)
 *   • fill="currentColor" — SVG text adopts the wrapper's CSS color,
 *     so dark/light mode works automatically via Tailwind classes
 *   • No complex gradient or filter on the text — clean renders sharper
 *   • Accent dot after the "i" in brand blue — unique brand mark
 *   • Arabic وصّلي stays as bilingual signature
 *
 * viewBox: 200 × 70
 */
const sizes = {
  sm:  { width: 126, height: 44 },
  md:  { width: 172, height: 60 },
  lg:  { width: 230, height: 80 },
  xl:  { width: 290, height: 101 },
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
      viewBox="0 0 200 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Waselli"
      role="img"
      className={className}
    >
      {/* ── "Waselli" wordmark ────────────────────────────────────
          fill="currentColor" means this text takes its color from
          the wrapping <Link>'s Tailwind color class:
            light  →  text-blue-700  (#1d4ed8)
            dark   →  dark:text-blue-400  (#60a5fa)
          That way the logo always has perfect contrast on both
          the white header and the dark-mode header.              */}
      <text
        x="0"
        y="46"
        fontFamily='"Plus Jakarta Sans", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
        fontWeight="700"
        fontSize="48"
        letterSpacing="1"
        fill="currentColor"
      >
        Waselli
      </text>

      {/* Accent dot — brand mark, always brand blue regardless of mode */}
      <circle cx="194" cy="38" r="4" fill="#1d4ed8" opacity="0.85" />

      {/* ── Arabic sub-identity ──────────────────────────────────── */}
      <line
        x1="0" y1="53"
        x2="196" y2="53"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
      />
      <text
        x="196"
        y="65"
        textAnchor="end"
        fontFamily='var(--font-cairo), "Cairo", "Noto Sans Arabic", sans-serif'
        fontWeight="600"
        fontSize="14"
        letterSpacing="0.5"
        fill="#2563eb"
        opacity="0.75"
      >
        وصّلي
      </text>
    </svg>
  );

  if (!href) return svg;

  return (
    <Link
      href={href}
      // Light mode: blue-700 (#1d4ed8) on white bg — high contrast ✓
      // Dark mode:  blue-400 (#60a5fa) on dark bg  — high contrast ✓
      className="text-blue-700 dark:text-blue-400 inline-flex items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors"
    >
      {svg}
    </Link>
  );
}
