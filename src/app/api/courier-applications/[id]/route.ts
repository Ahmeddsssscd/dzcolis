import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { status, admin_note } = body; // "approved" | "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status invalide" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("courier_applications")
    .update({ status, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
