"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminT } from "@/lib/admin-i18n";

/**
 * Admin-side support console.
 *
 * Left column  — queue (open chats + my claimed ones), auto-refreshes.
 * Right column — selected chat's conversation + composer.
 *
 * Polling rather than Supabase realtime on purpose: the support tables
 * use service-role-only access (see migration 004) and realtime needs
 * a permissive RLS policy, which would leak every chat to anyone with
 * the anon key. Two-second polling is cheap enough for this traffic
 * pattern (ops-level, not consumer-level).
 */

interface Chat {
  id: string;
  visitor_name: string;
  visitor_email: string;
  subject: string | null;
  status: "open" | "claimed" | "closed";
  claimed_by: string | null;
  claimed_at: string | null;
  closed_at: string | null;
  created_at: string;
  last_activity_at: string;
}

interface Message {
  id: string;
  author: "visitor" | "agent" | "system";
  admin_id: string | null;
  body: string;
  created_at: string;
}

const REFRESH_MS_QUEUE    = 4000;
const REFRESH_MS_MESSAGES = 2000;

export default function AdminSupportPage() {
  const { t } = useAdminT();

  const [open, setOpen] = useState<Chat[]>([]);
  const [mine, setMine] = useState<Chat[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Figure out the calling admin's id once — used to render "you
  // claimed this" labels. Exposed via /api/admin/me which already
  // backs the rest of the panel.
  const [selfId, setSelfId] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/admin/me").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.user?.id) setSelfId(d.user.id as string);
    }).catch(() => {/* ignore */});
  }, []);

  const refreshQueue = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/support/chats?status=queue", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      setOpen(data.open ?? []);
      setMine(data.mine ?? []);
    } catch {/* transient */}
  }, []);

  useEffect(() => {
    refreshQueue();
    const iv = setInterval(refreshQueue, REFRESH_MS_QUEUE);
    return () => clearInterval(iv);
  }, [refreshQueue]);

  const refreshSelected = useCallback(async () => {
    if (!selectedId) return;
    try {
      const [metaR, msgR] = await Promise.all([
        fetch(`/api/admin/support/chats/${selectedId}`,           { cache: "no-store" }),
        fetch(`/api/admin/support/chats/${selectedId}/messages`, { cache: "no-store" }),
      ]);
      if (metaR.ok) {
        const d = await metaR.json();
        setSelectedChat(d.chat ?? null);
      }
      if (msgR.ok) {
        const d = await msgR.json();
        setMessages(d.messages ?? []);
      }
    } catch {/* transient */}
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) { setSelectedChat(null); setMessages([]); return; }
    refreshSelected();
    const iv = setInterval(refreshSelected, REFRESH_MS_MESSAGES);
    return () => clearInterval(iv);
  }, [selectedId, refreshSelected]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleClaim() {
    if (!selectedId || acting) return;
    setActing(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/support/chats/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(typeof d?.error === "string" ? d.error : t("adm_support_err_claim"));
      }
      await Promise.all([refreshQueue(), refreshSelected()]);
    } finally {
      setActing(false);
    }
  }

  async function handleClose() {
    if (!selectedId || acting) return;
    setActing(true);
    try {
      await fetch(`/api/admin/support/chats/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      });
      await Promise.all([refreshQueue(), refreshSelected()]);
    } finally {
      setActing(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const r = await fetch(`/api/admin/support/chats/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (r.ok) {
        setDraft("");
        refreshSelected();
      } else {
        const d = await r.json().catch(() => ({}));
        setError(typeof d?.error === "string" ? d.error : t("adm_support_err_send"));
      }
    } finally {
      setSending(false);
    }
  }

  const isMine = selectedChat?.status === "claimed" && selectedChat.claimed_by === selfId;

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">{t("adm_support_title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("adm_support_subtitle")}</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] overflow-hidden">
        {/* Queue column */}
        <aside className="border-r border-gray-100 bg-white overflow-y-auto">
          <Section title={t("adm_support_mine")} items={mine} selectedId={selectedId} onSelect={setSelectedId} emptyLabel={t("adm_support_mine_empty")} />
          <Section title={t("adm_support_queue")} items={open} selectedId={selectedId} onSelect={setSelectedId} emptyLabel={t("adm_support_queue_empty")} badge />
        </aside>

        {/* Chat column */}
        <section className="flex flex-col overflow-hidden bg-gray-50">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-gray-400">{t("adm_support_select_hint")}</p>
            </div>
          ) : (
            <>
              <header className="px-5 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{selectedChat.visitor_name}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedChat.visitor_email}</p>
                  {selectedChat.subject && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{selectedChat.subject}</p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                    selectedChat.status === "open"
                      ? "bg-amber-100 text-amber-800"
                      : selectedChat.status === "claimed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t(`adm_support_status_${selectedChat.status}` as const)}
                </span>
                {selectedChat.status === "open" && (
                  <button
                    onClick={handleClaim}
                    disabled={acting}
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    {t("adm_support_claim")}
                  </button>
                )}
                {isMine && (
                  <button
                    onClick={handleClose}
                    disabled={acting}
                    className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                  >
                    {t("adm_support_close")}
                  </button>
                )}
              </header>

              {error && (
                <div className="px-5 py-2 bg-red-50 border-b border-red-100 text-red-800 text-xs">
                  {error}
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-8">{t("adm_support_empty")}</p>
                )}
                {messages.map((m) => {
                  if (m.author === "system") {
                    return (
                      <div key={m.id} className="text-center">
                        <span className="inline-block text-[11px] text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                          {m.body}
                        </span>
                      </div>
                    );
                  }
                  const isAgent = m.author === "agent";
                  return (
                    <div key={m.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                          isAgent
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedChat.status === "closed" ? (
                <div className="p-4 border-t border-gray-100 bg-white text-center text-sm text-gray-500">
                  {t("adm_support_closed_notice")}
                </div>
              ) : !isMine ? (
                <div className="p-4 border-t border-gray-100 bg-white text-center text-sm text-gray-500">
                  {t("adm_support_claim_hint")}
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-end gap-2">
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
                    placeholder={t("adm_support_composer_ph")}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t("adm_support_send")}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Section({
  title, items, selectedId, onSelect, emptyLabel, badge,
}: {
  title: string;
  items: Chat[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel: string;
  badge?: boolean;
}) {
  return (
    <div className="py-3">
      <div className="px-5 py-2 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{title}</p>
        {badge && items.length > 0 && (
          <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-3 text-xs text-gray-400">{emptyLabel}</p>
      ) : (
        items.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-5 py-3 border-l-2 transition-colors ${
              selectedId === c.id
                ? "bg-blue-50 border-blue-600"
                : "border-transparent hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate flex-1">{c.visitor_name}</p>
              <span className="text-[10px] text-gray-400">{timeAgo(c.last_activity_at)}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{c.subject ?? c.visitor_email}</p>
          </button>
        ))
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return "";
  const diff = Math.max(0, Date.now() - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
