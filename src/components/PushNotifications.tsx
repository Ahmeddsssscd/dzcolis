"use client";
import { useState, useEffect } from "react";

type Permission = "default" | "granted" | "denied";

// Demo notifications shown after user enables push
const DEMO_NOTIFICATIONS = [
  {
    title: "DZColis",
    body: "Nouveau transporteur disponible sur votre trajet Alger → Paris 🇫🇷",
    delay: 4000,
  },
  {
    title: "DZColis",
    body: "Votre colis a été pris en charge par le transporteur ✅",
    delay: 9000,
  },
];

export default function PushNotifications() {
  const [permission, setPermission] = useState<Permission>("default");
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission as Permission);
    }
  }, []);

  // Simulate an incoming notification badge after 30s if granted
  useEffect(() => {
    if (permission !== "granted") return;
    const t = setTimeout(() => setHasNew(true), 30000);
    return () => clearTimeout(t);
  }, [permission]);

  const handleEnable = async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    setShowTooltip(false);

    if (result === "granted") {
      // Send a welcome notification
      new Notification("DZColis — Notifications activées ✅", {
        body: "Vous serez alerté dès qu'un transporteur est disponible sur votre trajet.",
        icon: "/favicon.ico",
      });

      // Demo follow-up notifications
      DEMO_NOTIFICATIONS.forEach(({ title, body, delay }) => {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" });
          }
        }, delay);
      });
    }
  };

  const bellColor =
    permission === "granted"
      ? "text-dz-green"
      : permission === "denied"
      ? "text-dz-gray-300"
      : "text-dz-gray-600";

  const tooltip =
    permission === "granted"
      ? "Notifications activées"
      : permission === "denied"
      ? "Notifications bloquées — modifiez les paramètres du navigateur"
      : "Activer les notifications";

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (permission === "default") handleEnable();
          else setShowTooltip((v) => !v);
        }}
        aria-label={tooltip}
        className={`relative p-2 rounded-xl transition-colors hover:bg-dz-gray-100 ${bellColor}`}
        title={tooltip}
      >
        {/* Bell icon */}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Red dot for new notifications */}
        {hasNew && permission === "granted" && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        )}

        {/* Pulsing dot when not yet enabled */}
        {permission === "default" && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-dz-green rounded-full border border-white animate-pulse" />
        )}
      </button>

      {/* Tooltip dropdown for granted/denied state */}
      {showTooltip && permission !== "default" && (
        <div className="absolute right-0 top-12 w-64 bg-white border border-dz-gray-200 rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                permission === "granted" ? "bg-dz-green/10 text-dz-green" : "bg-red-100 text-red-500"
              }`}
            >
              {permission === "granted" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-dz-gray-800">
                {permission === "granted" ? "Notifications activées" : "Notifications bloquées"}
              </p>
              <p className="text-xs text-dz-gray-500 mt-0.5">
                {permission === "granted"
                  ? "Vous recevrez des alertes pour les nouveaux transporteurs, messages et mises à jour."
                  : "Pour activer, cliquez sur l'icône 🔒 dans la barre d'adresse de votre navigateur."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="mt-3 w-full text-xs text-dz-gray-400 hover:text-dz-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
