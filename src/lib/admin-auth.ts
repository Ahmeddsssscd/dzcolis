import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { adminSupabase } from "@/lib/supabase/admin";

// Session cookie format: "<uid>.<hmac(uid)>" — verified on every request,
// is_active checked against DB so deactivating an admin takes effect immediately.

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

// Role capability matrix — single source of truth.
// Add new actions here and call can(session, "action") in route handlers.

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
  | "contact.view"
  // support+
  | "disputes.resolve"
  | "users.message"
  | "support.respond"
  | "contact.manage"
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
  // ── viewer: only the summary dashboard (no data pages) ──────────────
  "dashboard.view":               "viewer",

  // ── support: customer-facing ops ────────────────────────────────────
  "users.view":                   "support",
  "listings.view":                "support",
  "bookings.view":                "support",
  "disputes.view":                "support",
  "contact.view":                 "support",
  "disputes.resolve":             "support",
  "users.message":                "support",
  "support.respond":              "support",
  "contact.manage":               "support",

  // ── moderator: review queue ──────────────────────────────────────────
  "kyc.view":                     "moderator",
  "kyc.review":                   "moderator",
  "courier_applications.review": "moderator",
  "listings.moderate":            "moderator",

  // ── admin: financial + system + mutations ────────────────────────────
  "payments.view":                "admin",
  "audit.view":                   "admin",
  "settings.update":              "admin",
  "payments.refund":              "admin",
  "users.update":                 "admin",
  "users.delete":                 "admin",

  // ── super_admin: team management + audit export ───────────────────────
  "admins.manage":                "super_admin",
  "audit.export":                 "super_admin",
};

export function can(session: AdminSession | null, action: AdminAction): boolean {
  if (!session) return false;
  const userRank = ROLE_RANK[session.role];
  const needRank = ROLE_RANK[ACTION_MIN_ROLE[action]];
  return userRank >= needRank;
}

/** Route guard — returns session or a 401/403 NextResponse. */
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
