import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

/**
 * Admin-side chat lifecycle:
 *
 *   GET    → full chat record (visitor name, email, status). The
 *            messages list lives at the sibling /messages endpoint.
 *   PATCH  → { action: "claim" | "close" | "release" } — move the
 *            chat between queue states. Claim sets `claimed_by` to
 *            the calling agent atomically so two agents can't grab
 *            the same chat by racing. Close ends the conversation.
 *            Release un-claims (rare, but useful if the agent needs
 *            to hand a chat back to the queue).
 */
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("support.respond");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (adminSupabase as any)
    .from("support_chats")
    .select("id, visitor_name, visitor_email, visitor_user_id, subject, status, claimed_by, claimed_at, closed_at, created_at, last_activity_at")
    .eq("id", id)
    .single();

  if (!data) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ chat: data });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("support.respond");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = (body as { action?: string })?.action;

  if (action === "claim") {
    // Race-safe claim: only flip 'open' → 'claimed'. If another agent
    // already won the race, their update will succeed and ours will
    // match zero rows → we return a 409 so the UI refetches the queue.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminSupabase as any)
      .from("support_chats")
      .update({ status: "claimed", claimed_by: session.userId, claimed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "open")
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("claim failed:", error);
      return NextResponse.json({ error: "Échec de la prise en charge" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Déjà pris en charge" }, { status: 409 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminSupabase as any).from("support_chat_messages").insert({
      chat_id: id,
      author:  "system",
      admin_id: session.userId,
      body:    `Agent ${session.fullName ?? session.email} a pris en charge la conversation.`,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "close") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminSupabase as any)
      .from("support_chats")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminSupabase as any).from("support_chat_messages").insert({
      chat_id: id,
      author:  "system",
      admin_id: session.userId,
      body:    "Conversation clôturée par l'agent.",
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "release") {
    // Only the agent who claimed the chat can release it — prevents
    // other agents from stealing conversations or nuking claim state.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (adminSupabase as any)
      .from("support_chats")
      .update({ status: "open", claimed_by: null, claimed_at: null })
      .eq("id", id)
      .eq("claimed_by", session.userId)
      .select("id")
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
