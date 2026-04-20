"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminT } from "@/lib/admin-i18n";

export default function AdminLoginForm() {
  const router = useRouter();
  const { t } = useAdminT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      // Default to generic invalid-credentials; narrow it for well-known
      // status codes so operators get an actionable hint.
      let msg = t("adm_login_err_invalid");
      if (res.status === 429) {
        msg = t("adm_login_err_rate");
      } else if (res.status === 500) {
        msg = t("adm_login_err_config");
      }
      setError(msg);
    } catch {
      setError(t("adm_login_err_network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "#1d4ed8" }}>
              W
            </div>
            <span className="text-xl font-bold text-gray-900">
              Waselli <span className="text-blue-600">{t("adm_sidebar_brand_suffix")}</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">{t("adm_login_subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("adm_login_email")}</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@waselli.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("adm_login_password")}</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            {loading ? t("adm_login_submitting") : t("adm_login_submit")}
          </button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed pt-2">
            {t("adm_login_hint")}
          </p>
        </form>
      </div>
    </div>
  );
}
