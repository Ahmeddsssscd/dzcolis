import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";

// Stripe requires the raw request body for signature verification.
// Next.js App Router: disable body parsing by reading arrayBuffer directly.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripeSecretKey    = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret      = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Stripe env vars not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe    = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" });
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    const rawBody = Buffer.from(await req.arrayBuffer());
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session   = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const bookingRef = session.metadata?.bookingRef;

      if (!bookingId) {
        console.error("No bookingId in Stripe session metadata");
        return NextResponse.json({ received: true });
      }

      // Idempotency check
      const { data: existingPayment } = await adminSupabase
        .from("payments")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider", "stripe")
        .single();

      if (existingPayment?.status === "paid") {
        return NextResponse.json({ received: true });
      }

      const paymentIntentId = typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? session.id;

      // Update payment record
      await adminSupabase
        .from("payments")
        .update({
          status:       "paid",
          paid_at:      new Date().toISOString(),
          provider_ref: paymentIntentId,
        })
        .eq("booking_id", bookingId)
        .eq("provider", "stripe");

      // Update booking status
      await adminSupabase
        .from("bookings")
        .update({ payment_status: "paid", status: "accepted" })
        .eq("id", bookingId);

      // Notify sender
      const { data: booking } = await adminSupabase
        .from("bookings")
        .select("sender_id, booking_ref")
        .eq("id", bookingId)
        .single();

      if (booking) {
        await adminSupabase.from("notifications").insert({
          user_id: booking.sender_id,
          type:    "payment_confirmed",
          title:   "Paiement confirmé",
          message: `Votre paiement pour la réservation ${booking.booking_ref ?? bookingRef} a été confirmé. Le transporteur a été notifié.`,
          read:    false,
        });

        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("first_name")
          .eq("id", booking.sender_id)
          .single();

        const { data: authUser } = await adminSupabase.auth.admin.getUserById(booking.sender_id);

        if (authUser.user?.email && profile) {
          await sendPaymentConfirmedEmail(authUser.user.email, {
            firstName:  profile.first_name,
            bookingRef: booking.booking_ref ?? bookingRef ?? "",
            amount:     Number(session.amount_total ?? 0) / 100,
          }).catch(console.error);
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session   = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await adminSupabase
          .from("payments")
          .update({ status: "failed" })
          .eq("booking_id", bookingId)
          .eq("provider", "stripe");

        await adminSupabase
          .from("bookings")
          .update({ payment_status: "unpaid" })
          .eq("id", bookingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
