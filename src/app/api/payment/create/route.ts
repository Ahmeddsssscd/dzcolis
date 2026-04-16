import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CHARGILY_BASE =
  process.env.CHARGILY_MODE === "live"
    ? "https://pay.chargily.net/api/v2"
    : "https://pay.chargily.net/test/api/v2";

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, paymentMethod } = await req.json();

    if (!bookingId || !paymentMethod) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Fetch booking from DB
    const { data: booking, error: bookingError } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    // Ensure requester owns this booking
    if (booking && booking.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Create Chargily checkout (no payment_method — Chargily shows edahabia/CIB at their page)
    const chargilyRes = await fetch(`${CHARGILY_BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHARGILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: booking.total_amount,
        currency: "dzd",
        success_url: `${appUrl}/paiement/succes?booking=${bookingId}`,
        failure_url: `${appUrl}/paiement/echec?booking=${bookingId}`,
        webhook_endpoint: `${appUrl}/api/payment/webhook`,
        description: `DZColis - Réservation ${booking.booking_ref}`,
        locale: "fr",
        metadata: {
          booking_id: bookingId,
          booking_ref: booking.booking_ref,
        },
      }),
    });

    if (!chargilyRes.ok) {
      const errText = await chargilyRes.text();
      console.error("Chargily error:", errText);
      return NextResponse.json(
        { error: "Payment provider error", details: errText },
        { status: 502 }
      );
    }

    const checkout = await chargilyRes.json();

    // Store checkout_id in payments table
    await adminSupabase.from("payments").insert({
      booking_id: bookingId,
      user_id: booking.sender_id,
      amount: booking.total_amount,
      provider: "chargily",
      provider_ref: checkout.id,
      status: "pending",
    });

    // Update booking payment_status to pending
    await adminSupabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", bookingId);

    return NextResponse.json({ checkout_url: checkout.checkout_url });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
