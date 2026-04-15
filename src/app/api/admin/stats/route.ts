import { NextResponse } from "next/server";
import { adminClient, adminSupabase } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await (adminClient as any).from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
