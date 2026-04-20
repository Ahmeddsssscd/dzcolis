# Right / Wrong — launch-readiness audit

**Status:** snapshot, 2026-04-20
**Owner:** Ahmed
**Purpose:** A brutally honest read on what Waselli does well today,
what it does poorly, and what a marketing agency reviewing the product
cold would call out. Written as if we are about to hand the keys to
an external agency and they are going to grade us.

---

## What is right

### Core loop is coherent
The sender → transporter → payment → tracking → delivery → review
chain runs end-to-end. Nothing is faked: every step is DB-backed,
every state transition is auditable. A prospective investor or agency
can follow a parcel from booking to review in one session and not hit
a wall. That is rare at this stage.

### Escrow is real
Payments land on Chargily (DZ) or Stripe (EUR), get parked, and only
release to the transporter after confirmation. Not a UI trick — the
`payments.status` and `bookings.payment_status` fields are the
source of truth and the `/api/payment/webhook/route.ts` idempotency
check prevents double-credit. That is the single most defensible
thing in the product.

### Trust signals are structural, not cosmetic
The KYC flow blocks transporter publishing until an admin approves
the file. The home-page "Nos engagements" section lists three
concrete promises (escrow, verified ID, 48h human arbitration) that
each map to real product behaviour. No lorem-ipsum "we care about
you" filler.

### The i18n is rigorous
FR, EN, and AR all have identical key coverage (599 keys). AR is a
real translation, not a machine-assisted afterthought (see
`TRANSLATION_AUDIT.md`). The language-switcher flips the entire site
in <100 ms. That is a moat when competing against operators who only
speak FR.

### Admin back-office is useful, not decorative
`/admin` shows notable events (KYC-pending, cancellations, refunds,
high-value bookings) in a single sorted feed. The agency will not
look at it, but the founder uses it daily and it is the reason the
product stays observable.

### Documentation discipline
Every non-trivial surface has a `docs/*.md` plan (delivery app,
PayPal, translation, this file). Handover to a second developer is
achievable in an afternoon. Most Algerian startups at our stage have
zero documentation.

---

## What is wrong

### Supply density is thin
The product is deployed and works, but on a random Tuesday in April
the number of active listings across all DZ corridors fits in two
screens. Marketing will amplify whatever reality is underneath —
spending on ads before we have daily supply on the top 5 corridors
will look worse than not advertising at all.

**Fix:** manual outreach to 30 more transporters before any paid
spend. Offer a launch-month 0 % commission incentive if it helps.

### The "delivery day" experience is missing
Transporters book and get paid, but the in-app experience on the
day of delivery is still an admin table. Photos, signatures, and
an offline-tolerant run screen are all planned but not built (see
`DELIVERY_IN_APP_PLAN.md`). Every week without this = extra WhatsApp
coordination overhead = lower NPS.

**Fix:** ship phases 1-2 of the delivery plan in the two weeks after
launch.

### Legal pages are FR-only
`/cgv`, `/confidentialite`, `/mentions-legales` are French only. This
is the right call for jurisdictional reasons (see
`TRANSLATION_AUDIT.md`) but it will surface as a complaint when a
diaspora user tries to read the refund clause. Need a 2-line
disclaimer: "La version française fait foi."

### Status labels bleed through i18n
Files like `src/app/suivi/page.tsx` and `src/app/tableau-de-bord/
page.tsx` hardcode status labels in French. Switching to AR leaves
"En attente de récupération" untranslated on the tracking page. This
breaks the trust the i18n build otherwise earns. Estimated fix: 4 h.

### Pricing grid is trusted but not explained
`/tarifs` shows numbers but does not explain the reasoning. Senders
who compare to Yalidine will ask "why is it 500 DA on Alger-Oran 10 kg
but Yalidine charges 1 400?". We need a small "how our price is
built" callout with the 4 components (escrow, insurance, platform
cut, transporter earnings). Without it the price looks suspiciously
cheap.

### PayPal is not live
Diaspora users keep asking. The research note exists
(`PAYPAL_OPTION.md`, option B via Stripe) but nothing is shipped.
Adding one string to `payment_method_types` is a 30-minute job for
~10 % conversion lift on international. We are leaving money on the
table.

### On-site SEO is weak
The home page scores well, but `/annonces`, `/annonces/[id]`, and
listing detail pages have thin `<title>` tags, no structured data
(JSON-LD Offer / Service), and no sitemap entry for dynamic listings.
Google will not rank "envoi Alger Oran" on generic pages. One
`sitemap.xml` route plus `generateMetadata` per dynamic page = half
a day.

### No onboarding for first-time senders
A sender lands on `/envoyer` and sees a form. No tour, no "How it
works in 3 steps" overlay, no pre-filled example. The `/comment-ca-
marche` page exists but most visitors do not click it. The bounce
rate on `/envoyer` (if measured) will hurt.

**Fix:** add a small 3-step tooltip overlay on first visit. 2 h
of work.

### Notifications are inbox-only
The header bell surfaces recent notifications, but there is no
browser push (despite `<PushNotifications />` existing — it asks
for permission but does not actually wire delivery events to push
subscriptions). Without push, re-engagement depends on email, and
email deliverability in DZ is fragile.

**Fix:** finish the push worker wiring in the next sprint. The UI
scaffold is already there.

### Review system leans optimistic
Every booking invites a review, but there is no moderation (no
"report abusive review" action, no admin suspend-review route).
First bad actor will push a competitor review and we will have no
tooling to respond in <24 h.

**Fix:** add `reviews.status` (published / hidden / under-review)
and an admin surface. Half a day.

### Mobile layout is solid, not native
The app is mobile-web-first, which is fine for year 1. But 60 % of
our target audience will install the site as a PWA or expect a
"real" app. `manifest.json` is generic, the service worker is
off-the-shelf Next.js. A basic PWA polish pass (splash, install
prompt copy, offline fallback that does not say "Internet
Explorer") is a week of work at some point.

---

## What an agency will focus on first

If an agency is handed the product tomorrow and told "grow it", they
will:

1. **Complain about supply density** → we need the 30-transporter
   recruit drive done before we hand over.
2. **Want to rewrite the home copy** → we prepare them for the fact
   that the home was deliberately designed with trust-first framing
   and we will push back on "Uber for parcels" positioning.
3. **Demand analytics** → we must install Plausible or PostHog and
   hand them a dashboard. Running blind ad spend is how budgets
   evaporate.
4. **Ask for a brand kit** → logo variants, colour palette, tone of
   voice doc, sample ad copies per segment. Currently scattered. A
   one-pager `docs/BRAND_KIT.md` is a 3 h job.
5. **Push us to ship the delivery-side app** → because without it
   they cannot advertise "real-time tracking" and that is their
   easiest hook.

---

## Priority queue — in order

1. Recruit 30 more transporters (manual). — Week 1
2. Translate the high-traffic hardcoded pages (suivi, profil,
   tableau-de-bord, reserver). — Week 1
3. Ship PayPal via Stripe (Option B). — Week 1
4. Ship delivery-app phases 1-2 (run screen + status transitions).
   — Week 2
5. Install analytics + send first baseline report. — Week 2
6. SEO pass: sitemap, generateMetadata on listing pages, structured
   data. — Week 2
7. Review-moderation backend + admin UI. — Week 3
8. PWA polish + push worker wiring. — Week 4

Anything below rank 8 waits until we have the first 500 completed
deliveries and can measure which issue actually hurts retention.
