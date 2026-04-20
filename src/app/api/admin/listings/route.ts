import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  const sessionOrRes = await requireAction("listings.view");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  try {
    const { data, error } = await adminSupabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Listings API error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const sessionOrRes = await requireAction("listings.moderate");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("listings")
      .update({ status })
      .eq("id", id);
    if (error) throw error;

    await logAdminAction({
      session,
      req: request,
      action: "listing.moderate",
      targetType: "listing",
      targetId: id,
      metadata: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Listings PATCH error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
