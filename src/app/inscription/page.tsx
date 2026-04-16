"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useToast } from "@/lib/context";
import { useI18n } from "@/lib/i18n";
import WaselliLogo from "@/components/WaselliLogo";

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
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6"><WaselliLogo size="md" href="/" /></div>
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dz-gray-800 mb-2">{t("auth_verify_title")}</h2>
            <p className="text-dz-gray-500 text-sm leading-relaxed">
              {t("auth_verify_sent")} <strong>{form.email}</strong>. {t("auth_verify_click")}
            </p>
            <p className="text-xs text-dz-gray-400 mt-4">{t("auth_verify_spam")}</p>
            <Link href="/connexion" className="mt-6 inline-block text-dz-green font-medium hover:underline text-sm">
              {t("auth_back_login")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><WaselliLogo size="md" href="/" /></div>
          <h1 className="text-2xl font-bold text-dz-gray-800 mt-2">{t("auth_register_title")}</h1>
          <p className="text-dz-gray-500 mt-1">{t("auth_register_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dz-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 text-dz-red text-sm p-3 rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_firstname")}</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Karim"
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_lastname")}</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Benali"
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_phone")}</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-dz-gray-200 rounded-l-xl bg-dz-gray-50 text-sm text-dz-gray-500">+213</span>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="555 123 456"
                className="flex-1 px-4 py-3 border border-dz-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_email")}</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_password")}</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green" />
            <p className="text-xs text-dz-gray-400 mt-1">{t("min_password")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">{t("auth_wilaya")}</label>
            <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)}
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-dz-gray-700">
              <option value="">{t("select_wilaya")}</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dz-gray-700 mb-1">
              {t("auth_referral")} <span className="text-dz-gray-400 font-normal">{t("auth_referral_opt")}</span>
            </label>
            <input type="text" value={form.referralCode} onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
              placeholder="WSL-XXXX-XXX"
              className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green font-mono text-sm" />
          </div>

          <div className="bg-dz-gray-50 border border-dz-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-dz-gray-700">Acceptation des conditions</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptTerms} onChange={(e) => update("acceptTerms", e.target.checked)}
                className="mt-0.5 accent-dz-green w-4 h-4 flex-shrink-0" />
              <span className="text-xs text-dz-gray-500 leading-relaxed">
                {t("auth_terms_check")}{" "}
                <Link href="/cgv" className="text-dz-green underline font-medium" target="_blank">{t("auth_terms_cgv")}</Link>,{" "}
                <Link href="/confidentialite" className="text-dz-green underline font-medium" target="_blank">{t("auth_terms_privacy")}</Link>{" "}
                {t("auth_or")}{" "}
                <Link href="/mentions-legales" className="text-dz-green underline font-medium" target="_blank">{t("auth_terms_charter")}</Link>.{" "}
                {t("auth_terms_age")}
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-dz-green hover:bg-dz-green-light disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? t("auth_registering") : t("auth_register_btn")}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-dz-gray-200" />
            <span className="text-xs text-dz-gray-400 font-medium">{t("auth_or_fast")}</span>
            <div className="flex-1 h-px bg-dz-gray-200" />
          </div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-dz-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-dz-gray-700 bg-white hover:bg-dz-gray-50 transition-colors"
          >
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
          <Link href="/connexion" className="text-dz-green font-medium hover:underline">{t("nav_login")}</Link>
        </p>
      </div>
    </div>
  );
}
