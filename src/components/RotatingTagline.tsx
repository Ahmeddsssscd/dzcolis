"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

/**
 * RotatingTagline
 *
 * Cycles a list of hero-grade taglines with a soft fade + lift transition.
 *
 * Senior-design notes:
 * — First paint renders the anchor tagline (stable for SSR / SEO / Core Web
 *   Vitals). Cycling only starts after mount, so nothing ever "flashes" on
 *   the way in.
 * — We reserve the height of the tallest tagline up-front via an invisible
 *   measurement pass. No layout jump when a longer phrase rotates in.
 * — Honors `prefers-reduced-motion`: if the user has it on, we don't cycle
 *   at all (just show the anchor). This is the right default — movement
 *   near an H1 can be nauseating for some users.
 * — Pauses on hover / focus-within. People want to read things that look
 *   interesting, not chase them.
 *
 * The anchor tagline is whichever key is first in `keys`. Put your
 * strongest, most-on-brand line there — that's what Google and first-time
 * visitors will see.
 */
type Props = {
  /** Translation keys to cycle through. First one is the anchor (SSR). */
  keys: TranslationKey[];
  /** Milliseconds each tagline is visible. Default 4200ms — long enough to
   *  read a full sentence without feeling stuck. */
  interval?: number;
  /** Transition duration in ms. Default 420. */
  duration?: number;
  /** Optional className passed to the outer element (apply your typography
   *  here, e.g. `text-4xl md:text-6xl font-bold tracking-[-0.03em]`). */
  className?: string;
  /** Render as… — defaults to <h1>. Use "span" when embedding inside
   *  another heading or body copy. */
  as?: "h1" | "h2" | "p" | "span";
};

export default function RotatingTagline({
  keys,
  interval = 4200,
  duration = 420,
  className = "",
  as = "h1",
}: Props) {
  const { t } = useI18n();
  const [i, setI]   = useState(0);
  const [on, setOn] = useState(true);
  const measurerRef = useRef<HTMLSpanElement>(null);
  const [minH, setMinH] = useState<number | undefined>(undefined);

  // Resolve once per render — memo keeps this cheap.
  const phrases = useMemo(() => keys.map((k) => t(k)), [keys, t]);

  // Tallest-phrase measurement. Runs when phrases change (e.g. lang switch).
  useEffect(() => {
    const node = measurerRef.current;
    if (!node) return;
    // We render every phrase into the measurer (absolutely positioned,
    // visibility hidden) and take the max height.
    const children = Array.from(node.children) as HTMLElement[];
    let tallest = 0;
    for (const c of children) {
      if (c.offsetHeight > tallest) tallest = c.offsetHeight;
    }
    if (tallest > 0) setMinH(tallest);
  }, [phrases]);

  // Cycle — but only when the tab is visible, reduced-motion is off, and
  // the element isn't being hovered.
  const pausedRef = useRef(false);
  useEffect(() => {
    if (phrases.length < 2) return;

    // Bail entirely on reduced-motion.
    const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq?.matches) return;

    const tick = () => {
      if (pausedRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      setOn(false);
      window.setTimeout(() => {
        setI((prev) => (prev + 1) % phrases.length);
        setOn(true);
      }, duration);
    };
    const id = window.setInterval(tick, interval);
    return () => window.clearInterval(id);
  }, [phrases, interval, duration]);

  // Tag chosen at runtime.
  const Tag = as;

  return (
    <Tag
      className={`rotating-tagline ${className}`}
      style={{ minHeight: minH ? `${minH}px` : undefined }}
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => { pausedRef.current = false; }}
    >
      <span
        style={{
          display: "inline-block",
          transition: `opacity ${duration}ms var(--ease-out, ease), transform ${duration}ms var(--ease-out, ease)`,
          opacity: on ? 1 : 0,
          transform: on ? "translateY(0)" : "translateY(-6px)",
          willChange: "opacity, transform",
        }}
      >
        {phrases[i]}
      </span>

      {/* Hidden measurer — all phrases stacked to find the tallest.
          Uses <span> to stay valid HTML inside an <h1>. */}
      <span
        ref={measurerRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          height: 0,
          overflow: "hidden",
          display: "block",
        }}
      >
        {phrases.map((p, idx) => (
          <span key={idx} style={{ display: "block" }}>{p}</span>
        ))}
      </span>
    </Tag>
  );
}
