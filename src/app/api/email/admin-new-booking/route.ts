import { NextRequest, NextResponse } from "next/server";
import { adminClient as adminSb } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateBookingProofPdf } from "@/lib/booking-pdf";
import { sendAdminNewBookingEmail } from "@/lib/email";
import { formatPhone } from "@/lib/phone";

/**
 * Fires the "new booking — here is your signable Bon de livraison PDF"
 * alert to the admin inbox. Called fire-and-forget from
 * `createBooking` on the client immediately after the booking row is
 * inserted.
 *
 * Auth model: the caller MUST be signed in (so anonymous traffic can't
 * spam PDF generation), but they do NOT have to own the booking — the
 * service-role client loads everything anyway, and admin notifications
 * are expected to fire on any booking. We still gate via auth to make
 * enumerating booking ids expensive.
 *
 * Node runtime is required — pdfkit depends on fs/path/zlib and its
 * AFM font files (bundled via outputFileTracingIncludes in next.config).
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();
    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Pull everything we'll need for the email body. The PDF generator
    // re-reads the DB too, but that's cheap and keeps generate-PDF a
    // self-contained helper. Over-fetching here is fine — this route
    // only runs once per booking.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking } = await (adminSb as any)
      .from("bookings")
      .select("*, listing:listings(user_id, from_city, to_city)")
      .eq("id", bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: senderProfile } = await (adminSb as any)
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", booking.sender_id)
      .single();

    const { data: senderAuth } = await adminSb.auth.admin.getUserById(booking.sender_id);

    let transporterName = "—";
    let transporterEmail = "—";
    if (booking.listing?.user_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tp } = await (adminSb as any)
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", booking.listing.user_id)
        .single();
      const { data: tAuth } = await adminSb.auth.admin.getUserById(booking.listing.user_id);
      transporterName = `${tp?.first_name ?? ""} ${tp?.last_name ?? ""}`.trim() || "—";
      transporterEmail = tAuth?.user?.email ?? "—";
    }

    const { buffer, bookingRef, filename } = await generateBookingProofPdf(bookingId);

    await sendAdminNewBookingEmail({
      bookingRef,
      fromCity: booking.listing?.from_city ?? "",
      toCity: booking.listing?.to_city ?? "",
      senderName: `${senderProfile?.first_name ?? ""} ${senderProfile?.last_name ?? ""}`.trim() || "—",
      senderEmail: senderAuth?.user?.email ?? "—",
      senderPhone: formatPhone(senderProfile?.phone) || "—",
      transporterName,
      transporterEmail,
      content: booking.content ?? "—",
      weight: Number(booking.weight ?? 0),
      totalAmount: Number(booking.total_amount ?? 0),
      recipientName: booking.recipient_name ?? "—",
      recipientPhone: booking.recipient_phone ?? "—",
      pdfBuffer: buffer,
      pdfFilename: filename,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Never throw back to the client — this is a fire-and-forget side
    // effect of booking creation. Log for ops and return a benign 500.
    console.error("admin-new-booking email error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
