import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const size = Math.min(512, Math.max(16, parseInt(req.nextUrl.searchParams.get("size") ?? "192")));
  const r = Math.round(size * 0.225); // iOS-style rounding

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(140deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)`,
          borderRadius: r,
          overflow: "hidden",
        }}
      >
        {/* Glass highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "55%",
            background: "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        {/* W lettermark */}
        <span
          style={{
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: Math.round(size * 0.68),
            color: "white",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginTop: Math.round(size * 0.06),
          }}
        >
          W
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
