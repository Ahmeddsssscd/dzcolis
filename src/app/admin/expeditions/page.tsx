"use client";

import { useEffect, useState } from "react";

type ExpStatut = "en_attente" | "confirmee" | "en_transit" | "livree" | "litigieux" | "annulee";
type SequestreStatut = "bloque" | "libere" | "rembourse";

interface Expedition {
  id: string;
  booking_ref: string;
  expediteur: string;
  statut: ExpStatut;
  montant: string;
  montantRaw: number;
  payment_status: string;
  sequestre: SequestreStatut;
  date: string;
}

type FilterStatut = "tous" | ExpStatut;

const EXP_STATUT_STYLES: Record<ExpStatut, string> = {
  en_attente: "bg-yellow-100 text-yellow-700",
  confirmee:  "bg-blue-100 text-blue-700",
  en_transit: "bg-purple-100 text-purple-700",
  livree:     "bg-green-100 text-green-700",
  litigieux:  "bg-red-100 text-red-700",
  annulee:    "bg-gray-100 text-gray-500",
};

const EXP_STATUT_LABELS: Record<ExpStatut, string> = {
  en_attente: "En attente",
  confirmee:  "Confirmée",
  en_transit: "En transit",
  livree:     "Livrée",
  litigieux:  "Litigieux",
  annulee:    "Annulée",
};

const SEQ_DISPLAY: Record<SequestreStatut, { label: string; color: string }> = {
  bloque:    { label: "Bloqué",    color: "text-orange-600" },
  libere:    { label: "Libéré",    color: "text-green-600"  },
  rembourse: { label: "Remboursé", color: "text-blue-600"   },
};

function mapBookingStatus(status: string): ExpStatut {
  if (status === "pending")    return "en_attente";
  if (status === "accepted")   return "confirmee";
  if (status === "in_transit") return "en_transit";
  if (status === "delivered")  return "livree";
  if (status === "cancelled")  return "annulee";
  return "en_attente";
}

function mapPaymentToSequestre(payment_status: string, booking_status: string): SequestreStatut {
  if (payment_status === "refunded") return "rembourse";
  if (booking_status === "delivered") return "libere";
  if (payment_status === "paid") return "bloque";
  return "bloque";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function formatDA(n: number) {
  return n.toLocaleString("fr-FR") + " DA";
}

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterStatut>("tous");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [acting, setActing]           = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function loadData() {
    fetch("/api/admin/bookings")
      .then(r => r.json())
      .then((data: Array<Record<string, unknown>>) => {
        const mapped: Expedition[] = (data ?? []).map(b => {
          const bStatus = String(b.status ?? "pending");
          const pStatus = String(b.payment_status ?? "unpaid");
          return {
            id:            String(b.id),
            booking_ref:   String(b.booking_ref ?? b.id),
            expediteur:    String(b.sender_name ?? "—"),
            statut:        mapBookingStatus(bStatus),
            montant:       b.total_amount != null ? formatDA(Number(b.total_amount)) : "—",
            montantRaw:    Number(b.total_amount ?? 0),
            payment_status: pStatus,
            sequestre:     mapPaymentToSequestre(pStatus, bStatus),
            date:          b.created_at ? formatDate(String(b.created_at)) : "—",
          };
        });
        setExpeditions(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  async function updateBooking(id: string, updates: { status?: string; payment_status?: string }, label: string) {
    setActing(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error();
      showToast(`✅ ${label}`);
      loadData();
    } catch {
      showToast("❌ Erreur, réessayez.");
    } finally {
      setActing(null);
    }
  }

  const filtered = expeditions.filter(e => {
    const matchesSearch =
      e.booking_ref.toLowerCase().includes(search.toLowerCase()) ||
      e.expediteur.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "tous" || e.statut === filter;
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const parts = e.date.split("/");
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (dateFrom && d < new Date(dateFrom)) matchesDate = false;
        if (dateTo   && d > new Date(dateTo))   matchesDate = false;
      }
    }
    return matchesSearch && matchesFilter && matchesDate;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Expéditions</h2>
        <p className="text-gray-500 text-sm mt-1">Suivi de toutes les réservations et livraisons</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {(Object.entries(EXP_STATUT_LABELS) as [ExpStatut, string][]).map(([statut, label]) => {
          const count = expeditions.filter(e => e.statut === statut).length;
          return (
            <button
              key={statut}
              onClick={() => setFilter(statut === filter ? "tous" : statut)}
              className={`bg-white rounded-xl shadow-sm border p-3 text-center transition-all ${
                filter === statut ? "border-green-500 ring-1 ring-green-500" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par réf, expéditeur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterStatut)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="tous">Tous les statuts</option>
          {(Object.entries(EXP_STATUT_LABELS) as [ExpStatut, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
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
                  {["Réf", "Expéditeur", "Statut", "Montant", "Séquestre", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(exp => {
                  const seq = SEQ_DISPLAY[exp.sequestre];
                  const isActing = acting === exp.id;
                  return (
                    <tr key={exp.id} className={`transition-colors ${exp.statut === "litigieux" ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{exp.booking_ref}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{exp.expediteur}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EXP_STATUT_STYLES[exp.statut]}`}>
                          {EXP_STATUT_LABELS[exp.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{exp.montant}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${seq.color} whitespace-nowrap`}>{seq.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{exp.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Accepter */}
                          {exp.statut === "en_attente" && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { status: "accepted" }, "Expédition confirmée")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              Confirmer
                            </button>
                          )}
                          {/* En transit */}
                          {exp.statut === "confirmee" && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { status: "in_transit" }, "En transit")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              En transit
                            </button>
                          )}
                          {/* Livré */}
                          {exp.statut === "en_transit" && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { status: "delivered" }, "Marqué livré")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              Livré
                            </button>
                          )}
                          {/* Libérer au transporteur */}
                          {exp.sequestre === "bloque" && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { payment_status: "paid" }, "Paiement libéré au transporteur")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              Libérer
                            </button>
                          )}
                          {/* Rembourser */}
                          {(exp.sequestre === "bloque" || exp.payment_status === "paid") && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { payment_status: "refunded" }, "Remboursé à l'expéditeur")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              Rembourser
                            </button>
                          )}
                          {/* Annuler */}
                          {(exp.statut === "en_attente" || exp.statut === "confirmee") && (
                            <button disabled={isActing}
                              onClick={() => updateBooking(exp.id, { status: "cancelled" }, "Expédition annulée")}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">Aucune expédition trouvée</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
