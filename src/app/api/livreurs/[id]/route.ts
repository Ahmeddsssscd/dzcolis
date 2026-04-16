import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, created_at")
    .eq("id", params.id)
    .single();

  if (!profile) return NextResponse.json(null, { status: 404 });

  const { data: listings } = await supabase
    .from("listings")
    .select("id, from_city, to_city, departure_date, available_weight, price_per_kg, is_international, listing_type, status")
    .eq("user_id", params.id)
    .eq("listing_type", "trajet")
    .order("departure_date", { ascending: true });

  return NextResponse.json({ ...profile, listings: listings ?? [] });
}
