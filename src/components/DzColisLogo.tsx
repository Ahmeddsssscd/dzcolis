import Link from "next/link";

interface DzColisLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

// Rendered widths at each size (width, height)
const sizes = {
  sm:  { width: 110, height: 36 },
  md:  { width: 150, height: 50 },
  lg:  { width: 200, height: 66 },
  xl:  { width: 270, height: 90 },
};

export default function DzColisLogo({
  size = "md",
  href = "/",
  className = "",
}: DzColisLogoProps) {
  const { width, height } = sizes[size];

  const svg = (
    <svg
      width={width}
      height={height}
      // Wide viewBox so every glyph of "DzColis" renders fully
      viewBox="0 0 330 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DzColis"
      role="img"
      className={className}
    >
      <defs>
        {/* Website brand gradient: dz-green-dark → dz-green → dz-green-light */}
        <linearGradient id="dzBrandGrad" x1="0" y1="0" x2="330" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#004d28" />
          <stop offset="40%"  stopColor="#006233" />
          <stop offset="100%" stopColor="#00894a" />
        </linearGradient>

        {/* Vertical sheen for depth */}
        <linearGradient id="dzSheen" x1="0" y1="0" x2="0" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="60%"  stopColor="#ffffff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
        </linearGradient>

        {/* Soft drop shadow */}
        <filter id="dzShadow" x="-4%" y="-4%" width="114%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#004d28" floodOpacity="0.20" />
        </filter>
      </defs>

      {/*
        Single <text> element — "DzColis" — with textLength forcing
        all 7 glyphs to fit within 318px of the 330px viewBox.
        This prevents any character from being clipped.
      */}
      <text
        x="6"
        y="74"
        fontFamily='"Arial Black", "Arial Bold", Arial, Helvetica, sans-serif'
        fontWeight="900"
        fontSize="78"
        textLength="318"
        lengthAdjust="spacingAndGlyphs"
        fill="url(#dzBrandGrad)"
        filter="url(#dzShadow)"
      >
        DzColis
      </text>

      {/* Sheen layer on top */}
      <text
        x="6"
        y="74"
        fontFamily='"Arial Black", "Arial Bold", Arial, Helvetica, sans-serif'
        fontWeight="900"
        fontSize="78"
        textLength="318"
        lengthAdjust="spacingAndGlyphs"
        fill="url(#dzSheen)"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        DzColis
      </text>
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
