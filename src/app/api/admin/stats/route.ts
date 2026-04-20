import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { checkAdminCookie } from "@/lib/admin-auth";

export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Build 7-day date range
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      usersRes,
      listingsRes,
      bookingsRes,
      paymentsRes,
      kycRes,
      recentBookingsRes,
      recentUsersRes,
      weeklyPaymentsRes,
      newTodayRes,
      newWeekRes,
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
      // Recent signups (last 5 users)
      adminSupabase
        .from("profiles")
        .select("id, first_name, last_name, wilaya, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      // 7-day payments for chart
      adminSupabase
        .from("payments")
        .select("amount, paid_at")
        .eq("status", "paid")
        .gte("paid_at", sevenDaysAgo.toISOString()),
      // New users today
      adminSupabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()),
      // New users this week
      adminSupabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString()),
    ]);

    const monthly_revenue = (paymentsRes.data ?? []).reduce(
      (sum: number, p: { amount: number }) => sum + (p.amount ?? 0),
      0
    );

    // Build daily revenue chart data
    const dailyMap: Record<string, number> = {};
    for (const day of days) dailyMap[day] = 0;
    for (const p of weeklyPaymentsRes.data ?? []) {
      const day = (p.paid_at as string).slice(0, 10);
      if (day in dailyMap) dailyMap[day] += p.amount ?? 0;
    }
    const revenue_chart = days.map((day) => ({
      date: day,
      amount: dailyMap[day],
      label: new Date(day).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    }));

    return NextResponse.json({
      total_users: usersRes.count ?? 0,
      active_listings: listingsRes.count ?? 0,
      ongoing_bookings: bookingsRes.count ?? 0,
      monthly_revenue,
      kyc_pending: kycRes.count ?? 0,
      recent_bookings: recentBookingsRes.data ?? [],
      recent_users: recentUsersRes.data ?? [],
      revenue_chart,
      new_users_today: newTodayRes.count ?? 0,
      new_users_week: newWeekRes.count ?? 0,
    });
  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
