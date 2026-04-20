import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { computeBookingPrice, priceMatches } from "@/lib/pricing";

const CHARGILY_BASE =
  process.env.CHARGILY_MODE === "live"
    ? "https://pay.chargily.net/api/v2"
    : "https://pay.chargily.net/test/api/v2";

/**
 * Server-side recomputation guard:
 *   We fetch the listing (price_per_kg, is_international) + platform commission,
 *   run the canonical pricing formula, and compare with the stored
 *   booking.total_amount. If they diverge beyond tolerance, we refuse to
 *   create a Chargily checkout and log the drift. The amount sent to
 *   Chargily is always the recomputed canonical one, never the stored value.
 */
async function getCommissionRate(): Promise<number> {
  const { data } = await adminSupabase
    .from("platform_settings")
    .select("value")
    .eq("key", "commission")
    .single();
  const pct = data?.value ? parseFloat(data.value as string) : 10;
  if (!Number.isFinite(pct)) return 0.10;
  // `commission` is stored as a percentage (e.g. "10")
  return Math.min(Math.max(pct / 100, 0), 1);
}

export async function POST(req: NextRequest) {
  try {
    // Max 15 payment creations per IP per 15 minutes — enough to let users
    // retry failed payments, tight enough to stop card-testing abuse.
    const limited = checkRateLimit(req, {
      bucket: "payment-create",
      max: 15,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

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

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ensure requester owns this booking
    if (booking.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Server-side amount verification ────────────────────────────────────
    // Never trust booking.total_amount blindly — recompute from immutable
    // inputs and compare. If drift > tolerance, abort and alert.
    const { data: listing, error: listingError } = await adminSupabase
      .from("listings")
      .select("price_per_kg, is_international")
      .eq("id", booking.listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const commissionRate = await getCommissionRate();
    let expected;
    try {
      expected = computeBookingPrice({
        pricePerKg: Number(listing.price_per_kg),
        weightKg: Number(booking.weight),
        commissionRate,
        isInternational: !!listing.is_international,
      });
    } catch (err) {
      console.error("Pricing input invalid for booking", bookingId, err);
      return NextResponse.json({ error: "Invalid booking inputs" }, { status: 400 });
    }

    const stored = Number(booking.total_amount);
    const bookingCurrency = listing.is_international ? "eur" : "dzd";
    if (!priceMatches(expected.total, stored, { currency: bookingCurrency })) {
      // Log and refuse. Either the client has drifted from the canonical
      // formula, or someone has tampered with total_amount in the DB.
      console.error(
        "Booking amount drift",
        { bookingId, expected: expected.total, stored, currency: bookingCurrency }
      );
      return NextResponse.json(
        { error: "Le montant à payer ne correspond pas au tarif en vigueur. Contactez le support." },
        { status: 409 }
      );
    }

    // Chargily supports DZD only — the `/api/v2/checkouts` endpoint does
    // not accept EUR. International bookings (EUR-priced) must be handled
    // by a different provider (Stripe wiring is TBD). Rather than send a
    // euro amount labelled as DZD and silently overcharge the shipper,
    // refuse the payment with a clear message.
    if (listing.is_international) {
      return NextResponse.json(
        {
          error:
            "Les paiements pour les envois internationaux ne sont pas encore disponibles en ligne. Contactez le support pour finaliser votre réservation.",
        },
        { status: 501 }
      );
    }

    // Always charge the canonical amount (ignore the stored number entirely).
    const amountToCharge = expected.total;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Create Chargily checkout (no payment_method — Chargily shows edahabia/CIB at their page)
    const chargilyRes = await fetch(`${CHARGILY_BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHARGILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountToCharge,
        currency: "dzd",
        success_url: `${appUrl}/paiement/succes?booking=${bookingId}`,
        failure_url: `${appUrl}/paiement/echec?booking=${bookingId}`,
        webhook_endpoint: `${appUrl}/api/payment/webhook`,
        description: `Waselli - Réservation ${booking.booking_ref}`,
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

    // Store checkout_id in payments table — if this fails we can't attach
    // the webhook later, so abort before sending the user to Chargily.
    const { error: paymentInsertErr } = await adminSupabase.from("payments").insert({
      booking_id: bookingId,
      user_id: booking.sender_id,
      amount: amountToCharge,
      provider: "chargily",
      provider_ref: checkout.id,
      status: "pending",
    });
    if (paymentInsertErr) {
      console.error("Payments insert error:", paymentInsertErr);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du paiement." },
        { status: 500 }
      );
    }

    // Flag the booking as pending-payment. Non-fatal if it fails — the
    // webhook will still reconcile from the payments row. Log and move on.
    const { error: bookingUpdateErr } = await adminSupabase
      .from("bookings")
      .update({ payment_status: "pending" })
      .eq("id", bookingId);
    if (bookingUpdateErr) {
      console.error("Booking payment_status update failed (non-fatal):", bookingUpdateErr);
    }

    return NextResponse.json({ checkout_url: checkout.checkout_url });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
