"use client";

/*
 * <PhoneInput>
 *
 * One input, one country picker — drop-in replacement for the ad-hoc
 * "[+213] [555 123 456]" UI scattered across signup / profile /
 * transporter / reserver pages. Produces a single E.164 string via
 * `onChange` so the parent form only has to store one field.
 *
 * Design notes:
 *   • Placeholder defaults to a grey-but-visible example (not hidden),
 *     so first-time users see EXACTLY what they should type. Previously
 *     placeholders were invisible because pages used `placeholder="…"`
 *     with no color override and the default is near-transparent.
 *   • We split the stored value on every render — this keeps the
 *     component controlled by a single string without needing two
 *     props. Parents can still bind `value` to the full E.164 string
 *     (preferred) or to just the local part (legacy).
 *   • Dark mode: inputs inherit border / bg via existing design tokens
 *     on the page. No hardcoded `bg-white` here.
 */

import { useEffect, useMemo, useState } from "react";
import { PHONE_COUNTRIES, DEFAULT_PHONE_CODE, splitPhone, joinE164, samplePlaceholder } from "@/lib/phone";

interface Props {
  /** Full E.164 value (e.g. "+213555123456"). Can also be a legacy
   *  Algerian number without a prefix — we'll coerce it. */
  value: string;
  /** Receives the new E.164 value whenever the user types or changes
   *  the country. Empty string if the user cleared the input. */
  onChange: (e164: string) => void;
  /** Override the default country (+213). */
  defaultCode?: string;
  /** Disable both controls. */
  disabled?: boolean;
  /** Required-attribute forwarded to the <input>. */
  required?: boolean;
  /** Extra class on the outer wrapper — used to inject width, margin, etc. */
  className?: string;
  /** HTML id on the number input for <label htmlFor=...>. */
  id?: string;
  /** HTML name on the number input. */
  name?: string;
  /** Force-select a given country (disables the picker). Useful if the
   *  parent already has auth context and wants to lock the prefix. */
  lockCode?: string;
}

export default function PhoneInput({
  value,
  onChange,
  defaultCode = DEFAULT_PHONE_CODE,
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  lockCode,
}: Props) {
  // Derive country + local from the parent-controlled `value`.
  const derived = useMemo(() => splitPhone(value), [value]);

  // The country selection is kept in local state so the user can pick
  // a new prefix even when `value` is empty. We reconcile with
  // `derived.code` whenever the parent updates `value` with a prefix
  // that differs from our local state (e.g. external form reset).
  const [code, setCode] = useState<string>(lockCode || derived.code || defaultCode);
  const [local, setLocal] = useState<string>(derived.local);

  // External → internal sync. Only fire when the parent value has a
  // different country than what we're showing, to avoid stomping on
  // the user mid-typing.
  useEffect(() => {
    if (value) {
      setCode(lockCode || derived.code);
      setLocal(derived.local);
    } else {
      setLocal("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function emit(nextCode: string, nextLocal: string) {
    const clean = nextLocal.replace(/\D+/g, "");
    onChange(clean ? joinE164(nextCode, clean) : "");
  }

  const placeholder = samplePlaceholder(code);

  return (
    <div className={`flex items-stretch gap-2 ${className}`}>
      <select
        aria-label="Indicatif pays"
        disabled={disabled || !!lockCode}
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          emit(e.target.value, local);
        }}
        className="px-2 py-3 border border-dz-gray-200 rounded-xl text-sm bg-[var(--card-bg)] text-dz-gray-900 focus:outline-none focus:ring-2 focus:ring-dz-green shrink-0 disabled:opacity-60"
      >
        {PHONE_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          emit(code, e.target.value);
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3 py-3 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-900 bg-[var(--card-bg)] placeholder:text-dz-gray-300 dark:placeholder:text-dz-gray-500 focus:outline-none focus:ring-2 focus:ring-dz-green disabled:opacity-60"
      />
    </div>
  );
}
