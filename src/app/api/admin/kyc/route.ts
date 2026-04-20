import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { checkAdminCookie } from "@/lib/admin-auth";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// This route uses Node built-ins transitively (`checkAdminCookie` verifies
// an HMAC with `node:crypto`). Pin the runtime so it can't be silently
// promoted to edge, where Node crypto isn't available.
export const runtime = "nodejs";

/**
 * Admin KYC queue.
 *
 * Security:
 *  - admin-session cookie required
 *  - rate-limited (200 list calls / 15 min / IP) so a stolen admin token
 *    can't be used to enumerate the entire KYC queue in seconds
 *  - document URLs are signed with a 10-minute TTL — the admin panel can
 *    preview scans but the URLs can't be copied, shared, or archived
 *  - bucket itself is private (see migration 002) so no /public/ URL works
 *  - pagination caps the page at 50 records so one query can't dump the
 *    entire queue in a single response
 */

const KYC_BUCKET = "kyc-documents";
const SIGNED_URL_TTL = 10 * 60; // 10 minutes
const MAX_PAGE_SIZE = 50;

type KycRow = {
  user_id: string;
  cin_recto_url: string | null;
  cin_verso_url: string | null;
  selfie_url: string | null;
  [k: string]: unknown;
};

async function signPath(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await adminSupabase.storage
    .from(KYC_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}

// GET — list KYC submissions (paginated, with signed URLs)
export async function GET(req: NextRequest) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Even admin endpoints get rate-limited — if a token leaks, slow the bleed.
  const limited = checkRateLimit(req, {
    bucket: "admin-kyc-list",
    max: 200,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? MAX_PAGE_SIZE);
  const rawOffset = Number(url.searchParams.get("offset") ?? 0);
  const limit = Math.min(Math.max(1, isFinite(rawLimit) ? rawLimit : MAX_PAGE_SIZE), MAX_PAGE_SIZE);
  const offset = Math.max(0, isFinite(rawOffset) ? rawOffset : 0);

  const { data, error } = await adminSupabase
    .from("kyc_documents")
    .select(
      "*, profiles!kyc_documents_user_id_fkey(first_name, last_name, phone, wilaya, kyc_status)"
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace raw storage paths with short-lived signed URLs.
  const rows = (data ?? []) as KycRow[];
  const signed = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      cin_recto_url: await signPath(row.cin_recto_url),
      cin_verso_url: await signPath(row.cin_verso_url),
      selfie_url: await signPath(row.selfie_url),
    }))
  );

  return NextResponse.json(signed);
}

// POST — approve or reject a user's KYC
export async function POST(req: NextRequest) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const limited = checkRateLimit(req, {
    bucket: "admin-kyc-action",
    max: 120,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const { userId, action } = await req.json(); // action: "approve" | "reject"

  if (!userId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update kyc_documents record for this user. The `.select()` tail forces
  // PostgREST to return the affected rows so we can distinguish "write
  // failed with RLS/constraint error" (throws), "no rows matched"
  // (user scrubbed their submission), and "OK" (1+ rows updated).
  // Previously the errors were swallowed and the admin saw a green tick
  // even when nothing changed in the DB.
  const { data: kycUpdated, error: kycErr } = await adminSupabase
    .from("kyc_documents")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select("id");

  if (kycErr) {
    console.error("KYC update error:", kycErr);
    return NextResponse.json({ error: "Erreur mise à jour KYC" }, { status: 500 });
  }
  if (!kycUpdated || kycUpdated.length === 0) {
    return NextResponse.json({ error: "Aucun dossier KYC trouvé pour cet utilisateur." }, { status: 404 });
  }

  // Update profile kyc_status — propagates the decision to the main
  // profile record used by feature gates across the app.
  const { error: profileErr } = await adminSupabase
    .from("profiles")
    .update({ kyc_status: newStatus })
    .eq("id", userId);
  if (profileErr) {
    console.error("Profile kyc_status update error:", profileErr);
    return NextResponse.json({ error: "Erreur mise à jour profil" }, { status: 500 });
  }

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
