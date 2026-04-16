import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("courier_applications")
    .select("id, first_name, last_name, wilaya, transport_type, message, created_at")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data);
}
