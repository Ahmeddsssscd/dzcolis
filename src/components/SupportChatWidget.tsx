"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Floating support chat — opens a modal from the "Support" card on
 * /contact. Self-contained on purpose so it can later be dropped on
 * other pages (FAQ, /tableau-de-bord) behind the same trigger.
 *
 * State machine:
 *   form  → visitor types name/email/subject/message, submits
 *   chat  → conversation view, polls every 2s for new messages
 *
 * The chat id + token survive a reload via localStorage so a visitor
 * who refreshes keeps their place in the queue. We only reopen a
 * live chat (open or claimed); closed chats fall back to the form.
 *
 * Token is our auth secret — losing it locks the visitor out of
 * their own chat. That's acceptable; they can always start a new one.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  initialEmail?: string;
}

interface Message {
  id: string;
  author: "visitor" | "agent" | "system";
  body: string;
  created_at: string;
}

interface ChatState {
  id: string;
  token: string;
  status: "open" | "claimed" | "closed";
  queuePosition: number | null;
}

const LS_KEY = "waselli:support_chat";

export default function SupportChatWidget({ open, onClose, initialName = "", initialEmail = "" }: Props) {
  const { t } = useI18n();
  const [stage, setStage] = useState<"form" | "chat">("form");
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chat, setChat] = useState<ChatState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Restore a previously started chat if it's still live.
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { id: string; token: string };
      if (!saved?.id || !saved?.token) return;
      fetch(`/api/support/chats/${saved.id}`, {
        headers: { "x-support-token": saved.token },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) { localStorage.removeItem(LS_KEY); return; }
          if (data.status === "closed") { localStorage.removeItem(LS_KEY); return; }
          setChat({
            id: saved.id,
            token: saved.token,
            status: data.status,
            queuePosition: data.queuePosition ?? null,
          });
          setStage("chat");
        })
        .catch(() => {/* fall through to form */});
    } catch {/* localStorage disabled — ignore */}
  }, [open]);

  // Poll the chat meta (status, queue position) every 5s while open.
  useEffect(() => {
    if (!open || stage !== "chat" || !chat) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/support/chats/${chat.id}`, {
          headers: { "x-support-token": chat.token },
          cache: "no-store",
        });
        if (!r.ok || cancelled) return;
        const data = await r.json();
        setChat((prev) => prev ? {
          ...prev,
          status: data.status,
          queuePosition: data.queuePosition ?? null,
        } : prev);
      } catch {/* ignore transient errors */}
    };
    tick();
    const iv = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [open, stage, chat]);

  // Poll messages every 2s. Cheap endpoint, bounded by chat lifetime.
  const refreshMessages = useCallback(async () => {
    if (!chat) return;
    try {
      const r = await fetch(`/api/support/chats/${chat.id}/messages`, {
        headers: { "x-support-token": chat.token },
        cache: "no-store",
      });
      if (!r.ok) return;
      const { messages: list } = await r.json();
      setMessages(list ?? []);
    } catch {/* ignore */}
  }, [chat]);

  useEffect(() => {
    if (!open || stage !== "chat" || !chat) return;
    refreshMessages();
    const iv = setInterval(refreshMessages, 2000);
    return () => clearInterval(iv);
  }, [open, stage, chat, refreshMessages]);

  // Keep the scroll pinned to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/support/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(typeof data?.error === "string" ? data.error : t("support_error_start"));
        return;
      }
      const saved = { id: data.id as string, token: data.token as string };
      try { localStorage.setItem(LS_KEY, JSON.stringify(saved)); } catch {/* ignore */}
      setChat({ id: saved.id, token: saved.token, status: "open", queuePosition: null });
      setStage("chat");
      setMessage("");
    } catch {
      setError(t("support_error_start"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chat || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const r = await fetch(`/api/support/chats/${chat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-support-token": chat.token },
        body: JSON.stringify({ text }),
      });
      if (r.ok) {
        setDraft("");
        refreshMessages();
      }
    } finally {
      setSending(false);
    }
  }

  function handleLeave() {
    // Keep the chat alive on the server — the visitor can reopen it
    // from another page/tab using the localStorage token. Just shut
    // the modal for now.
    onClose();
  }

  function handleNewChat() {
    try { localStorage.removeItem(LS_KEY); } catch {/* ignore */}
    setChat(null);
    setMessages([]);
    setStage("form");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleLeave}
        aria-hidden
      />

      <div className="relative bg-[var(--card-bg)] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] border border-[var(--card-border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dz-green/10 text-dz-green flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-dz-gray-900 text-sm">{t("support_title")}</p>
              <p className="text-xs text-dz-gray-400">
                {stage === "chat" && chat?.status === "claimed"
                  ? t("support_status_claimed")
                  : stage === "chat" && chat?.status === "open"
                  ? t("support_status_open")
                  : t("support_subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            aria-label="Close"
            className="text-dz-gray-400 hover:text-dz-gray-700 p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        {stage === "form" ? (
          <form onSubmit={handleStart} className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="text-sm text-dz-gray-500">{t("support_intro")}</p>
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-dz-gray-600 mb-1">{t("support_field_name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dz-gray-600 mb-1">{t("support_field_email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dz-gray-600 mb-1">{t("support_field_subject")}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder={t("support_field_subject_ph")}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dz-gray-600 mb-1">{t("support_field_message")}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
                rows={4}
                placeholder={t("support_field_message_ph")}
                className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-dz-green text-white py-2.5 rounded-xl font-semibold hover:bg-dz-green-dark transition-colors disabled:opacity-60"
            >
              {submitting ? t("support_starting") : t("support_start_cta")}
            </button>
          </form>
        ) : (
          <>
            {/* Queue banner */}
            {chat?.status === "open" && (
              <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 text-sm text-amber-900 flex items-center gap-3">
                <svg className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                </svg>
                <span>
                  {chat.queuePosition && chat.queuePosition > 1
                    ? t("support_waiting_with_position").replace("{n}", String(chat.queuePosition))
                    : t("support_waiting")}
                </span>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-dz-gray-50">
              {messages.length === 0 && (
                <p className="text-center text-xs text-dz-gray-400 py-8">{t("support_empty")}</p>
              )}
              {messages.map((m) => {
                if (m.author === "system") {
                  return (
                    <div key={m.id} className="text-center">
                      <span className="inline-block text-[11px] text-dz-gray-500 bg-dz-gray-100 rounded-full px-3 py-1">
                        {m.body}
                      </span>
                    </div>
                  );
                }
                const isMe = m.author === "visitor";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-sm ${
                        isMe
                          ? "bg-dz-green text-white rounded-br-sm"
                          : "bg-white dark:bg-dz-gray-200 text-dz-gray-900 border border-dz-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            {chat?.status === "closed" ? (
              <div className="p-4 border-t border-[var(--card-border)] bg-dz-gray-50 text-center space-y-2">
                <p className="text-sm text-dz-gray-500">{t("support_closed_notice")}</p>
                <button
                  onClick={handleNewChat}
                  className="text-sm text-dz-green font-semibold hover:underline"
                >
                  {t("support_new_chat")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-3 border-t border-[var(--card-border)] flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={t("support_composer_ph")}
                  className="flex-1 border border-dz-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="bg-dz-green text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-dz-green-dark disabled:opacity-50"
                >
                  {t("support_send")}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
