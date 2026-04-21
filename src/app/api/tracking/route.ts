import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public tracking endpoint.
 *
 * Anyone with the booking_ref can query this endpoint (the ref is shared in
 * notifications, chats, etc.) — but we must not leak sensitive info to
 * strangers. So we gate the response:
 *
 *   • Full payload (prices, names, content, recipient) — only if the caller
 *     is the sender or the transporter on this booking.
 *   • Lite payload (status, route, dates only) — for everyone else.
 *
 * This lets recipients follow the progress without exposing PII.
 */
export async function GET(req: NextRequest) {
  // Public unauthenticated endpoint — throttle aggressively so nobody can
  // enumerate booking_refs. 60 lookups / 5 min / IP is ~12 per minute,
  // well above any legitimate polling pattern from a single user but far
  // too slow to brute-force a random ref space.
  const limited = checkRateLimit(req, {
    bucket: "tracking-lookup",
    max: 60,
    windowMs: 5 * 60 * 1000,
  });
  if (limited) return limited;

  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const adminSb = adminClient;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error } = await (adminSb as any)
    .from("bookings")
    .select(`
      id, booking_ref, status, payment_status, total_amount,
      weight, content, recipient_name, sender_id, created_at, updated_at,
      accepted_at, in_transit_at, delivered_at,
      listing:listings(from_city, to_city, departure_date, user_id)
    `)
    .ilike("booking_ref", ref.trim())
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Identify caller — is this the sender or the transporter?
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();

  const transporterId = booking.listing?.user_id ?? null;
  const isPrivileged =
    !!user &&
    (user.id === booking.sender_id || user.id === transporterId);

  // Transporter profile (always returned — public-safe info only)
  let transporter = null;
  if (transporterId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: p } = await (adminSb as any)
      .from("profiles")
      .select("first_name, last_name, rating, review_count, kyc_status")
      .eq("id", transporterId)
      .single();
    transporter = p;
  }

  // Lite payload — always safe to return. Never includes prices, names,
  // content, or recipient. Enough for anyone holding the ref to see status.
  const lite = {
    booking_ref: booking.booking_ref,
    status: booking.status,
    payment_status: booking.payment_status,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    accepted_at: booking.accepted_at ?? null,
    in_transit_at: booking.in_transit_at ?? null,
    delivered_at: booking.delivered_at ?? null,
    from_city: booking.listing?.from_city ?? "",
    to_city: booking.listing?.to_city ?? "",
    departure_date: booking.listing?.departure_date ?? "",
    transporter: transporter ? {
      // First name only for strangers — last name is PII
      name: transporter.first_name ?? "",
      rating: transporter.rating,
      review_count: transporter.review_count,
      verified: transporter.kyc_status === "approved",
    } : null,
  };

  if (!isPrivileged) {
    return NextResponse.json(lite);
  }

  // Full payload — only sender/transporter get the sensitive fields.
  return NextResponse.json({
    ...lite,
    total_amount: booking.total_amount,
    weight: booking.weight,
    content: booking.content,
    recipient_name: booking.recipient_name,
    transporter: transporter ? {
      name: `${transporter.first_name ?? ""} ${transporter.last_name ?? ""}`.trim(),
      rating: transporter.rating,
      review_count: transporter.review_count,
      verified: transporter.kyc_status === "approved",
    } : null,
  });
}
