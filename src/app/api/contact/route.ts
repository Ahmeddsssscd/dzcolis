import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public contact-form endpoint.
 *
 * Anyone on the internet can POST here from the /contact page, so every
 * layer of defence is mandatory:
 *
 *   • Rate limit — 5 submissions per IP per 15 min. Keeps a single actor
 *     from using us as a spam cannon against our own support inbox.
 *   • Length caps — bounded strings so a malicious submitter can't DoS
 *     Resend or bloat our outgoing payload. 40mb attachment limit at
 *     Resend is enough that 5kb bodies are a non-issue, but a bounded
 *     input surface is always the right default.
 *   • Email-shaped `email` check — cheap sanity filter (prevents
 *     garbage in Reply-To that bounces immediately).
 *
 * No auth: contact forms are universally open. If we start getting
 * hammered we can upgrade to a CAPTCHA (hcaptcha, Turnstile) without
 * changing this contract.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    bucket: "contact-form",
    max: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
  };

  // Normalise + validate. Bounds are generous enough for real messages,
  // tight enough that a single POST can't smuggle a megabyte through.
  const cleanName    = typeof name === "string"    ? name.trim()    : "";
  const cleanEmail   = typeof email === "string"   ? email.trim()   : "";
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  if (!cleanName    || cleanName.length    > 120)  return NextResponse.json({ error: "Nom invalide" },     { status: 400 });
  if (!cleanSubject || cleanSubject.length > 200)  return NextResponse.json({ error: "Sujet invalide" },   { status: 400 });
  if (!cleanMessage || cleanMessage.length > 5000) return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  if (!cleanEmail   || cleanEmail.length   > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Surface a generic 500 — never leak provider details to the client,
    // but log server-side so ops can diagnose bounces / misconfiguration.
    console.error("Contact form send failed:", e);
    return NextResponse.json(
      { error: "Envoi impossible pour le moment. Réessayez dans quelques minutes." },
      { status: 500 }
    );
  }
}
