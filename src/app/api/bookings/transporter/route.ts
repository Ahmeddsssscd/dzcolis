import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  // Get all listings owned by this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listings } = await (supabase as any)
    .from("listings")
    .select("id, from_city, to_city")
    .eq("user_id", user.id);

  if (!listings || listings.length === 0) return NextResponse.json([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingIds = listings.map((l: any) => l.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingMap = Object.fromEntries(listings.map((l: any) => [l.id, l]));

  // Get all bookings for those listings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookings } = await (supabase as any)
    .from("bookings")
    .select("*")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (!bookings || bookings.length === 0) return NextResponse.json([]);

  // Get sender profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const senderIds = [...new Set(bookings.map((b: any) => b.sender_id))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, phone")
    .in("id", senderIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = bookings.map((b: any) => ({
    ...b,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sender_name: profileMap[b.sender_id] ? `${(profileMap[b.sender_id] as any).first_name} ${(profileMap[b.sender_id] as any).last_name}`.trim() : "—",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sender_phone: (profileMap[b.sender_id] as any)?.phone ?? "—",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from_city: (listingMap[b.listing_id] as any)?.from_city ?? "—",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    to_city: (listingMap[b.listing_id] as any)?.to_city ?? "—",
  }));

  return NextResponse.json(enriched);
}
