"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import { EUROPEAN_COUNTRIES } from "@/lib/data";

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

function useCountUp(target: number, active: boolean, ms = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / ms, 1);
      setN(Math.floor((1 - (1 - p) ** 3) * target));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, target, ms]);
  return n;
}

/* ─── data ──────────────────────────────── */

const WORDS = ["partout en Algérie", "Alger \u2192 Oran", "Oran \u2192 Tlemcen", "Alger \u2192 Constantine"];

const steps = [
  { title: "Publiez votre annonce",   desc: "Décrivez votre colis, ajoutez une photo, indiquez le départ et l'arrivée." },
  { title: "Recevez des offres",      desc: "Les transporteurs sur votre trajet vous envoient leurs propositions." },
  { title: "Choisissez et réservez",  desc: "Comparez les offres, discutez avec le transporteur, et confirmez." },
  { title: "Livraison sécurisée",     desc: "Le paiement est libéré uniquement après confirmation de réception." },
];

const features: { title: string; desc: string; icon: React.ReactNode }[] = [
  { title: "Économique",  desc: "Jusqu'à 60 % moins cher grâce au co-transport.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { title: "Sécurisé",    desc: "Paiement séquestre, assurance incluse, profils vérifiés.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { title: "Écologique",  desc: "Optimisez l'espace libre dans les véhicules en circulation.",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { title: "Tout format", desc: "Du petit colis au meuble volumineux, aucune limite de taille.",
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
  { country: "France",    flag: "FR", route: "Alger \u2192 Paris",       price: "25 €" },
  { country: "Espagne",   flag: "ES", route: "Oran \u2192 Madrid",       price: "20 €" },
  { country: "Belgique",  flag: "BE", route: "Alger \u2192 Bruxelles",   price: "22 €" },
  { country: "Allemagne", flag: "DE", route: "Alger \u2192 Berlin",      price: "35 €" },
  { country: "Italie",    flag: "IT", route: "Constantine \u2192 Milan",  price: "18 €" },
];

/* ─── small components ──────────────────── */

function Cycle() {
  const [i, setI] = useState(0);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setOn(false);
      setTimeout(() => { setI(prev => (prev + 1) % WORDS.length); setOn(true); }, 350);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-green-300 inline-block transition-all duration-300"
      style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(-8px)" }}>
      {WORDS[i]}
    </span>
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

function Stat({ label, target, suffix, go, fixed }: { label: string; target: number; suffix: string; go: boolean; fixed?: string }) {
  const n = useCountUp(target, go);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">
        {fixed ? (go ? fixed : "\u2013") : `${n.toLocaleString("fr-DZ")}${suffix}`}
      </div>
      <div className="text-sm text-green-200/70 mt-1">{label}</div>
    </div>
  );
}

/* ─── page ──────────────────────────────── */

export default function Home() {
  const { ref: stRef, visible: stVis } = useInView(0.3);

  return (
    <>
      <style>{`
        .hero-bg{background:linear-gradient(155deg,#00a651 0%,#006233 45%,#003d20 100%)}
        .blend{background:linear-gradient(180deg,#003d20 0%,var(--dz-gray-50) 100%)}
      `}</style>

      {/* ── Hero ─────────────────────────── */}
      <section className="hero-bg relative text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-8 border border-white/15">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              Livraison collaborative en Algérie
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Envoyez vos colis<br /><Cycle />
            </h1>
            <p className="text-lg text-green-100/90 mb-10 max-w-2xl leading-relaxed">
              DZColis connecte les expéditeurs avec des transporteurs qui font déjà le trajet. Économique, écologique et sécurisé.
            </p>
            <HeroSearch />
            <p className="mt-6 text-sm text-green-200/80">
              Vous êtes transporteur ?{" "}
              <Link href="/transporter" className="text-white font-semibold underline underline-offset-2 hover:text-green-300 transition-colors">
                Proposez votre trajet et gagnez de l&apos;argent →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats (blended from hero) ────── */}
      <div className="blend">
        <div ref={stRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat label="Utilisateurs"          target={50000} suffix="+" go={stVis} />
            <Stat label="Wilayas couvertes"     target={69}    suffix=""  go={stVis} />
            <Stat label="Taux de réclamation"   target={0}     suffix=""  go={stVis} fixed="0.2 %" />
            <Stat label="D'économies en moyenne" target={60}   suffix=" %" go={stVis} />
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────── */}
      <section className="py-20 bg-dz-gray-50" id="comment-ca-marche">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Comment ça marche</h2>
            <p className="text-dz-gray-500 mt-2">En 4 étapes simples</p>
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

      {/* ── Features ─────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Pourquoi DZColis</h2>
            <p className="text-dz-gray-500 mt-2">La solution de livraison adaptée à l&apos;Algérie</p>
          </Fade>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Fade key={f.title} delay={i * 80}>
                <div className="bg-dz-gray-50 rounded-2xl p-6 border border-dz-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-11 h-11 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center mb-4">
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
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Trajets populaires</h2>
            <p className="text-dz-gray-500 mt-2">Les itinéraires les plus demandés</p>
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

      {/* ── International ─────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fade className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-dz-gray-800">Algérie ↔ Europe</h2>
            <p className="text-dz-gray-500 mt-2">Service international vers 5 pays européens</p>
          </Fade>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {intlRoutes.map((r, i) => (
              <Fade key={r.country} delay={i * 60}>
                <Link href="/international"
                  className="bg-dz-gray-50 rounded-2xl border border-dz-gray-100 hover:border-dz-green/30 hover:shadow-md transition-all duration-200 p-5 text-center block group">
                  <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-lg flex items-center justify-center mx-auto mb-3 text-xs font-bold group-hover:bg-dz-green group-hover:text-white transition-colors">{r.flag}</div>
                  <div className="font-semibold text-dz-gray-800 text-sm mb-1">{r.country}</div>
                  <div className="text-xs text-dz-gray-500 mb-1">{r.route}</div>
                  <div className="text-xs font-semibold text-dz-green">{r.price}</div>
                </Link>
              </Fade>
            ))}
          </div>
          <Fade className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/international" className="bg-dz-green hover:bg-dz-green-light text-white px-7 py-3 rounded-xl font-semibold transition-colors text-center text-sm">
              Voir les transporteurs internationaux
            </Link>
            <Link href="/international/devenir-transporteur" className="border border-dz-green text-dz-green hover:bg-dz-green/5 px-7 py-3 rounded-xl font-semibold transition-colors text-center text-sm">
              Devenir transporteur international
            </Link>
          </Fade>
        </div>
      </section>

      {/* ── CTA ───────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-dz-green via-dz-green-dark to-dz-gray-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Fade>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à envoyer votre premier colis ?
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Rejoignez des milliers d&apos;Algériens qui utilisent DZColis pour envoyer et transporter des colis à travers tout le pays.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/envoyer"
                className="bg-white text-dz-green hover:bg-green-50 px-8 py-3.5 rounded-xl font-semibold transition-colors">
                Envoyer un colis
              </Link>
              <Link href="/transporter"
                className="border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors">
                Devenir transporteur
              </Link>
            </div>

            {/* Store buttons */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-green-200/60 text-sm">Bientôt disponible sur mobile</p>
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
