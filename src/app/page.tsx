"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import RotatingTagline from "@/components/RotatingTagline";

/** Keys that the hero cycles through. The FIRST one is the anchor —
 *  it's what SSR renders and what Google indexes. Put your strongest
 *  tagline there. */
const HERO_TAGLINE_KEYS: TranslationKey[] = [
  "hero_tagline_1",
  "hero_tagline_2",
  "hero_tagline_3",
  "hero_tagline_4",
  "hero_tagline_5",
  "hero_tagline_6",
];

/* ─── hooks ─────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}


/* ─── small components ──────────────────── */

function Cycle() {
  const { t } = useI18n();
  const ITEMS = [
    { text: t("cycle_1"), icon: "🔒" },
    { text: t("cycle_2"), icon: "✅" },
    { text: t("cycle_3"), icon: "🛡️" },
    { text: t("cycle_4"), icon: "💬" },
  ];
  const [i, setI] = useState(0);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setOn(false);
      setTimeout(() => { setI(prev => (prev + 1) % ITEMS.length); setOn(true); }, 350);
    }, 3200);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all duration-350 backdrop-blur-sm"
      style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0) scale(1)" : "translateY(6px) scale(0.97)" }}>
      <span>{ITEMS[i].icon}</span>
      <span>{ITEMS[i].text}</span>
    </div>
  );
}

function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
    }}>
      {children}
    </div>
  );
}


/* ─── page ──────────────────────────────── */

export default function Home() {
  const { t } = useI18n();
  const [topCarriers, setTopCarriers] = useState<Array<{
    id: string; first_name: string; last_name: string; wilaya: string;
    rating: number; review_count: number; kyc_status: string;
    listings?: { is_international: boolean }[];
  }>>([]);
  const [carriersLoading, setCarriersLoading] = useState(true);

  useEffect(() => {
    fetch("/api/livreurs")
      .then(r => r.json())
      .then(data => {
        setTopCarriers(Array.isArray(data) ? data.slice(0, 3) : []);
        setCarriersLoading(false);
      })
      .catch(() => setCarriersLoading(false));
  }, []);

  const steps = [
    { title: t("step1_title"), desc: t("step1_desc") },
    { title: t("step2_title"), desc: t("step2_desc") },
    { title: t("step3_title"), desc: t("step3_desc") },
    { title: t("step4_title"), desc: t("step4_desc") },
  ];

  const features: { title: string; desc: string; icon: React.ReactNode }[] = [
    { title: t("feat1_title"), desc: t("feat1_desc"),
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: t("feat2_title"), desc: t("feat2_desc"),
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { title: t("feat3_title"), desc: t("feat3_desc"),
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: t("feat4_title"), desc: t("feat4_desc"),
      icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  ];

  const routes = [
    { from: "Alger",       to: "Oran",        price: "1 500 DA" },
    { from: "Alger",       to: "Constantine", price: "1 500 DA" },
    { from: "Oran",        to: "Tlemcen",     price: "800 DA" },
    { from: "Alger",       to: "Sétif",       price: "1 200 DA" },
    { from: "Alger",       to: "Béjaïa",      price: "1 000 DA" },
    { from: "Constantine", to: "Annaba",      price: "800 DA" },
  ];

  const intlRoutes = [
    { countryKey: "country_france" as const,   flag: "FR", route: "Alger → Paris",      price: "25 €" },
    { countryKey: "country_spain" as const,    flag: "ES", route: "Oran → Madrid",      price: "20 €" },
    { countryKey: "country_belgium" as const,  flag: "BE", route: "Alger → Bruxelles",  price: "22 €" },
    { countryKey: "country_germany" as const,  flag: "DE", route: "Alger → Berlin",     price: "35 €" },
    { countryKey: "country_italy" as const,    flag: "IT", route: "Constantine → Milan", price: "18 €" },
  ];

  return (
    <>
      <style>{`
        .hero-bg{
          background:
            radial-gradient(1200px 500px at 85% -10%, rgba(59,130,246,0.45), transparent 60%),
            radial-gradient(900px 600px at 10% 110%, rgba(15,23,42,0.55), transparent 55%),
            linear-gradient(155deg,#2563eb 0%,#1d4ed8 45%,#0f172a 100%);
        }
        .hero-grain{
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>");
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────
           The senior-designer upgrade here:
           • Multi-stop radial gradient adds depth that a flat gradient
             can't — eye traces light across the section.
           • A faint SVG noise grain kills the "perfect CSS" look; the
             hero now feels printed, not rendered.
           • CTAs use the shared .btn primitives so they match the rest
             of the site's click surface exactly. */}
      <section className="hero-bg relative text-white overflow-hidden">
        <div className="hero-grain absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay" aria-hidden />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "32px 32px" }}
          aria-hidden
        />

        <div className="max-w-7xl mx-auto container-px py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 bg-white/10 rounded-full pl-2 pr-4 py-1.5 text-sm mb-8 border border-white/15 backdrop-blur-sm">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-blue-300 opacity-75" />
                <span className="relative rounded-full w-2 h-2 bg-blue-300" />
              </span>
              {t("hero_badge")}
            </p>
            <RotatingTagline
              keys={HERO_TAGLINE_KEYS}
              className="text-4xl md:text-6xl font-bold leading-[1.05] mb-6 tracking-[-0.03em] relative"
              as="h1"
            />
            <p className="text-lg text-white/80 mb-6 max-w-2xl leading-relaxed">
              {t("hero_subtitle")}
            </p>

            {/* Trust cycling badge */}
            <div className="mb-10">
              <Cycle />
            </div>

            {/* CTA buttons — both audiences land here, so both get
                a first-class CTA. Previous hero relegated travellers
                to a small underline link under the fold. */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/envoyer"
                className="btn btn-lg bg-white text-[color:var(--brand-hover)] hover:bg-blue-50 shadow-lg shadow-black/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {t("cta_send")}
              </Link>
              <Link
                href="/transporter"
                className="btn btn-lg bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {t("cta_propose_route")}
              </Link>
            </div>

            {/* Tertiary: browse the marketplace */}
            <p className="mt-6 text-sm text-white/55">
              {t("hero_marketplace_lead")}{" "}
              <Link href="/annonces" className="text-white font-semibold hover:text-white/90 transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white">
                {t("nav_listings")} →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust pillars ─────────────────────────────────────────────
           Design note: previous version used blue/green/purple/orange
           icons — visually fun but reads as "we picked a random color
           for each icon." One brand tint across the board makes the
           eye read the row as one unified trust signal. */}
      <div className="bg-white border-b border-dz-gray-100">
        <div className="max-w-7xl mx-auto container-px">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-dz-gray-100">
            {[
              {
                title: "Paiement séquestre",
                desc: "Votre argent est libéré uniquement après confirmation de réception.",
                path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
              {
                title: "Transporteurs vérifiés",
                desc: "Identité et véhicule contrôlés avant toute activation du compte.",
                path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Assurance incluse",
                desc: "Chaque colis couvert jusqu'à 20 000 DA, sans frais cachés.",
                path: "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v4m0 4h.01",
              },
              {
                title: "Support 7j/7",
                desc: "Une équipe disponible chaque jour pour répondre à vos questions.",
                path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="flex items-start gap-4 px-6 py-8 group">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-dz-green/10 text-dz-green flex items-center justify-center transition-colors duration-300 group-hover:bg-dz-green group-hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={pillar.path} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-dz-gray-800 text-sm leading-snug">{pillar.title}</p>
                  <p className="text-xs text-dz-gray-500 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────── */}
      <section className="py-20 bg-dz-gray-50" id="comment-ca-marche">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">{t("how_title")}</h2>
            <p className="text-dz-gray-500 mt-2">{t("how_subtitle")}</p>
          </Fade>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Fade key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl p-6 border border-dz-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-dz-green text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">{i + 1}</div>
                  <h3 className="font-semibold text-dz-gray-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-dz-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us / Price Comparison ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <span className="inline-block bg-dz-green/10 text-dz-green text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">{t("why_badge")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">{t("why_title")}</h2>
            <p className="text-dz-gray-500 mt-3 max-w-xl mx-auto">{t("why_subtitle")}</p>
          </Fade>

          <Fade className="mb-14">
            <div className="overflow-x-auto rounded-2xl border border-dz-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-dz-gray-50 border-b border-dz-gray-100">
                    <th className="text-left px-6 py-4 font-semibold text-dz-gray-600">{t("table_route")}</th>
                    <th className="px-6 py-4 font-semibold text-red-500 text-center">DHL / Chronopost</th>
                    <th className="px-6 py-4 font-semibold text-red-400 text-center">Agences locales</th>
                    <th className="px-6 py-4 font-bold text-dz-green text-center bg-dz-green/5 rounded-tr-2xl">Waselli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dz-gray-50">
                  {[
                    { route: "Alger → Paris",      dhl: "65 €",     local: "45 €",     waselli: "12 €" },
                    { route: "Alger → Lyon",        dhl: "65 €",     local: "45 €",     waselli: "12 €" },
                    { route: "Oran → Madrid",       dhl: "70 €",     local: "50 €",     waselli: "15 €" },
                    { route: "Alger → Oran",        dhl: "4 500 DA", local: "3 000 DA", waselli: "900 DA" },
                    { route: "Alger → Constantine", dhl: "4 500 DA", local: "3 000 DA", waselli: "900 DA" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-dz-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-dz-gray-800">{row.route}</td>
                      <td className="px-6 py-4 text-center text-red-500 font-semibold line-through opacity-70">{row.dhl}</td>
                      <td className="px-6 py-4 text-center text-red-400 font-semibold line-through opacity-70">{row.local}</td>
                      <td className="px-6 py-4 text-center bg-dz-green/5">
                        <span className="inline-flex items-center gap-1 bg-dz-green text-white font-bold px-3 py-1 rounded-full text-sm">{row.waselli}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-dz-gray-400 text-center mt-3">{t("table_note")}</p>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Fade key={f.title} delay={i * 80}>
                <div className="card card-hover p-6 h-full">
                  <div className="w-11 h-11 bg-dz-green/10 text-dz-green rounded-lg flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-dz-gray-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-dz-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular routes ────────────────── */}
      <section className="py-20 bg-dz-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">{t("routes_title")}</h2>
            <p className="text-dz-gray-500 mt-2">{t("routes_subtitle")}</p>
          </Fade>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((r, i) => (
              <Fade key={`${r.from}-${r.to}`} delay={i * 60}>
                <Link href="/annonces"
                  className="flex items-center justify-between p-5 bg-white rounded-2xl border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-dz-green/10 text-dz-green rounded-lg flex items-center justify-center group-hover:bg-dz-green group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-dz-gray-800">{r.from} → {r.to}</span>
                  </div>
                  <span className="text-sm font-semibold text-dz-green">{r.price}</span>
                </Link>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Carriers spotlight ────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-12">
            <span className="inline-block bg-dz-green/10 text-dz-green text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              {t("carriers_badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">{t("carriers_title")}</h2>
            <p className="text-dz-gray-500 mt-3 max-w-xl mx-auto">{t("carriers_subtitle")}</p>
          </Fade>

          {/* Concrete commitments row — we're a new marketplace, so
              we refuse to ship fake "2 400+ transporteurs / 98%
              satisfaction" vanity numbers. These three signals are
              facts about the product itself, verifiable today. */}
          <Fade className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
            {[
              { value: "58", label: t("carriers_stat1_label") },
              { value: "5",   label: t("carriers_stat2_label") },
              { value: "100%", label: t("carriers_stat3_label") },
            ].map((s) => (
              <div key={s.label} className="bg-dz-gray-50 rounded-2xl p-4 text-center border border-dz-gray-100">
                <div className="text-xl font-bold text-dz-gray-800">{s.value}</div>
                <div className="text-xs text-dz-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </Fade>

          {/* Carrier cards — real data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {carriersLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-dz-gray-50 rounded-2xl border border-dz-gray-100 p-5 flex items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-dz-gray-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-dz-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-dz-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-dz-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))
              : topCarriers.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Fade key={i} delay={i * 80}>
                    <div className="bg-dz-gray-50 rounded-2xl border border-dz-gray-100 p-5 flex items-center gap-4">
                      <div className="w-14 h-14 bg-dz-green/20 text-dz-green rounded-2xl flex items-center justify-center text-lg font-black shrink-0">
                        —
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-dz-gray-400">—</span>
                        <p className="text-xs text-dz-gray-300 mt-0.5">—</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex gap-0.5">{Array.from({length:5}).map((_,si)=><svg key={si} className="w-3 h-3 fill-dz-gray-200 text-dz-gray-200" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                        </div>
                      </div>
                    </div>
                  </Fade>
                ))
              : topCarriers.map((c, i) => {
                  const avatar = (c.first_name[0] ?? "?") + (c.last_name[0] ?? "");
                  const isIntl = c.listings?.some(l => l.is_international) ?? false;
                  const rating = c.rating ?? 0;
                  const reviews = c.review_count ?? 0;
                  return (
                    <Fade key={c.id} delay={i * 80}>
                      <Link href="/livreurs"
                        className="card card-interactive p-5 flex items-center gap-4 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-dz-green to-dz-green-dark text-white rounded-full flex items-center justify-center text-base font-bold shrink-0 shadow-sm">
                          {avatar.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-dz-gray-800">{c.first_name} {c.last_name[0]}.</span>
                            {c.kyc_status === "approved" && (
                              <span className="badge badge-success">
                                ✓ {t("carriers_verified")}
                              </span>
                            )}
                            {isIntl && <span className="badge badge-brand">Intl</span>}
                          </div>
                          <p className="text-xs text-dz-gray-500 mt-0.5 truncate">{c.wilaya || "Algérie"}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: Math.min(5, Math.round(rating)) }).map((_, si) => (
                                <svg key={si} className="w-3 h-3 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              ))}
                            </div>
                            <span className="text-xs text-dz-gray-500">{rating.toFixed(1)} · {reviews} {t("carriers_reviews_s")}</span>
                          </div>
                        </div>
                      </Link>
                    </Fade>
                  );
                })
            }
          </div>

          <Fade className="text-center">
            <Link href="/livreurs" className="btn btn-primary btn-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t("carriers_cta")}
            </Link>
          </Fade>
        </div>
      </section>

      {/* ── International ─────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">{t("intl_title")}</h2>
            <p className="text-dz-gray-500 mt-2">{t("intl_subtitle")}</p>
          </Fade>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {intlRoutes.map((r, i) => (
              <Fade key={r.flag} delay={i * 60}>
                <Link href="/international"
                  className="bg-dz-gray-50 rounded-2xl border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-md transition-all duration-200 p-5 text-center block group">
                  <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-lg flex items-center justify-center mx-auto mb-3 text-xs font-bold group-hover:bg-dz-green group-hover:text-white transition-colors">{r.flag}</div>
                  <div className="font-semibold text-dz-gray-800 text-sm mb-1">{t(r.countryKey)}</div>
                  <div className="text-xs text-dz-gray-500 mb-1">{r.route}</div>
                  <div className="text-xs font-semibold text-dz-green">{r.price}</div>
                </Link>
              </Fade>
            ))}
          </div>
          <Fade className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/international" className="btn btn-primary">
              {t("intl_cta1")}
            </Link>
            <Link
              href="/international/devenir-transporteur"
              className="btn border border-dz-green text-dz-green hover:bg-dz-green/5"
            >
              {t("intl_cta2")}
            </Link>
          </Fade>
        </div>
      </section>

      {/* ── CTA ───────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Fade>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta_title")}</h2>
            <p className="text-blue-100 text-lg mb-8">{t("cta_subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/envoyer" className="btn btn-lg bg-white text-[color:var(--brand-hover)] hover:bg-blue-50">
                {t("cta_send")}
              </Link>
              <Link href="/transporter" className="btn btn-lg border border-white/30 hover:bg-white/10 text-white">
                {t("cta_transport")}
              </Link>
            </div>
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-blue-200/60 text-sm">{t("cta_soon")}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="#" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors text-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
                <a href="#" className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors text-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.24.99.19l12.81-7.4-2.83-2.83-10.97 10.04zM.23 1.46C.09 1.8.01 2.19.01 2.62v18.76c0 .43.08.82.22 1.16l.12.11 10.51-10.51v-.23L.35 1.35l-.12.11zM20.75 10.4l-2.8-1.62-3.17 3.17 3.17 3.17 2.82-1.63c.8-.46.8-1.22-.02-1.69zM4.17.24l12.81 7.4-2.83 2.83L3.18.43C3.48.05 3.87-.02 4.17.24z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </Fade>
        </div>
      </section>
    </>
  );
}
