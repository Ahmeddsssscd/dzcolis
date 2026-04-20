import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── Maintenance mode cache (module-level, survives across requests in same instance) ──
// Two-tier cache:
//   - `fresh` window (SHORT_TTL): hit — no Supabase call, return cached value
//   - `stale` window (STALE_TTL): hit — return cached value AND refresh in
//     background, so the admin toggle still propagates within ~1 minute
//     without hammering the service-role endpoint on every request.
//
// Why bother: the previous 10-second window meant a moderately busy site
// would call Supabase (with the service-role key in the Authorization
// header) six times per minute per instance. Any request-log capture of
// that header == database compromise. Longer TTL = less exposure surface.
let maintenanceCache: { enabled: boolean; message: string; ts: number } | null = null;
let refreshInFlight = false;
const SHORT_TTL = 60_000;  // 1 min — serve without touching Supabase
const STALE_TTL = 300_000; // 5 min — still serve, but kick a background refresh

async function fetchMaintenanceFromSupabase(): Promise<{ enabled: boolean; message: string } | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/platform_settings?key=in.(maintenance,maintenance_message)&select=key,value`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!res.ok) return null;

    const rows: { key: string; value: string }[] = await res.json();
    const enabled = rows.find((r) => r.key === "maintenance")?.value === "true";
    const message =
      rows.find((r) => r.key === "maintenance_message")?.value ??
      "Le site est temporairement en maintenance. Nous revenons très bientôt.";
    return { enabled, message };
  } catch {
    return null;
  }
}

async function getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
  const now = Date.now();
  const age = maintenanceCache ? now - maintenanceCache.ts : Infinity;

  // Fresh — return immediately without a network call.
  if (maintenanceCache && age < SHORT_TTL) {
    return { enabled: maintenanceCache.enabled, message: maintenanceCache.message };
  }

  // Stale but still usable — return cached value, kick off a background refresh.
  if (maintenanceCache && age < STALE_TTL && !refreshInFlight) {
    refreshInFlight = true;
    fetchMaintenanceFromSupabase()
      .then((fresh) => {
        if (fresh) maintenanceCache = { ...fresh, ts: Date.now() };
      })
      .finally(() => {
        refreshInFlight = false;
      });
    return { enabled: maintenanceCache.enabled, message: maintenanceCache.message };
  }

  // No cache or too old — blocking refresh.
  const fresh = await fetchMaintenanceFromSupabase();
  if (fresh) {
    maintenanceCache = { ...fresh, ts: now };
    return fresh;
  }

  // Supabase unreachable — fail open (don't block users).
  return { enabled: false, message: "" };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Supabase session refresh (keeps access token valid for server components) ──
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  // ── Maintenance mode check ──
  // Exempt: admin panel, all API routes, Next internals, static assets, maintenance page itself
  const isExempt =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/maintenance") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|ico|webp|gif|woff2?)$/.test(pathname);

  if (!isExempt) {
    const { enabled } = await getMaintenanceStatus();
    if (enabled) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      // Intentionally DO NOT propagate the admin message in the URL.
      // The maintenance page's client component fetches the current
      // message from /api/maintenance/status on mount, so pushing it
      // through the URL is unnecessary AND it creates an injection
      // surface (a user-crafted `?message=...` would appear on the page,
      // and any HTML/JS payload stored in the admin message setting
      // would land in the address bar of every redirected user). Keep
      // admin-controlled text out of URLs.
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
