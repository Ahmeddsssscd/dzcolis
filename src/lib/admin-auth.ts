import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { adminSupabase } from "@/lib/supabase/admin";

/*
 * Admin session model
 * --------------------
 * Pre-RBAC:  cookie = HMAC("waselli-admin-authenticated") — a static value.
 *            Every admin shared one password, one cookie. A stolen cookie
 *            was good until its 8h TTL elapsed, with no way to revoke.
 *
 * Post-RBAC (this file): cookie = "<uid>.<hmac(uid)>".
 *   - `uid` points at a row in public.admin_users
 *   - every request re-fetches the row and checks `is_active`, so
 *     deactivating an admin in the DB kills their session within one
 *     request (no cache, on purpose — admin traffic is low volume)
 *   - the HMAC still uses ADMIN_SESSION_SECRET so the cookie can't be
 *     forged without server secret access
 */

export type AdminRole =
  | "viewer"
  | "support"
  | "moderator"
  | "admin"
  | "super_admin";

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET environment variable is required. Set it in Vercel or .env.local."
    );
  }
  return secret;
}

/** Build the cookie value: `<uid>.<hmac(uid)>` */
export function buildSessionCookie(userId: string): string {
  const sig = createHmac("sha256", getSecret()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

/** Verify a cookie value and pull out the uid; returns null if forged. */
function verifyCookie(raw: string): string | null {
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;

  const uid = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!uid || !sig) return null;

  const expected = createHmac("sha256", getSecret()).update(uid).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;

  try {
    return timingSafeEqual(a, b) ? uid : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the current admin session from the incoming cookie. Returns
 * null for anonymous / forged / deactivated sessions. The caller is
 * responsible for handling the null case — usually by redirecting or
 * returning 401.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const store = await cookies();
    const raw = store.get("admin_session")?.value;
    if (!raw) return null;

    const uid = verifyCookie(raw);
    if (!uid) return null;

    const { data, error } = await adminSupabase
      .from("admin_users")
      .select("id, email, full_name, role, is_active")
      .eq("id", uid)
      .maybeSingle();

    if (error || !data) return null;
    if (!data.is_active) return null;

    return {
      userId: data.id as string,
      email: data.email as string,
      fullName: (data.full_name as string | null) ?? null,
      role: data.role as AdminRole,
    };
  } catch {
    return null;
  }
}

/**
 * Boolean shortcut. Keeps the old name around so existing callers don't
 * need to change in one megacommit, even though we prefer getAdminSession
 * in new code because it also returns the role.
 */
export async function checkAdminCookie(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

/* ────────── Role capability matrix ──────────
 *
 * Single source of truth. If a new admin-facing action is added, put its
 * minimum-required role here and call `can(session, "action")` from the
 * route handler. Don't hard-code role strings in handlers — they drift.
 */

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 0,
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

export type AdminAction =
  // read-only — viewer+
  | "dashboard.view"
  | "users.view"
  | "listings.view"
  | "bookings.view"
  | "payments.view"
  | "disputes.view"
  | "kyc.view"
  | "audit.view"
  // support+
  | "disputes.resolve"
  | "users.message"
  | "support.respond"
  // moderator+
  | "kyc.review"
  | "courier_applications.review"
  | "listings.moderate"
  // admin+
  | "settings.update"
  | "payments.refund"
  | "users.update"
  | "users.delete"
  // super_admin only
  | "admins.manage"
  | "audit.export";

export const ACTION_MIN_ROLE: Record<AdminAction, AdminRole> = {
  "dashboard.view":               "viewer",
  "users.view":                   "viewer",
  "listings.view":                "viewer",
  "bookings.view":                "viewer",
  "payments.view":                "viewer",
  "disputes.view":                "viewer",
  "kyc.view":                     "viewer",
  "audit.view":                   "viewer",

  "disputes.resolve":             "support",
  "users.message":                "support",
  "support.respond":              "support",

  "kyc.review":                   "moderator",
  "courier_applications.review": "moderator",
  "listings.moderate":            "moderator",

  "settings.update":              "admin",
  "payments.refund":              "admin",
  "users.update":                 "admin",
  "users.delete":                 "admin",

  "admins.manage":                "super_admin",
  "audit.export":                 "super_admin",
};

export function can(session: AdminSession | null, action: AdminAction): boolean {
  if (!session) return false;
  const userRank = ROLE_RANK[session.role];
  const needRank = ROLE_RANK[ACTION_MIN_ROLE[action]];
  return userRank >= needRank;
}

/**
 * Guard helper for API routes. Returns either the session (authorized)
 * or a NextResponse to return directly (401 / 403). Typical use:
 *
 *   const sessionOrRes = await requireAction("kyc.review");
 *   if (sessionOrRes instanceof NextResponse) return sessionOrRes;
 *   const session = sessionOrRes;
 */
import { NextResponse } from "next/server";

export async function requireAction(
  action: AdminAction
): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!can(session, action)) {
    return NextResponse.json(
      { error: "Permissions insuffisantes pour cette action." },
      { status: 403 }
    );
  }
  return session;
}

/** Convenience alias when a route just needs "is an admin" with no specific action. */
export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  return requireAction("dashboard.view");
}
