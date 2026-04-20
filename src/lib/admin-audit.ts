import { adminSupabase } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";
import type { AdminSession } from "@/lib/admin-auth";

/**
 * Append a row to public.admin_audit_log.
 *
 * Design principles:
 *   1. Never throw. Logging must not block the action it records — a
 *      failed insert here is worse than no log, but it's far worse to
 *      refund a payment AND fail the whole request because the audit
 *      row couldn't write.
 *   2. Snapshot the actor's email into the row. If an admin is deleted
 *      later, their history still reads as "ayoub@..." not "uuid-of-null".
 *   3. Keep metadata JSON-safe and small. Don't log request bodies
 *      verbatim — they may contain PII, payment details, or passwords.
 *      Pass only the fields the audit trail actually needs.
 */
export async function logAdminAction(params: {
  session: AdminSession;
  req?: NextRequest | Request;
  action: string;
  targetType?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { session, req, action, targetType, targetId, metadata } = params;

    const ip = req ? getClientIp(req) : null;

    await adminSupabase.from("admin_audit_log").insert({
      actor_id: session.userId,
      actor_email: session.email,
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      metadata: metadata ?? {},
      ip,
    });
  } catch (err) {
    // Deliberately swallow. Don't even return the error — a caller that
    // `await`s this shouldn't care about the outcome. We log to console
    // so ops can spot a broken audit pipeline in the Vercel logs.
    console.error("[admin-audit] failed to log action:", err);
  }
}
