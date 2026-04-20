import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const sessionOrRes = await requireAction("dashboard.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

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

    // Threshold above which a booking is considered "notable" on the feed.
    // Tuned to the median Yalidine parcel (~1000-3000 DA) plus our insurance
    // tiers: anything above 30k DA carries enough value to be worth the
    // admin's attention before it ships.
    const HIGH_VALUE_THRESHOLD = 30000;

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
      kycSubmittedRes,
      cancelledBookingsRes,
      refundedPaymentsRes,
      highValueBookingsRes,
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
      // ─── Notable-events feed (past 7 days) ───
      // KYC submissions waiting for review
      adminSupabase
        .from("kyc_documents")
        .select("id, user_id, submitted_at, status")
        .eq("status", "submitted")
        .gte("submitted_at", sevenDaysAgo.toISOString())
        .order("submitted_at", { ascending: false })
        .limit(10),
      // Cancelled bookings (potential disputes)
      adminSupabase
        .from("bookings")
        .select("id, booking_ref, total_amount, updated_at")
        .eq("status", "cancelled")
        .gte("updated_at", sevenDaysAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(10),
      // Refunded payments
      adminSupabase
        .from("payments")
        .select("id, booking_id, amount, updated_at")
        .eq("status", "refunded")
        .gte("updated_at", sevenDaysAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(10),
      // High-value bookings
      adminSupabase
        .from("bookings")
        .select("id, booking_ref, total_amount, created_at")
        .gte("total_amount", HIGH_VALUE_THRESHOLD)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
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

    // ─── Merge notable events into a single feed ───────────────────
    // Each event carries the minimal shape the UI needs: a severity
    // bucket (so the dashboard can color-code), a short label, a link
    // target for one-click triage, and the ISO timestamp we sort by.
    type NotableEvent = {
      id: string;
      type: "kyc" | "dispute" | "refund" | "high_value";
      severity: "info" | "warning" | "danger";
      title: string;
      message: string;
      href: string;
      at: string;
    };
    const events: NotableEvent[] = [];

    for (const k of kycSubmittedRes.data ?? []) {
      events.push({
        id: `kyc-${k.id}`,
        type: "kyc",
        severity: "warning",
        title: "KYC à vérifier",
        message: "Un utilisateur a soumis ses pièces d'identité.",
        href: "/admin/kyc",
        at: k.submitted_at as string,
      });
    }
    for (const b of cancelledBookingsRes.data ?? []) {
      events.push({
        id: `cancel-${b.id}`,
        type: "dispute",
        severity: "danger",
        title: "Expédition annulée",
        message: `Réf. ${b.booking_ref ?? b.id} — ${Number(b.total_amount ?? 0).toLocaleString("fr-FR")} DA`,
        href: "/admin/expeditions",
        at: b.updated_at as string,
      });
    }
    for (const p of refundedPaymentsRes.data ?? []) {
      events.push({
        id: `refund-${p.id}`,
        type: "refund",
        severity: "warning",
        title: "Paiement remboursé",
        message: `${Number(p.amount ?? 0).toLocaleString("fr-FR")} DA rendus à l'expéditeur.`,
        href: "/admin/paiements",
        at: p.updated_at as string,
      });
    }
    for (const b of highValueBookingsRes.data ?? []) {
      events.push({
        id: `high-${b.id}`,
        type: "high_value",
        severity: "info",
        title: "Colis de forte valeur",
        message: `Réf. ${b.booking_ref ?? b.id} — ${Number(b.total_amount ?? 0).toLocaleString("fr-FR")} DA`,
        href: "/admin/expeditions",
        at: b.created_at as string,
      });
    }
    // Newest first, capped so the card stays scannable.
    events.sort((a, b) => (a.at < b.at ? 1 : -1));
    const notable_events = events.slice(0, 12);

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
      notable_events,
    });
  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
