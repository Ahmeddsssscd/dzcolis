"use client";

import { useEffect, useState } from "react";

type Statut = "actif" | "suspendu" | "en_attente_kyc";

interface User {
  id: string;
  nom: string;
  telephone: string;
  role: string;
  wilaya: string;
  statut: Statut;
  dateInscription: string;
  initials: string;
  avatarColor: string;
}

type FilterType = "tous" | "expediteurs" | "transporteurs" | "suspendus";

const STATUT_STYLES: Record<Statut, string> = {
  actif: "bg-green-100 text-green-700",
  suspendu: "bg-red-100 text-red-700",
  en_attente_kyc: "bg-yellow-100 text-yellow-700",
};

const STATUT_LABELS: Record<Statut, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  en_attente_kyc: "Attente KYC",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-amber-500",
];

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapKycToStatut(kyc_status: string): Statut {
  if (kyc_status === "submitted" || kyc_status === "reviewing") return "en_attente_kyc";
  return "actif";
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("tous");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(`Erreur API: ${data?.error ?? r.status}`); setLoading(false); return; }
        if (!Array.isArray(data)) { setError(`Réponse inattendue: ${JSON.stringify(data)}`); setLoading(false); return; }
        const mapped: User[] = data.map((p: Record<string, string>) => {
          const firstName = p.first_name ?? "";
          const lastName = p.last_name ?? "";
          const initials = (firstName[0] ?? "") + (lastName[0] ?? "") || "?";
          return {
            id: p.id,
            nom: `${firstName} ${lastName}`.trim() || "Inconnu",
            telephone: p.phone ?? "—",
            role: p.role ?? "user",
            wilaya: p.wilaya ?? "—",
            statut: mapKycToStatut(p.kyc_status ?? "none"),
            dateInscription: p.created_at ? formatDate(p.created_at) : "—",
            initials: initials.toUpperCase(),
            avatarColor: hashColor(p.id),
          };
        });
        setUsers(mapped);
        setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.telephone.toLowerCase().includes(search.toLowerCase()) ||
      u.wilaya.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "tous" ||
      (filter === "expediteurs" && u.role === "user") ||
      (filter === "transporteurs" && u.role === "admin") ||
      (filter === "suspendus" && u.statut === "suspendu");
    return matchesSearch && matchesFilter;
  });

  const total = users.length;
  const expediteurs = users.filter((u) => u.role === "user").length;
  const transporteurs = users.filter((u) => u.role !== "user").length;
  const suspendus = users.filter((u) => u.statut === "suspendu").length;

  function noOp() {
    // Fonctionnalité à venir — no suspend column in DB
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
        <p className="text-gray-500 text-sm mt-1">Gestion de tous les comptes de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} color="text-gray-900" />
        <StatCard label="Expéditeurs" value={expediteurs} color="text-blue-600" />
        <StatCard label="Transporteurs" value={transporteurs} color="text-green-600" />
        <StatCard label="Suspendus" value={suspendus} color="text-red-600" />
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, wilaya..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="tous">Tous les utilisateurs</option>
          <option value="expediteurs">Expéditeurs</option>
          <option value="transporteurs">Transporteurs</option>
          <option value="suspendus">Suspendus</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {error && (
          <div className="py-6 px-6 text-center">
            <p className="text-red-600 text-sm font-medium bg-red-50 rounded-xl p-4">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Utilisateur", "Téléphone", "Rôle", "Wilaya", "Statut", "Inscription", "Actions"].map((h) => (
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
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${user.avatarColor} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {user.initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{user.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{user.telephone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role !== "user" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role !== "user" ? "Transporteur" : "Expéditeur"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{user.wilaya}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[user.statut]}`}
                      >
                        {STATUT_LABELS[user.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{user.dateInscription}</td>
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
                        <button
                          onClick={noOp}
                          className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Suspendre (fonctionnalité à venir)"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                        <button
                          onClick={noOp}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer (fonctionnalité à venir)"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
