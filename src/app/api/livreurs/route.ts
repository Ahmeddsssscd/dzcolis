import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilaya = searchParams.get("wilaya");
  const supabase = getSupabase();

  try {
    let query = supabase
      .from("courier_applications")
      .select("id, first_name, last_name, wilaya, transport_type, message, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (wilaya) query = query.eq("wilaya", wilaya) as typeof query;

    const { data, error } = await query;
    if (error) {
      console.error("Livreurs API error:", error.message);
      return NextResponse.json([]);
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Livreurs API unexpected error:", err);
    return NextResponse.json([]);
  }
}
