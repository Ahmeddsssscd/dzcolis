import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, payment_status } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    const { error } = await adminSupabase.from("bookings").update(updates).eq("id", id);
    if (error) throw error;
    // If refunded, also update payment record
    if (payment_status === "refunded") {
      await adminSupabase.from("payments").update({ status: "refunded" }).eq("booking_id", id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bookings PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: bookings, error } = await adminSupabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const allBookings = bookings ?? [];

    // Get unique sender_ids to fetch profiles
    const senderIds = [...new Set(allBookings.map((b: { sender_id: string }) => b.sender_id).filter(Boolean))];

    let profilesMap: Record<string, { first_name: string; last_name: string }> = {};
    if (senderIds.length > 0) {
      const { data: profiles } = await adminSupabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", senderIds);

      if (profiles) {
        profilesMap = Object.fromEntries(
          profiles.map((p: { id: string; first_name: string; last_name: string }) => [
            p.id,
            { first_name: p.first_name, last_name: p.last_name },
          ])
        );
      }
    }

    const enriched = allBookings.map((b: Record<string, unknown>) => ({
      ...b,
      sender_name: b.sender_id && profilesMap[b.sender_id as string]
        ? `${profilesMap[b.sender_id as string].first_name ?? ""} ${profilesMap[b.sender_id as string].last_name ?? ""}`.trim()
        : null,
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Bookings API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
