import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * Visitor-facing: poll the current state of a chat (status, whether
 * it's been claimed, how many people are ahead in the queue).
 *
 * Gated by the visitor token returned at create time. Losing the
 * token means losing access — expected behaviour for a support chat.
 */
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const token = req.headers.get("x-support-token")?.trim();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chat } = await (adminSupabase as any)
    .from("support_chats")
    .select("id, status, claimed_by, claimed_at, closed_at, created_at, last_activity_at, visitor_token")
    .eq("id", id)
    .single();

  if (!chat || chat.visitor_token !== token) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Position in queue: how many older 'open' (unclaimed) chats sit
  // ahead of this one. Only meaningful when this chat itself is open.
  let queuePosition: number | null = null;
  if (chat.status === "open") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (adminSupabase as any)
      .from("support_chats")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .lt("created_at", chat.created_at);
    queuePosition = (count ?? 0) + 1;
  }

  return NextResponse.json({
    id:              chat.id,
    status:          chat.status,
    claimedAt:       chat.claimed_at,
    closedAt:        chat.closed_at,
    createdAt:       chat.created_at,
    lastActivityAt:  chat.last_activity_at,
    queuePosition,
  });
}
