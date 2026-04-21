"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import SupportChatWidget from "./SupportChatWidget";

/**
 * Floating support launcher — stacks above the WhatsApp FAB (bottom-24 right-6).
 * Pre-fills name/email from session when available.
 */
export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  const initialName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initialEmail = user?.email ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("support_title")}
        className="fixed bottom-24 right-6 z-50 group flex items-center gap-3"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap shadow-lg pointer-events-none">
          {t("support_title")}
        </span>

        <div className="relative w-14 h-14 bg-[var(--brand)] hover:brightness-110 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
          <span className="absolute inset-0 rounded-full bg-[var(--brand)] animate-ping opacity-25" />
          <svg
            className="w-7 h-7 text-white relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 14v-2a9 9 0 1118 0v2" />
            <path d="M21 14v3a3 3 0 01-3 3h-1v-7h1a3 3 0 013 3z" fill="currentColor" stroke="none" />
            <path d="M3 14v3a3 3 0 003 3h1v-7H6a3 3 0 00-3 3z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </button>

      <SupportChatWidget
        open={open}
        onClose={() => setOpen(false)}
        initialName={initialName}
        initialEmail={initialEmail}
      />
    </>
  );
}
