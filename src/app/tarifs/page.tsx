"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TarifsPage() {
  const { t } = useI18n();

  // Domestic grid — calibrated just above Yalidine's bureau-to-bureau
  // reference (Alger→Oran ≈ 800 DA for a 5 kg parcel), because Waselli
  // is a voyageur-hosted alternative, not an agency network, and the
  // transporter needs headroom above fuel cost + Waselli's 10 %
  // commission. Intentionally NOT undercut below street value.
  const domesticRoutes = [
    { zone: "Même wilaya (< 50 km)",      examples: "Alger–Blida, Oran–Aïn Témouchent", weight1: "250–400 DA",   weight5: "400–600 DA",   weight20: "600–900 DA" },
    { zone: "Wilayas voisines (50–200 km)", examples: "Alger–Tizi Ouzou, Alger–Béjaïa",  weight1: "350–550 DA",   weight5: "550–800 DA",   weight20: "800–1 200 DA" },
    { zone: "Trajet moyen (200–500 km)",  examples: "Alger–Oran, Alger–Constantine",    weight1: "500–800 DA",   weight5: "800–1 200 DA", weight20: "1 200–2 000 DA" },
    { zone: "Trajet long (500–1 000 km)", examples: "Alger–Annaba, Oran–Constantine",   weight1: "700–1 000 DA", weight5: "1 000–1 500 DA", weight20: "1 500–2 500 DA" },
    { zone: "Grand Sud (> 1 000 km)",     examples: "Alger–Tamanrasset, Alger–Djanet",  weight1: "1 200–1 800 DA", weight5: "1 800–2 800 DA", weight20: "2 800–4 500 DA" },
  ];

  // International grid — anchored on a 3 €/kg baseline (item 3), with
  // a small margin for distance. Distance-to-Germany naturally carries
  // the highest floor; Italy is closest so the cheapest.
  const internationalRoutes = [
    { country: "France", flag: "🇫🇷", small: "10–18 €", medium: "20–35 €", large: "40–70 €", delay: "4–8 jours" },
    { country: "Espagne", flag: "🇪🇸", small: "9–16 €",  medium: "18–32 €", large: "36–65 €", delay: "5–9 jours" },
    { country: "Belgique", flag: "🇧🇪", small: "11–18 €", medium: "22–36 €", large: "42–72 €", delay: "5–8 jours" },
    { country: "Allemagne", flag: "🇩🇪", small: "13–22 €", medium: "26–42 €", large: "48–80 €", delay: "7–12 jours" },
    { country: "Italie", flag: "🇮🇹", small: "8–15 €",  medium: "16–28 €", large: "32–58 €", delay: "4–7 jours" },
  ];

  const trustItems = [
    {
      title: t("tarifs_trust1_title"),
      desc: t("tarifs_trust1_desc"),
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      title: t("tarifs_trust2_title"),
      desc: t("tarifs_trust2_desc"),
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      title: t("tarifs_trust3_title"),
      desc: t("tarifs_trust3_desc"),
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: t("tarifs_trust4_title"),
      desc: t("tarifs_trust4_desc"),
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("tarifs_badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t("tarifs_hero_title")}<br />
            <span className="text-blue-200">{t("tarifs_hero_title2")}</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t("tarifs_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* Commission model */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">{t("tarifs_commission_title")}</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              {t("tarifs_commission_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Sender */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all text-center">
              <div className="w-14 h-14 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dz-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-dz-gray-800 mb-2">{t("tarifs_sender_title")}</h3>
              <p className="text-sm text-dz-gray-500">{t("tarifs_sender_desc")}</p>
            </div>

            {/* Waselli commission — highlighted */}
            <div className="bg-dz-green rounded-2xl p-6 text-white text-center shadow-lg shadow-dz-green/20">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-4xl font-bold mb-1">10 %</div>
              <h3 className="font-semibold mb-2">{t("tarifs_commission_label")}</h3>
              <p className="text-sm text-blue-100">{t("tarifs_commission_desc")}</p>
            </div>

            {/* Carrier */}
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all text-center">
              <div className="w-14 h-14 bg-dz-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-dz-green mb-1">90 %</div>
              <h3 className="font-semibold text-dz-gray-800 mb-2">{t("tarifs_trans_title")}</h3>
              <p className="text-sm text-dz-gray-500">{t("tarifs_trans_desc")}</p>
            </div>
          </div>

          {/* Example */}
          <div className="bg-dz-gray-50 rounded-2xl border border-dz-gray-200 p-6">
            <h3 className="font-semibold text-dz-gray-800 mb-4 text-center">{t("tarifs_example_title")}</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-dz-gray-800">3 000 DA</div>
                <div className="text-sm text-dz-gray-500">{t("tarifs_example_fixed")}</div>
              </div>
              <svg className="w-6 h-6 text-dz-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <div className="text-2xl font-bold text-dz-red">−300 DA</div>
                <div className="text-sm text-dz-gray-500">{t("tarifs_example_commission")}</div>
              </div>
              <svg className="w-6 h-6 text-dz-gray-300 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <div className="text-2xl font-bold text-dz-green">2 700 DA</div>
                <div className="text-sm text-dz-gray-500">{t("tarifs_example_received")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Domestic rates */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">{t("tarifs_domestic_title")}</h2>
            <p className="text-dz-gray-500">
              {t("tarifs_domestic_subtitle")}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-dz-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dz-gray-50 border-b border-dz-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-dz-gray-700">{t("tarifs_col_zone")}</th>
                    <th className="text-left px-4 py-4 text-sm font-semibold text-dz-gray-700">{t("tarifs_col_examples")}</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-gray-700">1–5 kg</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-gray-700">5–20 kg</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-dz-green">+ 20 kg</th>
                  </tr>
                </thead>
                <tbody>
                  {domesticRoutes.map((row, i) => (
                    <tr key={i} className={`border-b border-dz-gray-100 hover:bg-dz-gray-50 transition-colors ${i === domesticRoutes.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4 font-medium text-dz-gray-800 text-sm">{row.zone}</td>
                      <td className="px-4 py-4 text-dz-gray-500 text-sm">{row.examples}</td>
                      <td className="px-4 py-4 text-center text-sm text-dz-gray-700">{row.weight1}</td>
                      <td className="px-4 py-4 text-center text-sm text-dz-gray-700">{row.weight5}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-dz-green">{row.weight20}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-dz-gray-400 mt-3 text-center">
            {t("tarifs_col_footnote")}
          </p>
        </div>
      </section>

      {/* International rates */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              {t("tarifs_intl_badge")}
            </div>
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">{t("tarifs_intl_title")}</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              {t("tarifs_intl_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {internationalRoutes.map((route) => (
              <div
                key={route.country}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{route.flag}</span>
                  <div>
                    <div className="font-semibold text-dz-gray-800">{route.country}</div>
                    <div className="text-xs text-dz-gray-400">{route.delay} {t("tarifs_delay")}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">{t("tarifs_small_pkg")}</span>
                    <span className="font-medium text-dz-gray-800">{route.small}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">{t("tarifs_medium_pkg")}</span>
                    <span className="font-medium text-dz-gray-800">{route.medium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dz-gray-500">{t("tarifs_large_pkg")}</span>
                    <span className="font-medium text-dz-green">{route.large}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-dz-gray-400 mt-4 text-center">
            {t("tarifs_intl_footnote")}
          </p>
        </div>
      </section>

      {/* Insurance */}
      <section className="py-16 bg-dz-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">{t("tarifs_insurance_title")}</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              {t("tarifs_insurance_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dz-gray-800">{t("tarifs_domestic_cover")}</h3>
              </div>
              <div className="text-3xl font-bold text-dz-green mb-2">20 000 DA <span className="text-sm font-medium text-dz-gray-400">→ 150 000 DA</span></div>
              <p className="text-sm text-dz-gray-500">{t("tarifs_domestic_cover_desc")}</p>
            </div>

            <div className="bg-white rounded-2xl border border-dz-green/30 shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dz-gray-800">{t("tarifs_intl_cover")}</h3>
                  <span className="text-xs bg-dz-green text-white px-2 py-0.5 rounded-full">{t("tarifs_intl_cover_badge")}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-dz-green mb-2">500 € <span className="text-sm font-medium text-dz-gray-400">→ 5 000 €</span></div>
              <p className="text-sm text-dz-gray-500">{t("tarifs_intl_cover_desc")}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/assurance" className="text-dz-green font-medium hover:underline text-sm">
              {t("tarifs_insurance_link")}
            </Link>
          </div>
        </div>
      </section>

      {/* No hidden fees */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-dz-green/10 text-dz-green rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("tarifs_trust_badge")}
            </div>
            <h2 className="text-3xl font-bold text-dz-gray-800 mb-3">{t("tarifs_trust_title")}</h2>
            <p className="text-dz-gray-500 max-w-xl mx-auto">
              {t("tarifs_trust_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-dz-gray-200 p-6 hover:border-dz-green/30 hover:shadow-md transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-dz-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-dz-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-dz-green to-dz-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("tarifs_cta_title")}</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {t("tarifs_cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-dz-green hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              {t("tarifs_cta_send")}
            </Link>
            <Link
              href="/faq"
              className="border-2 border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors"
            >
              {t("tarifs_cta_faq")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
