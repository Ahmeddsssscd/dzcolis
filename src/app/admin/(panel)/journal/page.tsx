"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

/*
 * /admin/journal — audit log viewer.
 *
 * Consumes /api/admin/audit-log. Every admin (viewer+) can read this
 * page because the audit trail itself is a safety control: if a
 * suspicious change shows up in the UI, the first thing anyone asks is
 * "who did that?" — this page answers it.
 *
 * Filters are applied server-side so we don't over-fetch when the log
 * has grown to thousands of rows.
 */

interface AuditRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  at: string;
}

/*
 * Known actions — the matrix emitted by routes today. Used to populate
 * the filter dropdown and to colour-tag rows. Anything not listed here
 * still renders fine (falls through to the neutral "autre" style) but
 * won't appear in the dropdown. Add new actions as new routes emit them.
 */
const ACTION_CATEGORIES: { group: string; actions: string[] }[] = [
  {
    group: "Authentification",
    actions: ["admin.login", "admin.logout", "admin.bootstrap"],
  },
  {
    group: "Gestion des admins",
    actions: [
      "admin.create",
      "admin.delete",
      "admin.role_change",
      "admin.activate",
      "admin.deactivate",
      "admin.rename",
      "admin.password_reset",
    ],
  },
  {
    group: "Modération",
    actions: [
      "kyc.approve",
      "kyc.reject",
      "listings.moderate",
      "courier_applications.review",
      "users.ban",
      "users.unban",
    ],
  },
  {
    group: "Paiements",
    actions: ["payments.refund", "payments.manual_confirm"],
  },
  {
    group: "Litiges",
    actions: ["disputes.resolve", "disputes.comment"],
  },
  {
    group: "Configuration",
    actions: ["settings.update"],
  },
];

const ACTION_STYLES: Record<string, string> = {
  // auth
  "admin.login":         "bg-blue-50 text-blue-700",
  "admin.logout":        "bg-gray-100 text-gray-600",
  "admin.bootstrap":     "bg-purple-50 text-purple-700",
  // admin mgmt
  "admin.create":        "bg-green-50 text-green-700",
  "admin.delete":        "bg-red-50 text-red-700",
  "admin.role_change":   "bg-amber-50 text-amber-700",
  "admin.activate":      "bg-green-50 text-green-700",
  "admin.deactivate":    "bg-red-50 text-red-700",
  "admin.rename":        "bg-gray-100 text-gray-700",
  "admin.password_reset":"bg-amber-50 text-amber-700",
  // moderation
  "kyc.approve":         "bg-green-50 text-green-700",
  "kyc.reject":          "bg-red-50 text-red-700",
  "listings.moderate":   "bg-indigo-50 text-indigo-700",
  "courier_applications.review":"bg-indigo-50 text-indigo-700",
  "users.ban":           "bg-red-50 text-red-700",
  "users.unban":         "bg-green-50 text-green-700",
  // money
  "payments.refund":     "bg-purple-50 text-purple-700",
  "payments.manual_confirm":"bg-purple-50 text-purple-700",
  // disputes
  "disputes.resolve":    "bg-green-50 text-green-700",
  "disputes.comment":    "bg-gray-100 text-gray-700",
  // config
  "settings.update":     "bg-amber-50 text-amber-700",
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)}j`;
}

/*
 * Since-preset buttons. Computed client-side into an ISO string that
 * the API just does `gte` on. Empty string = no filter.
 */
function sinceFromPreset(preset: SincePreset): string {
  const now = Date.now();
  switch (preset) {
    case "1h":   return new Date(now - 60 * 60 * 1000).toISOString();
    case "24h":  return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    case "7d":   return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "30d":  return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    case "all":
    default:     return "";
  }
}

type SincePreset = "1h" | "24h" | "7d" | "30d" | "all";

const SINCE_OPTIONS: { key: SincePreset; label: string }[] = [
  { key: "1h",  label: "1h" },
  { key: "24h", label: "24h" },
  { key: "7d",  label: "7j" },
  { key: "30d", label: "30j" },
  { key: "all", label: "Tout" },
];

export default function JournalPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionFilter, setActionFilter] = useState("");
  const [sincePreset, setSincePreset] = useState<SincePreset>("7d");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      if (actionFilter) qs.set("action", actionFilter);
      const since = sinceFromPreset(sincePreset);
      if (since) qs.set("since", since);

      const res = await fetch(`/api/admin/audit-log?${qs.toString()}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: AuditRow[] = await res.json();
      setRows(data);
    } catch {
      setError("Impossible de charger le journal.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, sincePreset, limit]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  // Client-side search filter (cheap — operates on already-fetched rows).
  const visibleRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (r.actor_email ?? "").toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q) ||
      (r.target_id ?? "").toLowerCase().includes(q) ||
      (r.target_type ?? "").toLowerCase().includes(q) ||
      (r.ip ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const actors = new Set(rows.map((r) => r.actor_email).filter(Boolean));
    const actions = new Set(rows.map((r) => r.action));
    return { rows: rows.length, actors: actors.size, actions: actions.size };
  }, [rows]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Journal d&apos;audit</h2>
          <p className="text-gray-500 text-sm mt-1">
            Chaque action administrateur est enregistrée. Consultez-la pour comprendre ce qui
            s&apos;est passé, quand, et par qui.
          </p>
        </div>
        <button
          onClick={fetchLog}
          disabled={loading}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {loading ? "Chargement…" : "Actualiser"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Événements" value={String(stats.rows)} />
        <StatBox label="Acteurs uniques" value={String(stats.actors)} />
        <StatBox label="Types d'action" value={String(stats.actions)} />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900">Filtres</h3>
          <button
            onClick={() => {
              setActionFilter("");
              setSincePreset("7d");
              setSearch("");
              setLimit(100);
            }}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Réinitialiser
          </button>
        </div>

        {/* Period presets */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Période</label>
          <div className="flex gap-1 flex-wrap">
            {SINCE_OPTIONS.map((opt) => {
              const active = sincePreset === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSincePreset(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action filter + search + limit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Toutes les actions</option>
              {ACTION_CATEGORIES.map((cat) => (
                <optgroup key={cat.group} label={cat.group}>
                  {cat.actions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Recherche (email, IP, cible)
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="alice@waselli.com, 192.168…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Limite</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {[50, 100, 250, 500].map((n) => (
                <option key={n} value={n}>{n} dernières</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}

      {/* Events */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {loading
              ? "Chargement…"
              : visibleRows.length === rows.length
              ? `${visibleRows.length} événement${visibleRows.length > 1 ? "s" : ""}`
              : `${visibleRows.length} / ${rows.length} événements`}
          </h3>
          {!loading && visibleRows.length > 0 && (
            <span className="text-xs text-gray-400">
              Plus récent en premier
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement du journal…</div>
        ) : visibleRows.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Aucun événement pour ces filtres.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {visibleRows.map((row) => (
              <AuditRowView
                key={row.id}
                row={row}
                expanded={expanded === row.id}
                onToggle={() => setExpanded((curr) => (curr === row.id ? null : row.id))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function AuditRowView({
  row, expanded, onToggle,
}: {
  row: AuditRow; expanded: boolean; onToggle: () => void;
}) {
  const actionStyle = ACTION_STYLES[row.action] ?? "bg-gray-100 text-gray-600";
  const hasDetails =
    (row.metadata && Object.keys(row.metadata).length > 0) || row.target_id || row.ip;

  const initials =
    row.actor_email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <li>
      <button
        onClick={hasDetails ? onToggle : undefined}
        className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors ${
          hasDetails ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">
              {row.actor_email ?? "système"}
            </span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${actionStyle}`}>
              {row.action}
            </span>
            {row.target_type && (
              <span className="text-[11px] text-gray-500">
                → <span className="font-mono">{row.target_type}</span>
                {row.target_id && (
                  <span className="font-mono text-gray-400"> #{row.target_id.slice(0, 8)}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span title={fmtDateTime(row.at)}>{fmtDateTime(row.at)}</span>
            <span>·</span>
            <span>{timeAgo(row.at)}</span>
            {row.ip && (
              <>
                <span>·</span>
                <span className="font-mono">{row.ip}</span>
              </>
            )}
          </div>
        </div>

        {hasDetails && (
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {expanded && hasDetails && (
        <div className="px-5 pb-4 pl-[4.25rem]">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 text-xs">
            {row.target_id && (
              <DetailLine label="Cible" value={`${row.target_type ?? "?"} / ${row.target_id}`} mono />
            )}
            {row.ip && <DetailLine label="IP" value={row.ip} mono />}
            {row.actor_id && <DetailLine label="Actor ID" value={row.actor_id} mono />}
            {row.metadata && Object.keys(row.metadata).length > 0 && (
              <div>
                <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-1">
                  Metadata
                </div>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(row.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function DetailLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] min-w-[70px]">
        {label}
      </span>
      <span className={`text-gray-700 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
