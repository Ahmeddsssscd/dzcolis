"use client";

import { useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, show };
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${checked ? "bg-green-600" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
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

export default function ParametresPage() {
  const { toasts, show } = useToast();

  // Platform settings
  const [commission, setCommission] = useState("10");
  const [delaiLib, setDelaiLib] = useState("48h");
  const [montantMin, setMontantMin] = useState("500");

  // Contact
  const [emailContact, setEmailContact] = useState("contact@waselli.com");
  const [whatsapp, setWhatsapp] = useState("+40725028189");
  const [adresse, setAdresse] = useState("Alger, Algérie");

  // Notifications
  const [alertLitiges, setAlertLitiges] = useState(true);
  const [alertKYC, setAlertKYC] = useState(true);
  const [alertBigTx, setAlertBigTx] = useState(true);
  const [rapportQuotidien, setRapportQuotidien] = useState(false);

  // Danger zone
  const [maintenance, setMaintenance] = useState(false);

  function save(section: string) {
    show(`${section} enregistré ✓`);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2"
          >
            <span className="text-green-400">✓</span>
            {t.message}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-500 text-sm mt-1">Configuration générale de la plateforme Waselli</p>
      </div>

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
                className="w-28 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <button
              onClick={() => save("Taux de commission")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </Field>
        <Field label="Délai de libération automatique">
          <div className="flex items-center gap-3">
            <select
              value={delaiLib}
              onChange={(e) => setDelaiLib(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="24h">24 heures</option>
              <option value="48h">48 heures</option>
              <option value="72h">72 heures</option>
            </select>
            <button
              onClick={() => save("Délai de libération")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Enregistrer
            </button>
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
                className="w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DA</span>
            </div>
            <button
              onClick={() => save("Montant minimum")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Enregistrer
            </button>
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
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => save("Email de contact")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex-shrink-0"
            >
              Enregistrer
            </button>
          </div>
        </Field>
        <Field label="Numéro WhatsApp">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => save("WhatsApp")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex-shrink-0"
            >
              Enregistrer
            </button>
          </div>
        </Field>
        <Field label="Adresse">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => save("Adresse")}
              className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex-shrink-0"
            >
              Enregistrer
            </button>
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications admin">
        <div className="divide-y divide-gray-50">
          <ToggleSwitch
            checked={alertLitiges}
            onChange={(v) => { setAlertLitiges(v); show("Notifications litiges " + (v ? "activées" : "désactivées") + " ✓"); }}
            label="Alertes nouveaux litiges"
            description="Recevoir une notification à chaque litige ouvert"
          />
          <ToggleSwitch
            checked={alertKYC}
            onChange={(v) => { setAlertKYC(v); show("Notifications KYC " + (v ? "activées" : "désactivées") + " ✓"); }}
            label="Alertes KYC soumis"
            description="Notifié lorsqu'un transporteur soumet ses documents"
          />
          <ToggleSwitch
            checked={alertBigTx}
            onChange={(v) => { setAlertBigTx(v); show("Alertes grandes transactions " + (v ? "activées" : "désactivées") + " ✓"); }}
            label="Alertes transactions > 50 000 DA"
            description="Surveillance des transactions à montant élevé"
          />
          <ToggleSwitch
            checked={rapportQuotidien}
            onChange={(v) => { setRapportQuotidien(v); show("Rapport quotidien " + (v ? "activé" : "désactivé") + " ✓"); }}
            label="Rapport quotidien par email"
            description="Résumé envoyé chaque matin à 8h00"
          />
        </div>
      </Section>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h3 className="font-semibold text-red-700 text-base">Zone de danger</h3>
        </div>
        <p className="text-sm text-red-600 mb-6">Ces actions affectent l&apos;ensemble de la plateforme. Procédez avec précaution.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Mettre la plateforme en maintenance</p>
              <p className="text-xs text-gray-500 mt-0.5">Rend la plateforme inaccessible aux utilisateurs</p>
            </div>
            <button
              onClick={() => {
                setMaintenance((v) => {
                  const next = !v;
                  show("Mode maintenance " + (next ? "activé" : "désactivé") + " ✓");
                  return next;
                });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${maintenance ? "bg-red-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${maintenance ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {maintenance && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-4 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <div>
                <p className="text-red-800 font-semibold text-sm">Plateforme en maintenance</p>
                <p className="text-red-600 text-xs mt-0.5">Les utilisateurs voient une page de maintenance</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Exporter toutes les données</p>
              <p className="text-xs text-gray-500 mt-0.5">Télécharge un export CSV de toutes les données</p>
            </div>
            <button
              onClick={() => show("Export en cours de préparation ✓")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
