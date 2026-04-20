/**
 * Canonical pricing formula. Any surface that quotes or charges a booking
 * amount MUST go through this helper — never trust a `total_amount` the
 * client (or a stale DB row) hands you.
 *
 * Formula:
 *   transport   = price_per_kg × weight_kg
 *   commission  = transport × commission_rate
 *   total       = transport + commission
 *
 * Rounding:
 *   - Domestic (DZD): whole dinars at every step (no 0.1 DA fragments).
 *   - International (EUR): two decimal places.
 *
 * Why this exists: the payment API used to send `booking.total_amount`
 * straight to Chargily without recomputing. A race, a manual DB edit, or
 * a compromised admin could have silently shifted the charged amount. We
 * now recompute server-side from immutable inputs (listing.price_per_kg,
 * booking.weight) and refuse to charge if the recomputed total drifts
 * from what the client saw.
 */
export interface BookingPriceInput {
  pricePerKg: number;
  weightKg: number;
  /** 0.10 = 10 % */
  commissionRate: number;
  /** EUR vs DZD rounding */
  isInternational: boolean;
}

export interface BookingPriceBreakdown {
  transport: number;
  commission: number;
  total: number;
}

export function computeBookingPrice(input: BookingPriceInput): BookingPriceBreakdown {
  const { pricePerKg, weightKg, commissionRate, isInternational } = input;

  if (!Number.isFinite(pricePerKg) || pricePerKg < 0) {
    throw new Error("Invalid pricePerKg");
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new Error("Invalid weightKg");
  }
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 1) {
    throw new Error("Invalid commissionRate");
  }

  const transport = isInternational
    ? Math.round(pricePerKg * weightKg * 100) / 100
    : Math.round(pricePerKg * weightKg);

  const commission = isInternational
    ? Math.round(transport * commissionRate * 100) / 100
    : Math.round(transport * commissionRate);

  const total = isInternational
    ? Math.round((transport + commission) * 100) / 100
    : transport + commission;

  return { transport, commission, total };
}

/**
 * True if two amounts agree within a tight tolerance — used to flag a
 * tampered or drifted `booking.total_amount` before charging it.
 *
 * Tolerance is intentionally TIGHT and flat (no percentage component):
 *   - DZD: 2 dinars
 *   - EUR: 0.02 euros
 *
 * Why flat, not percentage: `computeBookingPrice` is deterministic and
 * rounds to whole DZD / 2-decimal EUR. No legitimate drift exists. The
 * small floor absorbs a single-step rounding difference between legacy
 * rows and the current formula; anything larger is tampering and we want
 * to catch it. A percentage-based tolerance would let drift scale with
 * amount — on a 100 000 DZD booking a 0.5 % tolerance would silently
 * accept a 500 DZD drift, which defeats the whole check.
 */
export function priceMatches(
  expected: number,
  seen: number,
  opts: { currency?: "dzd" | "eur" } = {}
): boolean {
  const delta = Math.abs(expected - seen);
  const tolerance = opts.currency === "eur" ? 0.02 : 2;
  return delta <= tolerance;
}
