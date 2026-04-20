import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service-role client — server-side only, never import in client components
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Legacy alias used by many callers — cast to any because the hand-written Database
// type in types.ts is incomplete (missing platform_settings + schema mismatches).
// TODO: regenerate types with `supabase gen types typescript` to remove this cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminSupabase = adminClient as any;
