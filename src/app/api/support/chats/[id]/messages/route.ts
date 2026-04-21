import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Visitor-facing message feed.
 *
 *   GET  → list all messages for this chat, in chronological order.
 *          Used for both initial load and 2s polling.
 *   POST → append a new visitor message. Rate-limited so a pasted
 *          script can't flood the agent's screen.
 *
 * Both verbs require `x-support-token` matching the chat's stored
 * visitor_token. That's the only auth — guests don't have Supabase
 * sessions, so a shared secret in a header is the right shape.
 */
export const runtime = "nodejs";

async function checkToken(id: string, token: string | null) {
  if (!token) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (adminSupabase as any)
    .from("support_chats")
    .select("id, visitor_token, status")
    .eq("id", id)
    .single();
  if (!data || data.visitor_token !== token) return null;
  return data;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const chat = await checkToken(id, req.headers.get("x-support-token")?.trim() ?? null);
  if (!chat) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messages } = await (adminSupabase as any)
    .from("support_chat_messages")
    .select("id, author, body, created_at")
    .eq("chat_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const limited = checkRateLimit(req, {
    bucket: "support-chat-visitor-send",
    max: 20,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  const chat = await checkToken(id, req.headers.get("x-support-token")?.trim() ?? null);
  if (!chat) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (chat.status === "closed") {
    return NextResponse.json({ error: "Chat clôturé" }, { status: 409 });
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
    .insert({ chat_id: id, author: "visitor", body: rawText });

  if (error) {
    console.error("visitor send failed:", error);
    return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
