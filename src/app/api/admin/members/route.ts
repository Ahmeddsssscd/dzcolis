import { NextRequest, NextResponse } from "next/server";
import { requireAction, type AdminRole } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/supabase/admin";
import { hashPassword, validatePasswordStrength } from "@/lib/admin-password";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

const VALID_ROLES: AdminRole[] = ["viewer", "support", "moderator", "admin", "super_admin"];

// ─── GET: list all admins ─────────────────────────────────────────────
export async function GET() {
  const sessionOrRes = await requireAction("admins.manage");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const { data, error } = await adminSupabase
    .from("admin_users")
    .select("id, email, full_name, role, is_active, last_login_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[members] list error:", error.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

// ─── POST: create a new admin ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const sessionOrRes = await requireAction("admins.manage");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  let body: { email?: string; password?: string; fullName?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Nom complet requis." }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role as AdminRole)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }
  const pwdError = validatePasswordStrength(password);
  if (pwdError) {
    return NextResponse.json({ error: pwdError }, { status: 400 });
  }

  // Reject duplicate email early (case-insensitive unique index in DB
  // would catch it, but we prefer a clean 409 over a generic 500).
  const { data: existing } = await adminSupabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Un admin utilise déjà cet email." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const { data, error } = await adminSupabase
    .from("admin_users")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      is_active: true,
      created_by: session.userId,
    })
    .select("id, email, full_name, role, is_active, last_login_at, created_at")
    .single();

  if (error || !data) {
    console.error("[members] create error:", error?.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  await logAdminAction({
    session,
    req,
    action: "admin.create",
    targetType: "admin_user",
    targetId: data.id as string,
    metadata: { email, role, fullName },
  });

  return NextResponse.json(data, { status: 201 });
}
