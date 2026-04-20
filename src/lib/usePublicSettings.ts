"use client";
import { useEffect, useState } from "react";

/**
 * Public platform settings (email / whatsapp / address) pushed from
 * the admin panel. Safe to expose: the backing endpoint only returns
 * keys declared in PUBLIC_KEYS server-side.
 *
 * Values live in the platform_settings table and are edited at
 * /admin/parametres. Changes propagate within ~10s thanks to the edge
 * cache on /api/settings/public.
 */
export interface PublicSettings {
  email_contact: string;
  whatsapp: string; // international format, e.g. "+213XXXXXXXXX"
  adresse: string;
}

// Keeps the payload stable across re-mounts so hopping between pages
// doesn't re-fetch. Admins editing /admin/parametres see their changes
// after the edge cache (~10s) plus the next client navigation.
let cached: PublicSettings | null = null;

const DEFAULTS: PublicSettings = {
  email_contact: "contact@waselli.com",
  whatsapp: "+213XXXXXXXXX",
  adresse: "Alger, Algérie",
};

export function usePublicSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>(cached ?? DEFAULTS);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, string> | null) => {
        if (cancelled || !data) return;
        const next: PublicSettings = {
          email_contact: data.email_contact?.trim() || DEFAULTS.email_contact,
          whatsapp:      data.whatsapp?.trim()      || DEFAULTS.whatsapp,
          adresse:       data.adresse?.trim()       || DEFAULTS.adresse,
        };
        cached = next;
        setSettings(next);
      })
      .catch(() => { /* keep defaults */ });
    return () => { cancelled = true; };
  }, []);

  return settings;
}

/** Strip spaces and drop leading "+" for wa.me URLs. */
export function whatsappNumber(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/^\+/, "");
}
