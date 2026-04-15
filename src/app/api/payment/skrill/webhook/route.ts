import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import crypto from "crypto";

// Skrill IPN status codes
// 2  = processed (paid)
// -2 = failed
// -3 = chargeback

function verifySkrillSignature(params: URLSearchParams, secretKey: string): boolean {
  // Skrill MD5 signature: MD5(
  //   merchant_id + transaction_id + MD5(upper(secret_key)) + mb_amount + mb_currency + status
  // )
  const secretMd5 = crypto
    .createHash("md5")
    .update(secretKey.toUpperCase())
    .digest("hex");

  const raw = [
    params.get("merchant_id") ?? "",
    params.get("transaction_id") ?? "",
    secretMd5,
    params.get("mb_amount") ?? "",
    params.get("mb_currency") ?? "",
    params.get("status") ?? "",
  ].join("");

  const computed = crypto.createHash("md5").update(raw).digest("hex");
  const received = params.get("md5sig") ?? "";

  return computed.toUpperCase() === received.toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params  = new URLSearchParams(rawBody);

    const secretKey = process.env.SKRILL_SECRET_KEY ?? "";

    // Verify signature
    if (!secretKey) {
      console.error("SKRILL_SECRET_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    if (!verifySkrillSignature(params, secretKey)) {
      console.error("Invalid Skrill IPN signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const status    = parseInt(params.get("status") ?? "0", 10);
    const bookingId = params.get("booking_id");
    const bookingRef = params.get("booking_ref");
    const transactionId = params.get("transaction_id") ?? "";

    if (!bookingId) {
      return NextResponse.json({ error: "No booking_id in IPN" }, { status: 400 });
    }

    if (status === 2) {
      // Payment processed (paid)

      // Idempotency check
      const { data: existingPayment } = await adminSupabase
        .from("payments")
        .select("status")
        .eq("booking_id", bookingId)
        .eq("provider", "skrill")
        .single();

      if (existingPayment?.status === "paid") {
        return NextResponse.json({ received: true });
      }

      await adminSupabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString(), provider_ref: transactionId })
        .eq("booking_id", bookingId)
        .eq("provider", "skrill");

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
            amount:     parseFloat(params.get("mb_amount") ?? "0"),
          }).catch(console.error);
        }
      }
    } else if (status === -2 || status === -3) {
      // Failed or chargeback
      await adminSupabase
        .from("payments")
        .update({ status: "failed" })
        .eq("booking_id", bookingId)
        .eq("provider", "skrill");

      await adminSupabase
        .from("bookings")
        .update({ payment_status: "unpaid" })
        .eq("id", bookingId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Skrill webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
