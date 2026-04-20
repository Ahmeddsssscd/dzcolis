import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  const sessionOrRes = await requireAction("dashboard.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { data, error } = await adminSupabase
    .from("platform_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAction("settings.update");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const body = await req.json();

  const upserts = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await adminSupabase
    .from("platform_settings")
    .upsert(upserts, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  await logAdminAction({
    session,
    req,
    action: "settings.update",
    targetType: "platform_settings",
    metadata: { keys: Object.keys(body) },
  });

  return NextResponse.json({ success: true });
}
