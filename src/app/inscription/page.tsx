"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import WaselliLogo from "@/components/WaselliLogo";
import PhoneInput from "@/components/PhoneInput";

const WILAYAS = [
  "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi","05 - Batna",
  "06 - Béjaïa","07 - Biskra","08 - Béchar","09 - Blida","10 - Bouira",
  "11 - Tamanrasset","12 - Tébessa","13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou",
  "16 - Alger","17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
  "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma","25 - Constantine",
  "26 - Médéa","27 - Mostaganem","28 - M'sila","29 - Mascara","30 - Ouargla",
  "31 - Oran","32 - El Bayadh","33 - Illizi","34 - Bordj Bou Arréridj",
  "35 - Boumerdès","36 - El Tarf","37 - Tindouf","38 - Tissemsilt",
  "39 - El Oued","40 - Khenchela","41 - Souk Ahras","42 - Tipaza",
  "43 - Mila","44 - Aïn Defla","45 - Naâma","46 - Aïn Témouchent",
  "47 - Ghardaïa","48 - Relizane",
];

/**
 * Inscription (signup) page.
 *
 * Design notes:
 * — Matches the connexion page's aesthetic — same background aura, same
 *   card, same input system — so users moving between the two don't
 *   feel a jump.
 * — Terms checkbox lives in a subtle tinted block to visually separate
 *   it from the inputs. It's the commitment moment; the eye should
 *   register it as distinct.
 * — Success view uses a proper success token (green), not a generic badge.
 */
export default function InscriptionPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", wilaya: "", referralCode: "", acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const { register, signInWithGoogle, user } = useAuth();
  const { addToast }       = useToast();
  const { t }              = useI18n();
  const router             = useRouter();
  const justRegistered     = useRef(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setForm((prev) => ({ ...prev, referralCode: ref }));
  }, [searchParams]);

  useEffect(() => {
    if (user && !justRegistered.current) router.replace("/tableau-de-bord");
  }, [user, router]);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError(t("auth_fill_required")); return;
    }
    if (form.password.length < 6) {
      setError(t("auth_password_short")); return;
    }
    if (!form.acceptTerms) {
      setError(t("auth_accept_terms")); return;
    }
    setLoading(true);
    justRegistered.current = true;
    const { error: err } = await register({
      firstName: form.firstName, lastName: form.lastName,
      email: form.email, phone: form.phone,
      wilaya: form.wilaya, password: form.password,
      referredBy: form.referralCode.trim() || undefined,
    });
    setLoading(false);
    if (err) {
      justRegistered.current = false;
      if (err.includes("already registered") || err.includes("already exists")) {
        setError(t("auth_email_exists"));
      } else {
        setError(err);
      }
    } else {
      setSuccess(true);
      addToast(t("auth_account_created"));
    }
  };

  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden bg-dz-gray-50">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.18), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative w-full max-w-md text-center animate-fade-up">
          <div className="flex justify-center mb-6"><WaselliLogo size="md" href="/" /></div>
          <div className="card p-8" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="w-16 h-16 bg-[color:var(--success-soft)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[color:var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dz-gray-800 mb-2">{t("auth_verify_title")}</h2>
            <p className="text-dz-gray-500 text-[15px] leading-relaxed">
              {t("auth_verify_sent")} <strong className="text-dz-gray-800">{form.email}</strong>. {t("auth_verify_click")}
            </p>
            <p className="text-xs text-dz-gray-400 mt-4">{t("auth_verify_spam")}</p>
            <Link href="/connexion" className="mt-6 inline-block text-dz-green font-semibold hover:underline underline-offset-4 text-sm">
              {t("auth_back_login")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden bg-dz-gray-50">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.18), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><WaselliLogo size="md" href="/" /></div>
          <h1 className="text-2xl md:text-[28px] font-bold text-dz-gray-800 mt-1">
            {t("auth_register_title")}
          </h1>
          <p className="text-dz-gray-500 mt-1.5 text-[15px]">{t("auth_register_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-7 space-y-4" style={{ boxShadow: "var(--shadow-md)" }}>
          {error && (
            <div className="flex items-start gap-2 bg-[color:var(--danger-soft)] text-[color:var(--danger)] text-sm p-3 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_firstname")}</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Karim" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_lastname")}</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Benali" className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_phone")}</label>
            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_email")}</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="vous@exemple.com" className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_password")}</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="input" />
            <p className="text-xs text-dz-gray-400 mt-1.5">{t("min_password")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">{t("auth_wilaya")}</label>
            <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)} className="input text-dz-gray-700">
              <option value="">{t("select_wilaya")}</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1.5">
              {t("auth_referral")} <span className="text-dz-gray-400 font-normal">{t("auth_referral_opt")}</span>
            </label>
            <input
              type="text"
              value={form.referralCode}
              onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
              placeholder="WSL-XXXX-XXX"
              className="input font-mono text-sm tracking-wide"
            />
          </div>

          <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-lg p-4 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => update("acceptTerms", e.target.checked)}
                className="mt-0.5 accent-dz-green w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-dz-gray-600 leading-relaxed">
                {t("auth_terms_check")}{" "}
                <Link href="/cgv" className="text-dz-green underline font-medium underline-offset-2" target="_blank">{t("auth_terms_cgv")}</Link>,{" "}
                <Link href="/confidentialite" className="text-dz-green underline font-medium underline-offset-2" target="_blank">{t("auth_terms_privacy")}</Link>{" "}
                {t("auth_or")}{" "}
                <Link href="/mentions-legales" className="text-dz-green underline font-medium underline-offset-2" target="_blank">{t("auth_terms_charter")}</Link>.{" "}
                {t("auth_terms_age")}
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-1">
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? t("auth_registering") : t("auth_register_btn")}
          </button>
        </form>

        <div className="mt-5">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-dz-gray-200" />
            <span className="text-[11px] uppercase tracking-[0.1em] text-dz-gray-400 font-semibold">
              {t("auth_or_fast")}
            </span>
            <div className="flex-1 h-px bg-dz-gray-200" />
          </div>
          <button type="button" onClick={signInWithGoogle} className="btn btn-secondary btn-lg w-full">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("auth_google_register")}
          </button>
        </div>

        <p className="text-center text-sm text-dz-gray-500 mt-6">
          {t("auth_already_account")}{" "}
          <Link href="/connexion" className="text-dz-green font-semibold hover:underline underline-offset-4">
            {t("nav_login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
