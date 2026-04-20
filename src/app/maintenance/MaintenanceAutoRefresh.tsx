"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 6_000; // every 6 seconds

/**
 * Polls /api/maintenance/status and redirects the user back to the homepage
 * as soon as the admin disables maintenance mode. Also re-syncs the displayed
 * message if the admin edits it while the page is open.
 *
 * Security note: we used to update a sibling `<p id="maintenance-message">`
 * via `<script dangerouslySetInnerHTML>`. That worked but the inline-script
 * pattern is fragile — if the interpolated message ever bypassed JSON escaping
 * (encoding bug, upstream change) it would execute arbitrary JS. We now own
 * the message element ourselves and render it through React, which escapes
 * text automatically. No more inline scripts anywhere on this page.
 */
export default function MaintenanceAutoRefresh({
  initialMessage,
}: {
  initialMessage: string;
}) {
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>(initialMessage);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/maintenance/status", { cache: "no-store" });
        if (!res.ok) return;
        const data: { enabled: boolean; message: string } = await res.json();
        if (cancelled) return;

        setLastCheck(new Date());

        // Maintenance ended → send the user back to the site
        if (!data.enabled) {
          window.location.href = "/";
          return;
        }

        // Live-update the message if admin edited it
        if (data.message && data.message !== liveMessage) {
          setLiveMessage(data.message);
        }
      } catch {
        // Network hiccup — try again on next tick
      }
    }

    // Update the server-rendered <p id="maintenance-message"> on the first
    // tick if the admin has edited it since the page was rendered. We do
    // this in a plain useEffect (no inline <script>) so React owns the DOM
    // mutation and textContent escaping is automatic.
    const syncDom = () => {
      if (typeof document === "undefined") return;
      const el = document.getElementById("maintenance-message");
      if (el && el.textContent !== liveMessage) {
        el.textContent = liveMessage;
      }
    };
    syncDom();

    // First check right away, then on interval
    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [liveMessage]);

  return (
    <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/40">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span>
        {lastCheck
          ? `Connexion active — mise à jour automatique`
          : `Connexion en cours…`}
      </span>
    </div>
  );
}
