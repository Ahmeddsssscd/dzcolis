import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

async function checkSupabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const { error } = await adminSupabase
      .from("platform_settings")
      .select("key")
      .limit(1);
    return { ok: !error, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

async function checkResend(): Promise<{ ok: boolean; mode: string }> {
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key || key.startsWith("re_placeholder")) {
    return { ok: false, mode: "not configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(4000),
    });
    return { ok: res.ok, mode: "configured" };
  } catch {
    return { ok: false, mode: "configured" };
  }
}

async function checkChargily(): Promise<{ ok: boolean; mode: string }> {
  const key = process.env.CHARGILY_API_KEY ?? "";
  const mode = process.env.CHARGILY_MODE === "live" ? "live" : "test";
  if (!key) return { ok: false, mode: "not configured" };
  try {
    const base =
      mode === "live"
        ? "https://pay.chargily.net/api/v2"
        : "https://pay.chargily.net/test/api/v2";
    const res = await fetch(`${base}/balance`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(4000),
    });
    return { ok: res.ok, mode };
  } catch {
    return { ok: false, mode };
  }
}

export async function GET() {
  const sessionOrRes = await requireAction("dashboard.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const [supabase, resend, chargily] = await Promise.all([
    checkSupabase(),
    checkResend(),
    checkChargily(),
  ]);

  return NextResponse.json({
    supabase,
    resend,
    chargily,
    checkedAt: new Date().toISOString(),
  });
}
