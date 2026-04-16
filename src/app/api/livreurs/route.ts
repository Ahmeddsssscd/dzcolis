import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wilaya = searchParams.get("wilaya");

  try {
    // Fetch profiles with their listings (no transport_type — not in schema)
    let query = adminClient
      .from("profiles")
      .select(`
        id, first_name, last_name, wilaya, rating, review_count,
        kyc_status, created_at,
        listings(id, is_international, listing_type, status)
      `)
      .order("rating", { ascending: false })
      .limit(100);

    if (wilaya) {
      query = query.eq("wilaya", wilaya) as typeof query;
    }

    const { data, error } = await query;

    if (error) {
      console.error("Livreurs API error:", error.message);

      // Fallback: just profiles, no join
      const { data: profiles } = wilaya
        ? await adminClient
            .from("profiles")
            .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, created_at")
            .eq("wilaya", wilaya)
            .order("rating", { ascending: false })
            .limit(100)
        : await adminClient
            .from("profiles")
            .select("id, first_name, last_name, wilaya, rating, review_count, kyc_status, created_at")
            .order("rating", { ascending: false })
            .limit(100);

      return NextResponse.json(profiles ?? []);
    }

    // Filter: prefer profiles with active "trajet" listings (transporters)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transporters = (data ?? []).filter((p: any) =>
      p.listings?.some((l: any) => l.listing_type === "trajet" && l.status === "active")
    );

    // Fall back to all profiles so the page is never empty
    const result = transporters.length > 0 ? transporters : (data ?? []);

    // Deduplicate
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
