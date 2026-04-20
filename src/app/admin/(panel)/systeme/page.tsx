"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AUDIT_UPDATED_AT,
  SECURITY_ITEMS,
  FEATURE_ITEMS,
  INFRA_ITEMS,
  type SecurityItem,
  type FeatureItem,
  type InfraItem,
  type IssueSeverity,
  type IssueStatus,
} from "./audit-data";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

/*
 * /admin/systeme — the "what's the state of this codebase" page.
 *
 * Four tabs:
 *   - Santé         : live health of Supabase / Resend / Chargily
 *   - Sécurité      : snapshot of SECURITY_ITEMS (from audit-data.ts)
 *   - Fonctionnalités : in-flight features with progress bars
 *   - Infra         : prod/infra punch list (migrations, backups, Sentry, ...)
 *
 * The three non-live tabs are backed by hand-maintained constants in
 * ./audit-data.ts. Treat that file as the single source of truth: flip
 * status → "fixed" once something ships. The AUDIT_UPDATED_AT banner at
 * the top tells admins how stale the list is at a glance.
 *
 * All visible text is translated through `useAdminT()` so switching the
 * global language switcher re-renders this page in fr/en/ar. Audit item
 * `title`/`note` strings stay in French — they're engineering-facing
 * content maintained alongside the code; translating them per locale
 * isn't worth the cost.
 */

type Tab = "sante" | "securite" | "features" | "infra";

interface HealthData {
  supabase: { ok: boolean; latencyMs: number };
  resend: { ok: boolean; mode: string };
  chargily: { ok: boolean; mode: string };
  checkedAt: string;
}

/* ─── Style maps (colour stays, labels resolved via t()) ──────────── */

const SEVERITY_STYLES: Record<IssueSeverity, { chip: string; dot: string; key: AdminKey }> = {
  critical: { chip: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500",    key: "adm_sys_sev_crit" },
  high:     { chip: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", key: "adm_sys_sev_high" },
  medium:   { chip: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", key: "adm_sys_sev_med" },
  low:      { chip: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500",   key: "adm_sys_sev_low" },
};

const STATUS_STYLES: Record<IssueStatus, { chip: string; key: AdminKey }> = {
  open:    { chip: "bg-gray-100 text-gray-700",     key: "adm_sys_st_open" },
  wip:     { chip: "bg-indigo-100 text-indigo-700", key: "adm_sys_st_wip" },
  fixed:   { chip: "bg-green-100 text-green-700",   key: "adm_sys_st_fixed" },
  wontfix: { chip: "bg-gray-200 text-gray-500",     key: "adm_sys_st_wontfix" },
};

const INFRA_SEVERITY_STYLES: Record<InfraItem["severity"], { chip: string; key: AdminKey }> = {
  high:   { chip: "bg-orange-50 text-orange-700 border-orange-200", key: "adm_sys_sev_high" },
  medium: { chip: "bg-yellow-50 text-yellow-700 border-yellow-200", key: "adm_sys_sev_med" },
  low:    { chip: "bg-blue-50 text-blue-700 border-blue-200",       key: "adm_sys_sev_low" },
};

const FEATURE_STATUS_STYLES: Record<FeatureItem["status"], { chip: string; bar: string; key: AdminKey }> = {
  idea:    { chip: "bg-gray-100 text-gray-600",     bar: "bg-gray-300",    key: "adm_sys_f_idea" },
  wip:     { chip: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500",  key: "adm_sys_f_wip" },
  done:    { chip: "bg-green-100 text-green-700",   bar: "bg-green-500",   key: "adm_sys_f_done" },
  blocked: { chip: "bg-red-100 text-red-700",       bar: "bg-red-400",     key: "adm_sys_f_blocked" },
};

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${className}`}>
      {children}
    </span>
  );
}

/* ─── Tab 1 — live health ─────────────────────────────────────────── */

function HealthDot({ ok }: { ok: boolean }) {
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ok ? "bg-green-500" : "bg-red-500"}`} />;
}

function HealthTab() {
  const { t, lang } = useAdminT();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/health");
      if (!res.ok) throw new Error(String(res.status));
      setHealth(await res.json());
    } catch {
      setError(t("adm_sys_h_error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tag = lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-FR";
  let checkedStr: string = t("adm_sys_h_waiting");
  if (health?.checkedAt) {
    try {
      checkedStr = `${t("adm_sys_h_checked")} ${new Date(health.checkedAt).toLocaleTimeString(tag)}`;
    } catch {
      checkedStr = `${t("adm_sys_h_checked")} ${new Date(health.checkedAt).toLocaleTimeString("fr-FR")}`;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-gray-900 font-semibold">{t("adm_sys_h_services")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{checkedStr}</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
        >
          {loading ? t("adm_sys_h_checking") : t("adm_sys_h_refresh")}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthCard
          title={t("adm_sys_h_db")}
          subtitle={t("adm_sys_h_db_sub")}
          ok={health?.supabase.ok ?? false}
          loading={loading && !health}
          detail={health?.supabase.latencyMs != null ? `${health.supabase.latencyMs} ms` : "—"}
        />
        <HealthCard
          title={t("adm_sys_h_mail")}
          subtitle={t("adm_sys_h_mail_sub")}
          ok={health?.resend.ok ?? false}
          loading={loading && !health}
          detail={health?.resend.mode ?? "—"}
        />
        <HealthCard
          title={t("adm_sys_h_pay")}
          subtitle={t("adm_sys_h_pay_sub")}
          ok={health?.chargily.ok ?? false}
          loading={loading && !health}
          detail={`${t("adm_sys_h_mode")} ${health?.chargily.mode ?? "—"}`}
        />
      </div>

      {/* Static reminders that often fail silently */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">{t("adm_sys_h_rem_title")}</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>{t("adm_sys_h_rem_stripe")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>{t("adm_sys_h_rem_migration")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>{t("adm_sys_h_rem_secret")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function HealthCard({
  title, subtitle, ok, loading, detail,
}: {
  title: string; subtitle: string; ok: boolean; loading: boolean; detail: string;
}) {
  const { t } = useAdminT();
  return (
    <div
      className={`rounded-2xl p-5 border ${
        loading
          ? "bg-gray-50 border-gray-100"
          : ok
          ? "bg-green-50 border-green-100"
          : "bg-red-50 border-red-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {!loading && <HealthDot ok={ok} />}
        {loading && <span className="w-2.5 h-2.5 rounded-full bg-gray-300 animate-pulse" />}
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
      <p className={`text-sm font-medium ${loading ? "text-gray-400" : ok ? "text-green-700" : "text-red-700"}`}>
        {loading ? t("adm_sys_h_checking") : ok ? t("adm_sys_h_ok") : t("adm_sys_h_down")}
      </p>
      {!loading && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
    </div>
  );
}

/* ─── Tab 2 — security audit ──────────────────────────────────────── */

const SEVERITY_ORDER: IssueSeverity[] = ["critical", "high", "medium", "low"];

function SecurityTab() {
  const { t } = useAdminT();
  const [onlyOpen, setOnlyOpen] = useState(true);

  const filtered = useMemo(
    () => (onlyOpen ? SECURITY_ITEMS.filter((i) => i.status !== "fixed" && i.status !== "wontfix") : SECURITY_ITEMS),
    [onlyOpen]
  );

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0, open: 0, fixed: 0 };
    for (const it of SECURITY_ITEMS) {
      c[it.severity]++;
      if (it.status === "open" || it.status === "wip") c.open++;
      if (it.status === "fixed") c.fixed++;
    }
    return c;
  }, []);

  return (
    <div className="space-y-4">
      {/* Severity legend / counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SEVERITY_ORDER.map((sev) => {
          const style = SEVERITY_STYLES[sev];
          const count = SECURITY_ITEMS.filter((i) => i.severity === sev).length;
          return (
            <div key={sev} className={`rounded-xl border p-4 ${style.chip}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-xs font-semibold uppercase tracking-wide">{t(style.key)}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <p className="text-xs opacity-70">{count > 1 ? t("adm_sys_items") : t("adm_sys_item")}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500">
          {counts.fixed} {counts.fixed > 1 ? t("adm_sys_fixed_count_p") : t("adm_sys_fixed_count")} · {counts.open} {counts.open > 1 ? t("adm_sys_open_count_p") : t("adm_sys_open_count")}
        </p>
        <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          {t("adm_sys_only_open")}
        </label>
      </div>

      {/* Grouped by severity */}
      <div className="space-y-5">
        {SEVERITY_ORDER.map((sev) => {
          const items = filtered.filter((i) => i.severity === sev);
          if (items.length === 0) return null;
          return <SecuritySection key={sev} severity={sev} items={items} />;
        })}
        {filtered.length === 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-8 text-center">
            <p className="text-green-700 font-semibold">{t("adm_sys_all_green")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SecuritySection({ severity, items }: { severity: IssueSeverity; items: SecurityItem[] }) {
  const { t } = useAdminT();
  const sevStyle = SEVERITY_STYLES[severity];
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${sevStyle.dot}`} />
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t(sevStyle.key)} · {items.length}
        </h4>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden">
        {items.map((it) => (
          <div key={it.id} className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-gray-400">{it.id}</span>
                  <h5 className="text-sm font-semibold text-gray-900">{it.title}</h5>
                </div>
                <code className="block text-[11px] text-gray-500 mt-1 break-all">{it.where}</code>
                <p className="text-sm text-gray-600 mt-2">{it.note}</p>
              </div>
              <Chip className={STATUS_STYLES[it.status].chip}>{t(STATUS_STYLES[it.status].key)}</Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Tab 3 — features ────────────────────────────────────────────── */

function FeaturesTab() {
  const { t } = useAdminT();
  const totalProgress = useMemo(() => {
    if (FEATURE_ITEMS.length === 0) return 0;
    const sum = FEATURE_ITEMS.reduce((s, f) => s + (f.progress ?? 0), 0);
    return Math.round(sum / FEATURE_ITEMS.length);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900">{t("adm_sys_f_global")}</h4>
          <span className="text-sm font-bold text-gray-900">{totalProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {t("adm_sys_f_avg_prefix")} {FEATURE_ITEMS.length} {t("adm_sys_f_avg_suffix")}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden">
        {FEATURE_ITEMS.map((f) => (
          <FeatureRow key={f.id} item={f} />
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ item }: { item: FeatureItem }) {
  const { t } = useAdminT();
  const st = FEATURE_STATUS_STYLES[item.status];
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-gray-400">{item.id}</span>
            <h5 className="text-sm font-semibold text-gray-900">{item.title}</h5>
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.note}</p>
        </div>
        <Chip className={st.chip}>{t(st.key)}</Chip>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${st.bar} rounded-full transition-all`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 tabular-nums w-10 text-end">
          {item.progress}%
        </span>
      </div>
    </div>
  );
}

/* ─── Tab 4 — infra ───────────────────────────────────────────────── */

function InfraTab() {
  const { t } = useAdminT();
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{t("adm_sys_infra_intro")}</p>

      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden">
        {INFRA_ITEMS.map((it) => (
          <InfraRow key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

function InfraRow({ item }: { item: InfraItem }) {
  const { t } = useAdminT();
  const sev = INFRA_SEVERITY_STYLES[item.severity];
  const status = STATUS_STYLES[item.status];
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-gray-400">{item.id}</span>
            <h5 className="text-sm font-semibold text-gray-900">{item.title}</h5>
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.note}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Chip className={`border ${sev.chip}`}>{t(sev.key)}</Chip>
          <Chip className={status.chip}>{t(status.key)}</Chip>
        </div>
      </div>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────── */

interface TabDef { key: Tab; labelKey: AdminKey; count?: number }

const TABS: TabDef[] = [
  { key: "sante",     labelKey: "adm_sys_tab_health" },
  { key: "securite",  labelKey: "adm_sys_tab_security",   count: SECURITY_ITEMS.filter((i) => i.status !== "fixed" && i.status !== "wontfix").length },
  { key: "features",  labelKey: "adm_sys_tab_features",   count: FEATURE_ITEMS.filter((f) => f.status !== "done").length },
  { key: "infra",     labelKey: "adm_sys_tab_infra",      count: INFRA_ITEMS.filter((i) => i.status !== "fixed" && i.status !== "wontfix").length },
];

export default function SystemePage() {
  const { t } = useAdminT();
  const [tab, setTab] = useState<Tab>("sante");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("adm_sys_title")}</h2>
          <p className="text-gray-500 text-sm mt-1">{t("adm_sys_subtitle")}</p>
        </div>
        <span className="text-[11px] font-medium text-gray-400 px-2.5 py-1 rounded-full bg-gray-100">
          {t("adm_sys_audit_date")} : {AUDIT_UPDATED_AT}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t(tb.labelKey)}
              {tb.count != null && tb.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      {tab === "sante"    && <HealthTab />}
      {tab === "securite" && <SecurityTab />}
      {tab === "features" && <FeaturesTab />}
      {tab === "infra"    && <InfraTab />}
    </div>
  );
}
