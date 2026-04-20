"use client";

import { useState, useCallback, useEffect } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show };
}

async function saveSettings(data: Record<string, string>): Promise<boolean> {
  const res = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-green-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 text-base mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <label className="text-sm font-medium text-gray-700 sm:w-56 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex-shrink-0"
    >
      {loading ? "…" : "Enregistrer"}
    </button>
  );
}

export default function ParametresPage() {
  const { toasts, show } = useToast();
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Platform settings
  const [commission, setCommission] = useState("10");
  const [delaiLib, setDelaiLib] = useState("48h");
  const [montantMin, setMontantMin] = useState("500");

  // Contact
  const [emailContact, setEmailContact] = useState("contact@waselli.com");
  const [whatsapp, setWhatsapp] = useState("+213XXXXXXXXX");
  const [adresse, setAdresse] = useState("Alger, Algérie");

  // Notifications
  const [alertLitiges, setAlertLitiges] = useState(true);
  const [alertKYC, setAlertKYC] = useState(true);
  const [alertBigTx, setAlertBigTx] = useState(true);
  const [rapportQuotidien, setRapportQuotidien] = useState(false);

  // Maintenance
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Le site est temporairement en maintenance. Nous revenons très bientôt."
  );
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Load all settings from DB on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        if (s.commission) setCommission(s.commission);
        if (s.delai_liberation) setDelaiLib(s.delai_liberation);
        if (s.montant_minimum) setMontantMin(s.montant_minimum);
        if (s.email_contact) setEmailContact(s.email_contact);
        if (s.whatsapp) setWhatsapp(s.whatsapp);
        if (s.adresse) setAdresse(s.adresse);
        if (s.notif_litiges !== undefined) setAlertLitiges(s.notif_litiges === "true");
        if (s.notif_kyc !== undefined) setAlertKYC(s.notif_kyc === "true");
        if (s.notif_big_tx !== undefined) setAlertBigTx(s.notif_big_tx === "true");
        if (s.rapport_quotidien !== undefined) setRapportQuotidien(s.rapport_quotidien === "true");
        if (s.maintenance !== undefined) setMaintenance(s.maintenance === "true");
        if (s.maintenance_message) setMaintenanceMessage(s.maintenance_message);
      })
      .catch(() => {})
      .finally(() => setLoadingInit(false));
  }, []);

  async function save(key: string, data: Record<string, string>, label: string) {
    setSaving((p) => ({ ...p, [key]: true }));
    const ok = await saveSettings(data);
    setSaving((p) => ({ ...p, [key]: false }));
    show(ok ? `${label} enregistré ✓` : `Erreur lors de la sauvegarde`, ok ? "success" : "error");
  }

  async function toggleMaintenance() {
    setTogglingMaintenance(true);
    const next = !maintenance;
    const ok = await saveSettings({
      maintenance: String(next),
      maintenance_message: maintenanceMessage,
    });
    if (ok) {
      setMaintenance(next);
      show(`Mode maintenance ${next ? "activé" : "désactivé"} ✓`);
    } else {
      show("Erreur — maintenance non mise à jour", "error");
    }
    setTogglingMaintenance(false);
  }

  async function saveNotif(key: string, value: boolean, label: string) {
    const ok = await saveSettings({ [key]: String(value) });
    show(ok ? `${label} ${value ? "activé" : "désactivé"} ✓` : "Erreur de sauvegarde", ok ? "success" : "error");
  }

  if (loadingInit) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Chargement des paramètres…</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              t.type === "error" ? "bg-red-600" : "bg-gray-900"
            }`}
          >
            <span>{t.type === "error" ? "✕" : "✓"}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-500 text-sm mt-1">Configuration générale de la plateforme Waselli</p>
      </div>

      {/* Maintenance banner */}
      {maintenance && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center gap-4">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Plateforme en maintenance</p>
            <p className="text-red-600 text-xs mt-0.5">
              Les utilisateurs voient la page de maintenance. Le panel admin reste accessible.
            </p>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={togglingMaintenance}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            Désactiver
          </button>
        </div>
      )}

      {/* Platform settings */}
      <Section title="Paramètres de la plateforme">
        <Field label="Taux de commission">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                min="0"
                max="100"
                className="w-28 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <SaveButton
              onClick={() => save("commission", { commission }, "Taux de commission")}
              loading={saving.commission}
            />
          </div>
        </Field>

        <Field label="Délai de libération automatique">
          <div className="flex items-center gap-3">
            <select
              value={delaiLib}
              onChange={(e) => setDelaiLib(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="24h">24 heures</option>
              <option value="48h">48 heures</option>
              <option value="72h">72 heures</option>
            </select>
            <SaveButton
              onClick={() => save("delai", { delai_liberation: delaiLib }, "Délai de libération")}
              loading={saving.delai}
            />
          </div>
        </Field>

        <Field label="Montant minimum de transaction">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                value={montantMin}
                onChange={(e) => setMontantMin(e.target.value)}
                min="0"
                className="w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DA</span>
            </div>
            <SaveButton
              onClick={() => save("montant", { montant_minimum: montantMin }, "Montant minimum")}
              loading={saving.montant}
            />
          </div>
        </Field>
      </Section>

      {/* Contact & Support */}
      <Section title="Contact & Support">
        <Field label="Email de contact">
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={emailContact}
              onChange={(e) => setEmailContact(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SaveButton
              onClick={() => save("email", { email_contact: emailContact }, "Email de contact")}
              loading={saving.email}
            />
          </div>
        </Field>

        <Field label="Numéro WhatsApp">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+213XXXXXXXXX"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SaveButton
              onClick={() => save("whatsapp", { whatsapp }, "Numéro WhatsApp")}
              loading={saving.whatsapp}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ce numéro s&apos;affiche sur le bouton WhatsApp du site en temps réel.
          </p>
        </Field>

        <Field label="Adresse">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SaveButton
              onClick={() => save("adresse", { adresse }, "Adresse")}
              loading={saving.adresse}
            />
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications admin">
        <div className="divide-y divide-gray-50">
          <ToggleSwitch
            checked={alertLitiges}
            onChange={(v) => {
              setAlertLitiges(v);
              saveNotif("notif_litiges", v, "Notifications litiges");
            }}
            label="Alertes nouveaux litiges"
            description="Recevoir une notification à chaque litige ouvert"
          />
          <ToggleSwitch
            checked={alertKYC}
            onChange={(v) => {
              setAlertKYC(v);
              saveNotif("notif_kyc", v, "Notifications KYC");
            }}
            label="Alertes KYC soumis"
            description="Notifié lorsqu'un transporteur soumet ses documents"
          />
          <ToggleSwitch
            checked={alertBigTx}
            onChange={(v) => {
              setAlertBigTx(v);
              saveNotif("notif_big_tx", v, "Alertes grandes transactions");
            }}
            label="Alertes transactions > 50 000 DA"
            description="Surveillance des transactions à montant élevé"
          />
          <ToggleSwitch
            checked={rapportQuotidien}
            onChange={(v) => {
              setRapportQuotidien(v);
              saveNotif("rapport_quotidien", v, "Rapport quotidien");
            }}
            label="Rapport quotidien par email"
            description="Résumé envoyé chaque matin à 8h00"
          />
        </div>
      </Section>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-semibold text-red-700 text-base">Zone de danger</h3>
        </div>
        <p className="text-sm text-red-600 mb-6">
          Ces actions affectent l&apos;ensemble de la plateforme. Procédez avec précaution.
        </p>

        <div className="space-y-4">
          {/* Maintenance toggle */}
          <div className="flex flex-col gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Mettre la plateforme en maintenance</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Rend la plateforme inaccessible aux utilisateurs. Le panel admin reste accessible.
                </p>
              </div>
              <button
                onClick={toggleMaintenance}
                disabled={togglingMaintenance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-60 ${
                  maintenance ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    maintenance ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Custom maintenance message */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Message affiché aux utilisateurs
              </label>
              <div className="flex gap-3">
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <button
                  onClick={() =>
                    save("msg", { maintenance_message: maintenanceMessage }, "Message de maintenance")
                  }
                  disabled={saving.msg}
                  className="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 self-start"
                >
                  {saving.msg ? "…" : "Sauver"}
                </button>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Exporter toutes les données</p>
              <p className="text-xs text-gray-500 mt-0.5">Télécharge un export CSV de toutes les réservations</p>
            </div>
            <button
              onClick={async () => {
                show("Préparation de l'export…");
                try {
                  const res = await fetch("/api/admin/bookings");
                  if (!res.ok) throw new Error("fetch failed");
                  const data: Record<string, unknown>[] = await res.json();
                  const headers = ["Réf", "Statut", "Montant (DA)", "Paiement", "Ville départ", "Ville arrivée", "Poids (kg)", "Date création"];
                  const rows = data.map(b => [
                    String(b.booking_ref ?? b.id ?? ""),
                    String(b.status ?? ""),
                    String(b.total_amount ?? ""),
                    String(b.payment_status ?? ""),
                    String(b.from_city ?? ""),
                    String(b.to_city ?? ""),
                    String(b.weight ?? ""),
                    b.created_at ? new Date(String(b.created_at)).toLocaleDateString("fr-FR") : "",
                  ]);
                  const csv = [headers, ...rows]
                    .map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))
                    .join("\n");
                  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `waselli_reservations_${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  // Revoke after a short delay to avoid Safari cancelling the download
                  setTimeout(() => URL.revokeObjectURL(url), 100);
                  show(`✅ Export téléchargé — ${data.length} réservations`);
                } catch {
                  show("❌ Erreur lors de l'export. Réessayez.", "error");
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
