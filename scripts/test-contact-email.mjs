// Quick end-to-end check of the contact-form email path.
// Sends a single test message through Resend using the same env vars
// the /api/contact route uses. Run with: node scripts/test-contact-email.mjs
//
// Output tells you exactly which env var is missing (if any), and
// whether the Resend API accepted the payload.
import { readFileSync } from "node:fs";

const env = {};
try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (e) {
  console.error("Could not read .env.local:", e.message);
}

const RESEND_API_KEY   = env.RESEND_API_KEY   || process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
const CONTACT_EMAIL     = env.CONTACT_EMAIL     || process.env.CONTACT_EMAIL     || "contact@waselli.com";

if (!RESEND_API_KEY)    { console.error("❌ RESEND_API_KEY is missing — contact form cannot send email"); process.exit(1); }
if (!RESEND_FROM_EMAIL) { console.error("❌ RESEND_FROM_EMAIL is missing — contact form cannot send email"); process.exit(1); }

console.log("→ RESEND_FROM_EMAIL:", RESEND_FROM_EMAIL);
console.log("→ CONTACT_EMAIL    :", CONTACT_EMAIL);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: RESEND_FROM_EMAIL,
    to: [CONTACT_EMAIL],
    subject: "Waselli · Test de réception (contact form)",
    html: `<p>Ceci est un test automatique du script <code>scripts/test-contact-email.mjs</code>.</p>
           <p>Si vous le recevez dans votre inbox <b>${CONTACT_EMAIL}</b> (ou son forward iCloud),
           la voie email du formulaire de contact fonctionne correctement.</p>`,
    reply_to: "no-reply@waselli.com",
  }),
});

const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`❌ Resend rejected the test (HTTP ${res.status}):`, data);
  process.exit(2);
}
console.log(`✅ Test email sent — check ${CONTACT_EMAIL} (message id: ${data.id ?? "?"})`);
