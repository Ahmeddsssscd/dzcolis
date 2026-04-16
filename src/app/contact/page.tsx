"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_URL =
  "https://wa.me/40725028189?text=Bonjour%20Waselli%2C%20j%27ai%20besoin%20d%27aide.";

export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const subjects = [
    t("contact_subj_general"),
    t("contact_subj_delivery"),
    t("contact_subj_report"),
    t("contact_subj_insurance"),
    t("contact_subj_business"),
    t("contact_subj_press"),
    t("contact_subj_other"),
  ];

  const contactInfo = [
    {
      icon: "👤",
      title: t("contact_support_title"),
      value: t("contact_support_value"),
      sub: t("contact_support_sub"),
    },
    {
      icon: "📧",
      title: t("contact_email_title"),
      value: "contact@waselli.com",
      sub: t("contact_email_sub"),
    },
    {
      icon: "📍",
      title: t("contact_address_title"),
      value: t("contact_address_value"),
      sub: t("contact_address_sub"),
    },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-dz-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dz-green to-green-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h1 className="text-4xl font-bold mb-3">{t("contact_hero_title")}</h1>
          <p className="text-green-100 text-lg">
            {t("contact_hero_subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <div key={info.title} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-5">
              <div className="text-2xl mb-2">{info.icon}</div>
              <p className="text-xs text-dz-gray-400 font-medium uppercase tracking-wide">{info.title}</p>
              <p className="font-semibold text-dz-gray-900 mt-0.5">{info.value}</p>
              <p className="text-xs text-dz-gray-400 mt-0.5">{info.sub}</p>
            </div>
          ))}

          {/* WhatsApp quick support */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20B954] text-white rounded-2xl p-5 transition-colors group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">{t("contact_whatsapp_title")}</p>
              <p className="text-xs text-white/80">{t("contact_whatsapp_sub")}</p>
            </div>
            <svg className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <p className="text-sm font-semibold text-dz-gray-800 mb-1">{t("contact_quick_help_title")}</p>
            <p className="text-xs text-dz-gray-500 mb-3">
              {t("contact_quick_help_desc")}
            </p>
            <Link href="/faq" className="text-sm text-dz-green font-semibold hover:underline">
              {t("contact_faq_link")}
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {sent ? (
            <div className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-dz-gray-900 mb-2">{t("contact_sent_title")}</h2>
              <p className="text-dz-gray-500 mb-6">
                {t("contact_sent_desc")}
              </p>
              <button
                onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                className="text-sm text-dz-green font-semibold hover:underline"
              >
                {t("contact_send_another")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-dz-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-dz-gray-900 text-lg mb-2">{t("contact_form_title")}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("contact_fullname")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t("contact_fullname_ph")}
                    className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("contact_email_label")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t("contact_email_ph")}
                    className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("contact_subject_label")}</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green bg-white"
                >
                  <option value="">{t("contact_subject_ph")}</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dz-gray-600 mb-1.5">{t("contact_message_label")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder={t("contact_message_ph")}
                  className="w-full border border-dz-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dz-green resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-dz-green text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {sending ? t("contact_sending") : t("contact_send_btn")}
              </button>

              <p className="text-xs text-dz-gray-400 text-center">
                {t("contact_privacy_text")}{" "}
                <Link href="/confidentialite" className="underline">{t("contact_privacy")}</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
