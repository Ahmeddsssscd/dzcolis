import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Admin-side message feed for a given chat.
 *
 *   GET  → full chronological message log. Polled every 2s by the
 *          admin UI while a chat is open on screen.
 *   POST → agent reply. Only the agent who claimed the chat can
 *          send replies — prevents a second agent from hijacking
 *          an active conversation.
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
    .from("support_chat_messages")
    .select("id, author, admin_id, body, created_at")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("support.respond");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const limited = checkRateLimit(req, {
    bucket: "support-chat-agent-send",
    max: 60,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chat } = await (adminSupabase as any)
    .from("support_chats")
    .select("id, status, claimed_by")
    .eq("id", id)
    .single();
  if (!chat) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (chat.status === "closed") {
    return NextResponse.json({ error: "Chat clôturé" }, { status: 409 });
  }
  if (chat.status !== "claimed" || chat.claimed_by !== session.userId) {
    return NextResponse.json({ error: "Prenez d'abord le chat en charge" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const rawText = typeof (body as { text?: unknown })?.text === "string"
    ? ((body as { text: string }).text).trim()
    : "";
  if (!rawText || rawText.length > 2000) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminSupabase as any)
    .from("support_chat_messages")
    .insert({ chat_id: id, author: "agent", admin_id: session.userId, body: rawText });
  if (error) {
    console.error("agent send failed:", error);
    return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
