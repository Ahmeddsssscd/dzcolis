"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Livraison de jour" : "Livraison de nuit"}
      className="relative flex items-center gap-1.5 rounded-full px-2 py-1 border transition-all duration-300 select-none"
      style={{
        backgroundColor: isDark ? "#1a2420" : "#f0f4f1",
        borderColor: isDark ? "#2d3b32" : "#dce5de",
        minWidth: 72,
      }}
    >
      {/* Track icons */}
      <span className="text-xs transition-opacity duration-200" style={{ opacity: isDark ? 0.4 : 1 }}>☀️</span>

      {/* Sliding truck/package pill */}
      <span
        className="absolute flex items-center justify-center text-base transition-all duration-300"
        style={{
          left: isDark ? "calc(100% - 30px)" : "22px",
          transform: isDark ? "scaleX(-1)" : "scaleX(1)",
        }}
      >
        🚚
      </span>

      <span className="text-xs ml-auto transition-opacity duration-200" style={{ opacity: isDark ? 1 : 0.4 }}>🌙</span>
    </button>
  );
}
