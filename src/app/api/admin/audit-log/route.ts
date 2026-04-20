import { NextRequest, NextResponse } from "next/server";
import { requireAction } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/*
 * GET /api/admin/audit-log
 *   ?limit=100          (max 500)
 *   ?actor=<uuid>       filter by actor admin id
 *   ?action=kyc.approve filter by exact action name
 *   ?since=<iso-date>   only rows on/after this date
 *
 * Requires `audit.view` capability (viewer+). Read-only, no mutations.
 */
export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAction("audit.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const url = new URL(req.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "100");
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 100, 1), 500);
  const actor = url.searchParams.get("actor");
  const action = url.searchParams.get("action");
  const since = url.searchParams.get("since");

  let query = adminSupabase
    .from("admin_audit_log")
    .select("id, actor_id, actor_email, action, target_type, target_id, metadata, ip, at")
    .order("at", { ascending: false })
    .limit(limit);

  if (actor) query = query.eq("actor_id", actor);
  if (action) query = query.eq("action", action);
  if (since) query = query.gte("at", since);

  const { data, error } = await query;
  if (error) {
    console.error("[audit-log] error:", error.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
