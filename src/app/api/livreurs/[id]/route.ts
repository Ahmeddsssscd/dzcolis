import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, avatar_url, created_at")
    .eq("id", params.id)
    .single();

  if (!profile) return NextResponse.json(null, { status: 404 });

  const { data: listings } = await adminClient
    .from("listings")
    .select("id, from_city, to_city, departure_date, available_weight, price_per_kg, is_international, status")
    .eq("user_id", params.id)
    .order("departure_date", { ascending: true });

  return NextResponse.json({ ...profile, listings: listings ?? [] });
}
