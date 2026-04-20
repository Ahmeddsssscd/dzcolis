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

  // On Vercel (our production host), `x-real-ip` is set by the edge proxy
  // and CANNOT be overridden by the client. Prefer it when present.
  const real = headerGet("x-real-ip");
  if (real) return real;

  // Fallback: `x-forwarded-for` is a comma-separated chain. The LEFTMOST
  // entry is the original claimed client — which the client controls and
  // can spoof (`curl -H "X-Forwarded-For: 1.2.3.4"`). The RIGHTMOST entry
  // is the one the closest trusted proxy appended, which is the real
  // source IP. Use the last entry so per-IP rate limits can't be bypassed
  // by forging the header.
  //
  // This matches OWASP guidance for XFF parsing behind a single trusted
  // hop. If we ever add Cloudflare in front of Vercel we'll need to skip
  // one additional proxy-added entry from the tail.
  const forwarded = headerGet("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return "unknown";
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
