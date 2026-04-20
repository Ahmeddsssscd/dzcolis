"use client";

import { useEffect, useState } from "react";

type TransactionStatut = "en_attente" | "libere" | "rembourse";

interface Transaction {
  id: string;
  booking_id: string;
  montantBrut: number;
  commission: number;
  netTransporteur: number;
  statut: TransactionStatut;
  provider: string;
  provider_ref: string;
  date: string;
}

const STATUT_STYLES: Record<TransactionStatut, string> = {
  en_attente: "bg-yellow-100 text-yellow-700",
  libere: "bg-green-100 text-green-700",
  rembourse: "bg-blue-100 text-blue-700",
};

const STATUT_LABELS: Record<TransactionStatut, string> = {
  en_attente: "En attente",
  libere: "Payé",
  rembourse: "Remboursé",
};

function mapPaymentStatus(status: string): TransactionStatut {
  if (status === "paid") return "libere";
  if (status === "refunded") return "rembourse";
  return "en_attente";
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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function PaiementsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data: Array<Record<string, unknown>>) => {
        const mapped: Transaction[] = (data ?? []).map((p) => {
          const amount = Number(p.amount ?? 0);
          const commission = Math.round(amount * 0.1);
          return {
            id: String(p.id),
            booking_id: String(p.booking_id ?? "—"),
            montantBrut: amount,
            commission,
            netTransporteur: amount - commission,
            statut: mapPaymentStatus(String(p.status ?? "pending")),
            provider: String(p.provider ?? "—"),
            provider_ref: String(p.provider_ref ?? "—"),
            date: p.created_at ? formatDate(String(p.created_at)) : "—",
          };
        });
        setTransactions(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const commissionsTotal = transactions
    .filter((t) => t.statut === "libere")
    .reduce((sum, t) => sum + t.commission, 0);

  const totalVolume = transactions.reduce((sum, t) => sum + t.montantBrut, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paiements & Séquestre</h2>
        <p className="text-gray-500 text-sm mt-1">Vue financière complète de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Volume total"
          value={loading ? "…" : formatDA(totalVolume)}
          color="text-orange-600"
          sub="Toutes transactions"
        />
        <StatCard
          label="Commissions encaissées"
          value={loading ? "…" : formatDA(commissionsTotal)}
          color="text-green-600"
          sub="10% sur transactions payées"
        />
        <StatCard
          label="Transactions totales"
          value={loading ? "…" : String(transactions.length)}
          color="text-blue-600"
          sub={`Dont ${transactions.filter((t) => t.statut === "en_attente").length} en attente`}
        />
        <StatCard
          label="Remboursements"
          value={loading ? "…" : String(transactions.filter((t) => t.statut === "rembourse").length)}
          color="text-red-600"
          sub="Transactions remboursées"
        />
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transactions récentes</h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "Réservation", "Montant brut", "Commission (10%)", "Net", "Provider", "Statut", "Date"].map((h) => (
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                      Aucune transaction
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">{t.booking_id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatDA(t.montantBrut)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-700 font-semibold whitespace-nowrap">
                        {formatDA(t.commission)}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-700 font-semibold whitespace-nowrap">
                        {formatDA(t.netTransporteur)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.provider}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[t.statut]}`}
                        >
                          {STATUT_LABELS[t.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{t.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
