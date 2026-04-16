"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="relative flex items-center rounded-full border transition-all duration-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        width: 52,
        height: 28,
        backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
        borderColor: isDark ? "#334155" : "#cbd5e1",
        padding: 3,
      }}
    >
      {/* Sliding pill */}
      <span
        className="absolute top-[3px] flex items-center justify-center rounded-full transition-all duration-300 pointer-events-none"
        style={{
          width: 22,
          height: 22,
          backgroundColor: isDark ? "#3b82f6" : "#ffffff",
          boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.15)",
          left: isDark ? "calc(100% - 25px)" : "3px",
        }}
      >
        {/* Sun icon */}
        <svg
          className="absolute transition-all duration-300"
          style={{ opacity: isDark ? 0 : 1, transform: isDark ? "scale(0.5) rotate(90deg)" : "scale(1) rotate(0deg)" }}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
        {/* Moon icon */}
        <svg
          className="absolute transition-all duration-300"
          style={{ opacity: isDark ? 1 : 0, transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-90deg)" }}
          width="12" height="12" viewBox="0 0 24 24" fill="#e2e8f0" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
