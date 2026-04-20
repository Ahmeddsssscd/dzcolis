import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/admin-auth";
import { timingSafeEqual, createHash } from "crypto";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

// Pin to the Node.js runtime. We use `node:crypto` here (timingSafeEqual,
// createHash) and in `@/lib/admin-auth` (HMAC) — none of which exists in
// the edge runtime. Without this, a future config change that promoted
// the route to edge would throw at runtime.
export const runtime = "nodejs";

function getAdminPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required. Set it in Vercel or .env.local."
    );
  }
  return pwd;
}

export async function POST(req: NextRequest) {
  // Max 10 failed login attempts per IP per 15 minutes
  const limited = checkRateLimit(req, {
    bucket: "admin-login",
    max: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const { password } = await req.json();
  const ADMIN_PASSWORD = getAdminPassword();

  // Timing-safe password comparison. We hash BOTH sides with SHA-256
  // before comparing so the buffers are always the same length — this
  // lets us skip the `.length === .length` short-circuit that previously
  // leaked password length via timing (different code paths for wrong
  // vs. right-length guesses). SHA-256 is not a password hash (no KDF)
  // but that's fine here: the real secret is `ADMIN_PASSWORD` itself,
  // loaded from env. The hash is only a length-normaliser for the
  // constant-time comparison below.
  const isValid =
    !!password &&
    typeof password === "string" &&
    timingSafeEqual(
      createHash("sha256").update(password).digest(),
      createHash("sha256").update(ADMIN_PASSWORD).digest()
    );

  if (!isValid) {
    // Constant-time delay to slow offline analysis
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  resetRateLimit(req, "admin-login");
  const token = signToken("waselli-admin-authenticated");

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // 8 hours — long enough for a full admin shift, short enough that a
    // stolen cookie stops working by the next day. Admins can re-login
    // whenever they need; it's not a user-facing friction.
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
