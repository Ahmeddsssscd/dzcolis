import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ── Maintenance mode cache (module-level, survives across requests in same instance) ──
let maintenanceCache: { enabled: boolean; message: string; ts: number } | null = null;
const CACHE_TTL = 10_000; // 10 seconds — short so admin toggle reflects quickly

async function getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
  const now = Date.now();
  if (maintenanceCache && now - maintenanceCache.ts < CACHE_TTL) {
    return { enabled: maintenanceCache.enabled, message: maintenanceCache.message };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return { enabled: false, message: "" };

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

    if (res.ok) {
      const rows: { key: string; value: string }[] = await res.json();
      const enabled = rows.find((r) => r.key === "maintenance")?.value === "true";
      const message =
        rows.find((r) => r.key === "maintenance_message")?.value ??
        "Le site est temporairement en maintenance. Nous revenons très bientôt.";
      maintenanceCache = { enabled, message, ts: now };
      return { enabled, message };
    }
  } catch {
    // Supabase unreachable — don't block users
  }

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
    const { enabled, message } = await getMaintenanceStatus();
    if (enabled) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.searchParams.set("message", message);
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
