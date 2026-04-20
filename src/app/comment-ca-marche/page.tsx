"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function CommentCaMarchePage() {
  const { t } = useI18n();

  const senderSteps = [
    { num: "1", title: t("hiw_sender_s1_title"), desc: t("hiw_sender_s1_desc") },
    { num: "2", title: t("hiw_sender_s2_title"), desc: t("hiw_sender_s2_desc") },
    { num: "3", title: t("hiw_sender_s3_title"), desc: t("hiw_sender_s3_desc") },
    { num: "4", title: t("hiw_sender_s4_title"), desc: t("hiw_sender_s4_desc") },
  ];

  const transporterSteps = [
    { num: "1", title: t("hiw_trans_s1_title"), desc: t("hiw_trans_s1_desc") },
    { num: "2", title: t("hiw_trans_s2_title"), desc: t("hiw_trans_s2_desc") },
    { num: "3", title: t("hiw_trans_s3_title"), desc: t("hiw_trans_s3_desc") },
    { num: "4", title: t("hiw_trans_s4_title"), desc: t("hiw_trans_s4_desc") },
  ];

  const faqs = [
    { q: t("hiw_faq_q1"), a: t("hiw_faq_a1") },
    { q: t("hiw_faq_q2"), a: t("hiw_faq_a2") },
    { q: t("hiw_faq_q3"), a: t("hiw_faq_a3") },
    { q: t("hiw_faq_q4"), a: t("hiw_faq_a4") },
    { q: t("hiw_faq_q5"), a: t("hiw_faq_a5") },
    { q: t("hiw_faq_q6"), a: t("hiw_faq_a6") },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="text-white py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("hiw_hero_title")}</h1>
          <p className="text-blue-100 text-lg">
            {t("hiw_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* For Senders */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-2 text-center">{t("hiw_senders_title")}</h2>
          <p className="text-dz-gray-500 text-center mb-12">{t("hiw_senders_subtitle")}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {senderSteps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-dz-green text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/envoyer" className="bg-dz-green hover:bg-dz-green-light text-white px-8 py-3 rounded-xl font-medium transition-colors">
              {t("hiw_senders_cta")}
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-dz-gray-200" />

      {/* For Transporters */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-2 text-center">{t("hiw_trans_title")}</h2>
          <p className="text-dz-gray-500 text-center mb-12">{t("hiw_trans_subtitle")}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {transporterSteps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-dz-gray-800 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/transporter" className="bg-dz-gray-800 hover:bg-dz-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
              {t("hiw_trans_cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dz-gray-800 mb-8 text-center">{t("hiw_faq_title")}</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="bg-dz-gray-50 rounded-xl border border-dz-gray-200 group">
                <summary className="p-5 cursor-pointer font-medium text-dz-gray-800 flex items-center justify-between">
                  {f.q}
                  <svg className="w-5 h-5 text-dz-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-dz-gray-600 leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
