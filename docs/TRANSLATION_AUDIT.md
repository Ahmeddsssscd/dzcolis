# Translation audit — FR / AR / EN

**Status:** audit done, staged cleanup complete
**Owner:** Ahmed
**Last updated:** 2026-04-20

## TL;DR

- `src/lib/i18n.tsx` is now balanced: **599 / 599 / 599** keys across
  FR, EN, AR.
- **31 orphan AR-only keys** (`market_*`) removed — they were not
  referenced anywhere in the codebase and a mirror `/marche` route does
  not exist.
- **0 Arabic entries** use FR or EN copy as a placeholder. The one AR
  value that is empty (`annonces_results_plural`) is intentionally
  empty: Arabic does not pluralise by appending "s".
- **33 EN entries** look identical to FR at the byte level — all of
  them are legitimate cognates (`"International"`, `"Messages"`,
  `"Email"`, `"Budget"`, brand names like `"Karim B."`, `"France"`, …).
  No action required.

The translation layer is coherent. Remaining work is about **moving
hardcoded strings into the i18n layer**, not fixing the layer itself.

## Audit method

A small AST-adjacent scan (`audit-i18n.mjs`) walked each of the three
language blocks in `src/lib/i18n.tsx`, diffed key sets, and flagged:

- keys present in one locale but missing in another,
- empty string values,
- AR values with no Arabic script (i.e. FR/EN pasted by mistake),
- EN values byte-identical to FR (likely lazy copy-paste).

Then a second script (`audit-hardcoded.mjs`) walked `src/app/**/*.tsx`
and flagged JSX text nodes + string literals containing French
accented characters that are **not** wrapped in a `t("…")` call. This
catches the common leak pattern where a dev types the copy in French
directly into the JSX and forgets to i18n-ise it.

## Findings by page

Counts are "hits" — not every hit is a user-visible string (some are
validation messages, error toasts, legal text, etc.).

### Tier 1 — High-traffic, worth i18n-ising

| File | Hits | Why it matters |
|------|-----:|----------------|
| `src/app/suivi/page.tsx` | 22 | Every tracking link opens this. Status labels + form copy should be 3-lingual. |
| `src/app/tableau-de-bord/page.tsx` | 50 | First screen after login. Plan names, level labels. |
| `src/app/reserver/[listingId]/page.tsx` | 36 | Core conversion step. Payment-method descriptions especially. |
| `src/app/kyc/page.tsx` | 20 | Mandatory for every transporter. Error toasts block submission. |
| `src/app/profil/page.tsx` | 22 | Personal dashboard. |
| `src/app/livreurs/page.tsx` | 25 | Public directory. |
| `src/app/annonces/[id]/page.tsx` | 16 | Listing detail. |
| `src/app/parrainage/page.tsx` | 11 | Referral flow. |

**Recommendation:** One translation-pass per page, about 30 minutes
each including the FR → EN + AR writing. Roughly **4 h of focused
work** for the whole tier.

### Tier 2 — Admin screens (internal use)

| File | Hits |
|------|-----:|
| `src/app/admin/expeditions/page.tsx` | 19 |
| `src/app/admin/page.tsx` | 16 |
| `src/app/admin/livreurs/page.tsx` | 15 |
| `src/app/admin/litiges/page.tsx` | 10 |
| `src/app/admin/parametres/page.tsx` | 26 |

**Policy:** admin UI stays FR. The handful of people who ever open
`/admin` all speak French, and maintaining three translations for an
internal back-office is cost without value. **No action.**

### Tier 3 — Legal & static content pages

| File | Hits | Action |
|------|-----:|--------|
| `src/app/confidentialite/page.tsx` | 74 | Keep FR-only (legal document under Algerian law). |
| `src/app/cgv/page.tsx` | 70 | Keep FR-only (contract between Waselli and the user, governed by DZ law). |
| `src/app/mentions-legales/page.tsx` | 25 | Keep FR-only (legal mentions). |
| `src/app/charte-transporteur/page.tsx` | 29 | Translate to AR — transporters are the audience and many prefer AR. |
| `src/app/assurance/page.tsx` | 59 | Translate — commercial explainer, not legal. |
| `src/app/conseils-emballage/page.tsx` | 56 | Translate — practical tips, read by senders. |
| `src/app/solutions-business/page.tsx` | 44 | Translate — B2B pitch, reads to diaspora partners in EN. |
| `src/app/international/envoyer/page.tsx` | 27 | Translate — international senders overwhelmingly need EN. |

**Policy:** legal pages (`cgv`, `confidentialite`, `mentions-legales`)
stay **French only**. That is the language of record for the contract
and disclaimers under Algerian jurisdiction. A translated version
could create ambiguity in case of dispute — the wrong kind of
localisation.

Everything else in this tier gets translated as a content job, not a
code job. Budget: **~1 working day** per long page, shorter for the
others.

## Changes made in this pass

1. Removed 31 orphan AR-only `market_*` keys from
   `src/lib/i18n.tsx`. The `/marche` or `/market` route they appear
   to reference does not exist, and `TranslationKey = keyof typeof
   translations.fr` means no code could have called them anyway.
2. Added 12 new keys (`home_engage_*`, `home_faq_*`) in FR / EN / AR
   to support the new home-page "Our commitments" and condensed FAQ
   sections.
3. This document, so the next person has a map of what is done and
   what remains.

## Open questions

- **Language auto-detection at first visit.** Today the default is
  FR. Should we read `Accept-Language` on the server and pre-switch
  EN for diaspora visitors coming from `.com` TLDs or EN IPs? Net lift
  is probably 2-3 % on international conversion — worth measuring.
- **AR RTL polish.** The i18n block is translated, but several
  components (status timelines, number badges, breadcrumbs) still
  read left-to-right even in AR mode. Separate accessibility pass
  needed.
- **Locale-aware date formatting.** `suivi/page.tsx` hardcodes
  `toLocaleDateString("fr-DZ", …)`. Should flow from the current
  locale on the `useI18n()` context.
