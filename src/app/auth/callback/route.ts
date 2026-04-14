import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code         = searchParams.get("code");
  const token_hash   = searchParams.get("token_hash");
  const type         = searchParams.get("type");
  const next         = searchParams.get("next") ?? "/tableau-de-bord";

  const supabase = await createClient();

  // Handle PKCE flow (code)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle token_hash flow (older Supabase email links)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" | "email" });
    if (!error && data.user) {
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If nothing worked, redirect to login with success anyway
  // (session may have been set via cookie already)
  return NextResponse.redirect(`${origin}/connexion?verified=1`);
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
