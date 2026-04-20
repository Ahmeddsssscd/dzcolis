"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 6_000; // every 6 seconds

/**
 * Polls /api/maintenance/status and redirects the user back to the homepage
 * as soon as the admin disables maintenance mode. Also re-syncs the displayed
 * message if the admin edits it while the page is open.
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

    // First check right away, then on interval
    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [liveMessage]);

  return (
    <>
      {/* Live message sync — replaces the static one if admin changed it */}
      {liveMessage !== initialMessage && (
        <script
          // Tiny inline script to update the visible message without a full reload
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var el = document.getElementById('maintenance-message');
                if (el) el.textContent = ${JSON.stringify(liveMessage)};
              })();
            `,
          }}
        />
      )}

      {/* Subtle live indicator */}
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
    </>
  );
}
