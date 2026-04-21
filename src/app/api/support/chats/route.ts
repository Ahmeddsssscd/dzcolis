import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { adminSupabase } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public endpoint. Anyone on the internet can POST here to start a
 * support chat, so every layer of defence must be present:
 *
 *   • 3 chats per IP per 10 min — stops a bot from flooding the queue.
 *   • Bounded field lengths — caps request size so the same bot can't
 *     bloat our storage with megabyte-long names/emails/subjects.
 *   • Email-shape validation — keeps Reply-To/agent contact usable.
 *   • Short random token — returned to the browser, stored in
 *     localStorage, required to read/write the chat after creation.
 *     Prevents one visitor from reading another visitor's chat.
 *
 * The visitor's Supabase auth session (if any) is captured opportunistically
 * so the agent can cross-reference an existing account. No auth is
 * required — guests are a first-class case for support.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    bucket: "support-chat-create",
    max: 3,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = (body ?? {}) as {
    name?: unknown; email?: unknown; subject?: unknown; message?: unknown;
  };

  const cleanName    = typeof name === "string"    ? name.trim()    : "";
  const cleanEmail   = typeof email === "string"   ? email.trim()   : "";
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  if (!cleanName    || cleanName.length    > 120)  return NextResponse.json({ error: "Nom invalide" },     { status: 400 });
  if (!cleanMessage || cleanMessage.length > 2000) return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  if (cleanSubject.length > 200)                   return NextResponse.json({ error: "Sujet invalide" },   { status: 400 });
  if (!cleanEmail   || cleanEmail.length   > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Try to link the chat to an authenticated visitor if they happen to
  // have a Supabase session — purely informational for the agent.
  let visitorUserId: string | null = null;
  try {
    const auth = await createServerClient();
    const { data: { user } } = await auth.auth.getUser();
    visitorUserId = user?.id ?? null;
  } catch {/* anon visitor — fine */}

  const visitorToken = randomUUID();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: chat, error } = await (adminSupabase as any)
    .from("support_chats")
    .insert({
      visitor_name:    cleanName,
      visitor_email:   cleanEmail,
      visitor_token:   visitorToken,
      visitor_user_id: visitorUserId,
      subject:         cleanSubject || null,
      status:          "open",
    })
    .select("id, created_at")
    .single();

  if (error || !chat) {
    console.error("support chat create failed:", error);
    return NextResponse.json({ error: "Impossible de démarrer le chat" }, { status: 500 });
  }

  // Seed the conversation with the visitor's first message. We do it
  // as a second insert so the token-bump trigger fires and the chat's
  // last_activity_at is set by the message rather than by the creation
  // timestamp (keeps the queue fair even with burst creates).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminSupabase as any).from("support_chat_messages").insert({
    chat_id: chat.id,
    author:  "visitor",
    body:    cleanMessage,
  });

  return NextResponse.json({
    ok: true,
    id:    chat.id,
    token: visitorToken,
  });
}
