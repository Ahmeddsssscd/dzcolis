import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

/**
 * GET /api/admin/contact — list contact messages for the inbox.
 *
 * Supports:
 *   • ?status=new|read|archived|all (default: all)
 *   • ?q=<search>  matches name, email, subject, message
 *   • ?limit (capped at 200)
 *
 * Reads are cheap — the UI does optimistic filtering locally on top.
 */
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAction("contact.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (adminSupabase as any)
    .from("contact_messages")
    .select("id, user_id, name, email, subject, message, ip, status, read_at, read_by, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(
      `name.ilike.%${safe}%,email.ilike.%${safe}%,subject.ilike.%${safe}%,message.ilike.%${safe}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("contact list failed:", error);
    return NextResponse.json({ error: "Chargement impossible" }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
