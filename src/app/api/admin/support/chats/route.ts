import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

/**
 * Admin-side: list chats for the support queue + viewer.
 *
 * Filters via `status` query string (`open`, `claimed`, `closed`, or
 * `mine` to get the chats claimed by the calling agent). Default is
 * "open + my claimed" which is what a working agent cares about.
 *
 * We don't include the visitor_token in the response — agents never
 * need it, and it's the visitor's auth secret.
 */
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAction("support.respond");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const url = req.nextUrl;
  const filter = (url.searchParams.get("status") ?? "queue").toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (adminSupabase as any)
    .from("support_chats")
    .select("id, visitor_name, visitor_email, subject, status, claimed_by, claimed_at, closed_at, created_at, last_activity_at")
    .order("last_activity_at", { ascending: false })
    .limit(100);

  if (filter === "open") {
    q = q.eq("status", "open");
  } else if (filter === "mine") {
    q = q.eq("status", "claimed").eq("claimed_by", session.userId);
  } else if (filter === "closed") {
    q = q.eq("status", "closed");
  } else {
    // "queue" — open OR claimed-by-me. Approximated with two calls
    // because Supabase's REST .or() is fiddly with uuid nulls.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ data: open }, { data: mine }] = await Promise.all([
      (adminSupabase as any)
        .from("support_chats")
        .select("id, visitor_name, visitor_email, subject, status, claimed_by, claimed_at, closed_at, created_at, last_activity_at")
        .eq("status", "open")
        .order("created_at", { ascending: true })
        .limit(100),
      (adminSupabase as any)
        .from("support_chats")
        .select("id, visitor_name, visitor_email, subject, status, claimed_by, claimed_at, closed_at, created_at, last_activity_at")
        .eq("status", "claimed")
        .eq("claimed_by", session.userId)
        .order("last_activity_at", { ascending: false })
        .limit(100),
    ]);
    return NextResponse.json({ open: open ?? [], mine: mine ?? [] });
  }

  const { data } = await q;
  return NextResponse.json({ chats: data ?? [] });
}
