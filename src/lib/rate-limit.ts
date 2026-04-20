import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory IP rate limiter (sliding window).
 *
 * Good enough for a single-instance Vercel serverless function and our current
 * traffic. For multi-region or high-traffic setups, swap the Map for Upstash
 * Redis / Vercel KV and keep the same API.
 *
 * Each call to `checkRateLimit(req, opts)` returns:
 *   - `null`  → request is allowed, proceed
 *   - a 429 NextResponse → caller must return it immediately
 *
 * Counters are keyed by `${bucket}:${ip}` so different endpoints share
 * the same process memory without colliding.
 */

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export interface RateLimitOptions {
  /** Unique name per endpoint so buckets don't cross-pollute */
  bucket: string;
  /** Max requests per IP per window */
  max: number;
  /** Window length in milliseconds */
  windowMs: number;
  /** Human-readable hint shown to the client (defaults to FR message) */
  message?: string;
}

export function getClientIp(req: NextRequest | Request): string {
  const headerGet = (name: string) =>
    (req as NextRequest).headers?.get?.(name) ?? null;

  const forwarded = headerGet("x-forwarded-for");
  const real = headerGet("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || real || "unknown";
}

/**
 * Check whether the current request from this IP is within the bucket's limit.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function checkRateLimit(
  req: NextRequest | Request,
  opts: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${opts.bucket}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  entry.count += 1;
  if (entry.count > opts.max) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    const message =
      opts.message ??
      `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfterSec / 60)} minutes.`;
    return NextResponse.json(
      { error: message },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(opts.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Reset the counter for an IP inside a bucket (e.g. on successful login so a
 * correct password clears the failed-attempt counter).
 */
export function resetRateLimit(req: NextRequest | Request, bucket: string) {
  const ip = getClientIp(req);
  store.delete(`${bucket}:${ip}`);
}
