import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

// No-cache endpoint polled by the /maintenance page to detect when the admin
// disables maintenance mode. Must stay fresh — do not add Cache-Control here.
export async function GET() {
  const { data, error } = await adminSupabase
    .from("platform_settings")
    .select("key, value")
    .in("key", ["maintenance", "maintenance_message"]);

  if (error) {
    // Fail-open: if the table is unreachable, say maintenance is off so users
    // aren't permanently trapped behind this page by a DB outage.
    return NextResponse.json(
      { enabled: false, message: "" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const rows = (data ?? []) as { key: string; value: string }[];
  const enabled = rows.find((r) => r.key === "maintenance")?.value === "true";
  const message = rows.find((r) => r.key === "maintenance_message")?.value ?? "";

  return NextResponse.json(
    { enabled, message },
    { headers: { "Cache-Control": "no-store" } }
  );
}
