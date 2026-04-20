import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code         = searchParams.get("code");
  const token_hash   = searchParams.get("token_hash");
  const type         = searchParams.get("type");
  // Validate next param to prevent open redirect — must be a relative path
  const rawNext = searchParams.get("next") ?? "/tableau-de-bord";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/tableau-de-bord";

  const supabase = await createClient();

  // Handle PKCE flow (code) — used by email verification AND Google OAuth
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.email, data.user.user_metadata);
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle token_hash flow (older Supabase email links)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" | "email" });
    if (!error && data.user) {
      await ensureProfile(data.user.id, data.user.email, data.user.user_metadata);
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?verified=1`);
}

// Create profile for OAuth users who don't have one yet (e.g. Google Sign-In)
async function ensureProfile(
  userId: string,
  email?: string,
  metadata?: Record<string, string>,
) {
  if (!userId) return;

  // Check if profile already exists
  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) return; // already has a profile

  // Build name from Google metadata
  const firstName = metadata?.given_name ?? metadata?.name?.split(" ")[0] ?? email?.split("@")[0] ?? "Utilisateur";
  const lastName  = metadata?.family_name ?? metadata?.name?.split(" ").slice(1).join(" ") ?? "";
  const avatarUrl = metadata?.avatar_url ?? metadata?.picture ?? null;

  // Generate referral code
  const referralCode = "WSL-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 5).toUpperCase();

  await adminSupabase.from("profiles").insert({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    phone: "",
    wilaya: "",
    avatar_url: avatarUrl,
    referral_code: referralCode,
    rating: 0,
    review_count: 0,
    kyc_status: "none",
    role: "user",
  });
}

async function trySendWelcome(userId: string, email?: string, createdAt?: string) {
  if (!email || !createdAt) return;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  if (diffMs > 10 * 60 * 1000) return; // only for new signups
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("first_name")
    .eq("id", userId)
    .single();
  sendWelcomeEmail(email, profile?.first_name ?? "là").catch(console.error);
}
