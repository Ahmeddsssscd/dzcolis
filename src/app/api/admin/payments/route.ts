import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const sessionOrRes = await requireAction("payments.refund");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();

    const { error } = await adminSupabase.from("payments").update(updates).eq("id", id);
    if (error) throw error;

    const { data: payment } = await adminSupabase
      .from("payments")
      .select("booking_id")
      .eq("id", id)
      .single();

    if (payment?.booking_id) {
      const bookingPaymentStatus =
        status === "paid" ? "paid" : status === "refunded" ? "refunded" : "pending";
      await adminSupabase
        .from("bookings")
        .update({ payment_status: bookingPaymentStatus })
        .eq("id", payment.booking_id);
    }

    await logAdminAction({
      session,
      req,
      action: status === "refunded" ? "payment.refund" : "payment.update",
      targetType: "payment",
      targetId: id,
      metadata: { status },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Payments PATCH error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET() {
  const sessionOrRes = await requireAction("payments.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  try {
    const { data, error } = await adminSupabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Payments API error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
