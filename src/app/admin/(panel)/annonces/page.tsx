"use client";

import { useEffect, useState } from "react";

type AnnonceStatut = "active" | "en_attente" | "signalee" | "supprimee";

interface Annonce {
  id: string;
  trajet: string;
  prix: string;
  poids: number;
  statut: AnnonceStatut;
  date: string;
  from_city: string;
  to_city: string;
  is_international: boolean;
  raw_status: string;
}

type FilterStatut = "toutes" | "actives" | "en_attente" | "signalee" | "supprimee";

const STATUT_STYLES: Record<AnnonceStatut, string> = {
  active: "bg-green-100 text-green-700",
  en_attente: "bg-yellow-100 text-yellow-700",
  signalee: "bg-orange-100 text-orange-700",
  supprimee: "bg-gray-100 text-gray-500",
};

const STATUT_LABELS: Record<AnnonceStatut, string> = {
  active: "Active",
  en_attente: "En attente",
  signalee: "Signalée",
  supprimee: "Supprimée",
};

function mapStatus(status: string): AnnonceStatut {
  if (status === "active") return "active";
  if (status === "cancelled") return "supprimee";
  if (status === "full" || status === "completed") return "supprimee";
  return "en_attente";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatut>("toutes");

  useEffect(() => {
    fetch("/api/admin/listings")
      .then((r) => r.json())
      .then((data: Array<Record<string, unknown>>) => {
        const mapped: Annonce[] = (data ?? []).map((l) => ({
          id: String(l.id),
          from_city: String(l.from_city ?? ""),
          to_city: String(l.to_city ?? ""),
          trajet: `${l.from_city ?? "?"} → ${l.to_city ?? "?"}`,
          prix: l.price_per_kg != null ? `${l.price_per_kg} DA/kg` : "—",
          poids: Number(l.available_weight ?? 0),
          statut: mapStatus(String(l.status ?? "")),
          raw_status: String(l.status ?? ""),
          is_international: Boolean(l.is_international),
          date: l.created_at ? formatDate(String(l.created_at)) : "—",
        }));
        setAnnonces(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatut(id: string, statut: AnnonceStatut) {
    const statusMap: Record<AnnonceStatut, string> = {
      active: "active",
      en_attente: "active",
      signalee: "cancelled",
      supprimee: "cancelled",
    };
    const newStatus = statusMap[statut];
    await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, statut } : a)));
  }

  function deleteAnnonce(id: string) {
    updateStatut(id, "supprimee");
  }

  const filtered = annonces.filter((a) => {
    const matchesSearch =
      a.trajet.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "toutes" ||
      (filter === "actives" && a.statut === "active") ||
      (filter === "en_attente" && a.statut === "en_attente") ||
      (filter === "signalee" && a.statut === "signalee") ||
      (filter === "supprimee" && a.statut === "supprimee");
    return matchesSearch && matchesFilter;
  });

  const actives = annonces.filter((a) => a.statut === "active").length;
  const enAttente = annonces.filter((a) => a.statut === "en_attente").length;
  const signalees = annonces.filter((a) => a.statut === "signalee").length;
  const supprimees = annonces.filter((a) => a.statut === "supprimee").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Annonces</h2>
        <p className="text-gray-500 text-sm mt-1">Gestion des annonces colis et trajets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Actives" value={actives} color="text-green-600" />
        <StatCard label="En attente" value={enAttente} color="text-yellow-600" />
        <StatCard label="Signalées" value={signalees} color="text-orange-600" />
        <StatCard label="Supprimées" value={supprimees} color="text-gray-400" />
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par trajet, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterStatut)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="toutes">Toutes les annonces</option>
          <option value="actives">Actives</option>
          <option value="en_attente">En attente</option>
          <option value="signalee">Signalées</option>
          <option value="supprimee">Supprimées</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "Type", "Trajet", "Prix", "Poids dispo", "Statut", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((annonce) => (
                  <tr
                    key={annonce.id}
                    className={`transition-colors ${
                      annonce.statut === "signalee" ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{annonce.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          annonce.is_international ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {annonce.is_international ? "International" : "National"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px]">
                      <span className="block truncate">{annonce.trajet}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{annonce.prix}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{annonce.poids} kg</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[annonce.statut]}`}
                      >
                        {STATUT_LABELS[annonce.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{annonce.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {annonce.statut === "en_attente" && (
                          <button
                            onClick={() => updateStatut(annonce.id, "active")}
                            className="p-1.5 text-gray-400 hover:text-dz-green hover:bg-dz-green/10 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {annonce.statut !== "signalee" && annonce.statut !== "supprimee" && (
                          <button
                            onClick={() => updateStatut(annonce.id, "signalee")}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Signaler"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H13l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                          </button>
                        )}
                        {annonce.statut !== "supprimee" && (
                          <button
                            onClick={() => deleteAnnonce(annonce.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">Aucune annonce trouvée</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
