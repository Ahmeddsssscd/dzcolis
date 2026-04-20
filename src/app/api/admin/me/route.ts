import { NextResponse } from "next/server";
import { getAdminSession, ACTION_MIN_ROLE, can, type AdminAction } from "@/lib/admin-auth";

export const runtime = "nodejs";

/*
 * Returns the current admin's profile + a precomputed permissions map.
 * The client uses this to hide/show nav entries and action buttons.
 * SECURITY: server-side guards still run on every action — this is
 * purely UX, never the only check.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Compute per-action "can" flags once so the client doesn't have to
  // re-implement the role ladder.
  const actions = Object.keys(ACTION_MIN_ROLE) as AdminAction[];
  const permissions: Record<string, boolean> = {};
  for (const a of actions) {
    permissions[a] = can(session, a);
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    },
    permissions,
  });
}
