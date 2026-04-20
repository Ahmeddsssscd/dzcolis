import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

export const runtime = "nodejs";

/*
 * L3 fix deferred here: the SELECT * still returns every column, but at
 * least RBAC now gates who can even hit this endpoint. Column pruning
 * should follow in a later sprint — changing the shape breaks the
 * consumer page, so it needs paired UI work.
 */
export async function GET() {
  const sessionOrRes = await requireAction("users.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  try {
    const { data, error } = await adminSupabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Users API error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
