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
          background: "linear-gradient(135deg, #00a651 0%, #007a3d 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
        }}
      >
        {/* Package icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: size * 0.38, lineHeight: 1, display: "flex" }}>📦</div>
          <div
            style={{
              color: "white",
              fontSize: size * 0.18,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginTop: size * 0.04,
              display: "flex",
            }}
          >
            DZColis
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
