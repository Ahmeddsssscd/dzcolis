import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/admin-auth";
import { timingSafeEqual } from "crypto";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

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

  // Timing-safe password comparison to prevent timing attacks
  const isValid =
    !!password &&
    password.length === ADMIN_PASSWORD.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));

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
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
