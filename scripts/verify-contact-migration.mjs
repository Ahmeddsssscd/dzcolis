// Quick verifier — run with: node scripts/verify-contact-migration.mjs
// Checks that the `public.contact_messages` table exists and is reachable
// via the service role. Prints ✅ or ❌ with the PostgREST error code.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Minimal .env.local parser (no dotenv dep required).
const env = {};
try {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) {
  console.error('Could not read .env.local:', e.message);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const s = createClient(url, key, { auth: { persistSession: false } });

const { count, error } = await s
  .from('contact_messages')
  .select('*', { head: true, count: 'exact' });

if (error) {
  console.error('❌ contact_messages query failed:', error.code, '—', error.message);
  process.exit(2);
}

console.log(`✅ contact_messages table exists — ${count ?? 0} row(s)`);
