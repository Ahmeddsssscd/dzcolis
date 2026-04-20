import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { checkAdminCookie } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { error } = await adminSupabase.from("payments").update(updates).eq("id", id);
    if (error) throw error;
    const { data: payment } = await adminSupabase.from("payments").select("booking_id").eq("id", id).single();
    if (payment?.booking_id) {
      const bookingPaymentStatus = status === "paid" ? "paid" : status === "refunded" ? "refunded" : "pending";
      await adminSupabase.from("bookings").update({ payment_status: bookingPaymentStatus }).eq("id", payment.booking_id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Payments PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await adminSupabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Payments API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
