# DZColis — Full Project Context for Claude

> Read this file at the start of every session. Contains EVERYTHING needed to continue development.

---

## Project Overview

**DZColis** is an Algerian parcel delivery marketplace — travelers offer to carry packages along their routes, senders book them.

- **Live URL:** https://dzcolis.vercel.app
- **Admin panel:** https://dzcolis.vercel.app/admin (password: `dzcolis2026`)
- **Local dev:** `cd C:\Users\Ahmed\Desktop\coclis\dzcolis && npm run dev`
- **Deploy to prod:** `cd C:\Users\Ahmed\Desktop\coclis\dzcolis && npx vercel --prod`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (`kyc-documents` bucket) |
| Email | Resend |
| Payments | Chargily Pay (Algerian — edahabia / CIB) |
| Hosting | Vercel |

---

## Environment Variables

### `.env.local` (local dev)
```
NEXT_PUBLIC_SUPABASE_URL=https://itbcazlejwattexuctur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmNhemxlandhdHRleHVjdHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTUyNjYsImV4cCI6MjA5MTY3MTI2Nn0.9CvYUlrQea_h52IrCGtrCJY3uzDKDMlIvIGtsdc_c18
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmNhemxlandhdHRleHVjdHVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA5NTI2NiwiZXhwIjoyMDkxNjcxMjY2fQ.ke5XlSXJItEv0Xc__vdvJ70FReSbdq5pozn9I3dbLMU
CHARGILY_API_KEY=test_sk_kRh5i8jQrNMuQNtOCTR7Wgr1g4vBYDkOc31AU2RX
CHARGILY_MODE=test
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_8Y3p9ENV_9yHMDGFefrDH1LPVDPkLDPmM
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Vercel Production Env (already set)
Same as above but `NEXT_PUBLIC_APP_URL=https://dzcolis.vercel.app`

---

## Supabase Project

- **URL:** `https://itbcazlejwattexuctur.supabase.co`
- **Dashboard:** https://supabase.com/dashboard/project/itbcazlejwattexuctur

### Database Tables

```
profiles       - id, first_name, last_name, phone, wilaya, role("user"|"admin"),
                 kyc_status("none"|"submitted"|"reviewing"|"approved"|"rejected"),
                 referral_code, referred_by, rating, review_count, created_at

listings       - id, user_id, from_city, to_city, departure_date, arrival_date,
                 available_weight, price_per_kg, description,
                 status("active"|"full"|"cancelled"|"completed"), is_international, created_at

bookings       - id, listing_id, sender_id, weight, dimensions, content,
                 pickup_address, recipient_name, recipient_phone, instructions,
                 status("pending"|"accepted"|"in_transit"|"delivered"|"cancelled"),
                 payment_status("unpaid"|"pending"|"paid"|"refunded"),
                 total_amount, booking_ref, created_at, updated_at

payments       - id, booking_id, user_id, amount, currency, provider("chargily"),
                 provider_ref, checkout_url, status("pending"|"paid"|"failed"|"refunded"),
                 paid_at, created_at, updated_at

kyc_documents  - id, user_id, cin_recto_url, cin_verso_url, selfie_url,
                 status("submitted"|"reviewing"|"approved"|"rejected"),
                 admin_note, submitted_at, reviewed_at, reviewed_by

reviews        - id, booking_id, reviewer_id, reviewed_id, rating, comment, created_at

notifications  - id, user_id, type, title, message, read(bool), data(jsonb), created_at
                 NOTE: uses "message" field, NOT "body"
```

### NOT YET IN DB (needs to be run in Supabase SQL editor)
```sql
-- For real messaging system (high priority todo):
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  participant_one uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_two uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message text,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(listing_id, participant_one, participant_two)
);
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select" ON conversations FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "conv_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "conv_update" ON conversations FOR UPDATE USING (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "msg_select" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())));
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())));
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

---

## Critical Implementation Details

### Supabase Client — IMPORTANT RULES
1. **Browser client** (`src/lib/supabase/client.ts`): Uses `createClient` from `@supabase/supabase-js` (NOT `createBrowserClient` from `@supabase/ssr` — that caused Web Locks deadlock)
2. **Server client** (`src/lib/supabase/server.ts`): Uses `createServerClient` from `@supabase/ssr` with cookies
3. **Admin client** (`src/lib/supabase/admin.ts`): Uses service role key, bypasses RLS
4. Module-level singleton in context: `const supabase = createClient(); const db = supabase as any;`

### Auth — CRITICAL (fixes infinite spinner)
```ts
// onAuthStateChange must NOT await fetchProfile — fire and forget
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    setSupabaseUser(session.user);
    fetchProfile(session.user); // NO await — this was causing the deadlock
  }
  if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
    clearTimeout(timeout);
    setAuthLoading(false);
  }
});
```

### next.config.ts
```ts
reactStrictMode: false, // Prevents Supabase auth lock double-mount
```

---

## What's Done ✅

- Auth (login/signup/email verification) — no spinner bugs
- Dashboard with real DB data
- Browse + book listings
- KYC upload to Supabase Storage
- Chargily payment flow (test mode)
- Payment webhook → updates DB + sends email
- Admin panel (all pages with real DB data)
- Admin expeditions action buttons (persist to DB)
- Admin litiges decisions (persist via notifications table)
- Sidebar KYC badge = real count
- **Transporter incoming bookings** — "Demandes reçues" section in dashboard ✅
- **Notifications** — created on: new booking, accepted, in_transit, delivered, cancelled, payment confirmed, KYC approved/rejected ✅

---

## What's Left ❌

### HIGH PRIORITY

#### 1. Real Messaging System (messages page is still in-memory)
**Run SQL above in Supabase dashboard first**, then rewrite `src/app/messages/page.tsx`:
- Load conversations from `conversations` table
- Load messages from `messages` table  
- Use Supabase Realtime for live updates
- Keep existing UI, just replace data layer
- Update context.tsx MessagesContext to no-ops

#### 2. GitHub Auto-Deploy
- `git init` if needed, push to GitHub
- Connect GitHub repo in Vercel dashboard → Project Settings → Git
- Then every `git push` auto-deploys (no more manual `npx vercel --prod`)

### MEDIUM PRIORITY

#### 3. Booking confirmation email
`sendBookingConfirmationEmail()` exists in email.ts but is never called. Call it in `createBooking` in context.tsx after successful insert.

#### 4. Delivery confirmation email
Call `sendDeliveryConfirmedEmail()` from email.ts when booking marked delivered in `update-status` API route.

#### 5. Reviews to DB
ReviewModal exists in dashboard but `onSubmit` only does `console.log`. Wire it to insert into `reviews` table.

#### 6. Package tracking page
`/suivi` shows dummy data. Query real booking by tracking ref.

#### 7. Chargily app name
Shows "My new app" on payment page — change in Chargily dashboard settings.

#### 8. Admin: Suspend users
No `is_suspended` column in profiles. Add it then wire up suspend button in admin/utilisateurs.

---

## Full Source Files

### `src/lib/supabase/client.ts`
```ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}
```

### `src/lib/supabase/server.ts`
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

### `src/lib/supabase/admin.ts`
```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const adminSupabase = adminClient as any;
```

### `src/lib/supabase/types.ts`
```ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string; first_name: string; last_name: string; phone: string; wilaya: string;
          role: "user" | "admin";
          kyc_status: "none" | "submitted" | "reviewing" | "approved" | "rejected";
          referral_code: string | null; referred_by: string | null;
          rating: number; review_count: number; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "rating" | "review_count">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string; user_id: string; from_city: string; to_city: string;
          departure_date: string; arrival_date: string | null;
          available_weight: number; price_per_kg: number; description: string;
          status: "active" | "full" | "cancelled" | "completed";
          is_international: boolean; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string; listing_id: string; sender_id: string; weight: number;
          dimensions: string | null; content: string; pickup_address: string;
          recipient_name: string; recipient_phone: string; instructions: string | null;
          status: "pending" | "accepted" | "in_transit" | "delivered" | "cancelled";
          payment_status: "unpaid" | "pending" | "paid" | "refunded";
          total_amount: number; booking_ref: string; created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "booking_ref" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string; booking_id: string; user_id: string; amount: number;
          currency: string; provider: string; provider_ref: string | null;
          checkout_url: string | null;
          status: "pending" | "paid" | "failed" | "refunded";
          paid_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      kyc_documents: {
        Row: {
          id: string; user_id: string;
          cin_recto_url: string | null; cin_verso_url: string | null; selfie_url: string | null;
          status: "submitted" | "reviewing" | "approved" | "rejected";
          admin_note: string | null; submitted_at: string;
          reviewed_at: string | null; reviewed_by: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["kyc_documents"]["Row"], "id" | "submitted_at">;
        Update: Partial<Database["public"]["Tables"]["kyc_documents"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string; booking_id: string; reviewer_id: string; reviewed_id: string;
          rating: number; comment: string | null; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string; user_id: string; type: string; title: string;
          message: string; read: boolean; data: Json | null; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
  };
}

export type Profile      = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing      = Database["public"]["Tables"]["listings"]["Row"];
export type Booking      = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment      = Database["public"]["Tables"]["payments"]["Row"];
export type KycDoc       = Database["public"]["Tables"]["kyc_documents"]["Row"];
export type Review       = Database["public"]["Tables"]["reviews"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
```

### `next.config.ts`
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: false,
};
export default nextConfig;
```

### `vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://pay.chargily.net https://api.resend.com; frame-src 'self' https://pay.chargily.net;"
        }
      ]
    }
  ]
}
```

### `src/lib/email.ts`
```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "DZColis <noreply@dzcolis.com>";

function baseHtml(content: string) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>DZColis</title>
<style>body{font-family:-apple-system,sans-serif;background:#f4f5f7;margin:0}.wrap{max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden}.header{background:#00a651;padding:24px 32px}.header h1{color:#fff;margin:0;font-size:22px;font-weight:700}.header p{color:#d4f5e3;margin:4px 0 0;font-size:13px}.body{padding:32px}.body p{color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px}.btn{display:inline-block;background:#00a651;color:#fff!important;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:600;font-size:15px;margin:8px 0 24px}.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:16px 0}.card p{margin:4px 0;font-size:14px;color:#6b7280}.card strong{color:#111827}.footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center}.footer p{font-size:12px;color:#9ca3af;margin:0}</style></head>
<body><div class="wrap"><div class="header"><h1>🟢 DZColis</h1><p>Livraison entre particuliers · Algérie</p></div><div class="body">${content}</div><div class="footer"><p>© ${new Date().getFullYear()} DZColis</p></div></div></body></html>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await resend.emails.send({ from: FROM, to, subject: "Bienvenue sur DZColis 🎉",
    html: baseHtml(`<p>Bonjour <strong>${firstName}</strong>,</p><p>Bienvenue sur <strong>DZColis</strong> !</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/annonces" class="btn">Voir les annonces →</a>`) });
}

export async function sendBookingConfirmationEmail(to: string, data: { firstName: string; bookingRef: string; fromCity: string; toCity: string; departureDate: string; totalAmount: number }) {
  await resend.emails.send({ from: FROM, to, subject: `Réservation confirmée — ${data.bookingRef}`,
    html: baseHtml(`<p>Bonjour <strong>${data.firstName}</strong>,</p><p>Votre réservation est enregistrée.</p><div class="card"><p><strong>Réf:</strong> ${data.bookingRef}</p><p><strong>Trajet:</strong> ${data.fromCity} → ${data.toCity}</p><p><strong>Total:</strong> ${data.totalAmount.toLocaleString()} DA</p></div><a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Suivre →</a>`) });
}

export async function sendPaymentConfirmedEmail(to: string, data: { firstName: string; bookingRef: string; amount: number }) {
  await resend.emails.send({ from: FROM, to, subject: `Paiement confirmé — ${data.bookingRef}`,
    html: baseHtml(`<p>Bonjour <strong>${data.firstName}</strong>,</p><p>Paiement confirmé ✅</p><div class="card"><p><strong>Réf:</strong> ${data.bookingRef}</p><p><strong>Montant:</strong> ${data.amount.toLocaleString()} DA</p></div><a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Voir →</a>`) });
}

export async function sendKycApprovedEmail(to: string, firstName: string) {
  await resend.emails.send({ from: FROM, to, subject: "Votre identité a été vérifiée ✅",
    html: baseHtml(`<p>Bonjour <strong>${firstName}</strong>,</p><p>Votre identité a été vérifiée avec succès !</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/transporter" class="btn">Proposer un trajet →</a>`) });
}

export async function sendKycRejectedEmail(to: string, firstName: string) {
  await resend.emails.send({ from: FROM, to, subject: "Action requise — Vérification d'identité",
    html: baseHtml(`<p>Bonjour <strong>${firstName}</strong>,</p><p>Vos documents n'ont pas pu être validés. Veuillez soumettre de nouveaux documents.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/kyc" class="btn">Resoumettre →</a>`) });
}

export async function sendDeliveryConfirmedEmail(to: string, data: { firstName: string; bookingRef: string }) {
  await resend.emails.send({ from: FROM, to, subject: `Colis livré — ${data.bookingRef}`,
    html: baseHtml(`<p>Bonjour <strong>${data.firstName}</strong>,</p><p>Votre colis (${data.bookingRef}) a été livré ! 📦</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tableau-de-bord" class="btn">Laisser un avis →</a>`) });
}
```

### `src/app/auth/callback/route.ts`
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type");
  const next       = searchParams.get("next") ?? "/tableau-de-bord";
  const supabase   = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" | "email" });
    if (!error && data.user) {
      await trySendWelcome(data.user.id, data.user.email, data.user.created_at);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/connexion?verified=1`);
}

async function trySendWelcome(userId: string, email?: string, createdAt?: string) {
  if (!email || !createdAt) return;
  if (Date.now() - new Date(createdAt).getTime() > 10 * 60 * 1000) return;
  const { data: profile } = await adminSupabase.from("profiles").select("first_name").eq("id", userId).single();
  sendWelcomeEmail(email, profile?.first_name ?? "là").catch(console.error);
}
```

### `src/app/api/payment/create/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

const CHARGILY_BASE = process.env.CHARGILY_MODE === "live"
  ? "https://pay.chargily.net/api/v2"
  : "https://pay.chargily.net/test/api/v2";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, paymentMethod } = await req.json();
    if (!bookingId || !paymentMethod) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data: booking, error: bookingError } = await adminSupabase.from("bookings").select("*").eq("id", bookingId).single();
    if (bookingError || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const chargilyMethod = paymentMethod === "cib" ? "cib" : "edahabia";

    const chargilyRes = await fetch(`${CHARGILY_BASE}/checkouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CHARGILY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: booking.total_amount, currency: "dzd", payment_method: chargilyMethod,
        success_url: `${appUrl}/paiement/succes?booking=${bookingId}`,
        failure_url: `${appUrl}/paiement/echec?booking=${bookingId}`,
        webhook_endpoint: `${appUrl}/api/payment/webhook`,
        description: `DZColis - Réservation ${booking.booking_ref}`, locale: "fr",
        metadata: { booking_id: bookingId, booking_ref: booking.booking_ref },
      }),
    });

    if (!chargilyRes.ok) {
      const errText = await chargilyRes.text();
      return NextResponse.json({ error: "Payment provider error", details: errText }, { status: 502 });
    }

    const checkout = await chargilyRes.json();
    await adminSupabase.from("payments").insert({ booking_id: bookingId, user_id: booking.sender_id, amount: booking.total_amount, provider: "chargily", provider_ref: checkout.id, status: "pending" });
    await adminSupabase.from("bookings").update({ payment_status: "pending" }).eq("id", bookingId);
    return NextResponse.json({ checkout_url: checkout.checkout_url });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### `src/app/api/payment/webhook/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") ?? "";
    const apiKey = process.env.CHARGILY_API_KEY ?? "";

    if (signature && apiKey && !verifySignature(rawBody, signature, apiKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === "checkout.paid") {
      const bookingId = data.metadata?.booking_id;
      if (!bookingId) return NextResponse.json({ error: "No booking_id" }, { status: 400 });

      await adminSupabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("provider_ref", data.id);
      await adminSupabase.from("bookings").update({ payment_status: "paid", status: "accepted" }).eq("id", bookingId);

      const { data: booking } = await adminSupabase.from("bookings").select("sender_id, booking_ref").eq("id", bookingId).single();
      if (booking) {
        await adminSupabase.from("notifications").insert({ user_id: booking.sender_id, type: "payment_confirmed", title: "Paiement confirmé", message: `Votre paiement pour la réservation ${booking.booking_ref} a été confirmé.`, read: false });
        const { data: profile } = await adminSupabase.from("profiles").select("first_name").eq("id", booking.sender_id).single();
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(booking.sender_id);
        if (authUser.user?.email && profile) {
          sendPaymentConfirmedEmail(authUser.user.email, { firstName: profile.first_name, bookingRef: booking.booking_ref, amount: data.amount ?? 0 }).catch(console.error);
        }
      }
    }

    if (type === "checkout.failed") {
      const bookingId = data.metadata?.booking_id;
      if (bookingId) {
        await adminSupabase.from("payments").update({ status: "failed" }).eq("provider_ref", data.id);
        await adminSupabase.from("bookings").update({ payment_status: "unpaid" }).eq("id", bookingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
```

### `src/app/api/admin/stats/route.ts`
```ts
import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const [usersRes, listingsRes, bookingsRes, paymentsRes, kycRes, recentBookingsRes] = await Promise.all([
      adminSupabase.from("profiles").select("id", { count: "exact", head: true }),
      adminSupabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      adminSupabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["pending", "accepted", "in_transit"]),
      adminSupabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", startOfMonth),
      adminSupabase.from("kyc_documents").select("id", { count: "exact", head: true }).eq("status", "submitted"),
      adminSupabase.from("bookings").select("id, booking_ref, sender_id, listing_id, status, total_amount, created_at").order("created_at", { ascending: false }).limit(10),
    ]);
    const monthly_revenue = (paymentsRes.data ?? []).reduce((sum: number, p: { amount: number }) => sum + (p.amount ?? 0), 0);
    return NextResponse.json({ total_users: usersRes.count ?? 0, active_listings: listingsRes.count ?? 0, ongoing_bookings: bookingsRes.count ?? 0, monthly_revenue, kyc_pending: kycRes.count ?? 0, recent_bookings: recentBookingsRes.data ?? [] });
  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### `src/app/api/admin/bookings/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, payment_status } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    const { error } = await adminSupabase.from("bookings").update(updates).eq("id", id);
    if (error) throw error;
    if (payment_status === "refunded") await adminSupabase.from("payments").update({ status: "refunded" }).eq("booking_id", id);
    return NextResponse.json({ ok: true });
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}

export async function GET() {
  try {
    const { data: bookings, error } = await adminSupabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const allBookings = bookings ?? [];
    const senderIds = [...new Set(allBookings.map((b: { sender_id: string }) => b.sender_id).filter(Boolean))];
    let profilesMap: Record<string, { first_name: string; last_name: string }> = {};
    if (senderIds.length > 0) {
      const { data: profiles } = await adminSupabase.from("profiles").select("id, first_name, last_name").in("id", senderIds);
      if (profiles) profilesMap = Object.fromEntries(profiles.map((p: { id: string; first_name: string; last_name: string }) => [p.id, p]));
    }
    const enriched = allBookings.map((b: Record<string, unknown>) => ({ ...b, sender_name: b.sender_id && profilesMap[b.sender_id as string] ? `${profilesMap[b.sender_id as string].first_name} ${profilesMap[b.sender_id as string].last_name}`.trim() : null }));
    return NextResponse.json(enriched);
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
```

### `src/app/api/admin/payments/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { error } = await adminSupabase.from("payments").update(updates).eq("id", id);
    if (error) throw error;
    const { data: payment } = await adminSupabase.from("payments").select("booking_id").eq("id", id).single();
    if (payment?.booking_id) {
      const bookingPaymentStatus = status === "paid" ? "paid" : status === "refunded" ? "refunded" : "pending";
      await adminSupabase.from("bookings").update({ payment_status: bookingPaymentStatus }).eq("id", payment.booking_id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}

export async function GET() {
  try {
    const { data, error } = await adminSupabase.from("payments").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
```

### `src/app/api/admin/litiges/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data } = await adminSupabase.from("notifications").select("*").eq("type", "litige_resolution").order("created_at", { ascending: false });
    const resolved: Record<string, { decision: string; date: string }> = {};
    for (const n of data ?? []) {
      const d = n.data as { litige_id?: string; decision?: string } | null;
      if (d?.litige_id && d?.decision) resolved[d.litige_id] = { decision: d.decision, date: n.created_at };
    }
    return NextResponse.json(resolved);
  } catch { return NextResponse.json({}, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const { litige_id, decision } = await req.json();
    if (!litige_id || !decision) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await adminSupabase.from("notifications").delete().eq("type", "litige_resolution").contains("data", { litige_id });
    await adminSupabase.from("notifications").insert({ user_id: "00000000-0000-0000-0000-000000000000", type: "litige_resolution", title: "Litige résolu", message: `Litige ${litige_id} résolu : ${decision}`, read: true, data: { litige_id, decision } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
```

### `src/app/api/bookings/transporter/route.ts` (NEW)
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const { data: listings } = await (supabase as any).from("listings").select("id, from_city, to_city").eq("user_id", user.id);
  if (!listings || listings.length === 0) return NextResponse.json([]);

  const listingIds = listings.map((l: any) => l.id);
  const listingMap = Object.fromEntries(listings.map((l: any) => [l.id, l]));

  const { data: bookings } = await (supabase as any).from("bookings").select("*").in("listing_id", listingIds).order("created_at", { ascending: false });
  if (!bookings || bookings.length === 0) return NextResponse.json([]);

  const senderIds = [...new Set(bookings.map((b: any) => b.sender_id))];
  const { data: profiles } = await (supabase as any).from("profiles").select("id, first_name, last_name, phone").in("id", senderIds);
  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

  const enriched = bookings.map((b: any) => ({
    ...b,
    sender_name: profileMap[b.sender_id] ? `${profileMap[b.sender_id].first_name} ${profileMap[b.sender_id].last_name}`.trim() : "—",
    sender_phone: profileMap[b.sender_id]?.phone ?? "—",
    from_city: listingMap[b.listing_id]?.from_city ?? "—",
    to_city: listingMap[b.listing_id]?.to_city ?? "—",
  }));

  return NextResponse.json(enriched);
}
```

### `src/app/api/bookings/update-status/route.ts` (NEW)
```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, status } = await req.json();
  if (!bookingId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: booking } = await (supabase as any).from("bookings").select("*, listing:listings(user_id, from_city, to_city)").eq("id", bookingId).single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isTransporter = booking.listing?.user_id === user.id;
  const isSender = booking.sender_id === user.id;
  if (!isTransporter && !isSender) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await (supabase as any).from("bookings").update({ status }).eq("id", bookingId);

  const route = `${booking.listing?.from_city ?? ""} → ${booking.listing?.to_city ?? ""}`;
  const ref = booking.booking_ref;
  const notifMap: Record<string, { user_id: string; type: string; title: string; message: string }> = {
    accepted:   { user_id: booking.sender_id, type: "booking_accepted",   title: "Réservation acceptée ✅", message: `Votre réservation ${ref} (${route}) a été acceptée.` },
    cancelled:  { user_id: isTransporter ? booking.sender_id : booking.listing?.user_id ?? "", type: "booking_cancelled", title: "Réservation annulée", message: `La réservation ${ref} a été annulée.` },
    in_transit: { user_id: booking.sender_id, type: "booking_in_transit", title: "Colis en route 🚗",       message: `Votre colis (${ref}) est en route !` },
    delivered:  { user_id: booking.sender_id, type: "booking_delivered",  title: "Colis livré 📦",          message: `Votre colis (${ref}) a été livré.` },
  };

  const notif = notifMap[status];
  if (notif?.user_id) {
    await (supabase as any).from("notifications").insert({ user_id: notif.user_id, type: notif.type, title: notif.title, message: notif.message, read: false, data: { booking_id: bookingId, booking_ref: ref } });
  }

  return NextResponse.json({ ok: true });
}
```

---

## Common Commands

```bash
# Run locally
cd C:\Users\Ahmed\Desktop\coclis\dzcolis && npm run dev

# Deploy to production
cd C:\Users\Ahmed\Desktop\coclis\dzcolis && npx vercel --prod

# Set env var on Vercel
npx vercel env add VAR_NAME production

# Check env vars
npx vercel env ls
```

---

## Chargily Payment Flow

1. POST `/api/payment/create` → creates Chargily checkout → returns `checkout_url`
2. User redirected to Chargily hosted page
3. Chargily sends webhook to `/api/payment/webhook`
4. Webhook verifies HMAC → updates DB → sends email
5. User redirected to `/paiement/succes` or `/paiement/echec`

**Test API:** `https://pay.chargily.net/test/api/v2`
**Test Key:** `test_sk_kRh5i8jQrNMuQNtOCTR7Wgr1g4vBYDkOc31AU2RX`
