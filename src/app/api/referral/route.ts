import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// GET /api/referral  → referral stats for current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminSb = adminClient;

  // Get current user's referral code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (adminSb as any)
    .from("profiles")
    .select("referral_code, wallet_balance")
    .eq("id", user.id)
    .single();

  if (!profile?.referral_code) return NextResponse.json({ referrals: [], earned: 0, wallet: 0 });

  // Find all users who were referred by this user's code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: referred } = await (adminSb as any)
    .from("profiles")
    .select("id, first_name, last_name, created_at")
    .eq("referred_by", profile.referral_code);

  if (!referred || referred.length === 0) {
    return NextResponse.json({ referrals: [], earned: 0, wallet: profile.wallet_balance ?? 0 });
  }

  // For each referred user, check if they have at least one delivered booking
  const referredIds = referred.map((r: { id: string }) => r.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deliveredBookings } = await (adminSb as any)
    .from("bookings")
    .select("sender_id")
    .in("sender_id", referredIds)
    .eq("status", "delivered");

  const usersWithDelivery = new Set((deliveredBookings ?? []).map((b: { sender_id: string }) => b.sender_id));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const referrals = referred.map((r: any) => ({
    id: r.id,
    name: `${r.first_name} ${r.last_name}`.trim(),
    created_at: r.created_at,
    completed: usersWithDelivery.has(r.id),
  }));

  const earned = referrals.filter((r: { completed: boolean }) => r.completed).length * 500;

  return NextResponse.json({
    referrals,
    earned,
    wallet: profile.wallet_balance ?? 0,
  });
}
