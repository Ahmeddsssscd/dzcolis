"use client";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; flag: string; native: string }[] = [
  { code: "fr", label: "Français",  flag: "🇫🇷", native: "FR" },
  { code: "ar", label: "العربية",   flag: "🇩🇿", native: "AR" },
  { code: "en", label: "English",   flag: "🇬🇧", native: "EN" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Options popup */}
      {open && (
        <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden min-w-[150px]">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                ${lang === l.code
                  ? "bg-dz-green/10 text-dz-green"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && (
                <svg className="w-4 h-4 ml-auto text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl rounded-2xl px-4 py-3 font-semibold text-sm transition-all hover:scale-105 active:scale-95"
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="tracking-wide">{current.native}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
