# Marketing launch plan

**Status:** plan, pre-launch
**Owner:** Ahmed
**Last updated:** 2026-04-20

## Positioning in one sentence

> Waselli — the marketplace that turns empty car boots into cheap,
> insured parcel deliveries between Algerian cities, and between
> Algeria and the diaspora.

Not "Uber for parcels". Not "Yalidine killer". Those framings either
cue the wrong expectations (on-demand, professional fleet) or pick a
fight we do not need. The wedge is **price + trust + empty-boot
economics**.

## Audience ranking

| Priority | Segment | Why |
|:-------:|---------|-----|
| **1** | Senders in Algiers, Oran, Constantine | High parcel frequency, concentrated ad spend pays off fast. |
| **2** | Transporters already making the trip | Supply-side. Without them Segment 1 churns. |
| **3** | Diaspora in France (Paris, Lyon, Marseille) | High-ticket international corridor, best margins. |
| **4** | E-commerce shops doing 10–30 orders/week | B2B upsell once supply is dense. Later. |

We do **not** chase segment 4 before segments 1+2 are dense. Running
B2B ads on a two-sided marketplace with thin supply is how marketplaces
burn out.

## Channel mix — the first 90 days

| Channel | Spend share | KPI | Notes |
|---------|:-----------:|-----|-------|
| Meta Ads (IG + FB) | 45 % | CPL on sender signup | Short video of a boot → a doorstep. Two variants: diaspora (EN/FR), domestic (FR/AR). |
| TikTok creators | 20 % | Engagement rate | Micro-influencers in DZ (<50k followers). One skit format: "un colis d'Alger à Annaba pour 500 DA". |
| Google Search | 15 % | Paid-search CAC | Bid on `envoi colis Algerie`, `livraison wilaya`, `yalidine alternative`. |
| Radio / Podcast (DZ) | 10 % | Branded-search lift | Partner 2 podcasts that the 25-45 urban audience listens to. |
| SEO + content | 10 % | Organic sessions | "Envoyer un colis de X à Y" programmatic pages powered by our pricing grid. |

Performance budget caveat: if CAC on Meta exceeds €8 for a confirmed
sender signup after week 4, reallocate to search + creators.

## The three messages we will test

1. **"5 × moins cher que les agences"** — the price hook. Works on all
   segments. Dangerous if customers compare us to Yalidine's lowest
   tier (small parcel, same wilaya) — we need to caveat with the
   typical corridor (e.g. Alger → Oran, 10 kg).
2. **"Un humain vérifié, pas un camion anonyme"** — the trust hook.
   Targets segments who had a bad Yalidine experience (damaged,
   late, lost). Pairs well with the new home "Nos engagements" section.
3. **"De France à Alger sans passer par la valise d'un cousin"** —
   the diaspora hook. Works because the alternative (asking a
   relative flying back) is free but unreliable, and agencies (DHL,
   Colissimo) are expensive.

**A/B plan:** run all three in parallel at low budget (€30/day each)
for 10 days. Pick the winner per segment, scale that to €150/day.

## Creative principles

- **No stock photos.** Film 3 real transporters, with their real
  vehicles. Use them across all channels.
- **Show the money flow.** In every video, the escrow + release
  moment appears — that is the whole differentiation. Senders have
  never seen a marketplace explain escrow visually.
- **Arabic script on half the creatives.** Not a translation of the
  French version — a separate creative with Arabic copy native to
  the audience.
- **No influencer endorsements until month 3.** Paid endorsements
  before we have ~500 completed deliveries will look fake and the
  comments section will call it out.

## Launch-day choreography

Week -2:
- Lock the pricing grid at `/tarifs`. No last-minute changes.
- Record the three creator videos.
- Stress-test `/suivi` with 100 parallel fake deliveries.
- QA the FR/AR/EN language switcher on every top-20 page.

Week -1:
- Seed 30 transporters manually (friends-of-friends + targeted
  outreach on Telegram groups). We need supply density on day 1 in
  Algiers ↔ Oran, Algiers ↔ Constantine, Algiers ↔ Annaba.
- Pre-register 200 senders via a waitlist form → email drip.

Day 0 (a Tuesday, not a weekend — lower ad CPMs, better CS coverage):
- Email the waitlist with a €3 credit for the first booking.
- Post on the founder's LinkedIn + IG.
- Turn on Meta + Google at 50 % of planned budget. Ramp to 100 % at
  end of day 2 if CAC looks sane.

Day +7:
- Publish the first "Impact" post: X deliveries, Y km saved from
  empty boots, Z testimonials. Senders love metrics.

## Retention hooks

- **Credit loop:** every completed delivery credits 5 % back to the
  sender's wallet, usable on the next delivery. Simple, measurable,
  cheap.
- **Referral:** the existing `/parrainage` page gives 500 DA per
  converted friend. Double that in launch month to boost viral
  coefficient past 0.25.
- **Notifications:** the header bell now surfaces `booking_paid`
  and `new_message` in real time — drives re-engagement without
  email fatigue.

## Risks we accept

- **Supply cold-start in month 1** — some corridors will have zero
  transporters some days. CS must proactively refund with an apology
  credit rather than let bookings sit.
- **Legal scrutiny on amateur transport.** Under DZ law a private
  individual can carry a parcel for a friend; the grey zone is when
  it becomes habitual. Position us as "occasional voluntary
  transport with reimbursement" for the first 6 months. Legal sign-
  off already obtained for this framing.
- **Fraud.** Escrow mitigates most sender-side fraud. Transporter-
  side fraud (fake identity, empty parcel) is bounded by KYC + photo
  proof (see `DELIVERY_IN_APP_PLAN.md`).

## Post-launch metrics we will report weekly

- `N_bookings_completed` / `N_bookings_paid`
- `on_time_rate` (delivered_at ≤ departure_date + 1 day)
- `NPS_sender`, `NPS_transporter`
- `average_corridor_supply_density` (transporters active per corridor
  per day)
- `CAC_paid_sender` across channels
- `dispute_rate` and `dispute_resolution_time_hours`

If `dispute_rate` exceeds 3 % we pause ad spend and fix the supply
quality first. Marketing cannot outrun a broken delivery.
