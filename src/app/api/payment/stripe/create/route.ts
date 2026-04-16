import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Stripe Checkout — international payments (EUR)
// Flow:
//  1. Create a Stripe Checkout Session
//  2. Return the hosted checkout URL → client redirects there
//  3. On success Stripe calls our webhook to confirm payment

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, paymentMethod } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });

    // Fetch booking
    const { data: booking, error: bookingError } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ensure requester owns this booking
    if (booking.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Amount must be in cents (integer)
    const amountCents = Math.round(Number(booking.total_amount) * 100);

    if (amountCents < 50) {
      // Stripe minimum is 0.50 EUR
      return NextResponse.json({ error: "Amount too low for Stripe" }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      currency: "eur",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `DZColis — Réservation ${booking.booking_ref ?? bookingId}`,
              description: "Transport de colis international sécurisé",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/paiement/succes?booking=${bookingId}`,
      cancel_url: `${appUrl}/paiement/echec?booking=${bookingId}`,
      metadata: {
        bookingId: String(bookingId),
        bookingRef: String(booking.booking_ref ?? ""),
      },
    });

    // Store pending payment record
    await adminSupabase.from("payments").insert({
      booking_id:   bookingId,
      user_id:      booking.sender_id,
      amount:       booking.total_amount,
      provider:     "stripe",
      provider_ref: session.id,
      status:       "pending",
    });

    // Mark booking payment as pending
    await adminSupabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", bookingId);

    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    console.error("Stripe payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
