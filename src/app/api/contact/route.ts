import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Contact-form endpoint.
 *
 * Hard requirements (post-spam-control rework):
 *   • Auth required — must be a signed-in Waselli user. We tie every
 *     message to a user_id, so an attacker can't flood the form with
 *     throwaway emails from a script. Bans on a user propagate here too.
 *   • Email is forced to the account email — the submitted `email`
 *     field is ignored for auth/notification purposes so nobody can
 *     impersonate another account's sender when we receive the mail.
 *   • Rate-limit: 5 POSTs per IP per 15 min as a belt-and-suspenders
 *     layer (one user with multiple devices still caps).
 *   • Persist to DB FIRST, email SECOND — if Resend is down/misconfigured
 *     the message still lands in /admin/contact (nothing is ever lost).
 *   • Length caps — bounded strings so a submitter can't DoS Resend
 *     or bloat our row payload.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    bucket: "contact-form",
    max: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "AUTH_REQUIRED", message: "Connectez-vous pour envoyer un message." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, subject, message } = (body ?? {}) as {
    name?: unknown;
    subject?: unknown;
    message?: unknown;
  };

  const cleanName    = typeof name === "string"    ? name.trim()    : "";
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  if (!cleanName    || cleanName.length    > 120)  return NextResponse.json({ error: "Nom invalide" },     { status: 400 });
  if (!cleanSubject || cleanSubject.length > 200)  return NextResponse.json({ error: "Sujet invalide" },   { status: 400 });
  if (!cleanMessage || cleanMessage.length > 5000) return NextResponse.json({ error: "Message invalide" }, { status: 400 });

  // Always use the account email — ignore whatever the client sent. A
  // support thread is only useful if the reply address actually belongs
  // to the submitter.
  const accountEmail = user.email ?? "";
  if (!accountEmail) {
    return NextResponse.json({ error: "Compte sans adresse email" }, { status: 400 });
  }

  // Capture client IP for audit trail — first entry in x-forwarded-for
  // is the real client when sitting behind Vercel's edge.
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;

  // Persist FIRST — if Resend later fails, the admin can still read the
  // message in the inbox page. We prefer a row to an email on purpose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (adminSupabase as any)
    .from("contact_messages")
    .insert({
      user_id: user.id,
      name: cleanName,
      email: accountEmail,
      subject: cleanSubject,
      message: cleanMessage,
      ip,
    });

  if (insertError) {
    console.error("contact_messages insert failed:", insertError);
    return NextResponse.json(
      { error: "Enregistrement impossible. Réessayez dans un moment." },
      { status: 500 }
    );
  }

  // Email is a notification, not the source of truth. If it fails we
  // still return success to the client — the message IS persisted.
  try {
    await sendContactEmail({
      name: cleanName,
      email: accountEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });
  } catch (e) {
    console.error("Contact form email notification failed (message still saved):", e);
  }

  return NextResponse.json({ ok: true });
}
