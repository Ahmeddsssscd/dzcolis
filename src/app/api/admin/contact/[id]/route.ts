import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/contact/[id] — change message status.
 *   body: { action: "mark_read" | "archive" | "unarchive" | "mark_unread" }
 *
 * Logged to the audit trail via the status column (read_by / read_at).
 */
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("contact.manage");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const action = typeof (body as { action?: unknown })?.action === "string" ? (body as { action: string }).action : "";

  const updates: Record<string, unknown> = {};
  if (action === "mark_read") {
    updates.status = "read";
    updates.read_at = new Date().toISOString();
    updates.read_by = session.userId;
  } else if (action === "mark_unread") {
    updates.status = "new";
    updates.read_at = null;
    updates.read_by = null;
  } else if (action === "archive") {
    updates.status = "archived";
  } else if (action === "unarchive") {
    updates.status = "new";
  } else {
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from("contact_messages")
    .update(updates)
    .eq("id", id);
  if (error) {
    console.error("contact patch failed:", error);
    return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
