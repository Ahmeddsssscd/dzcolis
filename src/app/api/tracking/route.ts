import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const adminSb = createAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error } = await (adminSb as any)
    .from("bookings")
    .select(`
      id, booking_ref, status, payment_status, total_amount,
      weight, content, recipient_name, created_at, updated_at,
      listing:listings(from_city, to_city, departure_date, user_id)
    `)
    .ilike("booking_ref", ref.trim())
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Get transporter profile
  let transporter = null;
  if (booking.listing?.user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: p } = await (adminSb as any)
      .from("profiles")
      .select("first_name, last_name, rating, review_count, kyc_status")
      .eq("id", booking.listing.user_id)
      .single();
    transporter = p;
  }

  return NextResponse.json({
    booking_ref: booking.booking_ref,
    status: booking.status,
    payment_status: booking.payment_status,
    total_amount: booking.total_amount,
    weight: booking.weight,
    content: booking.content,
    recipient_name: booking.recipient_name,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    from_city: booking.listing?.from_city ?? "",
    to_city: booking.listing?.to_city ?? "",
    departure_date: booking.listing?.departure_date ?? "",
    transporter: transporter ? {
      name: `${transporter.first_name} ${transporter.last_name}`,
      rating: transporter.rating,
      review_count: transporter.review_count,
      verified: transporter.kyc_status === "approved",
    } : null,
  });
}
