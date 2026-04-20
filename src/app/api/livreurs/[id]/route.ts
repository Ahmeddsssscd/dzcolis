import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Courier public profile.
 *
 * Phone number is sensitive — a public, unauthenticated GET used to leak every
 * approved courier's mobile number, which is trivially scrapable. We now hide
 * the phone by default and only expose it to:
 *   1) the courier themselves (their own profile), or
 *   2) a signed-in sender viewing a SPECIFIC listing via `?listing_id=<uuid>`,
 *      where they already have an accepted / in_transit / delivered booking
 *      on that exact listing.
 *
 * Everyone else gets `phone: null`. If they need to reach the courier they
 * contact them through the in-app messaging / booking flow.
 *
 * Security note: we intentionally do NOT fall back to "any accepted booking
 * with any of this courier's listings" — that would let an attacker book one
 * cheap listing per courier and scrape all their profile phones. Callers must
 * pass `?listing_id=<uuid>` and the booking check runs against THAT listing.
 */

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceDb = getServiceSupabase();

  // Optional scoping: if the caller passes `?listing_id=<uuid>`, we verify
  // they booked that exact listing. No listing_id → no phone (unless owner).
  const url = new URL(req.url);
  const listingIdParam = url.searchParams.get("listing_id");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (serviceDb as any)
    .from("courier_applications")
    .select(
      "id, user_id, first_name, last_name, wilaya, transport_type, message, price_range, phone, contact_preference, is_available, zones, vehicle_photo_url, created_at"
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) return NextResponse.json(null, { status: 404 });

  // Is the caller allowed to see the phone number?
  let showPhone = false;
  try {
    const authDb = await createServerClient();
    const { data: { user } } = await authDb.auth.getUser();

    if (user) {
      if (data.user_id && user.id === data.user_id) {
        // Courier viewing their own profile — always reveal.
        showPhone = true;
      } else if (data.user_id && listingIdParam) {
        // Caller provided a specific listing context — verify that:
        //   (a) the listing belongs to this courier, AND
        //   (b) the caller has an accepted/in_transit/delivered booking
        //       on THAT exact listing.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: listing } = await (serviceDb as any)
          .from("listings")
          .select("id, user_id")
          .eq("id", listingIdParam)
          .eq("user_id", data.user_id)
          .maybeSingle();

        if (listing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: booking } = await (serviceDb as any)
            .from("bookings")
            .select("id")
            .eq("sender_id", user.id)
            .eq("listing_id", listing.id)
            .in("status", ["accepted", "in_transit", "delivered"])
            .limit(1)
            .maybeSingle();

          if (booking) showPhone = true;
        }
      }
    }
  } catch {
    // Auth failure = treat as anonymous, phone stays hidden
  }

  const payload = showPhone
    ? data
    : { ...data, phone: null };

  return NextResponse.json(payload);
}
