import Link from "next/link";

interface WaselliLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

const sizes = {
  sm:  { width: 120, height: 33, arabicSize: "10px", arabicTop: "1px"  },
  md:  { width: 165, height: 45, arabicSize: "13px", arabicTop: "2px"  },
  lg:  { width: 220, height: 60, arabicSize: "16px", arabicTop: "3px"  },
  xl:  { width: 285, height: 78, arabicSize: "20px", arabicTop: "4px"  },
};

export default function WaselliLogo({
  size = "md",
  href = "/",
  className = "",
}: WaselliLogoProps) {
  const { width, height, arabicSize, arabicTop } = sizes[size];

  const inner = (
    <span className="inline-flex flex-col items-start leading-none">
      {/* ── "Waselli" — SVG so we get precise sizing ── */}
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
        {/* Small accent dot */}
        <circle cx="184" cy="14" r="5" fill="#1d4ed8" opacity="0.9" />
      </svg>

      {/* ── Arabic sub-identity — plain HTML so Cairo web font loads ── */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-cairo), "Cairo", "Noto Sans Arabic", sans-serif',
          fontWeight: 600,
          fontSize: arabicSize,
          color: "#2563eb",
          opacity: 0.82,
          letterSpacing: "0.04em",
          marginTop: arabicTop,
          direction: "rtl",
          display: "block",
          width: "100%",
          textAlign: "right",
        }}
      >
        وصّلي
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      className="text-blue-700 dark:text-blue-400 inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg transition-colors"
    >
      {inner}
    </Link>
  );
}
