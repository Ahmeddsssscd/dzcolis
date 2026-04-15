import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const size = Math.min(512, Math.max(16, parseInt(req.nextUrl.searchParams.get("size") ?? "192")));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
          overflow: "hidden",
          background: "linear-gradient(150deg, #5dd474 0%, #22c55e 35%, #16a34a 65%, #14532d 100%)",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── GLOBE ── */}
          <circle cx="102" cy="108" r="72" fill="#1a9fd4" />
          {/* ocean shine */}
          <circle cx="80" cy="82" r="28" fill="#2ab8f0" opacity="0.35" />
          {/* continent – Africa / Europe blob */}
          <path d="M 108 55 Q 128 52 134 68 Q 142 85 134 108 Q 128 125 118 138 Q 108 148 100 140 Q 90 130 88 115 Q 84 98 90 80 Q 96 62 108 55 Z" fill="#5dba5d" />
          {/* continent – Americas */}
          <path d="M 52 72 Q 64 65 70 80 Q 76 96 68 115 Q 62 128 52 130 Q 42 124 40 108 Q 36 90 44 76 Z" fill="#5dba5d" />
          {/* continent – Asia stub */}
          <path d="M 148 75 Q 162 72 168 85 Q 172 96 162 105 Q 155 112 148 108 Q 140 100 142 88 Z" fill="#5dba5d" />
          {/* globe grid lines */}
          <ellipse cx="102" cy="108" rx="40" ry="72" fill="none" stroke="rgba(0,80,160,0.3)" strokeWidth="1.2" />
          <ellipse cx="102" cy="108" rx="20" ry="72" fill="none" stroke="rgba(0,80,160,0.3)" strokeWidth="1.2" />
          <line x1="30" y1="108" x2="174" y2="108" stroke="rgba(0,80,160,0.3)" strokeWidth="1.2" />
          <line x1="34" y1="82" x2="170" y2="82" stroke="rgba(0,80,160,0.25)" strokeWidth="1" />
          <line x1="34" y1="134" x2="170" y2="134" stroke="rgba(0,80,160,0.25)" strokeWidth="1" />
          {/* globe outline */}
          <circle cx="102" cy="108" r="72" fill="none" stroke="rgba(0,60,120,0.45)" strokeWidth="1.5" />

          {/* ── AIRPLANE MOTION LINES ── */}
          <line x1="6" y1="58" x2="46" y2="50" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="68" x2="42" y2="63" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="78" x2="36" y2="76" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />

          {/* ── AIRPLANE ── */}
          {/* fuselage */}
          <ellipse cx="112" cy="56" rx="50" ry="13" fill="white" transform="rotate(-18 112 56)" />
          {/* nose cone */}
          <path d="M 154 34 Q 164 42 158 52 L 144 48 Z" fill="white" />
          {/* orange belly stripe */}
          <path d="M 68 66 Q 112 52 156 36 Q 160 44 116 60 Q 90 68 68 66 Z" fill="#f97316" />
          {/* main wing */}
          <path d="M 106 62 L 88 96 L 120 74 Z" fill="white" />
          {/* rear wing */}
          <path d="M 80 66 L 66 90 L 88 74 Z" fill="white" />
          {/* tail fin */}
          <path d="M 72 54 L 58 36 L 76 50 Z" fill="white" />
          {/* engine pod */}
          <ellipse cx="104" cy="78" rx="11" ry="4.5" fill="#d1d5db" transform="rotate(-18 104 78)" />
          <ellipse cx="104" cy="78" rx="6" ry="3" fill="#9ca3af" transform="rotate(-18 104 78)" />
          {/* windows */}
          <circle cx="138" cy="47" r="2.5" fill="#93c5fd" opacity="0.9" />
          <circle cx="130" cy="50" r="2.5" fill="#93c5fd" opacity="0.9" />
          <circle cx="122" cy="53" r="2.5" fill="#93c5fd" opacity="0.9" />
          <circle cx="114" cy="56" r="2.5" fill="#93c5fd" opacity="0.9" />

          {/* ── BOXES ON PLANE ── */}
          <rect x="110" y="36" width="16" height="14" rx="1.5" fill="#d97706" transform="rotate(-18 118 43)" />
          <line x1="110" y1="43" x2="126" y2="43" stroke="#92400e" strokeWidth="0.8" transform="rotate(-18 118 43)" />
          <line x1="118" y1="36" x2="118" y2="50" stroke="#92400e" strokeWidth="0.8" transform="rotate(-18 118 43)" />
          <rect x="128" y="30" width="13" height="12" rx="1.5" fill="#b45309" transform="rotate(-18 134 36)" />

          {/* ── ROAD ── */}
          <path d="M 0 190 Q 100 175 200 190 L 200 200 L 0 200 Z" fill="#374151" />
          {/* road markings */}
          <rect x="30" y="185" width="20" height="3.5" rx="1.5" fill="rgba(255,255,255,0.7)" />
          <rect x="88" y="183" width="20" height="3.5" rx="1.5" fill="rgba(255,255,255,0.7)" />
          <rect x="148" y="185" width="20" height="3.5" rx="1.5" fill="rgba(255,255,255,0.7)" />

          {/* ── TRUCK SPEED LINES ── */}
          <line x1="4" y1="138" x2="28" y2="138" stroke="rgba(251,146,60,0.85)" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="148" x2="24" y2="148" stroke="rgba(251,146,60,0.65)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="4" y1="158" x2="20" y2="158" stroke="rgba(251,146,60,0.45)" strokeWidth="1.6" strokeLinecap="round" />

          {/* ── TRUCK CARGO BOX ── */}
          <rect x="28" y="120" width="90" height="62" rx="3" fill="#c8832a" />
          <rect x="30" y="122" width="86" height="58" rx="2" fill="#f5deb3" />
          {/* box seam lines */}
          <line x1="73" y1="122" x2="73" y2="180" stroke="#8B5E1A" strokeWidth="1.5" />
          <line x1="30" y1="152" x2="116" y2="152" stroke="#8B5E1A" strokeWidth="1.5" />
          {/* bookmark ribbon */}
          <path d="M 68 124 L 78 124 L 78 138 L 73 133 L 68 138 Z" fill="#8B5E1A" />

          {/* ── TRUCK CAB ── */}
          <rect x="118" y="130" width="60" height="52" rx="6" fill="#ea580c" />
          {/* cab top curve */}
          <path d="M 118 130 Q 118 118 132 118 L 165 118 Q 178 118 178 132 L 178 130 L 118 130 Z" fill="#f97316" />
          {/* windshield */}
          <rect x="122" y="120" width="52" height="30" rx="4" fill="#bfdbfe" opacity="0.88" />
          {/* windshield glare */}
          <path d="M 126 122 Q 136 120 148 124 L 144 134 Q 132 130 126 132 Z" fill="rgba(255,255,255,0.45)" />
          {/* front grille area */}
          <rect x="164" y="148" width="14" height="32" rx="3" fill="#c2410c" />
          {/* headlights */}
          <rect x="166" y="152" width="10" height="6" rx="2" fill="#fef08a" />
          <rect x="166" y="162" width="10" height="5" rx="2" fill="#fef08a" opacity="0.7" />
          {/* cab door line */}
          <line x1="145" y1="152" x2="145" y2="182" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />

          {/* ── WHEELS ── */}
          {/* rear wheels */}
          <circle cx="60" cy="183" r="16" fill="#1f2937" />
          <circle cx="60" cy="183" r="10" fill="#4b5563" />
          <circle cx="60" cy="183" r="5" fill="#9ca3af" />
          <circle cx="90" cy="183" r="16" fill="#1f2937" />
          <circle cx="90" cy="183" r="10" fill="#4b5563" />
          <circle cx="90" cy="183" r="5" fill="#9ca3af" />
          {/* front wheel */}
          <circle cx="152" cy="183" r="16" fill="#1f2937" />
          <circle cx="152" cy="183" r="10" fill="#4b5563" />
          <circle cx="152" cy="183" r="5" fill="#9ca3af" />

          {/* ── STACKED BOXES on truck ── */}
          <rect x="34" y="100" width="24" height="22" rx="2" fill="#d97706" />
          <rect x="60" y="104" width="22" height="18" rx="2" fill="#b45309" />
          <rect x="44" y="82" width="22" height="20" rx="2" fill="#d97706" />
          {/* box lines */}
          <line x1="34" y1="111" x2="58" y2="111" stroke="#92400e" strokeWidth="0.8" />
          <line x1="46" y1="100" x2="46" y2="122" stroke="#92400e" strokeWidth="0.8" />
          <line x1="60" y1="113" x2="82" y2="113" stroke="#92400e" strokeWidth="0.8" />
          <line x1="71" y1="104" x2="71" y2="122" stroke="#92400e" strokeWidth="0.8" />
          <line x1="44" y1="92" x2="66" y2="92" stroke="#92400e" strokeWidth="0.8" />
          <line x1="55" y1="82" x2="55" y2="102" stroke="#92400e" strokeWidth="0.8" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
