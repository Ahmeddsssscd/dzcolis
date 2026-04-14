"use client";

import { useState, useEffect, useCallback } from "react";

interface KycRecord {
  id: string;
  user_id: string;
  cin_recto_url: string | null;
  cin_verso_url: string | null;
  selfie_url: string | null;
  status: string;
  submitted_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    phone: string;
    wilaya: string;
    kyc_status: string;
  };
}

interface GroupedUser {
  userId: string;
  name: string;
  phone: string;
  wilaya: string;
  submittedAt: string;
  record: KycRecord;
}

export default function KYCPage() {
  const [grouped, setGrouped] = useState<GroupedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<Record<string, "approve" | "reject" | null>>({});
  const [done, setDone] = useState<Record<string, "approved" | "rejected">>({});

  const fetchPending = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kyc");
    if (!res.ok) { setLoading(false); return; }
    const records: KycRecord[] = await res.json();

    setGrouped(records.map(r => ({
      userId: r.user_id,
      name: `${r.profiles.first_name} ${r.profiles.last_name}`,
      phone: r.profiles.phone,
      wilaya: r.profiles.wilaya,
      submittedAt: new Date(r.submitted_at).toLocaleDateString("fr-DZ"),
      record: r,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  async function handleAction(userId: string, action: "approve" | "reject") {
    setActing(prev => ({ ...prev, [userId]: action }));
    const res = await fetch("/api/admin/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (res.ok) {
      setDone(prev => ({ ...prev, [userId]: action === "approve" ? "approved" : "rejected" }));
      setTimeout(() => {
        setGrouped(prev => prev.filter(u => u.userId !== userId));
        setDone(prev => { const n = { ...prev }; delete n[userId]; return n; });
      }, 1000);
    }
    setActing(prev => ({ ...prev, [userId]: null }));
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vérification KYC</h2>
        <p className="text-gray-500 text-sm mt-1">File de vérification d&apos;identité</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-700 font-semibold">File d&apos;attente vide</p>
          <p className="text-gray-400 text-sm mt-1">Toutes les demandes KYC ont été traitées</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {grouped.map((u) => {
            const doneStatus = done[u.userId];
            const isActing = acting[u.userId];

            return (
              <div
                key={u.userId}
                className={`bg-white rounded-2xl border shadow-sm p-6 transition-all duration-500 ${
                  doneStatus === "approved" ? "border-green-400 bg-green-50"
                  : doneStatus === "rejected" ? "border-red-400 bg-red-50"
                  : "border-gray-100"
                }`}
              >
                {/* User info */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">{u.name}</h3>
                    <p className="text-gray-500 text-sm">{u.phone}</p>
                    <p className="text-gray-400 text-xs">{u.wilaya}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Soumis le</p>
                    <p className="text-xs font-semibold text-gray-600">{u.submittedAt}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents soumis</p>
                  <div className="space-y-2">
                    {[
                      { label: "CIN Recto", url: u.record.cin_recto_url },
                      { label: "CIN Verso", url: u.record.cin_verso_url },
                      { label: "Selfie avec CIN", url: u.record.selfie_url },
                    ].map(doc => (
                      <div key={doc.label} className={`flex items-center gap-2 text-xs font-medium ${doc.url ? "text-green-700" : "text-red-500"}`}>
                        {doc.url ? (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span>{doc.label}</span>
                        {doc.url && (
                          <a href={`https://itbcazlejwattexuctur.supabase.co/storage/v1/object/public/kyc-documents/${doc.url}`}
                            target="_blank" rel="noreferrer"
                            className="ml-auto text-blue-500 hover:underline font-normal">Voir</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {doneStatus === "approved" ? (
                  <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-sm py-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Approuvé — email envoyé
                  </div>
                ) : doneStatus === "rejected" ? (
                  <div className="flex items-center justify-center gap-2 text-red-600 font-semibold text-sm py-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Rejeté — email envoyé
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(u.userId, "approve")}
                      disabled={!!isActing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                    >
                      {isActing === "approve" ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleAction(u.userId, "reject")}
                      disabled={!!isActing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 text-sm font-semibold transition-colors"
                    >
                      {isActing === "reject" ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
