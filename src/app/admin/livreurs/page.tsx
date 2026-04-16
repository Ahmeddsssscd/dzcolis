"use client";

import { useState, useEffect, useCallback } from "react";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  wilaya: string;
  transport_type: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-600 border-red-200",
};

const TRANSPORT_LABELS: Record<string, string> = {
  voiture: "Voiture 🚗",
  moto: "Moto 🏍️",
  camionnette: "Camionnette 🚐",
  camion: "Camion 🚛",
  international: "International ✈️",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLivreursPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/courier-applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id + status);
    // Optimistic update
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status, reviewed_at: new Date().toISOString() } : app)
    );
    try {
      const res = await fetch(`/api/courier-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // Revert on error
        await fetchApplications();
      }
    } catch {
      // Revert on error
      await fetchApplications();
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = applications.filter(app => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "pending";
    if (activeTab === "approved") return app.status === "approved";
    if (activeTab === "rejected") return app.status === "rejected";
    return true;
  });

  const stats = {
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    total: applications.length,
  };

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: "all",      label: "Tous",      count: stats.total    },
    { key: "pending",  label: "En attente",count: stats.pending  },
    { key: "approved", label: "Approuvées",count: stats.approved },
    { key: "rejected", label: "Refusées",  count: stats.rejected },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Candidatures transporteurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les demandes d&apos;inscription des transporteurs</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </div>
        <div className="bg-white rounded-2xl border border-yellow-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-yellow-600 mt-1">En attente</div>
        </div>
        <div className="bg-white rounded-2xl border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-green-600 mt-1">Approuvées</div>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          <div className="text-xs text-red-500 mt-1">Refusées</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              activeTab === tab.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">
            {activeTab === "pending" ? "⏳" : activeTab === "approved" ? "✅" : activeTab === "rejected" ? "❌" : "📋"}
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {activeTab === "all"
              ? "Aucune candidature reçue"
              : activeTab === "pending"
              ? "Aucune candidature en attente"
              : activeTab === "approved"
              ? "Aucune candidature approuvée"
              : "Aucune candidature refusée"}
          </h3>
          <p className="text-gray-400 text-sm">
            {activeTab === "all"
              ? "Les candidatures s'afficheront ici dès qu'elles seront soumises."
              : "Changez de filtre pour voir d'autres candidatures."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {(app.first_name[0] ?? "?").toUpperCase()}{(app.last_name[0] ?? "").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {app.first_name} {app.last_name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLASSES[app.status] ?? STATUS_CLASSES.pending}`}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs text-gray-500">{app.email}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{app.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-gray-400">{app.wilaya}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{TRANSPORT_LABELS[app.transport_type] ?? app.transport_type}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(app.created_at)}</span>
                    </div>
                    {app.message && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2 italic max-w-lg">
                        &ldquo;{app.message}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {app.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(app.id, "approved")}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {actionLoading === app.id + "approved" ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : "✓"} Approuver
                    </button>
                    <button
                      onClick={() => handleAction(app.id, "rejected")}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-red-600 text-sm font-medium rounded-xl transition-colors border border-red-200 hover:border-red-500"
                    >
                      {actionLoading === app.id + "rejected" ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : "✗"} Refuser
                    </button>
                  </div>
                )}
                {app.status !== "pending" && app.reviewed_at && (
                  <div className="text-xs text-gray-400 shrink-0 self-start mt-1">
                    Traité le {formatDate(app.reviewed_at)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
