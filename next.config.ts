import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // next/image is allowed to fetch + optimize images served from our own
  // Supabase Storage public buckets (vehicle photos, avatars). Anything
  // else must be explicitly whitelisted here — otherwise next/image refuses
  // to render it, which is exactly the behaviour we want (no arbitrary
  // third-party hot-linking).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // pdfkit loads its built-in fonts (Helvetica, Helvetica-Bold, etc.) at
  // runtime from AFM files shipped inside the package. Vercel's output
  // tracer doesn't see these `fs.readFileSync(path.join(__dirname,
  // 'data', ...))` calls, so without this include the
  // /api/admin/bookings/:id/proof-pdf and /api/email/admin-new-booking
  // routes crash with "ENOENT Helvetica.afm" in production. The glob
  // is scoped to the two routes that actually generate PDFs so we
  // don't inflate every other lambda.
  outputFileTracingIncludes: {
    "/api/admin/bookings/*/proof-pdf":  ["./node_modules/pdfkit/js/data/**/*"],
    "/api/email/admin-new-booking":     ["./node_modules/pdfkit/js/data/**/*"],
    "/api/bookings/*/receipt-pdf":      ["./node_modules/pdfkit/js/data/**/*"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://pay.chargily.net",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
