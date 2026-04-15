"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently (within 3 days)
    const dismissedAt = localStorage.getItem("pwa_dismissed_at");
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 2000);
      return;
    }

    // Capture native install prompt if browser supports it
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Always show after 2s regardless — if no native prompt, show manual instructions
    const timer = setTimeout(() => setShow(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa_dismissed_at", Date.now().toString());
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-white border border-dz-gray-200 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-dz-green rounded-xl flex items-center justify-center text-2xl shrink-0">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dz-gray-800 text-sm">Installer DZColis</p>
            <p className="text-xs text-dz-gray-500 mt-0.5 leading-relaxed">
              {isIOS
                ? "Appuyez sur le bouton Partager puis « Sur l'écran d'accueil »"
                : "Installez l'appli pour un accès rapide depuis votre écran d'accueil"}
            </p>
          </div>
          <button onClick={dismiss} className="text-dz-gray-400 hover:text-dz-gray-600 shrink-0 -mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isIOS ? (
          <div className="mt-4 bg-dz-gray-50 rounded-xl p-3 flex items-center gap-3 text-xs text-dz-gray-600">
            <span className="text-lg">1️⃣</span> Appuyez sur
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l-2 4H4l4 4-1 5 5-3 5 3-1-5 4-4h-6L12 2z" />
            </svg>
            puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>
          </div>
        ) : prompt ? (
          <div className="mt-4 flex gap-2">
            <button
              onClick={install}
              className="flex-1 bg-dz-green hover:bg-dz-green-light text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Installer
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-600 hover:bg-dz-gray-50 transition-colors"
            >
              Plus tard
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <div className="bg-dz-gray-50 rounded-xl p-3 text-xs text-dz-gray-600">
              Sur Chrome : Menu <strong>⋮</strong> → <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>
            </div>
            <button
              onClick={dismiss}
              className="w-full px-4 py-2.5 border border-dz-gray-200 rounded-xl text-sm text-dz-gray-600 hover:bg-dz-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
