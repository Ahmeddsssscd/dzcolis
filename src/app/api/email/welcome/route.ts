import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

// Welcome email — always sent to the authenticated user's own email. No body params accepted.
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single();

    // Recipient is always the authenticated user's own verified email
    const to = user.email;
    if (!to) return NextResponse.json({ error: "No email on file" }, { status: 400 });

    const firstName = (profile as { first_name?: string } | null)?.first_name ?? "";
    await sendWelcomeEmail(to, firstName);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
