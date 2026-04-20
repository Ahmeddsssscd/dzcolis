import bcrypt from "bcryptjs";

// Cost factor 10 is the modern default: ~100ms on a typical server,
// which is painful enough to slow brute-force but fast enough not to
// DoS our own login endpoint. Raise to 12 if/when CPU budget allows.
const BCRYPT_COST = 10;

export async function hashPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    // Malformed hash in DB shouldn't auth the user — fail closed.
    return false;
  }
}

/**
 * Minimum policy for admin passwords. Deliberately lenient — we rely on
 * the rate limiter + bcrypt cost to block brute force, not complexity
 * rules. The one non-negotiable is length.
 */
export function validatePasswordStrength(plain: string): string | null {
  if (typeof plain !== "string") return "Mot de passe invalide";
  if (plain.length < 10) return "Mot de passe trop court (10 caractères minimum)";
  if (plain.length > 256) return "Mot de passe trop long";
  return null;
}
