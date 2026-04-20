import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import crypto from "crypto";

// Chargily uses the API key as the HMAC secret for webhook signing.
// Set CHARGILY_WEBHOOK_SECRET in Vercel if they ever provide a separate secret.
const WEBHOOK_SECRET =
  process.env.CHARGILY_WEBHOOK_SECRET ?? process.env.CHARGILY_API_KEY ?? "";

function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const computed = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") ?? "";

    if (!WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === "checkout.paid") {
      const checkoutId = data.id;
      const bookingId  = data.metadata?.booking_id;

      if (!bookingId) {
        return NextResponse.json({ error: "No booking_id in metadata" }, { status: 400 });
      }

      // ── Idempotency: skip if this checkout was already processed ──
      const { data: existingPayment } = await adminSupabase
        .from("payments")
        .select("status")
        .eq("provider_ref", checkoutId)
        .maybeSingle();

      if (existingPayment?.status === "paid") {
        return NextResponse.json({ received: true, skipped: "already_processed" });
      }

      // Mark payment as paid
      await adminSupabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("provider_ref", checkoutId);

      // Update booking — guard with .eq("payment_status", "unpaid") to prevent double-update
      await adminSupabase
        .from("bookings")
        .update({ payment_status: "paid", status: "accepted" })
        .eq("id", bookingId)
        .eq("payment_status", "unpaid");

      // Notification + email
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

        // Notify the transporter too — payment succeeded means the booking
        // is "live", and they should move from prospect-mode to
        // ready-to-collect. We resolve their user_id via the listing so
        // the notifications table stays the single source of truth for
        // per-user alerts.
        const { data: bookingFull } = await adminSupabase
          .from("bookings")
          .select("listing_id")
          .eq("id", bookingId)
          .single();
        if (bookingFull?.listing_id) {
          const { data: listing } = await adminSupabase
            .from("listings")
            .select("user_id, from_city, to_city")
            .eq("id", bookingFull.listing_id)
            .single();
          if (listing?.user_id) {
            await adminSupabase.from("notifications").insert({
              user_id: listing.user_id,
              type: "booking_paid",
              title: "Réservation payée 💰",
              message: `La réservation ${booking.booking_ref} (${listing.from_city} → ${listing.to_city}) est payée. Préparez la collecte.`,
              read: false,
              data: { booking_id: bookingId, booking_ref: booking.booking_ref },
            });
          }
        }

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
        // Never downgrade a confirmed payment
        await adminSupabase
          .from("payments")
          .update({ status: "failed" })
          .eq("provider_ref", checkoutId)
          .neq("status", "paid");

        await adminSupabase
          .from("bookings")
          .update({ payment_status: "unpaid" })
          .eq("id", bookingId)
          .eq("payment_status", "unpaid");
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
