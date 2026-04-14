import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      usersRes,
      listingsRes,
      bookingsRes,
      paymentsRes,
      kycRes,
      recentBookingsRes,
    ] = await Promise.all([
      adminSupabase.from("profiles").select("id", { count: "exact", head: true }),
      adminSupabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      adminSupabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "accepted", "in_transit"]),
      adminSupabase
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .gte("paid_at", startOfMonth),
      adminSupabase
        .from("kyc_documents")
        .select("id", { count: "exact", head: true })
        .eq("status", "submitted"),
      adminSupabase
        .from("bookings")
        .select("id, booking_ref, sender_id, listing_id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const monthly_revenue = (paymentsRes.data ?? []).reduce(
      (sum: number, p: { amount: number }) => sum + (p.amount ?? 0),
      0
    );

    return NextResponse.json({
      total_users: usersRes.count ?? 0,
      active_listings: listingsRes.count ?? 0,
      ongoing_bookings: bookingsRes.count ?? 0,
      monthly_revenue,
      kyc_pending: kycRes.count ?? 0,
      recent_bookings: recentBookingsRes.data ?? [],
    });
  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
