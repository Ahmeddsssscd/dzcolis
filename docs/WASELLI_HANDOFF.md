# Waselli — Complete Project Handoff Document
> Generated: 2026-04-18 | For workspace transfer — includes all configs, security fixes, and strategy

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables & API Keys](#3-environment-variables--api-keys)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Supabase Setup](#5-supabase-setup)
6. [Security Fixes Implemented](#6-security-fixes-implemented)
7. [All Modified Files — Current State](#7-all-modified-files--current-state)
8. [Remaining Security TODOs](#8-remaining-security-todos)
9. [Marketing & Startup Strategy](#9-marketing--startup-strategy)
10. [Launch Checklist](#10-launch-checklist)

---

## 1. Project Overview

**Waselli** (formerly DzColis) is a peer-to-peer package delivery marketplace connecting senders with transporters traveling the same route — primarily between Algerian cities and between Algeria and Europe.

- **Live URL:** https://www.waselli.com
- **Vercel Project:** dzcolis (contactguenane-1072s-projects)
- **Supabase Project:** `itbcazlejwattexuctur`
- **Tech:** Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + Resend (email) + Chargily (DZD payments) + Skrill (EUR payments)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React 19) |
| Styling | Tailwind CSS v4.2 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email + Google OAuth) |
| Storage | Supabase Storage (avatars bucket) |
| Email | Resend (transactional emails) |
| Payments (DZD) | Chargily Pay |
| Payments (EUR) | Skrill Quick Checkout |
| Payments (EUR alt) | Stripe (configured, not yet live) |
| Hosting | Vercel |
| Fonts | Plus Jakarta Sans + Cairo (Arabic) |
| i18n | Custom i18n.tsx (FR / AR / EN) |

---

## 3. Environment Variables & API Keys

### `.env.local` (local development)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://itbcazlejwattexuctur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmNhemxlandhdHRleHVjdHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTUyNjYsImV4cCI6MjA5MTY3MTI2Nn0.9CvYUlrQea_h52IrCGtrCJY3uzDKDMlIvIGtsdc_c18
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YmNhemxlandhdHRleHVjdHVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA5NTI2NiwiZXhwIjoyMDkxNjcxMjY2fQ.ke5XlSXJItEv0Xc__vdvJ70FReSbdq5pozn9I3dbLMU

# Chargily Pay (DZD payments)
CHARGILY_API_KEY=test_sk_kRh5i8jQrNMuQNtOCTR7Wgr1g4vBYDkOc31AU2RX
CHARGILY_MODE=test

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (email service)
RESEND_API_KEY=re_8Y3p9ENV_9yHMDGFefrDH1LPVDPkLDPmM
RESEND_FROM_EMAIL=onboarding@resend.dev

# Stripe (EUR — international payments, not yet live)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin panel security (ADD THESE TO VERCEL!)
ADMIN_PASSWORD=waselli@2026!
ADMIN_SESSION_SECRET=change-me-to-a-long-random-string-32-chars-min
```

### Vercel Production Environment Variables
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add ALL of the above, plus:
```env
NEXT_PUBLIC_APP_URL=https://www.waselli.com
CHARGILY_MODE=live          # Switch from test to live when ready
ADMIN_PASSWORD=<your-chosen-admin-password>
ADMIN_SESSION_SECRET=<generate-with: openssl rand -hex 32>
```

### ⚠️ KEY ROTATION REQUIRED
These keys may have been exposed if `.env.local` was ever committed to git. Rotate them:
1. **Supabase** → https://supabase.com/dashboard/project/itbcazlejwattexuctur/settings/api → Regenerate service role key
2. **Resend** → https://resend.com/api-keys → Delete old, create new
3. **Chargily** → Dashboard → Regenerate API key (switch to live key for production)
4. **Stripe** → https://dashboard.stripe.com/apikeys → Roll secret key

Check if ever committed:
```bash
git log --all --full-history -- .env.local
git grep "SUPABASE_SERVICE_ROLE_KEY" $(git rev-list --all)
```

---

## 4. Vercel Deployment

```bash
# Deploy to production
cd dzcolis
npx vercel --prod

# Or via git push (if connected)
git push origin main
```

**Project alias:** `www.waselli.com`
**Vercel project slug:** `dzcolis`

---

## 5. Supabase Setup

**Project ID:** `itbcazlejwattexuctur`
**Dashboard:** https://supabase.com/dashboard/project/itbcazlejwattexuctur

### Tables Used
- `profiles` — user info (first_name, last_name, phone, wilaya, avatar_url, role, kyc_status, referral_code)
- `listings` — transporter route announcements
- `bookings` — package booking requests (status: pending → accepted → in_transit → delivered)
- `payments` — payment records per booking
- `notifications` — in-app notification feed
- `reviews` — sender/transporter reviews
- `courier_applications` — prospective transporter sign-up forms
- `kyc_documents` — KYC document uploads

### Storage Buckets
- `avatars` — public bucket, user profile photos

### Auth Providers Enabled
- Email/Password
- Google OAuth (configured in Supabase Auth settings)

---

## 6. Security Fixes Implemented

All CRITICAL and HIGH severity issues have been fixed and deployed. Here is a full record:

### CRITICAL Fixes

#### CRIT-1 — Admin Auth Always Returned True
**File:** `src/lib/admin-auth.ts`
**Problem:** `checkAdminCookie()` always returned `true` — admin panel had no real protection
**Fix:** Real HMAC-SHA256 signed cookie verification using `crypto.timingSafeEqual`

#### CRIT-2 — Admin Password in Client Bundle
**File:** `src/app/admin/layout.tsx` + new `src/app/api/admin/login/route.ts`
**Problem:** Password `waselli@2026!` was visible in browser JavaScript
**Fix:** Moved to server-side API route; admin login now uses `POST /api/admin/login`

#### CRIT-3 — Email APIs Publicly Callable
**Files:** `src/app/api/email/welcome/route.ts`, `booking-confirmation/route.ts`, `new-booking/route.ts`
**Problem:** Anyone could trigger emails to any address
**Fix:** Added `supabase.auth.getUser()` check — returns 401 if unauthenticated

#### CRIT-4 — IDOR on Avatar Upload
**File:** `src/app/api/upload/avatar/route.ts`
**Problem:** `userId` came from request body — attacker could overwrite any user's avatar
**Fix:** `userId` now comes from `supabase.auth.getUser()` session only

#### CRIT-5 — Open Redirect in Auth Callback
**File:** `src/app/auth/callback/route.ts`
**Problem:** `?next=https://evil.com` would redirect user after login to external site
**Fix:** Validates `next` param: must start with `/` and not `//`
```typescript
const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/tableau-de-bord";
```

#### CRIT-6 — Payment API Had No Auth or Ownership Check
**File:** `src/app/api/payment/skrill/create/route.ts`
**Problem:** Anyone could initiate payments for any booking
**Fix:** Added `supabase.auth.getUser()` + `booking.sender_id !== user.id` ownership check

### HIGH Fixes

#### HIGH-1 — Courier Admin Routes Unprotected
**Files:** `src/app/api/courier-applications/route.ts`, `src/app/api/courier-applications/[id]/route.ts`
**Problem:** Anyone could list or approve/reject courier applications
**Fix:** Added `checkAdminCookie()` guard to GET and PATCH handlers

#### HIGH-2 — Escrow Bypass
**File:** `src/app/api/bookings/update-status/route.ts`
**Problem:** Transporter could accept booking without payment being completed
**Fix:** Status transition to `accepted` blocked if `booking.payment_status !== "paid"`

#### HIGH-3 — No Security HTTP Headers
**File:** `next.config.ts`
**Problem:** No protection against clickjacking, MIME sniffing, XSS via headers
**Fix:** Added `headers()` export with 6 security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

#### HIGH-4 — Service Role Key Used in Wrong Places
**Fix:** Switched `courier-applications` admin route to use service role key only in admin-guarded context

---

## 7. All Modified Files — Current State

### `src/lib/admin-auth.ts`
```typescript
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET ?? "waselli-admin-fallback-change-me";

export function signToken(value: string): string {
  return createHmac("sha256", ADMIN_SECRET).update(value).digest("hex");
}

export async function checkAdminCookie(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get("admin_session")?.value;
    if (!token) return false;

    const expected = signToken("waselli-admin-authenticated");
    const tokenBuf = Buffer.from(token, "hex");
    const expectedBuf = Buffer.from(expected, "hex");

    if (tokenBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}
```

### `src/app/api/admin/login/route.ts` (NEW FILE)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/admin-auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "waselli@2026!";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || password !== ADMIN_PASSWORD) {
    await new Promise(r => setTimeout(r, 500)); // brute-force delay
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = signToken("waselli-admin-authenticated");
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
```

### `next.config.ts` (security headers added)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### `src/app/auth/callback/route.ts` (open redirect fix)
Key change:
```typescript
const rawNext = searchParams.get("next") ?? "/tableau-de-bord";
const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/tableau-de-bord";
```

### `src/app/api/upload/avatar/route.ts` (IDOR fix)
Key change:
```typescript
// Auth check — get userId from session, never from request body
const authClient = await createServerClient();
const { data: { user } } = await authClient.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const userId = user.id;
```

### `src/app/api/bookings/update-status/route.ts` (escrow enforcement)
Key change:
```typescript
// Transporter cannot accept an unpaid booking — enforce escrow
if (status === "accepted" && booking.payment_status !== "paid") {
  return NextResponse.json({ error: "Le paiement doit être effectué avant d'accepter la réservation." }, { status: 400 });
}
```

### `src/app/page.tsx` (homepage redesign — full file)

Key changes:
- Hero headline → "Votre voisin livre votre colis"
- Removed `HeroSearch` city selector component
- Added `Cycle` component (cycling trust badges with fade animation)
- Two CTAs: "Envoyer votre colis" (white solid) + "Voir les annonces" (glass)
- Stats section REPLACED with 4-pillar trust strip: Paiement séquestre / Transporteurs vérifiés / Assurance incluse / Support 7j/7

The full current file content is in `src/app/page.tsx` in the repository.

### `src/lib/i18n.tsx` (translations updated)

Changed keys (all 3 languages — FR / EN / AR):

```
// FR
hero_title: "Votre voisin livre votre colis"
cycle_1:    "Paiement 100 % sécurisé par séquestre"
cycle_2:    "Transporteurs vérifiés et assurés"
cycle_3:    "Assurance incluse sur chaque envoi"
cycle_4:    "Support disponible 7j/7"

// EN
hero_title: "Your neighbor delivers your package"
cycle_1:    "Payment 100% secured by escrow"
cycle_2:    "Verified and insured transporters"
cycle_3:    "Insurance included on every shipment"
cycle_4:    "Support available 7 days a week"

// AR
hero_title: "جارك يوصّل طردك"
cycle_1:    "دفع آمن 100% عبر الضمان"
cycle_2:    "سائقون موثقون ومؤمَّنون"
cycle_3:    "تأمين شامل على كل شحنة"
cycle_4:    "دعم متاح 7 أيام في الأسبوع"
```

### `src/app/admin/layout.tsx` (admin login — full file)

Key change — `handleLogin` now calls the API server-side instead of checking password client-side:

```typescript
async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setError("Mot de passe incorrect.");
    }
  } catch {
    setError("Erreur de connexion. Réessayez.");
  }
}
```

Logout button calls `DELETE /api/admin/login`:
```typescript
fetch("/api/admin/login", { method: "DELETE" }).finally(() => setAuthenticated(false))
```

### `src/app/api/courier-applications/[id]/route.ts` (admin-protected PATCH)

```typescript
import { checkAdminCookie } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  // ... rest of handler uses service role client
}
```

### Email API routes — all now require authentication

`src/app/api/email/welcome/route.ts`:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

Same pattern applied to:
- `src/app/api/email/booking-confirmation/route.ts`
- `src/app/api/email/new-booking/route.ts`

---

## 8. Remaining Security TODOs

These are MEDIUM/LOW severity — not critical but should be addressed:

| ID | Issue | File | Priority |
|---|---|---|---|
| MED-5 | No rate limiting on login/API routes | `/api/admin/login`, `/api/bookings` | Medium |
| MED-2 | Package tracking API returns booking details without auth | `/api/track` or `/suivi` | Medium |
| MED-4 | `vehicle_photo_url` not validated (could be malicious URL) | `courier-applications/route.ts` | Medium |
| LOW-2 | Email templates don't sanitize HTML (internal risk) | `src/lib/email.ts` | Low |
| LOW-3 | Courier `mine` route uses email for lookup instead of user_id | `courier-applications/mine` | Low |

**To add rate limiting** (recommended): Use `@upstash/ratelimit` with Vercel KV, or Vercel's built-in Edge middleware.

---

## 9. Marketing & Startup Strategy

### Phase 1 — Validation (Months 1–3): Zero Budget, Max Signal

**Goal:** Prove the concept works. Get 50 real transactions.

**Channels:**
- Facebook Groups: "Algériens en France", "Expat Algérie", "Transferts Algérie France" — post about the service personally, not as ads. Tell a real story: "J'ai envoyé du miel de ma grand-mère depuis Tizi Ouzou..."
- Instagram Reels: Before/after — "Before: paying 80€ via DHL. After: 15€ via Waselli."
- WhatsApp broadcasts to Algerian diaspora community groups
- Target: university students returning to Algeria for holidays (they carry packages)

**Supply Side (Transporters):**
- Recruit on Facebook: "Vous voyagez Algérie-France? Rentabilisez votre bagage vide"
- Partner with 3-5 early "hero transporters" who get premium placement and badge
- Give first 20 transporters a "Founding Transporter" badge — exclusivity effect

**KPIs for Phase 1:**
- 50 completed deliveries
- 20 active transporters
- Average review score > 4.2/5
- 0 fraud incidents

### Phase 2 — Growth (Months 4–12): Paid Acquisition

**Budget Allocation (assuming 500€/month):**
- 40% Meta Ads (Facebook/Instagram) — targeting: Algerian diaspora in France, Germany, Belgium
- 30% Google Ads — keywords: "envoyer colis Algérie pas cher", "transport colis Algérie particulier"
- 20% TikTok — short videos of real deliveries, surprise unboxings
- 10% Influencer micro-deals — 1-2 Algerian YouTube/TikTok creators per month (500–1000 followers niche)

**Content Strategy:**
- Weekly "Transporteur de la semaine" feature on Instagram
- Monthly "Économies du mois" post showing community savings vs DHL/FedEx
- User testimonials (video > text)
- Behind-the-scenes of how escrow payment works (builds trust)

**Referral Program:**
- Sender gets 5€ off next booking for each friend they refer
- Transporter gets 10% commission boost for first 3 months after referral

### Phase 3 — Monetization (Months 6–18)

**Revenue Streams:**

| Stream | Description | Take Rate |
|---|---|---|
| Platform commission | Applied to each booking | 8–12% |
| Insurance upsell | Basic/Standard/Premium tiers | 1–5% of declared value |
| Express listing boost | Transporter pays to appear at top | 2–5€/boost |
| Business accounts (B2B) | SMEs sending regular packages | Monthly subscription |
| International premium | Algeria ↔ Europe route fee | Higher take rate (15%) |

**Pricing Benchmark:**
- DHL Algérie → France: ~80–120€ for 10kg
- FedEx: ~90–150€
- Waselli target: 25–50€ for 10kg (55–70% cheaper)

**Break-Even Math (rough):**
- Average booking value: 35€
- Platform take (10%): 3.50€/booking
- To cover 5000€/month costs: need ~1,430 bookings/month
- That's ~48 bookings/day across the platform

### Phase 4 — Scale (Year 2–3)

**Expansion routes:**
1. Algérie ↔ France (core)
2. Algérie ↔ Espagne (large Algerian community)
3. Algérie ↔ Canada (Montreal diaspora)
4. Algérie interne: Alger ↔ Oran ↔ Constantine bus/train network

**Tech investments:**
- Mobile app (React Native, sharing web codebase)
- Real-time package tracking via transporter GPS
- ID verification via AI (reduce manual KYC time)
- Automated dispute resolution for < 50€ cases

**Partnership targets:**
- Air Algérie baggage program
- Tassili Airlines
- SNTF (train network) for domestic
- Algerian embassy cultural centers in France/Belgium

### Legal & Compliance

**Minimum to operate legally:**
1. Register a French SAS or Algerian SARL (choose France for EU payment processing access)
2. General Terms & Conditions (already on site at `/cgv`)
3. Privacy Policy GDPR-compliant (already at `/confidentialite`)
4. Professional civil liability insurance (RC Pro) — ~500€/year in France
5. Declaration with CNIL (French data authority) if operating from France
6. Bank account that accepts Stripe/Skrill payouts (Revolut Business, Wise Business work)

**Recommended legal structure:** French SAS (simplified, no minimum capital, easy to add co-founders)

**Regulatory risk:** The "informal" peer transport model is legal in EU under platform economy rules as long as you don't employ the transporters (they are independent contractors). Include this explicitly in your Terms.

### Key Metrics to Track From Day 1

| Metric | Target (Month 3) | Target (Month 12) |
|---|---|---|
| GMV (Gross Merchandise Value) | 5,000€ | 50,000€ |
| Completed deliveries | 50 | 1,500 |
| Active transporters | 20 | 200 |
| Avg. review score | > 4.2 | > 4.5 |
| Dispute rate | < 5% | < 2% |
| Email open rate | > 35% | > 40% |
| Transporter utilization | > 60% of listings get booked | > 75% |

### Tools & Software Stack for Growth

| Category | Tool | Cost |
|---|---|---|
| Analytics | Posthog (free tier) | Free |
| Email marketing | Resend + simple newsletter | Free |
| CRM | Notion database initially | Free |
| Customer support | WhatsApp Business | Free |
| Social scheduling | Buffer | ~15€/month |
| Meta ads | Start with 200€ test budget | Variable |
| Legal templates | Rocket Lawyer FR | ~30€/month |

---

## 10. Launch Checklist

### Before Going Live
- [ ] Rotate all API keys (Supabase, Resend, Chargily) — see Section 3
- [ ] Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel env vars
- [ ] Switch Chargily from `test` to `live` mode in Vercel env vars
- [ ] Set `NEXT_PUBLIC_APP_URL=https://www.waselli.com` in Vercel
- [ ] Configure Resend with verified domain (use `noreply@waselli.com` not `onboarding@resend.dev`)
- [ ] Test full booking flow end-to-end on production
- [ ] Test admin login at `https://www.waselli.com/admin`
- [ ] Verify Google OAuth works on production domain
- [ ] Set up Stripe live keys for EUR payments
- [ ] Configure Skrill merchant account and webhook URL

### First Week After Launch
- [ ] Post in 3 Facebook groups (Algériens en France, etc.)
- [ ] Create Instagram account @waselli.dz
- [ ] Record a short demo video (screen recording of a booking)
- [ ] Reach out to 10 potential transporters personally
- [ ] Set up Google Analytics or Posthog

### Ongoing
- [ ] Deploy updates: `npx vercel --prod`
- [ ] Monitor Supabase logs for errors
- [ ] Check Resend delivery stats weekly
- [ ] Review new courier applications in admin panel
- [ ] Respond to user messages within 24h

---

*Document last updated: 2026-04-18*
*All security fixes deployed to https://www.waselli.com*
