"use client";

import { useState, useEffect } from "react";

type LitigeStatut = "ouvert" | "en_examen" | "resolu";
type LitigeDecision = "rembourse_expediteur" | "libere_transporteur";

interface Note { text: string; date: string; }

interface Litige {
  id: string;
  dateOuverture: string;
  expediteur: { nom: string; initials: string; avatarColor: string };
  transporteur: { nom: string; initials: string; avatarColor: string };
  trajet: string;
  montant: string;
  description: string;
  statut: LitigeStatut;
  decision?: LitigeDecision;
  notes: Note[];
  dateResolution?: string;
}

// Real litiges are submitted by users — no fake seed data
const BASE_LITIGES: Litige[] = [];
const INITIAL_RESOLVED: Litige[] = [];

const STATUS_STEPS: LitigeStatut[] = ["ouvert", "en_examen", "resolu"];
const STATUS_LABELS: Record<LitigeStatut, string> = { ouvert: "Ouvert", en_examen: "En examen", resolu: "Résolu" };

function Avatar({ data }: { data: { nom: string; initials: string; avatarColor: string } }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${data.avatarColor} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {data.initials}
      </div>
      <span className="text-sm font-medium text-gray-900">{data.nom}</span>
    </div>
  );
}

function Timeline({ statut }: { statut: LitigeStatut }) {
  const current = STATUS_STEPS.indexOf(statut);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-full ${i <= current ? "bg-green-500" : "bg-gray-200"}`} />
          <span className={`text-xs ${i <= current ? "text-green-700 font-semibold" : "text-gray-400"}`}>{STATUS_LABELS[s]}</span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-px w-6 ${i < current ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function LitigesPage() {
  const [activeTab, setActiveTab]       = useState<"ouverts" | "resolus">("ouverts");
  const [openLitiges, setOpenLitiges]   = useState<Litige[]>(BASE_LITIGES);
  const [resolvedLitiges, setResolvedLitiges] = useState<Litige[]>(INITIAL_RESOLVED);
  const [noteInputs, setNoteInputs]     = useState<Record<string, string>>({});
  const [showNoteInput, setShowNoteInput] = useState<Record<string, boolean>>({});
  const [acting, setActing]             = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Load persisted resolutions on mount
  useEffect(() => {
    fetch("/api/admin/litiges")
      .then(r => r.json())
      .then((resolved: Record<string, { decision: string; date: string }>) => {
        const resolvedIds = Object.keys(resolved);
        if (resolvedIds.length === 0) return;

        setOpenLitiges(prev => {
          const stillOpen: Litige[] = [];
          const newResolved: Litige[] = [];

          for (const l of prev) {
            if (resolved[l.id]) {
              newResolved.push({
                ...l,
                statut: "resolu",
                decision: resolved[l.id].decision as LitigeDecision,
                dateResolution: new Date(resolved[l.id].date).toLocaleDateString("fr-FR"),
              });
            } else {
              stillOpen.push(l);
            }
          }

          if (newResolved.length > 0) {
            setResolvedLitiges(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              const toAdd = newResolved.filter(r => !existingIds.has(r.id));
              return [...toAdd, ...prev];
            });
          }

          return stillOpen;
        });
      })
      .catch(() => {}); // silently fail if API not ready
  }, []);

  async function resoudre(id: string, decision: LitigeDecision) {
    const litige = openLitiges.find(l => l.id === id);
    if (!litige) return;
    setActing(id);
    try {
      await fetch("/api/admin/litiges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ litige_id: id, decision }),
      });
      const resolved: Litige = {
        ...litige,
        statut: "resolu",
        decision,
        dateResolution: new Date().toLocaleDateString("fr-FR"),
      };
      setOpenLitiges(prev => prev.filter(l => l.id !== id));
      setResolvedLitiges(prev => [resolved, ...prev]);
      showToast(decision === "rembourse_expediteur" ? "✅ Expéditeur remboursé" : "✅ Paiement libéré au transporteur");
    } catch {
      showToast("❌ Erreur, réessayez.");
    } finally {
      setActing(null);
    }
  }

  function ajouterNote(id: string) {
    const text = noteInputs[id];
    if (!text?.trim()) return;
    const now = new Date().toLocaleDateString("fr-FR");
    setOpenLitiges(prev =>
      prev.map(l => l.id === id ? { ...l, statut: "en_examen", notes: [...l.notes, { text, date: now }] } : l)
    );
    setNoteInputs(prev => ({ ...prev, [id]: "" }));
    setShowNoteInput(prev => ({ ...prev, [id]: false }));
  }

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Litiges</h2>
        <p className="text-gray-500 text-sm mt-1">Gestion des conflits entre expéditeurs et transporteurs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("ouverts")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "ouverts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Ouverts
          {openLitiges.length > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{openLitiges.length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab("resolus")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "resolus" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Résolus ({resolvedLitiges.length})
        </button>
      </div>

      {activeTab === "ouverts" && (
        <div className="space-y-4">
          {openLitiges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="flex justify-center mb-3">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold">Aucun litige ouvert</p>
              <p className="text-gray-400 text-sm mt-1">Tous les litiges ont été résolus</p>
            </div>
          ) : (
            openLitiges.map(l => (
              <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-500">{l.id}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${l.statut === "ouvert" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {STATUS_LABELS[l.statut]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Ouvert le {l.dateOuverture}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Montant en litige</p>
                    <p className="text-lg font-bold text-red-600">{l.montant}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 mb-2 uppercase">Expéditeur</p>
                    <Avatar data={l.expediteur} />
                  </div>
                  <div className="flex items-center justify-center text-2xl text-gray-400">vs</div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-orange-600 mb-2 uppercase">Transporteur</p>
                    <Avatar data={l.transporteur} />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Trajet</p>
                  <p className="text-sm font-medium text-gray-900">{l.trajet}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Description du problème</p>
                  <p className="text-sm text-gray-700">{l.description}</p>
                </div>

                <Timeline statut={l.statut} />

                {l.notes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {l.notes.map((n, i) => (
                      <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm text-blue-800">{n.text}</p>
                          <p className="text-xs text-blue-400 mt-0.5">{n.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showNoteInput[l.id] && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter une note admin..."
                      value={noteInputs[l.id] || ""}
                      onChange={e => setNoteInputs(prev => ({ ...prev, [l.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && ajouterNote(l.id)}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      autoFocus
                    />
                    <button onClick={() => ajouterNote(l.id)}
                      className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                      Ajouter
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
                  <button
                    disabled={acting === l.id}
                    onClick={() => resoudre(l.id, "rembourse_expediteur")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    Rembourser expéditeur
                  </button>
                  <button
                    disabled={acting === l.id}
                    onClick={() => resoudre(l.id, "libere_transporteur")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-dz-green text-white text-sm font-semibold rounded-xl hover:bg-dz-green-dark disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Libérer au transporteur
                  </button>
                  <button
                    onClick={() => setShowNoteInput(prev => ({ ...prev, [l.id]: !prev[l.id] }))}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Ajouter note
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "resolus" && (
        <div className="space-y-4">
          {resolvedLitiges.map(l => (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-gray-500">{l.id}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Résolu
                    </span>
                    {l.decision && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${l.decision === "rembourse_expediteur" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {l.decision === "rembourse_expediteur" ? "Remboursé expéditeur" : "Libéré transporteur"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Avatar data={l.expediteur} />
                    <span className="text-gray-400 text-xs">vs</span>
                    <Avatar data={l.transporteur} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{l.trajet} — Ouvert le {l.dateOuverture} · Résolu le {l.dateResolution}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{l.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Montant</p>
                  <p className="text-lg font-bold text-gray-700">{l.montant}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
