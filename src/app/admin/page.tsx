"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RecentBooking {
  id: string;
  booking_ref: string;
  sender_id: string;
  listing_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface StatsData {
  total_users: number;
  active_listings: number;
  ongoing_bookings: number;
  monthly_revenue: number;
  kyc_pending: number;
  recent_bookings: RecentBooking[];
}

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  in_transit: "En transit",
  delivered: "Livrée",
  cancelled: "Annulée",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        BOOKING_STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {BOOKING_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDA(n: number) {
  return n.toLocaleString("fr-FR") + " DA";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const STATS_CONFIG = [
    {
      label: "Total utilisateurs",
      value: loading ? "…" : String(stats?.total_users ?? 0),
      sub: "Comptes inscrits",
      subColor: "text-gray-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Annonces actives",
      value: loading ? "…" : String(stats?.active_listings ?? 0),
      sub: "Trajets disponibles",
      subColor: "text-green-600",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Expéditions en cours",
      value: loading ? "…" : String(stats?.ongoing_bookings ?? 0),
      sub: "Mise à jour en temps réel",
      subColor: "text-gray-400",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5.01M13 16H9m4 0h3m2-5h-5V6m5 5l1.5 2.5M16 11V6h2l3 5" />
        </svg>
      ),
    },
    {
      label: "Revenus du mois",
      value: loading ? "…" : formatDA(stats?.monthly_revenue ?? 0),
      sub: "Paiements confirmés",
      subColor: "text-green-600",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const recentBookings = stats?.recent_bookings ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme Waselli</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS_CONFIG.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
                <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
              </div>
              <div
                className={`${s.iconBg} ${s.iconColor} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent activity table */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Activité récente</h3>
            <Link href="/admin/expeditions" className="text-green-600 text-sm font-medium hover:underline">
              Voir tout →
            </Link>
          </div>
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Réf", "Statut", "Montant", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">
                        Aucune réservation
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
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

        {/* Right column */}
        <div className="space-y-4">
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
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {loading ? "…" : stats?.kyc_pending ?? 0}
                </span>
              </Link>
              <Link
                href="/admin/litiges"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-yellow-50 text-yellow-700 text-sm font-medium hover:bg-yellow-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Voir litiges
              </Link>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Exporter rapport
              </button>
            </div>
          </div>

          {/* Top routes placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top trajets cette semaine</h3>
            <p className="text-gray-400 text-sm text-center py-4">Données en cours de collecte</p>
          </div>
        </div>
      </div>
    </div>
  );
}
