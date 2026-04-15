import { NextRequest, NextResponse } from "next/server";
import { adminClient, adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await (adminClient as any).from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { error } = await adminSupabase.from("payments").update(updates).eq("id", id);
    if (error) throw error;
    // Sync booking payment_status
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await (adminClient as any).from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
