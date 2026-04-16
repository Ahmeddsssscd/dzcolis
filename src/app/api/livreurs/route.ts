import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilaya = searchParams.get("wilaya");

  try {
    // First try: get profiles that have at least one active listing
    let query = adminClient
      .from("profiles")
      .select(`
        id, first_name, last_name, wilaya, rating, review_count,
        kyc_status, avatar_url, created_at,
        listings(id, is_international, transport_type, status)
      `)
      .order("rating", { ascending: false })
      .limit(100);

    if (wilaya) {
      query = query.eq("wilaya", wilaya) as typeof query;
    }

    const { data, error } = await query;

    if (error) {
      console.error("Livreurs API error (with listings join):", error.message);

      // Fallback: just get profiles ordered by rating
      const fallbackQuery = adminClient
        .from("profiles")
        .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, avatar_url, created_at")
        .order("rating", { ascending: false })
        .limit(100);

      const { data: fallbackData, error: fallbackError } = wilaya
        ? await (fallbackQuery.eq("wilaya", wilaya) as typeof fallbackQuery)
        : await fallbackQuery;

      if (fallbackError) {
        console.error("Livreurs fallback error:", fallbackError.message);
        return NextResponse.json([]);
      }

      return NextResponse.json(fallbackData ?? []);
    }

    // Filter to only profiles that have at least one active listing,
    // OR include all if very few profiles (so page isn't empty)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withActiveListings = (data ?? []).filter((p: any) =>
      p.listings?.some((l: any) => l.status === "active")
    );

    // If nobody has active listings yet, show all profiles so page isn't empty
    const result = withActiveListings.length > 0 ? withActiveListings : (data ?? []);

    // Deduplicate by id
    const seen = new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unique = result.filter((p: any) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    return NextResponse.json(unique);
  } catch (err) {
    console.error("Livreurs API unexpected error:", err);
    return NextResponse.json([]);
  }
}
