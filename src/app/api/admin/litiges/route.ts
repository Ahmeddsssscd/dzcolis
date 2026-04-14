import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

// We persist litige resolutions in the notifications table
// using type "litige_resolution" and user_id "admin"
// so they survive page refreshes without needing a new table.

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from("notifications")
      .select("*")
      .eq("type", "litige_resolution")
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Return a map of litige_id → decision
    const resolved: Record<string, { decision: string; date: string }> = {};
    for (const n of data ?? []) {
      const d = n.data as { litige_id?: string; decision?: string } | null;
      if (d?.litige_id && d?.decision) {
        resolved[d.litige_id] = { decision: d.decision, date: n.created_at };
      }
    }
    return NextResponse.json(resolved);
  } catch (err) {
    console.error("Litiges GET error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { litige_id, decision } = await req.json();
    if (!litige_id || !decision) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upsert: delete old record for this litige_id if exists, then insert
    await adminSupabase
      .from("notifications")
      .delete()
      .eq("type", "litige_resolution")
      .contains("data", { litige_id });

    const { error } = await adminSupabase.from("notifications").insert({
      user_id: "00000000-0000-0000-0000-000000000000", // placeholder admin
      type: "litige_resolution",
      title: "Litige résolu",
      message: `Litige ${litige_id} résolu : ${decision}`,
      read: true,
      data: { litige_id, decision },
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Litiges POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
