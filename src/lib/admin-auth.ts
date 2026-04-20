import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET environment variable is required. Set it in Vercel or .env.local."
    );
  }
  return secret;
}

/** Sign a value so we can verify it without storing sessions */
export function signToken(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Verify the admin_session HttpOnly cookie server-side */
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
