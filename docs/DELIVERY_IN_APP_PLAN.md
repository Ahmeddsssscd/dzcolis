# Delivery-side experience — in-app plan

**Status:** plan, not yet implemented
**Owner:** Ahmed
**Last updated:** 2026-04-20

## Context

Today Waselli is mostly a **sender-first** product:

- `/envoyer` is polished and converts.
- `/annonces` and `/reserver/[listingId]` lead senders through to
  checkout.
- The transporter-side has `/transporter` (publish a trip) and
  `/tableau-de-bord` (see my bookings) but there is **no dedicated
  delivery surface** — no run list, no per-stop detail, no photo
  upload, no offline-friendly "en route" mode.

The gap is visible: transporters land on the dashboard, squint at a
table, and fall back to phone + WhatsApp to actually run the day. We
lose all the coordination signal.

This doc plans the delivery-side experience as a proper product, not
an admin table.

## User story

> I am a transporter. This morning I have 4 collections and 4 drops
> spread across Algiers. I open Waselli, see a single "Today" screen,
> tap the next stop, call the client, snap a photo when I have the
> parcel, and move on. At night I tap "End of day" and Waselli emails
> me the day's receipts.

## Surfaces to build

### 1. `/livreur/aujourd-hui` — the run screen

The home screen for transporters on a working day.

- Header: date, total stops, total kg, total DA to collect / to earn.
- Timeline of stops, sorted by the route we compute (simple
  nearest-neighbour over wilaya centroids for v1; swap for
  Mapbox/OpenRouteService later).
- Each stop card shows:
  - the booking ref (WSL-YY-NNNNNN from migration 001),
  - sender / recipient name + phone (tap-to-call),
  - address,
  - parcel summary (weight, content, dimensions, instructions),
  - current status chip,
  - primary CTA: **Marquer collecté** / **Marquer livré**.
- Secondary button: **Ouvrir le chat** (deep-link to the conversation
  seeded at booking time).

### 2. `/livreur/stop/[bookingId]` — per-stop detail

When the transporter is at the door. This is the only screen that
matters at that moment — big buttons, offline-tolerant.

- Big photo of the client avatar + name.
- Read-only: address, phone, pickup instructions.
- **Photo upload** (camera first, gallery fallback): proof of pickup
  or drop-off. Stored in Supabase Storage `bookings/{id}/`. Writes
  metadata into the `bookings` row: `pickup_photos[]`, `drop_photos[]`.
- **Signature pad** (canvas) for the recipient at drop-off.
- **Transition button:** `pending → in_transit` at pickup, `in_transit
  → delivered` at drop-off. Same DB route as the admin uses today, so
  no new API surface.

### 3. `/livreur/fin-de-journee` — day summary

End-of-day close-out:

- Stats: stops done, kg moved, DA owed by Waselli (escrow held), DA
  already released.
- One-tap PDF receipt (re-uses the `/api/admin/bookings/[id]/proof-pdf`
  endpoint but scoped to the transporter for their own bookings — new
  route `/api/livreur/day-pdf`).
- Prompt to leave a review on each sender.

## Data model changes

Minimal — we avoid a new table.

| Table | Change |
|-------|--------|
| `bookings` | add `pickup_photos text[]` and `drop_photos text[]` (nullable, default `{}`) |
| `bookings` | add `recipient_signature_url text` (nullable) |
| `bookings` | add `in_transit_at timestamptz`, `delivered_at timestamptz` so the day summary can filter quickly |

A single migration (say `002_delivery_columns.sql`) handles this in one
`alter table` + new storage policy.

## Storage policy

Create a `delivery-proofs` bucket with RLS:

- Insert: only the listing owner (the transporter) on a booking they
  are on.
- Select: the sender, the transporter, and the admin.
- Delete: admin only.

## Routing & auth

- All `/livreur/*` pages are auth-gated and additionally require
  `profile.kyc_status = "approved"`. We already have the KYC status on
  the user object; a lightweight `<RequireKyc>` wrapper component in
  `src/lib/guards.tsx` does the job.
- If the user is KYC-pending we route them to `/kyc` with an
  explanation.

## Offline & network resilience

Algeria's mobile network is patchy outside city centres. For v1:

- Queue status transitions in `localStorage` if `navigator.onLine ===
  false`, replay on reconnect.
- Show a persistent "Hors ligne — les changements seront envoyés dès
  reconnexion" banner.
- Photo uploads are **not** queued client-side in v1: too risky (device
  loss = no proof). Show a modal: "Impossible d'enregistrer la preuve,
  réessayez dès que vous avez du signal."

## Phasing

| Phase | Scope | ETA |
|-------|-------|-----|
| 1 | `/livreur/aujourd-hui` timeline (read-only, no photos) | 1 day |
| 2 | Per-stop detail + status transitions (no photo) | 1 day |
| 3 | Photo upload + storage policy | 2 days |
| 4 | Signature pad + day-summary PDF | 1 day |
| 5 | Offline queue for status transitions | 2 days |

Total: ~7 working days for a production-ready delivery experience.

## Non-goals for v1

- Route optimisation across multiple drivers.
- Real-time GPS tracking visible to the sender (this is the `/suivi`
  page's job; we keep the in-app delivery surface separate from the
  public tracking page).
- Third-party integrations (Waze, Google Maps embed). A `tel:` and
  `geo:` link pair is enough on mobile.

## Open questions

- Should the driver see the declared value of high-value parcels? Risk
  of targeted theft vs benefit of knowing what care to take. **Default:
  hide unless the sender opts to share.**
- Do we support a "refuse parcel" action at pickup (e.g. parcel doesn't
  match the declared content)? Probably yes with a reason picker —
  the decision flows into `/admin/litiges`.
- How do we handle two drivers sharing a vehicle? Out of scope for v1;
  the account model is 1 listing = 1 driver.
