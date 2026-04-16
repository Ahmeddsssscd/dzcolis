import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createClient() as any;

  const { data: profile } = await db
    .from("profiles")
    .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, avatar_url, created_at")
    .eq("id", params.id)
    .single();

  if (!profile) return NextResponse.json(null, { status: 404 });

  const { data: listings } = await db
    .from("listings")
    .select("id, from_city, to_city, departure_date, available_weight, price_per_kg, is_international, status")
    .eq("user_id", params.id)
    .order("departure_date", { ascending: true });

  return NextResponse.json({ ...profile, listings: listings ?? [] });
}
