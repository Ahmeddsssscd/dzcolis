import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Privacy rule: sender phone numbers are only exposed once a booking has
 * actually moved past "pending". If a booking is still waiting for the
 * transporter's decision (or was refused/cancelled), we show a masked phone
 * so transporters cannot harvest contact info from senders they never
 * committed to transport.
 *
 * Once the transporter ACCEPTS the booking, the full phone appears — they
 * need it to coordinate pickup.
 */
const FULL_CONTACT_STATUSES = new Set(["accepted", "in_transit", "delivered"]);

function maskPhone(phone: unknown): string {
  if (typeof phone !== "string" || phone.length === 0) return "—";
  const digits = phone.replace(/\D+/g, "");
  if (digits.length <= 4) return "•••";
  return `••• ••• ${digits.slice(-2)}`;
}

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
  const enriched = bookings.map((b: any) => {
    const profile = profileMap[b.sender_id];
    const rawPhone = profile?.phone ?? null;
    const canSeeFullPhone = FULL_CONTACT_STATUSES.has(String(b.status));
    return {
      ...b,
      sender_name: profile
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `${(profile as any).first_name ?? ""} ${(profile as any).last_name ?? ""}`.trim() || "—"
        : "—",
      sender_phone: canSeeFullPhone ? (rawPhone ?? "—") : maskPhone(rawPhone),
      sender_phone_masked: !canSeeFullPhone,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      from_city: (listingMap[b.listing_id] as any)?.from_city ?? "—",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to_city: (listingMap[b.listing_id] as any)?.to_city ?? "—",
    };
  });

  return NextResponse.json(enriched);
}
