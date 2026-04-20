import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrRes = await requireAction("courier_applications.review");
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const session = sessionOrRes;

  const { id } = await params;
  const body = await request.json();
  const { status, admin_note } = body; // "approved" | "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status invalide" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("courier_applications")
    .update({ status, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });

  await logAdminAction({
    session,
    req: request,
    action: status === "approved" ? "courier_application.approve" : "courier_application.reject",
    targetType: "courier_application",
    targetId: id,
    metadata: { admin_note: admin_note ?? null },
  });

  return NextResponse.json(data);
}
