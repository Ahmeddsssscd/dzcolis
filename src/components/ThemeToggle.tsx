"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="flex items-center gap-1 rounded-full px-1.5 py-1 border transition-all duration-300 select-none"
      style={{
        backgroundColor: isDark ? "#1a2420" : "#f0f4f1",
        borderColor: isDark ? "#2d3b32" : "#dce5de",
        width: 72,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sun */}
      <span className="text-xs z-10 transition-opacity duration-200" style={{ opacity: isDark ? 0.35 : 1 }}>☀️</span>

      {/* Spacer */}
      <span className="flex-1" />

      {/* Moon */}
      <span className="text-xs z-10 transition-opacity duration-200" style={{ opacity: isDark ? 1 : 0.35 }}>🌙</span>

      {/* Sliding truck pill */}
      <span
        className="absolute top-1/2 text-base leading-none pointer-events-none"
        style={{
          transform: `translateY(-50%) translateX(${isDark ? "38px" : "4px"}) scaleX(${isDark ? -1 : 1})`,
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        🚚
      </span>
    </button>
  );
}
