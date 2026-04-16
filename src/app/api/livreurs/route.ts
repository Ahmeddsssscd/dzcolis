import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilaya = searchParams.get("wilaya");

  // Use service-role or anon key to read public profiles + listings
  const supabase = createClient();

  // Fetch profiles that have at least one active listing (transporters)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let query = db
    .from("profiles")
    .select(`
      id, first_name, last_name, wilaya, rating, review_count,
      kyc_status, avatar_url, created_at,
      listings!inner(id, from_city, to_city, is_international, status, transport_type)
    `)
    .eq("listings.status", "active")
    .order("rating", { ascending: false });

  if (wilaya) {
    query = query.eq("wilaya", wilaya);
  }

  const { data, error } = await query;

  if (error) {
    // Fallback: fetch profiles with listings separately
    const { data: profiles } = await db
      .from("profiles")
      .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, avatar_url, created_at")
      .order("rating", { ascending: false })
      .limit(50);

    return NextResponse.json(profiles ?? []);
  }

  // Deduplicate by profile id
  const seen = new Set();
  const unique = (data ?? []).filter((p: { id: string }) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return NextResponse.json(unique);
}
