import { NextRequest, NextResponse } from "next/server";
import { adminClient as adminSb } from "@/lib/supabase/admin";
import { sendNewBookingToTransporterEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking } = await (adminSb as any)
      .from("bookings")
      .select("*, listing:listings(user_id, from_city, to_city)")
      .eq("id", bookingId)
      .single();

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const transporterId = booking.listing?.user_id;
    if (!transporterId) return NextResponse.json({ ok: true });

    // Get transporter email + name
    const { data: transporterAuth } = await adminSb.auth.admin.getUserById(transporterId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transporterProfile } = await (adminSb as any)
      .from("profiles")
      .select("first_name")
      .eq("id", transporterId)
      .single();

    // Get sender name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: senderProfile } = await (adminSb as any)
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", booking.sender_id)
      .single();

    const transporterEmail = transporterAuth?.user?.email;
    if (!transporterEmail) return NextResponse.json({ ok: true });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.waselli.com";

    await sendNewBookingToTransporterEmail(transporterEmail, {
      transporterName: transporterProfile?.first_name ?? "Transporteur",
      senderName: `${senderProfile?.first_name ?? ""} ${senderProfile?.last_name?.[0] ?? ""}.`.trim(),
      bookingRef: booking.booking_ref,
      fromCity: booking.listing?.from_city ?? "",
      toCity: booking.listing?.to_city ?? "",
      weight: booking.weight,
      content: booking.content,
      totalAmount: booking.total_amount,
      dashboardUrl: `${appUrl}/tableau-de-bord`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("New booking email error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
