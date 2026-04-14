import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service-role client — server-side only, never import in client components
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Alias for convenience
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminSupabase = adminClient as any;
