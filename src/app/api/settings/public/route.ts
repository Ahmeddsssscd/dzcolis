import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

// Public keys safe to expose — never include sensitive settings here
const PUBLIC_KEYS = ["whatsapp", "email_contact", "adresse", "commission", "montant_minimum"];

export async function GET() {
  const { data, error } = await adminSupabase
    .from("platform_settings")
    .select("key, value")
    .in("key", PUBLIC_KEYS);

  if (error) {
    return NextResponse.json({}, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json(settings, {
    // Short edge cache so admin changes reflect within ~10s in production.
    // s-maxage applies to CDN; browsers revalidate on every navigation (no max-age).
    headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
  });
}
