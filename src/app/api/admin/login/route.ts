import { NextRequest, NextResponse } from "next/server";
import { buildSessionCookie } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/admin-password";
import { logAdminAction } from "@/lib/admin-audit";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";

// Pin to Node — we use bcryptjs + crypto in downstream libs. bcryptjs is
// pure-JS so it technically runs on Edge, but the HMAC helpers in
// admin-auth use `node:crypto` which does not.
export const runtime = "nodejs";

/*
 * Bootstrap model
 * ---------------
 * First deploy: admin_users is empty. An ADMIN_EMAIL + ADMIN_PASSWORD
 * env var pair on the server lets exactly one person through the door,
 * which auto-creates the first super_admin record. After that, the env
 * vars are ignored (login goes purely through the DB), so leaking or
 * forgetting to rotate them is not a security hole — they only work
 * when the table is empty.
 */

async function bootstrapIfEmpty(email: string, password: string): Promise<string | null> {
  // Is the admin table empty?
  const { count, error: countErr } = await adminSupabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (countErr) {
    console.error("[admin/login] bootstrap count failed:", countErr.message);
    return null;
  }
  if ((count ?? 0) > 0) return null;

  // Compare against env bootstrap creds
  const bootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const bootPwd = process.env.ADMIN_PASSWORD;
  if (!bootEmail || !bootPwd) return null;
  if (email.trim().toLowerCase() !== bootEmail) return null;
  if (password !== bootPwd) return null;

  // Create the super_admin
  const passwordHash = await hashPassword(password);
  const { data, error } = await adminSupabase
    .from("admin_users")
    .insert({
      email: bootEmail,
      password_hash: passwordHash,
      full_name: "Super Admin",
      role: "super_admin",
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[admin/login] bootstrap insert failed:", error?.message);
    return null;
  }
  return data.id as string;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    bucket: "admin-login",
    max: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  // Constant-ish response time for failures so presence/absence of an
  // email can't be timed. The bcrypt compare alone takes ~100ms, plus
  // a 400ms floor on any failure path.
  const FAIL_FLOOR_MS = 400;
  const failStart = Date.now();
  const fail = async (msg = "Identifiants invalides.") => {
    const elapsed = Date.now() - failStart;
    if (elapsed < FAIL_FLOOR_MS) {
      await new Promise((r) => setTimeout(r, FAIL_FLOOR_MS - elapsed));
    }
    return NextResponse.json({ error: msg }, { status: 401 });
  };

  // Lookup the admin. `maybeSingle` returns null (not error) when no
  // row matches, which lets us treat missing-user and wrong-password
  // identically.
  const { data: admin, error } = await adminSupabase
    .from("admin_users")
    .select("id, email, password_hash, role, is_active")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[admin/login] lookup error:", error.message);
    return fail("Erreur serveur.");
  }

  // First-run bootstrap path: no admins exist AND caller matches env.
  if (!admin) {
    const bootstrappedId = await bootstrapIfEmpty(email, password);
    if (bootstrappedId) {
      return finalizeSession(req, bootstrappedId, email, "super_admin", /*bootstrap*/ true);
    }
    return fail();
  }

  if (!admin.is_active) {
    return fail("Compte désactivé.");
  }

  const ok = await verifyPassword(password, admin.password_hash as string);
  if (!ok) return fail();

  // Success — update last_login_at (fire-and-forget, don't gate the login on it).
  void adminSupabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  return finalizeSession(req, admin.id as string, admin.email as string, admin.role as string, false);
}

async function finalizeSession(
  req: NextRequest,
  userId: string,
  email: string,
  role: string,
  bootstrap: boolean
) {
  // Deliberately do NOT reset the rate-limit counter on success — see
  // security item M6. Letting a successful guess uncap retries means a
  // credential-stuffing attack unlocks the bucket the moment it lands
  // one hit.
  void resetRateLimit; // kept imported for callers that opt in elsewhere

  const token = buildSessionCookie(userId);
  const res = NextResponse.json({ success: true, role });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8h
    path: "/",
  });

  // Audit log. Pass a synthetic session since the whole point is that
  // we just built it — logAdminAction expects a live session object.
  await logAdminAction({
    session: { userId, email, fullName: null, role: role as never },
    req,
    action: bootstrap ? "admin.bootstrap" : "admin.login",
    targetType: "admin_user",
    targetId: userId,
    metadata: { ip: getClientIp(req) },
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
