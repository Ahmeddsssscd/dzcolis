"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface RecentBooking {
  id: string;
  booking_ref: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  wilaya: string;
  created_at: string;
}

interface ChartDay {
  date: string;
  label: string;
  amount: number;
}

interface NotableEvent {
  id: string;
  type: "kyc" | "dispute" | "refund" | "high_value";
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  href: string;
  at: string;
}

interface StatsData {
  total_users: number;
  active_listings: number;
  ongoing_bookings: number;
  monthly_revenue: number;
  kyc_pending: number;
  recent_bookings: RecentBooking[];
  recent_users: RecentUser[];
  revenue_chart: ChartDay[];
  new_users_today: number;
  new_users_week: number;
  notable_events: NotableEvent[];
}

interface HealthData {
  supabase: { ok: boolean; latencyMs: number };
  resend: { ok: boolean; mode: string };
  chargily: { ok: boolean; mode: string };
  checkedAt: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  in_transit: "En transit",
  delivered: "Livrée",
  cancelled: "Annulée",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDA(n: number) {
  return n.toLocaleString("fr-FR") + " DA";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)}j`;
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function StatCard({
  label, value, sub, subColor, iconBg, iconColor, icon,
}: {
  label: string; value: string; sub: string; subColor: string;
  iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs mt-1 font-medium ${subColor}`}>{sub}</p>
        </div>
        <div className={`${iconBg} ${iconColor} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function HealthDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ok ? "bg-green-500" : "bg-red-500"}`}
    />
  );
}

const EVENT_STYLES: Record<
  NotableEvent["severity"],
  { dot: string; chip: string; border: string }
> = {
  danger:  { dot: "bg-red-500",    chip: "bg-red-50 text-red-700",       border: "border-red-100"    },
  warning: { dot: "bg-yellow-500", chip: "bg-yellow-50 text-yellow-700", border: "border-yellow-100" },
  info:    { dot: "bg-blue-500",   chip: "bg-blue-50 text-blue-700",     border: "border-blue-100"   },
};

const EVENT_TYPE_LABELS: Record<NotableEvent["type"], string> = {
  kyc:        "KYC",
  dispute:    "Litige",
  refund:     "Remboursement",
  high_value: "Forte valeur",
};

function NotableEventsCard({ events, loading }: { events: NotableEvent[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Évènements à surveiller</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            KYC, litiges, remboursements & colis de forte valeur (7 derniers jours)
          </p>
        </div>
        {!loading && events.length > 0 && (
          <span className="bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        )}
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Chargement…</div>
      ) : events.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          Aucun évènement notable — tout est calme 🌿
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {events.map((ev) => {
            const st = EVENT_STYLES[ev.severity];
            return (
              <li key={ev.id}>
                <Link
                  href={ev.href}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${st.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{ev.title}</span>
                      <span className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${st.chip}`}>
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{ev.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    {timeAgo(ev.at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RevenueChart({ data, loading }: { data: ChartDay[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((day) => {
        const pct = Math.max((day.amount / max) * 100, day.amount > 0 ? 8 : 3);
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col items-center justify-end" style={{ height: 96 }}>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10">
                {formatDA(day.amount)}
              </div>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  day.amount > 0 ? "bg-blue-500" : "bg-gray-100"
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const fetchStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoadingStats(false); })
      .catch(() => setLoadingStats(false));
  }, []);

  const fetchHealth = useCallback(() => {
    fetch("/api/admin/health")
      .then((r) => r.json())
      .then((d) => { setHealth(d); setLoadingHealth(false); })
      .catch(() => setLoadingHealth(false));
  }, []);

  useEffect(() => {
    fetchStats();
    fetchHealth();
    // Load maintenance status
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        setMaintenance(s.maintenance === "true");
      })
      .catch(() => {});
  }, [fetchStats, fetchHealth]);

  const L = loadingStats;

  const STATS = [
    {
      label: "Total utilisateurs",
      value: L ? "…" : String(stats?.total_users ?? 0),
      sub: `+${stats?.new_users_today ?? 0} aujourd'hui · +${stats?.new_users_week ?? 0} cette semaine`,
      subColor: "text-blue-600",
      iconBg: "bg-blue-50", iconColor: "text-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Annonces actives",
      value: L ? "…" : String(stats?.active_listings ?? 0),
      sub: "Trajets disponibles",
      subColor: "text-green-600",
      iconBg: "bg-green-50", iconColor: "text-green-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Expéditions en cours",
      value: L ? "…" : String(stats?.ongoing_bookings ?? 0),
      sub: "En attente / transit",
      subColor: "text-orange-500",
      iconBg: "bg-orange-50", iconColor: "text-orange-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5.01M13 16H9m4 0h3m2-5h-5V6m5 5l1.5 2.5M16 11V6h2l3 5" />
        </svg>
      ),
    },
    {
      label: "Revenus du mois",
      value: L ? "…" : formatDA(stats?.monthly_revenue ?? 0),
      sub: "Paiements confirmés",
      subColor: "text-green-600",
      iconBg: "bg-purple-50", iconColor: "text-purple-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Maintenance banner */}
      {maintenance && (
        <div className="bg-red-600 rounded-2xl px-5 py-3 flex items-center gap-4">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <p className="text-white text-sm font-semibold flex-1">
            Mode maintenance actif — les utilisateurs ne peuvent pas accéder au site
          </p>
          <Link
            href="/admin/parametres"
            className="text-white/80 hover:text-white text-xs underline underline-offset-2"
          >
            Désactiver →
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme Waselli</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">État du système</h3>
          {!loadingHealth && (
            <button
              onClick={() => { setLoadingHealth(true); fetchHealth(); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Actualiser
            </button>
          )}
        </div>

        {loadingHealth ? (
          <div className="text-gray-400 text-sm text-center py-4">Vérification en cours…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Supabase */}
            <div className={`rounded-xl p-4 border ${health?.supabase.ok ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <HealthDot ok={health?.supabase.ok ?? false} />
                <span className="text-sm font-semibold text-gray-900">Base de données</span>
              </div>
              <p className={`text-xs font-medium ${health?.supabase.ok ? "text-green-700" : "text-red-700"}`}>
                {health?.supabase.ok ? "Opérationnel" : "Hors ligne"}
              </p>
              {health?.supabase.latencyMs != null && (
                <p className="text-xs text-gray-400 mt-0.5">{health.supabase.latencyMs}ms</p>
              )}
            </div>

            {/* Resend */}
            <div className={`rounded-xl p-4 border ${health?.resend.ok ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <HealthDot ok={health?.resend.ok ?? false} />
                <span className="text-sm font-semibold text-gray-900">Emails (Resend)</span>
              </div>
              <p className={`text-xs font-medium ${health?.resend.ok ? "text-green-700" : "text-red-700"}`}>
                {health?.resend.ok ? "Opérationnel" : "Erreur / Non configuré"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{health?.resend.mode}</p>
            </div>

            {/* Chargily */}
            <div className={`rounded-xl p-4 border ${health?.chargily.ok ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <HealthDot ok={health?.chargily.ok ?? false} />
                <span className="text-sm font-semibold text-gray-900">Paiements (Chargily)</span>
              </div>
              <p className={`text-xs font-medium ${health?.chargily.ok ? "text-green-700" : "text-orange-700"}`}>
                {health?.chargily.ok ? "Opérationnel" : "Vérifier la clé API"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Mode : {health?.chargily.mode ?? "inconnu"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revenue chart + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Revenus — 7 derniers jours</h3>
              <p className="text-xs text-gray-400 mt-0.5">Paiements confirmés uniquement</p>
            </div>
            <Link href="/admin/paiements" className="text-blue-600 text-xs font-medium hover:underline">
              Voir tout →
            </Link>
          </div>
          <RevenueChart data={stats?.revenue_chart ?? []} loading={loadingStats} />
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <Link
              href="/admin/kyc"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Vérifier KYC
              {(stats?.kyc_pending ?? 0) > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats?.kyc_pending}
                </span>
              )}
            </Link>
            <Link
              href="/admin/litiges"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-yellow-50 text-yellow-700 text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Litiges
            </Link>
            <Link
              href="/admin/livreurs"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Candidatures livreurs
            </Link>
            <Link
              href="/admin/parametres"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Paramètres
            </Link>
          </div>
        </div>
      </div>

      {/* Notable events — unified feed of KYC submissions, disputes,
          refunds and high-value bookings. Everything here wants a human
          decision; routine activity stays in the tables below. */}
      <NotableEventsCard events={stats?.notable_events ?? []} loading={loadingStats} />

      {/* Bottom row: recent bookings + recent signups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Activité récente</h3>
            <Link href="/admin/expeditions" className="text-blue-600 text-sm font-medium hover:underline">
              Voir tout →
            </Link>
          </div>
          {loadingStats ? (
            <div className="py-10 text-center text-gray-400 text-sm">Chargement…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Réf", "Statut", "Montant", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(stats?.recent_bookings ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                        Aucune réservation
                      </td>
                    </tr>
                  ) : (
                    (stats?.recent_bookings ?? []).map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">
                          {b.booking_ref ?? b.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {b.total_amount != null ? formatDA(b.total_amount) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(b.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Nouveaux inscrits</h3>
            <Link href="/admin/utilisateurs" className="text-blue-600 text-sm font-medium hover:underline">
              Voir tout →
            </Link>
          </div>
          {loadingStats ? (
            <div className="py-10 text-center text-gray-400 text-sm">Chargement…</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(stats?.recent_users ?? []).length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  Aucun inscrit récent
                </div>
              ) : (
                (stats?.recent_users ?? []).map((u) => (
                  <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                      {(u.first_name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{u.wilaya ?? "—"}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(u.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
