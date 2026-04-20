import { NextRequest, NextResponse } from "next/server";
import { requireAction, type AdminRole } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/supabase/admin";
import { hashPassword, validatePasswordStrength } from "@/lib/admin-password";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

const VALID_ROLES: AdminRole[] = ["viewer", "support", "moderator", "admin", "super_admin"];

/*
 * PATCH — mutate a single admin. Body may include:
 *   { role?, is_active?, full_name?, password? }
 *
 * Safety rails:
 *   - super_admin cannot demote THEMSELVES (locks themselves out)
 *   - cannot deactivate the last active super_admin (platform lockout)
 *
 * Each accepted field bumps a dedicated audit action so the journal
 * reads as a real history, not "admin.update with JSON blob".
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("admins.manage");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });

  let body: {
    role?: string;
    is_active?: boolean;
    full_name?: string;
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { data: target, error: fetchErr } = await adminSupabase
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    console.error("[members PATCH] fetch error:", fetchErr.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "Admin introuvable." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  const audits: Array<{ action: string; metadata: Record<string, unknown> }> = [];

  // Role change
  if (typeof body.role === "string" && body.role !== target.role) {
    if (!VALID_ROLES.includes(body.role as AdminRole)) {
      return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
    }
    // Self-demotion guard: a super_admin cannot remove their own super_admin.
    if (session.userId === target.id && target.role === "super_admin" && body.role !== "super_admin") {
      return NextResponse.json(
        { error: "Impossible de retirer votre propre rôle super admin." },
        { status: 400 }
      );
    }
    // Last-super-admin guard: demoting the only super_admin would
    // permanently lock out the platform.
    if (target.role === "super_admin" && body.role !== "super_admin") {
      const { count } = await adminSupabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("is_active", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Il faut au moins un super admin actif." },
          { status: 400 }
        );
      }
    }
    update.role = body.role;
    audits.push({
      action: "admin.role_change",
      metadata: { from: target.role, to: body.role },
    });
  }

  // Active flag
  if (typeof body.is_active === "boolean" && body.is_active !== target.is_active) {
    // Self-deactivate guard.
    if (session.userId === target.id && body.is_active === false) {
      return NextResponse.json(
        { error: "Impossible de désactiver votre propre compte." },
        { status: 400 }
      );
    }
    // Last-super-admin guard applies to deactivation too.
    if (target.role === "super_admin" && body.is_active === false) {
      const { count } = await adminSupabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "super_admin")
        .eq("is_active", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Impossible de désactiver le dernier super admin actif." },
          { status: 400 }
        );
      }
    }
    update.is_active = body.is_active;
    audits.push({
      action: body.is_active ? "admin.reactivate" : "admin.deactivate",
      metadata: {},
    });
  }

  // Full name
  if (typeof body.full_name === "string" && body.full_name.trim()) {
    update.full_name = body.full_name.trim();
    audits.push({ action: "admin.rename", metadata: { newName: body.full_name.trim() } });
  }

  // Password reset (super_admin sets a new password on behalf of another admin)
  if (typeof body.password === "string") {
    const pwdErr = validatePasswordStrength(body.password);
    if (pwdErr) return NextResponse.json({ error: pwdErr }, { status: 400 });
    update.password_hash = await hashPassword(body.password);
    audits.push({ action: "admin.password_reset", metadata: {} });
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucune modification." }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("admin_users")
    .update(update)
    .eq("id", id)
    .select("id, email, full_name, role, is_active, last_login_at, created_at")
    .single();

  if (error || !data) {
    console.error("[members PATCH] update error:", error?.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  // Write one audit row per discrete change so the journal is readable.
  for (const a of audits) {
    await logAdminAction({
      session,
      req,
      action: a.action,
      targetType: "admin_user",
      targetId: id,
      metadata: { ...a.metadata, email: target.email },
    });
  }

  return NextResponse.json(data);
}

/*
 * DELETE — permanent removal. Prefer deactivation (PATCH is_active:false)
 * for anything recoverable; DELETE is for admins that were created by
 * mistake and never actually used. Same last-super-admin guard applies.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("admins.manage");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });

  if (session.userId === id) {
    return NextResponse.json(
      { error: "Impossible de supprimer votre propre compte." },
      { status: 400 }
    );
  }

  const { data: target, error: fetchErr } = await adminSupabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    console.error("[members DELETE] fetch error:", fetchErr.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "Admin introuvable." }, { status: 404 });
  }

  if (target.role === "super_admin") {
    const { count } = await adminSupabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Impossible de supprimer le dernier super admin." },
        { status: 400 }
      );
    }
  }

  const { error } = await adminSupabase.from("admin_users").delete().eq("id", id);
  if (error) {
    console.error("[members DELETE] delete error:", error.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  await logAdminAction({
    session,
    req,
    action: "admin.delete",
    targetType: "admin_user",
    targetId: id,
    metadata: { email: target.email, role: target.role },
  });

  return NextResponse.json({ success: true });
}
