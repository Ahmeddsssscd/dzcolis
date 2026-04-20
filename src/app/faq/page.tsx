"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type FaqItem = {
  q: string;
  a: string;
};

type FaqCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
};

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 text-dz-green transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-dz-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-dz-gray-200 rounded-xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-dz-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 pr-4">
          <CheckIcon />
          <span className="font-medium text-dz-gray-800">{item.q}</span>
        </div>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 bg-white border-t border-dz-gray-100">
          <p className="text-dz-gray-600 leading-relaxed pl-8">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const { t } = useI18n();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories: FaqCategory[] = [
    {
      id: "general",
      title: t("faq_cat_general"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: [
        { q: t("faq_gen_q1"), a: t("faq_gen_a1") },
        { q: t("faq_gen_q2"), a: t("faq_gen_a2") },
        { q: t("faq_gen_q3"), a: t("faq_gen_a3") },
        { q: t("faq_gen_q4"), a: t("faq_gen_a4") },
      ],
    },
    {
      id: "expediteurs",
      title: t("faq_cat_senders"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      items: [
        { q: t("faq_exp_q1"), a: t("faq_exp_a1") },
        { q: t("faq_exp_q2"), a: t("faq_exp_a2") },
        { q: t("faq_exp_q3"), a: t("faq_exp_a3") },
        { q: t("faq_exp_q4"), a: t("faq_exp_a4") },
      ],
    },
    {
      id: "transporteurs",
      title: t("faq_cat_transporters"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      items: [
        { q: t("faq_trans_q1"), a: t("faq_trans_a1") },
        { q: t("faq_trans_q2"), a: t("faq_trans_a2") },
        { q: t("faq_trans_q3"), a: t("faq_trans_a3") },
        { q: t("faq_trans_q4"), a: t("faq_trans_a4") },
      ],
    },
    {
      id: "international",
      title: t("faq_cat_international"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: [
        { q: t("faq_intl_q1"), a: t("faq_intl_a1") },
        { q: t("faq_intl_q2"), a: t("faq_intl_a2") },
        { q: t("faq_intl_q3"), a: t("faq_intl_a3") },
      ],
    },
    {
      id: "paiement-securite",
      title: t("faq_cat_payment"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      items: [
        { q: t("faq_pay_q1"), a: t("faq_pay_a1") },
        { q: t("faq_pay_q2"), a: t("faq_pay_a2") },
        { q: t("faq_pay_q3"), a: t("faq_pay_a3") },
      ],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-dz-green-light rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("faq_badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t("faq_hero_title")}<br />
            <span className="text-blue-200">{t("faq_hero_title2")}</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t("faq_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* Navigation rapide par catégorie */}
      <div className="bg-white border-b border-dz-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-dz-gray-600 hover:bg-dz-green/10 hover:text-dz-green transition-colors"
              >
                <span className="text-dz-green">{cat.icon}</span>
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="bg-dz-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {categories.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <h2 className="text-2xl font-bold text-dz-gray-800">{cat.title}</h2>
                <span className="text-sm text-dz-gray-400 font-medium">
                  {cat.items.length} {cat.items.length > 1 ? t("faq_question_plural") : t("faq_question_singular")}
                </span>
              </div>
              <div className="space-y-3">
                {cat.items.map((item, i) => {
                  const key = `${cat.id}-${i}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-dz-green to-dz-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("faq_cta_title")}</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {t("faq_cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              {t("faq_cta_send")}
            </Link>
            <Link
              href="/inscription"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              {t("faq_cta_register")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
