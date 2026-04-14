import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import crypto from "crypto";

// Verify Chargily webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") ?? "";
    const apiKey = process.env.CHARGILY_API_KEY ?? "";

    // Verify webhook authenticity
    if (signature && apiKey) {
      const isValid = verifySignature(rawBody, signature, apiKey);
      if (!isValid) {
        console.error("Invalid Chargily webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === "checkout.paid") {
      const checkoutId = data.id;
      const bookingId  = data.metadata?.booking_id;

      if (!bookingId) {
        return NextResponse.json({ error: "No booking_id in metadata" }, { status: 400 });
      }

      // Update payment record
      await adminSupabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("provider_ref", checkoutId);

      // Update booking payment_status
      await adminSupabase
        .from("bookings")
        .update({ payment_status: "paid", status: "accepted" })
        .eq("id", bookingId);

      // Create notification for sender
      const { data: booking } = await adminSupabase
        .from("bookings")
        .select("sender_id, booking_ref")
        .eq("id", bookingId)
        .single();

      if (booking) {
        await adminSupabase.from("notifications").insert({
          user_id: booking.sender_id,
          type: "payment_confirmed",
          title: "Paiement confirmé",
          message: `Votre paiement pour la réservation ${booking.booking_ref} a été confirmé. Le transporteur a été notifié.`,
          read: false,
        });

        // Send email notification
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("first_name")
          .eq("id", booking.sender_id)
          .single();
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(booking.sender_id);
        if (authUser.user?.email && profile) {
          await sendPaymentConfirmedEmail(authUser.user.email, {
            firstName: profile.first_name,
            bookingRef: booking.booking_ref,
            amount: data.amount ?? 0,
          }).catch(console.error);
        }
      }
    }

    if (type === "checkout.failed") {
      const checkoutId = data.id;
      const bookingId  = data.metadata?.booking_id;

      if (bookingId) {
        await adminSupabase
          .from("payments")
          .update({ status: "failed" })
          .eq("provider_ref", checkoutId);

        await adminSupabase
          .from("bookings")
          .update({ payment_status: "unpaid" })
          .eq("id", bookingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
