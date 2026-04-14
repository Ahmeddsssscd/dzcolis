import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, status } = await req.json();
  if (!bookingId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Get the booking + listing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking } = await (supabase as any)
    .from("bookings")
    .select("*, listing:listings(user_id, from_city, to_city)")
    .eq("id", bookingId)
    .single();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify user is either sender or listing owner
  const isTransporter = booking.listing?.user_id === user.id;
  const isSender = booking.sender_id === user.id;
  if (!isTransporter && !isSender) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Update booking status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("bookings").update({ status }).eq("id", bookingId);

  // Send notification to the OTHER party
  const route = `${booking.listing?.from_city ?? ""} → ${booking.listing?.to_city ?? ""}`;
  const ref = booking.booking_ref;

  const notifMap: Record<string, { user_id: string; type: string; title: string; message: string }> = {
    accepted:   { user_id: booking.sender_id,          type: "booking_accepted",   title: "Réservation acceptée ✅",  message: `Votre réservation ${ref} (${route}) a été acceptée par le transporteur.` },
    cancelled:  { user_id: isTransporter ? booking.sender_id : booking.listing?.user_id ?? "", type: "booking_cancelled",  title: "Réservation annulée",     message: `La réservation ${ref} (${route}) a été annulée.` },
    in_transit: { user_id: booking.sender_id,          type: "booking_in_transit", title: "Colis en route 🚗",        message: `Votre colis (${ref}) est en route sur le trajet ${route} !` },
    delivered:  { user_id: booking.sender_id,          type: "booking_delivered",  title: "Colis livré 📦",           message: `Votre colis (${ref}) a été livré. Confirmez la réception.` },
  };

  const notif = notifMap[status];
  if (notif && notif.user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("notifications").insert({
      user_id: notif.user_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: false,
      data: { booking_id: bookingId, booking_ref: ref },
    });
  }

  return NextResponse.json({ ok: true });
}
