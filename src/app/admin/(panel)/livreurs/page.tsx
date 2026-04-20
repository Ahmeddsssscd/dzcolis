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
  pending:  "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};

const STATUS_CLASSES: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-blue-50 text-blue-700 border border-blue-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_DOT: Record<string, string> = {
  pending:  "bg-amber-400",
  approved: "bg-blue-500",
  rejected: "bg-red-400",
};

const TRANSPORT_LABELS: Record<string, string> = {
  voiture:      "Voiture",
  moto:         "Moto",
  camionnette:  "Camionnette",
  camion:       "Camion",
  international:"International",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function exportCSV(apps: Application[]) {
  const header = ["Prénom", "Nom", "Email", "Téléphone", "Wilaya", "Véhicule", "Statut", "Date"];
  const rows = apps.map(a => [
    a.first_name, a.last_name, a.email, a.phone, a.wilaya,
    TRANSPORT_LABELS[a.transport_type] ?? a.transport_type,
    STATUS_LABELS[a.status] ?? a.status,
    new Date(a.created_at).toLocaleDateString("fr-FR"),
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `transporteurs_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function AdminLivreursPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<FilterTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [filterWilaya, setFilterWilaya]   = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const res  = await fetch("/api/courier-applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id + status);
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status, reviewed_at: new Date().toISOString() } : app)
    );
    try {
      const res = await fetch(`/api/courier-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) await fetchApplications();
    } catch {
      await fetchApplications();
    } finally {
      setActionLoading(null);
    }
  }

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const filtered = applications.filter(app => {
    if (activeTab === "pending"  && app.status !== "pending")  return false;
    if (activeTab === "approved" && app.status !== "approved") return false;
    if (activeTab === "rejected" && app.status !== "rejected") return false;
    if (filterVehicle && app.transport_type !== filterVehicle) return false;
    if (filterWilaya  && !app.wilaya.toLowerCase().includes(filterWilaya.toLowerCase())) return false;
    return true;
  });

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: "all",      label: "Tous",        count: stats.total    },
    { key: "pending",  label: "En attente",  count: stats.pending  },
    { key: "approved", label: "Approuvées",  count: stats.approved },
    { key: "rejected", label: "Refusées",    count: stats.rejected },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Candidatures transporteurs</h2>
          <p className="text-gray-400 text-sm">Gérez les demandes d&apos;inscription des transporteurs</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          <p className="text-xs text-amber-500 mt-1 font-medium">En attente</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          <p className="text-xs text-blue-500 mt-1 font-medium">Approuvées</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          <p className="text-xs text-red-400 mt-1 font-medium">Refusées</p>
        </div>
      </div>

      {/* ── Filter tabs + export ── */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeTab === tab.key
                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exporter CSV ({filtered.length})
        </button>
      </div>

      {/* ── Extra filters ── */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterVehicle}
          onChange={e => setFilterVehicle(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400"
        >
          <option value="">Tous les véhicules</option>
          {Object.entries(TRANSPORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filtrer par wilaya..."
          value={filterWilaya}
          onChange={e => setFilterWilaya(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-blue-400 w-44"
        />
        {(filterVehicle || filterWilaya) && (
          <button onClick={() => { setFilterVehicle(""); setFilterWilaya(""); }} className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium">
            Réinitialiser ×
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            {activeTab === "pending" ? (
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : activeTab === "approved" ? (
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : activeTab === "rejected" ? (
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {activeTab === "all"
              ? "Aucune candidature reçue"
              : activeTab === "pending"
              ? "Aucune candidature en attente"
              : activeTab === "approved"
              ? "Aucune candidature approuvée"
              : "Aucune candidature refusée"}
          </h3>
          <p className="text-slate-400 text-sm">
            {activeTab === "all"
              ? "Les candidatures apparaîtront ici dès qu'elles seront soumises."
              : "Changez de filtre pour voir d'autres candidatures."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const initials = `${(app.first_name[0] ?? "?").toUpperCase()}${(app.last_name[0] ?? "").toUpperCase()}`;
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[#0f172a] flex items-center justify-center text-blue-300 font-bold text-base shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {app.first_name} {app.last_name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[app.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[app.status]}`} />
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span>{app.email}</span>
                      <span className="text-slate-300">·</span>
                      <span>{app.phone}</span>
                      <span className="text-slate-300">·</span>
                      <span>{app.wilaya}</span>
                      <span className="text-slate-300">·</span>
                      <span>{TRANSPORT_LABELS[app.transport_type] ?? app.transport_type}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">{formatDate(app.created_at)}</span>
                    </div>

                    {app.message && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2 italic max-w-lg border border-slate-100">
                        &ldquo;{app.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {app.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleAction(app.id, "approved")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                          {actionLoading === app.id + "approved" ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          Approuver
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "rejected")}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 hover:text-red-600 text-sm font-medium rounded-xl transition-colors border border-red-200 hover:border-red-300"
                        >
                          {actionLoading === app.id + "rejected" ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Refuser
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400 self-center">
                        Traité le {app.reviewed_at ? formatDate(app.reviewed_at) : "—"}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
