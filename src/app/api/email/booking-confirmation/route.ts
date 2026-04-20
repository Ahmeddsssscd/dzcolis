import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Auth check — must be a logged-in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingRef } = await req.json();
    if (!bookingRef) return NextResponse.json({ error: "Missing bookingRef" }, { status: 400 });

    // Fetch the booking — only allow if the authenticated user is the sender
    const { data: booking, error } = await adminSupabase
      .from("bookings")
      .select("id, booking_ref, sender_id, from_city, to_city, departure_date, total_amount, listings(from_city, to_city, departure_date)")
      .eq("booking_ref", bookingRef)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ownership check — only the sender can request their own confirmation email
    if (booking.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch recipient email and name from auth — never from the request body
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id);
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single();

    const to = authUser.user?.email;
    if (!to) return NextResponse.json({ error: "No email on file" }, { status: 400 });

    await sendBookingConfirmationEmail(to, {
      firstName: profile?.first_name ?? "",
      bookingRef: booking.booking_ref,
      fromCity: booking.from_city ?? "",
      toCity: booking.to_city ?? "",
      departureDate: booking.departure_date ?? "",
      totalAmount: booking.total_amount ?? 0,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
