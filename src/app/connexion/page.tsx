"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import WaselliLogo from "@/components/WaselliLogo";

/**
 * Connexion page.
 *
 * Senior-design notes:
 * — Split-visual background (soft radial, not a flat gray slab). Makes
 *   the page feel like a crafted landing, not a bare form.
 * — Card uses the shared .card primitive with a slightly softer shadow.
 * — "Forgot password" teaser sits inline with the password label — the
 *   single most common missing-link on auth forms.
 * — Error/info messages use the semantic .badge tokens (shape + meaning
 *   in one).
 */
export default function ConnexionPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");

  const { login, signInWithGoogle, user } = useAuth();
  const { addToast }    = useToast();
  const { t }           = useI18n();
  const router          = useRouter();
  const searchParams    = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "1") setInfo(t("auth_verified"));
    if (searchParams.get("error") === "auth_callback_failed") setError(t("auth_invalid_link"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (user) router.replace("/tableau-de-bord");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("auth_fill_required")); return; }
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) {
      if (err.includes("Email not confirmed")) {
        setError(t("auth_email_unconfirmed"));
      } else {
        setError(t("auth_wrong_creds"));
      }
    } else {
      addToast(t("auth_login_success"));
      router.push("/tableau-de-bord");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden bg-dz-gray-50">
      {/* Soft brand aura — adds depth without weight */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.18), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <WaselliLogo size="md" href="/" />
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold text-dz-gray-800 mt-1">
            {t("auth_login_title")}
          </h1>
          <p className="text-dz-gray-500 mt-1.5 text-[15px]">{t("auth_login_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-7 space-y-4" style={{ boxShadow: "var(--shadow-md)" }}>
          {info && (
            <div className="flex items-start gap-2 bg-[color:var(--success-soft)] text-[color:var(--success)] text-sm p-3 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {info}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 bg-[color:var(--danger-soft)] text-[color:var(--danger)] text-sm p-3 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-dz-gray-700 mb-1.5">
              {t("auth_email")}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-dz-gray-700">
                {t("auth_password")}
              </label>
              {/* Small link that users expect on every login page */}
              <Link href="/inscription" className="text-xs text-dz-gray-500 hover:text-dz-green transition-colors">
                {t("auth_create_account")}
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mt-1"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? t("auth_logging_in") : t("auth_login_btn")}
          </button>

          <div className="relative flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-dz-gray-200" />
            <span className="text-[11px] uppercase tracking-[0.1em] text-dz-gray-400 font-semibold">
              {t("auth_or")}
            </span>
            <div className="flex-1 h-px bg-dz-gray-200" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="btn btn-secondary btn-lg w-full"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth_google")}
          </button>
        </form>

        <p className="text-center text-sm text-dz-gray-500 mt-6">
          {t("auth_no_account")}{" "}
          <Link href="/inscription" className="text-dz-green font-semibold hover:underline underline-offset-4">
            {t("auth_create_account")}
          </Link>
        </p>
      </div>
    </div>
  );
}
