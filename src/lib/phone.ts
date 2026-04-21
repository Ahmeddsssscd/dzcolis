/**
 * Phone-number utilities — shared by every form that captures a phone
 * and every page that displays one.
 *
 * Design rules:
 *   1. We store phones in E.164 form with the leading `+` and no spaces:
 *      `+213555123456`, `+33612345678`. That's what the DB SHOULD look
 *      like for any record created after this ships.
 *   2. Legacy data isn't migrated — there are raw Algerian numbers in
 *      the profiles table with no prefix (e.g. `555123456`, `0555 12 34 56`).
 *      `formatPhone()` must tolerate those and render them as if they
 *      were Algerian, so the dashboard doesn't look broken overnight.
 *   3. The country-code list is small on purpose. It covers >99% of our
 *      users (Algeria + EU diaspora countries). Adding a country is a
 *      one-line change here.
 */
export interface PhoneCountry {
  /** International dial code with leading `+`, e.g. `+213`. */
  code: string;
  /** Emoji flag — used in dropdowns. */
  flag: string;
  /** Short human label used in dropdowns / pills. */
  label: string;
  /** Example LOCAL number (no country code), shown as placeholder. */
  sample: string;
}

/**
 * Supported countries. Order matters — Algeria comes first because it's
 * the default for the vast majority of submissions.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "+213", flag: "🇩🇿", label: "Algérie",   sample: "5 55 12 34 56"   },
  { code: "+33",  flag: "🇫🇷", label: "France",    sample: "6 12 34 56 78"   },
  { code: "+34",  flag: "🇪🇸", label: "Espagne",   sample: "612 34 56 78"    },
  { code: "+39",  flag: "🇮🇹", label: "Italie",    sample: "312 345 6789"    },
  { code: "+49",  flag: "🇩🇪", label: "Allemagne", sample: "151 23456789"    },
  { code: "+32",  flag: "🇧🇪", label: "Belgique",  sample: "470 12 34 56"    },
  { code: "+1",   flag: "🇺🇸", label: "USA/CA",    sample: "415 555 0132"    },
  { code: "+44",  flag: "🇬🇧", label: "UK",        sample: "7400 123456"     },
  { code: "+212", flag: "🇲🇦", label: "Maroc",     sample: "6 12 34 56 78"   },
  { code: "+216", flag: "🇹🇳", label: "Tunisie",   sample: "20 123 456"      },
  { code: "+90",  flag: "🇹🇷", label: "Turquie",   sample: "532 123 45 67"   },
  { code: "+971", flag: "🇦🇪", label: "UAE",       sample: "50 123 4567"     },
  { code: "+966", flag: "🇸🇦", label: "Arabie S.", sample: "50 123 4567"     },
];

/** Fast lookup of dial code → PhoneCountry. */
const BY_CODE: Record<string, PhoneCountry> = Object.fromEntries(
  PHONE_COUNTRIES.map((c) => [c.code, c])
);

/** Default dial code used when we can't detect one from a raw string. */
export const DEFAULT_PHONE_CODE = "+213";

/**
 * Strip non-digits. Keeps the leading `+` intact. Used everywhere we
 * need a clean token to work with (tel:, wa.me, E.164).
 */
function onlyDigitsKeepPlus(raw: string): string {
  if (!raw) return "";
  const hasPlus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D+/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Split a raw phone into a known dial code + local part. Falls back to
 * `{code: +213, local: <digits>}` if we can't identify a prefix — that
 * matches legacy Algerian data in the DB.
 *
 * Local part is returned WITHOUT leading zeros (Algerian trunk prefix
 * `0` is stripped) and without spaces, so display formatters can
 * regroup it however they like.
 */
export function splitPhone(raw: string | null | undefined): { code: string; local: string } {
  const clean = onlyDigitsKeepPlus((raw ?? "").trim());
  if (!clean) return { code: DEFAULT_PHONE_CODE, local: "" };

  if (clean.startsWith("+")) {
    // Try codes longest-first so `+213` wins over `+21`.
    const codes = Object.keys(BY_CODE).sort((a, b) => b.length - a.length);
    for (const c of codes) {
      if (clean.startsWith(c)) {
        return { code: c, local: clean.slice(c.length).replace(/^0+/, "") };
      }
    }
    // Unknown country code — keep it verbatim so the admin sees the
    // real number instead of us silently mangling it.
    return { code: clean.slice(0, 4), local: clean.slice(4) };
  }

  // No `+` → assume Algeria, strip leading trunk zero if present.
  return { code: DEFAULT_PHONE_CODE, local: clean.replace(/^0+/, "") };
}

/**
 * Groups a local-part string into readable chunks. Not a real phone
 * formatter (that would require libphonenumber); a simple "every 2
 * digits" grouping works fine for AL, FR, DZ, TN, MA and looks clean
 * for the others.
 */
function group(local: string): string {
  if (!local) return "";
  return local.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

/**
 * Canonical display format:  +213 5 55 12 34 56
 *
 * - If the raw value already starts with `+`, we respect whatever
 *   country code is there.
 * - If it doesn't, we prepend `fallback` (defaults to +213). This
 *   keeps legacy rows looking correct everywhere without a migration.
 * - Empty / null input → empty string, so JSX like
 *   `{formatPhone(u.phone) || "—"}` works naturally.
 */
export function formatPhone(raw: string | null | undefined, fallback: string = DEFAULT_PHONE_CODE): string {
  if (!raw) return "";
  const s = raw.trim();
  if (!s) return "";
  const { code, local } = splitPhone(s.startsWith("+") ? s : `${fallback}${s}`);
  if (!local) return code;
  return `${code} ${group(local)}`;
}

/**
 * Combine dial code + local digits into E.164 (`+213555123456`). Used
 * by forms at submit time to produce the value that ends up in the DB.
 */
export function joinE164(code: string, local: string): string {
  const cleanCode = (code || DEFAULT_PHONE_CODE).trim();
  const cleanLocal = (local || "").replace(/\D+/g, "").replace(/^0+/, "");
  if (!cleanLocal) return "";
  return `${cleanCode}${cleanLocal}`;
}

/** E.164 without the `+`, suitable for wa.me URLs. */
export function toWaNumber(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const { code, local } = splitPhone(s);
  return `${code.replace("+", "")}${local}`;
}

/** Fully qualified `tel:` href. */
export function toTelHref(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const { code, local } = splitPhone(s);
  return `tel:${code}${local}`;
}

/** Fully qualified `wa.me` URL, with an optional pre-filled message. */
export function toWaLink(raw: string | null | undefined, message?: string): string {
  const num = toWaNumber(raw);
  if (!num) return "";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Placeholder example for a given country code (e.g. "5 55 12 34 56"). */
export function samplePlaceholder(code: string): string {
  return BY_CODE[code]?.sample ?? BY_CODE[DEFAULT_PHONE_CODE].sample;
}
