import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import crypto from "crypto";

// Skrill Quick Checkout — https://www.skrill.com/en/business/payment-gateway/
// Flow:
//  1. POST params to https://pay.skrill.com → get back a SID
//  2. Redirect user to https://pay.skrill.com/?sid={SID}

const SKRILL_GATEWAY = "https://pay.skrill.com";

// Map our internal method IDs to Skrill payment_method values
const SKRILL_METHOD_MAP: Record<string, string | undefined> = {
  skrill_card:   "ACC",    // Visa / Mastercard via Skrill
  skrill_wallet: "SWL",    // Skrill Wallet
  skrill_paypal: "PAL",    // PayPal via Skrill
};

export async function POST(req: NextRequest) {
  try {
    const { bookingId, paymentMethod } = await req.json();

    if (!bookingId || !paymentMethod) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const merchantEmail = process.env.SKRILL_MERCHANT_EMAIL;
    const secretKey     = process.env.SKRILL_SECRET_KEY;

    if (!merchantEmail || !secretKey) {
      console.error("Skrill env vars not configured");
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const skrillMethod = SKRILL_METHOD_MAP[paymentMethod];

    // Build Skrill Quick Checkout params
    const params = new URLSearchParams({
      pay_to_email:      merchantEmail,
      amount:            booking.total_amount.toString(),
      currency:          "EUR",
      language:          "FR",
      return_url:        `${appUrl}/paiement/succes?booking=${bookingId}`,
      cancel_url:        `${appUrl}/paiement/echec?booking=${bookingId}`,
      status_url:        `${appUrl}/api/payment/skrill/webhook`,
      merchant_fields:   "booking_id,booking_ref",
      booking_id:        bookingId,
      booking_ref:       booking.booking_ref ?? "",
      detail1_description: "DZColis",
      detail1_text:      `Réservation ${booking.booking_ref}`,
      ...(skrillMethod ? { payment_methods: skrillMethod } : {}),
    });

    // Step 1: POST to Skrill to obtain a SID
    const skrillRes = await fetch(SKRILL_GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!skrillRes.ok) {
      const errText = await skrillRes.text();
      console.error("Skrill SID error:", errText);
      return NextResponse.json({ error: "Payment provider error", details: errText }, { status: 502 });
    }

    const sid = await skrillRes.text();

    if (!sid || sid.includes("ERROR")) {
      console.error("Skrill returned error SID:", sid);
      return NextResponse.json({ error: "Skrill session error", details: sid }, { status: 502 });
    }

    // Store pending payment record
    await adminSupabase.from("payments").insert({
      booking_id:   bookingId,
      user_id:      booking.sender_id,
      amount:       booking.total_amount,
      provider:     "skrill",
      provider_ref: sid.trim(),
      status:       "pending",
    });

    // Mark booking payment as pending
    await adminSupabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", bookingId);

    // Step 2: Return redirect URL — client redirects to Skrill hosted page
    const checkout_url = `${SKRILL_GATEWAY}/?sid=${encodeURIComponent(sid.trim())}`;

    return NextResponse.json({ checkout_url });
  } catch (err) {
    console.error("Skrill payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
