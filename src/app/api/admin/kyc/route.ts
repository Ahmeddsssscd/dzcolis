import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { checkAdminCookie } from "@/lib/admin-auth";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "@/lib/email";

// GET — list all pending KYC submissions
export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await adminSupabase
    .from("kyc_documents")
    .select("*, profiles!kyc_documents_user_id_fkey(first_name, last_name, phone, wilaya, kyc_status)")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — approve or reject a user's KYC
export async function POST(req: NextRequest) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, action } = await req.json(); // action: "approve" | "reject"

  if (!userId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";
  const kycStatus = action === "approve" ? "approved" : "rejected";

  // Update kyc_documents record for this user
  await adminSupabase.from("kyc_documents").update({ status: newStatus, reviewed_at: new Date().toISOString() }).eq("user_id", userId);

  // Update profile kyc_status
  await adminSupabase.from("profiles").update({ kyc_status: kycStatus }).eq("id", userId);

  // Send notification to user
  const notifTitle = action === "approve" ? "Identité vérifiée !" : "Documents refusés";
  const notifBody  = action === "approve"
    ? "Votre identité a été vérifiée avec succès. Vous pouvez maintenant proposer des trajets."
    : "Vos documents n'ont pas pu être validés. Veuillez soumettre de nouveaux documents clairs.";

  await adminSupabase.from("notifications").insert({
    user_id: userId,
    type: action === "approve" ? "kyc_approved" : "kyc_rejected",
    title: notifTitle,
    message: notifBody,
    read: false,
  });

  // Send email
  const { data: profile } = await adminSupabase.from("profiles").select("first_name").eq("id", userId).single();
  const { data: authUser } = await adminSupabase.auth.admin.getUserById(userId);
  if (authUser.user?.email && profile) {
    const emailFn = action === "approve" ? sendKycApprovedEmail : sendKycRejectedEmail;
    await emailFn(authUser.user.email, profile.first_name).catch(console.error);
  }

  return NextResponse.json({ success: true, newStatus });
}
