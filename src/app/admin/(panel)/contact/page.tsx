"use client";

/*
 * /admin/contact — contact-form inbox.
 *
 * Reads the `contact_messages` table. Every row here is a submission
 * from a signed-in Waselli user via /contact. Because every row is
 * tied to a user_id, we can block/ban the submitter right from this
 * view if someone tries to use the contact form as a spam channel.
 *
 * Polling: 15s is plenty — contact-form traffic is low-volume and
 * admins usually keep the tab open in the background.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminT } from "@/lib/admin-i18n";

interface ContactMessage {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string | null;
  status: "new" | "read" | "archived";
  read_at: string | null;
  read_by: string | null;
  created_at: string;
}

type Status = "all" | "new" | "read" | "archived";

function fmt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ContactInboxPage() {
  const { t } = useAdminT();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<Status>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      qs.set("status", status);
      if (q.trim()) qs.set("q", q.trim());
      const res = await fetch(`/api/admin/contact?${qs.toString()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "err");
      setMessages(d.messages || []);
      setError("");
    } catch (e) {
      console.error(e);
      setError(t("adm_contact_err_load"));
    } finally {
      setLoading(false);
    }
  }, [status, q, t]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId]
  );

  // Auto-mark a message read when it's been open for 1s+.
  useEffect(() => {
    if (!selected || selected.status !== "new") return;
    const h = setTimeout(() => {
      void patch(selected.id, "mark_read");
    }, 1000);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  async function patch(id: string, action: "mark_read" | "mark_unread" | "archive" | "unarchive") {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError(t("adm_contact_err_patch"));
    }
  }

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t("adm_contact_title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("adm_contact_subtitle")}</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-2">{error}</div>}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "new", "read", "archived"] as Status[]).map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t(`adm_contact_f_${s}` as never)}
              {s === "new" && newCount > 0 && (
                <span className={`ms-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-red-500 text-white"}`}>{newCount}</span>
              )}
            </button>
          );
        })}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("adm_contact_search_ph")}
          className="ml-auto min-w-[220px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-4 min-h-[60vh]">
        {/* List */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">{t("adm_contact_loading")}</div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">{t("adm_contact_empty")}</div>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {messages.map((m) => {
                const isSel = selectedId === m.id;
                const isNew = m.status === "new";
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setSelectedId(m.id)}
                      className={`w-full text-start px-4 py-3 transition-colors ${
                        isSel ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${isNew ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {m.name}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmt(m.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{m.email}</div>
                      <div className={`text-xs truncate mt-0.5 ${isNew ? "text-gray-900" : "text-gray-500"}`}>
                        {m.subject}
                      </div>
                      {isNew && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {t("adm_contact_new_tag")}
                        </span>
                      )}
                      {m.status === "archived" && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {t("adm_contact_archived_tag")}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white border border-gray-100 rounded-2xl">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 py-20">
              {t("adm_contact_select_hint")}
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t("adm_contact_from")} <span className="font-semibold text-gray-700">{selected.name}</span> ·{" "}
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {fmt(selected.created_at)}
                    {selected.ip && <> · <span className="font-mono">{selected.ip}</span></>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re:%20${encodeURIComponent(selected.subject)}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {t("adm_contact_reply")}
                  </a>
                  {selected.status !== "archived" ? (
                    <button
                      onClick={() => patch(selected.id, "archive")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {t("adm_contact_archive")}
                    </button>
                  ) : (
                    <button
                      onClick={() => patch(selected.id, "unarchive")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {t("adm_contact_unarchive")}
                    </button>
                  )}
                  {selected.status === "read" && (
                    <button
                      onClick={() => patch(selected.id, "mark_unread")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {t("adm_contact_mark_unread")}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {selected.message}
              </div>

              <div className="text-xs text-gray-400">
                {t("adm_contact_user_ref")}{" "}
                <Link
                  href={`/admin/utilisateurs?q=${encodeURIComponent(selected.email)}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  {selected.user_id.slice(0, 8)}…
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
