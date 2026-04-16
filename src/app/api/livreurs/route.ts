import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use anon key — profiles are publicly readable (RLS allows it)
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
    // Fetch profiles with their listings
    const profileQuery = supabase
      .from("profiles")
      .select(`
        id, first_name, last_name, wilaya, rating, review_count,
        kyc_status, created_at,
        listings(id, is_international, listing_type, status)
      `)
      .order("rating", { ascending: false })
      .limit(100);

    const { data, error } = wilaya
      ? await (profileQuery.eq("wilaya", wilaya) as typeof profileQuery)
      : await profileQuery;

    if (error) {
      console.error("Livreurs API error:", error.message);
      // Fallback: profiles only, no join
      const fallback = supabase
        .from("profiles")
        .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, created_at")
        .order("rating", { ascending: false })
        .limit(100);

      const { data: fb } = wilaya
        ? await (fallback.eq("wilaya", wilaya) as typeof fallback)
        : await fallback;

      return NextResponse.json(fb ?? []);
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Livreurs API unexpected error:", err);
    return NextResponse.json([]);
  }
}
