# PayPal — international payment option (research note)

**Status:** research only, not yet implemented
**Owner:** Ahmed
**Last updated:** 2026-04-20

## Why we are looking at this

Today, Waselli accepts two payment paths:

| Corridor       | Provider        | Currency | Notes                                          |
|----------------|-----------------|----------|------------------------------------------------|
| Domestic (DZ)  | Chargily        | DZD      | Edahabia + CIB, commission 1.5 %               |
| International  | Stripe (cards)  | EUR      | Visa/Mastercard, commission ~1.4 % + 0.25 €    |

Stripe covers 90 % of diaspora users. The gap is the ~10 % who insist on
paying with a PayPal account, usually because:

- they do not have a credit/debit card abroad (common for students),
- they already keep a PayPal balance from selling on Vinted / eBay,
- they trust PayPal's buyer protection for cross-border transfers.

Every time we surface this in user interviews we hear the same line:
*"Tu n'acceptes pas PayPal ?"*. Adding it would close the gap without
rebuilding the whole payment layer.

## Two viable integration paths

### Option A — PayPal standalone (REST API)

- Create a PayPal Business account (DZ-registered entity is allowed if
  KYC passes; fallback is a FR/BE PayPal Business if Waselli operates a
  EU subsidiary, which we will eventually need anyway for VAT).
- Integrate the `v2/checkout/orders` REST endpoints: `create` →
  redirect to PayPal → `capture` on return.
- Webhook `CHECKOUT.ORDER.APPROVED` drives the same booking state
  machine as Chargily's `checkout.paid`.
- **Pros:** highest margin (standard rate ~3.4 % + 0.35 € cross-border),
  cleanest dispute flow on PayPal's side.
- **Cons:** two new surfaces to maintain (API + webhook) and we lose the
  uniformity of going through Stripe for all card-like flows.

### Option B — PayPal via Stripe

Stripe added PayPal as a payment method in 2023. On a Stripe Checkout
session you simply add `"paypal"` to `payment_method_types` and the
customer sees a "Pay with PayPal" button next to the card form.

- **Pros:** zero new infrastructure, one webhook, one reconciliation,
  one KYC. Rollback = remove one string from the array.
- **Cons:** higher effective rate (Stripe passes PayPal's fee through
  plus a small margin — ballpark 3.8 % + 0.25 €), and availability
  depends on the Stripe entity country. For our FR Stripe account this
  is live today.

### Recommendation

**Go with Option B first**, measure conversion lift over two weeks, and
only move to Option A if the fee delta eats a noticeable chunk of
margin. The time cost is maybe 30 minutes of code plus a new line in
`src/app/reserver/[listingId]/page.tsx` for the payment method selector.

## Implementation sketch (Option B)

1. `INTERNATIONAL_PAYMENT_METHODS` in `src/app/reserver/[listingId]/page.tsx`
   gains a `paypal` entry:
   ```ts
   { id: "paypal", label: "PayPal", desc: "Payez via votre solde ou compte PayPal" }
   ```
2. `src/app/api/payment/stripe/create/route.ts` branches on
   `paymentMethod`:
   ```ts
   payment_method_types: paymentMethod === "paypal"
     ? ["paypal"]
     : ["card"],
   ```
3. Webhook stays unchanged — Stripe already emits
   `checkout.session.completed` for PayPal sessions.
4. Display the effective fee in the price breakdown so the sender knows
   why the total is slightly higher when PayPal is chosen (fairness).

## Open questions

- **Refund policy:** PayPal allows partial refunds for 180 days; Stripe
  inherits that. Document this in CGV so the dispute flow in
  `/admin/litiges` can cite it.
- **Currency:** we keep EUR for international. Paying DZD via PayPal is
  not supported (DZ is PayPal-restricted), so no risk of corridor mix.
- **Chargeback exposure:** PayPal is more sender-friendly than Stripe
  on chargebacks. The escrow model already mitigates this, but we
  should expect a slightly higher reversal rate than pure card.

## Decision log (to be filled in after the pilot)

- [ ] Pilot started on `__/__/____`
- [ ] Two-week conversion delta: `+__ %` paid bookings
- [ ] Fee delta: `__ DA` per average booking
- [ ] Keep / drop / migrate to Option A
