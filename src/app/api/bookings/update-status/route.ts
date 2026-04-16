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

  // Validate status transition
  const currentStatus: string = booking.status;
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending:    ["accepted", "rejected", "cancelled"],
    accepted:   ["in_transit", "cancelled"],
    in_transit: ["delivered", "cancelled"],
    delivered:  ["cancelled"],
    rejected:   ["cancelled"],
    cancelled:  [],
  };
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status transition: cannot move from '${currentStatus}' to '${status}'` },
      { status: 400 }
    );
  }
  // Only the sender can cancel
  if (status === "cancelled" && !isSender) {
    return NextResponse.json({ error: "Only the sender can cancel a booking" }, { status: 403 });
  }

  // Update booking status + timestamp for this specific status
  const now = new Date().toISOString();
  const timestampField: Record<string, string> = {
    accepted:   "accepted_at",
    in_transit: "in_transit_at",
    delivered:  "delivered_at",
  };
  const updatePayload: Record<string, string> = { status };
  if (timestampField[status]) updatePayload[timestampField[status]] = now;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("bookings").update(updatePayload).eq("id", bookingId);

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

  // ── Email notifications per status ──────────────────────────────────
  try {
    const { adminClient: adminSb } = await import("@/lib/supabase/admin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.waselli.com";

    // Helper to get email + first_name for a user id
    async function getUserInfo(userId: string) {
      const { data: auth } = await adminSb.auth.admin.getUserById(userId);
      const { data: profile } = await (supabase as any).from("profiles").select("first_name, last_name").eq("id", userId).single();
      return { email: auth?.user?.email ?? null, firstName: profile?.first_name ?? "Utilisateur", lastName: profile?.last_name ?? "" };
    }

    const fromCity = booking.listing?.from_city ?? "";
    const toCity   = booking.listing?.to_city   ?? "";
    const ref      = booking.booking_ref;

    if (status === "accepted") {
      // Email to sender: your booking was accepted
      const sender = await getUserInfo(booking.sender_id);
      const transporter = await getUserInfo(booking.listing?.user_id);
      if (sender.email) {
        const { sendBookingAcceptedToSenderEmail } = await import("@/lib/email");
        await sendBookingAcceptedToSenderEmail(sender.email, {
          senderName: sender.firstName,
          bookingRef: ref,
          fromCity,
          toCity,
          transporterName: transporter.firstName,
        }).catch(() => {});
      }
    }

    if (status === "in_transit") {
      // Email to sender: your package is on the way
      const sender = await getUserInfo(booking.sender_id);
      if (sender.email) {
        const { sendBookingInTransitEmail } = await import("@/lib/email");
        await sendBookingInTransitEmail(sender.email, {
          senderName: sender.firstName,
          bookingRef: ref,
          fromCity,
          toCity,
        }).catch(() => {});
      }
    }

    if (status === "delivered") {
      // Email to sender: confirm reception
      const sender = await getUserInfo(booking.sender_id);
      if (sender.email) {
        const { sendDeliveryConfirmedEmail } = await import("@/lib/email");
        await sendDeliveryConfirmedEmail(sender.email, {
          firstName: sender.firstName,
          bookingRef: ref,
        }).catch(() => {});
      }
    }
  } catch { /* emails are non-critical */ }

  return NextResponse.json({ ok: true });
}
