"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/* ─── Copy ──────────────────────────────────────────────────────────────────
   Fix #10: Removed unused `solution` key from both locales.
   Fix #16: Removed "Demo" (was index 4, never rendered in desktop nav).
────────────────────────────────────────────────────────────────────────────── */
const copy = {
  it: {
    nav: ["Soluzione", "Come funziona", "Dashboard", "PMS"],
    heroBadge: "Trust • Identity • Connection",
    heroTitleStart: "Identità digitale verificata per",
    heroTitleHighlight: "l'ospitalità moderna.",
    heroText:
      "Riduci i tempi di check-in, verifica l'identità degli ospiti e raccogli il consenso ai dati in pochi secondi.",
    demo: "Richiedi una Demo",
    discover: "Scopri come funziona",
    problem: "Il problema",
    problemTitle:
      "Il check-in tradizionale non è più all'altezza dell'ospitalità moderna.",
    problemText:
      "Documenti raccolti manualmente, dati inseriti a mano e procedure lente riducono l'efficienza della reception e peggiorano l'esperienza ospite.",
    how: "Come funziona",
    howTitle:
      "Un flusso sicuro progettato per hotel, ospiti e strutture ricettive.",
    dashboard: "Dashboard Hotel",
    dashboardTitle: "Gestisci arrivi, identità e check-in da una vista chiara.",
    pms: "PMS Integration",
    pmsTitle:
      "Pensato per integrarsi con i sistemi già utilizzati dagli hotel.",
    finalTitle: "Porta un check-in premium nel tuo hotel.",
    finalText:
      "Una piattaforma progettata per hotel, gruppi alberghieri e strutture ricettive che vogliono digitalizzare il check-in senza complicare l'esperienza dell'ospite.",
    skipNav: "Salta al contenuto principale",
    openMenu: "Apri menu di navigazione",
    closeMenu: "Chiudi menu di navigazione",
  },
  en: {
    nav: ["Solution", "How it works", "Dashboard", "PMS"],
    heroBadge: "Trust • Identity • Connection",
    heroTitleStart: "Trusted guest identity for",
    heroTitleHighlight: "modern hospitality.",
    heroText:
      "ValtiqStay connects guests and hotels through verified digital identity, secure consent-based data sharing and frictionless check-in.",
    demo: "Request a Demo",
    discover: "See how it works",
    problem: "The problem",
    problemTitle: "Traditional check-in no longer matches modern hospitality.",
    problemText:
      "Manual document collection, repetitive data entry and slow front-desk procedures reduce efficiency and weaken the guest experience.",
    how: "How it works",
    howTitle: "A secure flow designed for hotel reception teams.",
    dashboard: "Hotel Dashboard",
    dashboardTitle:
      "Manage arrivals, identity and check-in from one clear view.",
    pms: "PMS Integration",
    pmsTitle: "Designed to integrate with systems already used by hotels.",
    finalTitle: "Bring premium digital check-in to your hotel.",
    finalText:
      "A platform designed for hotels, hospitality groups and premium properties that want to digitalize check-in without adding friction to the guest experience.",
    skipNav: "Skip to main content",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
  },
};

const pms = [
  { name: "Leonardo",       logo: "/pms/leonardo.png"      },
  { name: "Simple Booking", logo: "/pms/simplebooking.png" },
  { name: "Mews",           logo: "/pms/mews.png"          },
  { name: "Ericsoft",       logo: "/pms/ericsoft.png"      },
  { name: "Protel",         logo: "/pms/protel.png"        },
  { name: "Oracle Opera",   logo: "/pms/opera.png"         },
];

const metrics: [string, string, string][] = [
  ["-70%", "tempo medio al check-in", "average check-in time" ],
  ["1 QR", "per condividere i dati",  "to share verified data"],
  ["100%", "controllo dell'ospite",   "guest control"         ],
];

/* ─── Effect CSS ─────────────────────────────────────────────────────────────
   Fix #2:  .sr / .sr-visible CSS REMOVED. Scroll reveal is now done via JS
            inline styles (see useScrollReveal). Content is fully visible on
            SSR — no hidden content without JavaScript.
   Fix #18: Added :focus-visible styles for keyboard navigation (WCAG 2.4.7).
   Fix #13: Added .skip-link style.
────────────────────────────────────────────────────────────────────────────── */
const effectStyles = `
  /* ── Skip link (Fix #13 / WCAG 2.4.1) ───────────────── */
  .skip-link {
    position: absolute;
    top: -100px;
    left: 1rem;
    z-index: 9999;
    background: white;
    color: #172033;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    transition: top 0.2s ease;
    text-decoration: none;
  }
  .skip-link:focus { top: 1rem; outline: 2px solid #1D4ED8; outline-offset: 2px; }

  /* ── Shimmer sweep ────────────────────────────────────── */
  .shimmer { position: relative; overflow: hidden; }
  .shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      108deg,
      transparent 38%,
      rgba(255, 255, 255, 0.52) 50%,
      transparent 62%
    );
    transform: translateX(-120%);
    transition: transform 0.65s ease;
    pointer-events: none;
    z-index: 1;
  }
  .shimmer:hover::after { transform: translateX(120%); }

  /* ── Card gold glow ──────────────────────────────────── */
  .card-glow { transition: box-shadow 0.3s ease, transform 0.3s ease; }
  .card-glow:hover {
    box-shadow: 0 24px 64px rgba(201, 166, 92, 0.22),
                0 6px 20px rgba(0, 0, 0, 0.06);
  }

  /* ── Button glow — blue ──────────────────────────────── */
  .glow-btn { position: relative; z-index: 0; }
  .glow-btn::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: inherit;
    background: linear-gradient(90deg, #1D4ED8, #60A5FA, #1D4ED8);
    z-index: -1;
    opacity: 0;
    filter: blur(10px);
    transition: opacity 0.35s ease;
  }
  .glow-btn:hover::before { opacity: 0.6; }

  /* ── Button glow — gold variant ───────────────────────── */
  .glow-gold::before { background: linear-gradient(90deg, #B8944E, #E8C57A, #B8944E); }

  /* ── Step circle pulse ────────────────────────────────── */
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0    rgba(232, 197, 122, 0.55); }
    70%  { box-shadow: 0 0 0 16px rgba(232, 197, 122, 0);    }
    100% { box-shadow: 0 0 0 0    rgba(232, 197, 122, 0);    }
  }
  .pulse-ring { animation: pulse-ring 2.6s ease-out infinite; }

  /* ── PMS card hover ───────────────────────────────────── */
  .pms-card {
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .pms-card:hover {
    border-color: #C9A65C !important;
    box-shadow: 0 0 24px rgba(201, 166, 92, 0.22);
    transform: translateY(-3px);
  }

  /* ── Counter done flash ───────────────────────────────── */
  @keyframes flash-gold {
    0%   { color: #C9A65C; }
    100% { color: #172033; }
  }
  .counter-flash { animation: flash-gold 0.6s ease forwards; }

  /* ── Focus styles (Fix #18 / WCAG 2.4.7) ─────────────── */
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid #1D4ED8;
    outline-offset: 3px;
    border-radius: 3px;
  }

  /* ── Reduced motion ───────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .shimmer::after   { display: none; }
    .pulse-ring       { animation: none; }
    .glow-btn::before { display: none; }
  }
`;

/* ─── Logo ───────────────────────────────────────────────────────────────────
   Fix #5: Added `sizes` prop so Next.js generates the correct srcset width
           instead of serving a 500 px image to a 120 px slot.
────────────────────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <Image
      src="/logo-valtiqstay.png"
      alt="ValtiqStay"
      width={420}
      height={151}
      priority
      sizes="(max-width: 768px) 120px, 420px"
      className="h-auto w-[120px] md:w-[420px]"
    />
  );
}

/* ─── Icon ───────────────────────────────────────────────────────────────────
   Fix #19: Added aria-hidden="true" — icons are decorative (cards carry text).
────────────────────────────────────────────────────────────────────────────── */
function Icon({ type }: { type: "passport" | "qr" | "hotel" }) {
  if (type === "passport") {
    return (
      <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "qr") {
    return (
      <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" stroke="currentColor" strokeWidth="2" />
        <path d="M15 15h2v2h-2zM19 14h1v6h-6v-1M14 19h2" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V8l8-5 8 5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 21v-7h6v7M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Particle Canvas ────────────────────────────────────────────────────────
   Fix #8: animId initialized to 0 (was declared without assignment).
   Fix #9: IntersectionObserver pauses the rAF loop when the hero section
           leaves the viewport, reducing battery usage on mobile.
────────────────────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number = 0;            // Fix #8
    let isVisible     = true;          // Fix #9

    type Pt = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; hex: string };
    const palette = ["#C9A65C", "#E8C57A", "#93C5FD", "#DBEAFE", "#B8944E", "#C9A65C"];
    let pts: Pt[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const spawn = (): Pt => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.32,
      vy:    -(Math.random() * 0.28 + 0.06),
      r:     Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.42 + 0.08,
      hex:   palette[Math.floor(Math.random() * palette.length)],
    });

    const init = () => { pts = Array.from({ length: 60 }, spawn); };

    const draw = () => {
      if (!isVisible) { animId = 0; return; }  // Fix #9: stop loop off-screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4)           { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        if (p.x < 0)            p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.hex;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    // Fix #9: Pause / resume based on viewport visibility
    const visObs = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && animId === 0) draw(); // restart when scrolled back into view
    }, { threshold: 0 });
    visObs.observe(canvas);

    const onResize = () => { resize(); init(); };
    resize(); init(); draw();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      visObs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}

/* ─── Animated Metric ────────────────────────────────────────────────────────
   Fix #4: State is initialized with the FINAL value so SSR renders the real
           number (e.g. "-70%"), not "0". The counter resets client-side only
           once the element enters the viewport — no hydration flash.
────────────────────────────────────────────────────────────────────────────── */
function AnimatedMetric({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const m      = value.match(/^(-?)(\d+)(.*)/);
  const prefix = m?.[1] ?? "";
  const num    = parseInt(m?.[2] ?? "0", 10);
  const suffix = m?.[3] ?? "";

  const [text, setText]   = useState(`${prefix}${num}${suffix}`); // Fix #4: start at final value
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let fired = false;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || fired) return;
      fired = true;
      setText(`${prefix}0${suffix}`); // Fix #4: reset to 0 client-side before animating
      let t0 = 0;
      const dur = 1600;
      const tick = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setText(`${prefix}${Math.round(e * num)}${suffix}`);
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          setText(`${prefix}${num}${suffix}`);
          setFlash(true);
        }
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    obs.observe(el);
    return () => obs.disconnect();
  }, [num, prefix, suffix]);

  return (
    <div ref={ref} className="border-r border-[#E8E0D2] px-4 text-center last:border-r-0">
      <p
        className={`text-3xl font-semibold tabular-nums text-[#172033] ${flash ? "counter-flash" : ""}`}
        onAnimationEnd={() => setFlash(false)}
      >
        {text}
      </p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* ─── Scroll Reveal Hook ─────────────────────────────────────────────────────
   Fix #2: Complete rewrite — scroll reveal applies inline styles via JS only.
           Elements use data-reveal / data-delay attributes (not .sr CSS class).
           Elements are FULLY VISIBLE on SSR and without JavaScript.
           Only elements already off-screen when JS runs get the hiding style.
           prefers-reduced-motion: all animations are skipped.
────────────────────────────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (prefersReducedMotion) return; // content stays visible, no animation

    // Only hide elements that are currently off-screen
    els.forEach((el) => {
      const { top, bottom } = el.getBoundingClientRect();
      const offScreen = top >= window.innerHeight || bottom <= 0;
      if (offScreen) {
        const delay   = el.getAttribute("data-delay");
        const delayMs = delay ? parseInt(delay, 10) * 80 : 0;
        el.style.opacity    = "0";
        el.style.transform  = "translateY(28px)";
        el.style.transition = `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`;
      }
    });

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const el       = e.target as HTMLElement;
          el.style.opacity   = "1";
          el.style.transform = "none";
          obs.unobserve(el);
        }
      }
    }, { threshold: 0.08 });

    // Only observe the elements that were hidden
    els.forEach((el) => {
      if (el.style.opacity === "0") obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);
}

/* ─── Home ───────────────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [lang, setLang]                     = useState<"it" | "en">("it");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useScrollReveal();
  const t = copy[lang];

  // Fix #14: Sync <html lang="…"> when user switches language (WCAG 3.1.1)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const features = [
    {
      icon:  "passport" as const,
      title: lang === "it" ? "Passaporto Digitale"    : "Digital Passport",
      text:  lang === "it"
        ? "L'ospite conserva documenti e dati in un profilo digitale sicuro."
        : "Guests securely store identity data and documents in one verified profile.",
      color: "bg-blue-50 text-blue-700",
    },
    {
      icon:  "qr" as const,
      title: lang === "it" ? "QR con conferma ospite" : "Consent-Based QR",
      text:  lang === "it"
        ? "L'hotel accede ai dati solo dopo la conferma dell'ospite."
        : "Hotels access guest data only after explicit approval.",
      color: "bg-[#FFF3D8] text-[#9A742C]",
    },
    {
      icon:  "hotel" as const,
      title: lang === "it" ? "Pensato per i PMS"     : "PMS Ready",
      text:  lang === "it"
        ? "Progettato per integrarsi con i software già usati dagli hotel."
        : "Designed to integrate with existing hospitality systems.",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const steps = lang === "it"
    ? [
        "L'ospite crea il proprio profilo verificato",
        "La struttura conferma la prenotazione",
        "Il QR abilita il check-in",
        "L'ospite approva la condivisione dei dati",
      ]
    : [
        "Guest creates a verified profile",
        "Hotel confirms reservation",
        "QR unlocks check-in",
        "Guest approves data sharing",
      ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: effectStyles }} />

      {/* Fix #13: Skip navigation (WCAG 2.4.1) — visible on keyboard focus */}
      <a href="#main-content" className="skip-link">
        {t.skipNav}
      </a>

      <main id="main-content" className="min-h-screen bg-[#FAF8F4] text-[#172033]">

        {/* ════════════════ HERO ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-[#E8E0D2]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#DBEAFE_0%,transparent_35%),radial-gradient(circle_at_top_left,#F3E7C8_0%,transparent_30%)]" />
          <ParticleCanvas />

          <div className="relative mx-auto max-w-7xl px-6 py-4">

            {/* Nav */}
            <nav className="flex items-center justify-between">
              <Logo />

              <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
                <a href="#solution">{t.nav[0]}</a>
                <a href="#how">{t.nav[1]}</a>
                <a href="#dashboard">{t.nav[2]}</a>
                <a href="#pms">{t.nav[3]}</a>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLang(lang === "it" ? "en" : "it")}
                  className="rounded-full border border-[#D8C49A] bg-white px-4 py-2 text-sm font-semibold text-[#8A6B2F]"
                >
                  {lang === "it" ? "EN" : "IT"}
                </button>
                <a
                  href="#demo"
                  className="glow-btn rounded-full bg-[#172033] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                >
                  {t.demo}
                </a>
              </div>

              {/* Fix #6: aria-label + aria-expanded + aria-controls */}
              <button
                type="button"
                className="md:hidden text-3xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                ☰
              </button>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div id="mobile-menu" className="md:hidden mt-4 rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  <a href="#solution">{t.nav[0]}</a>
                  <a href="#how">{t.nav[1]}</a>
                  <a href="#dashboard">{t.nav[2]}</a>
                  <a href="#pms">{t.nav[3]}</a>
                  <button
                    type="button"
                    onClick={() => setLang(lang === "it" ? "en" : "it")}
                    className="rounded-full border border-[#D8C49A] px-4 py-2"
                  >
                    {lang === "it" ? "EN" : "IT"}
                  </button>
                  <a
                    href="#demo"
                    className="rounded-full bg-[#172033] px-5 py-3 text-center text-white"
                  >
                    {t.demo}
                  </a>
                </div>
              </div>
            )}

            {/* Hero grid — Fix #2: data-reveal replaces className="sr" */}
            <div className="grid min-h-[80vh] items-center gap-14 py-8 lg:grid-cols-2">

              {/* Left — copy */}
              <div>
                <p
                  className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#B8944E]"
                  data-reveal=""
                >
                  {t.heroBadge}
                </p>

                <h1
                  className="max-w-5xl text-5xl font-semibold leading-tight tracking-[-0.05em] md:text-7xl"
                  data-reveal="" data-delay="1"
                >
                  {t.heroTitleStart}
                  <br />
                  <span className="bg-gradient-to-r from-[#B8944E] via-[#D8C49A] to-[#B8944E] bg-clip-text text-transparent">
                    {t.heroTitleHighlight}
                  </span>
                </h1>

                <p
                  className="mt-7 max-w-2xl text-lg leading-8 text-slate-600"
                  data-reveal="" data-delay="2"
                >
                  {t.heroText}
                </p>

                <div
                  className="mt-10 flex flex-col gap-4 sm:flex-row"
                  data-reveal="" data-delay="3"
                >
                  <a
                    href="#demo"
                    className="glow-btn rounded-full bg-[#1D4ED8] px-8 py-4 text-center font-semibold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    {t.demo}
                  </a>
                  <a
                    href="#how"
                    className="rounded-full border border-[#D8C49A] bg-white px-8 py-4 text-center font-semibold text-[#172033] shadow-sm transition hover:bg-[#FFFDF8]"
                  >
                    {t.discover}
                  </a>
                </div>

                <div
                  className="mt-10 grid max-w-2xl grid-cols-3 rounded-3xl border border-[#E8E0D2] bg-white/80 p-6 shadow-sm"
                  data-reveal="" data-delay="4"
                >
                  {metrics.map(([value, itLabel, enLabel]) => (
                    <AnimatedMetric
                      key={value}
                      value={value}
                      label={lang === "it" ? itLabel : enLabel}
                    />
                  ))}
                </div>
              </div>

              {/* Right — phone mockup */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 -z-10 blur-3xl opacity-40 bg-gradient-to-r from-blue-400 via-[#C9A65C] to-blue-600" />
                  <div className="w-full max-w-sm rounded-[2.5rem] border border-[#E8E0D2] bg-white p-4 shadow-2xl shadow-slate-300/50 transition-all duration-500 hover:-translate-y-2 hover:rotate-1">
                    <div className="rounded-[2rem] bg-[#172033] p-4">
                      <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/20" />
                      <div className="rounded-[1.5rem] bg-white p-5">

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-[#172033]">ValtiqStay</div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Verified Guest
                          </span>
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
                            <Icon type="passport" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Guest Passport</p>
                            {/* Fix #7: h2 → p (was first H2 in DOM, before all section headings) */}
                            <p className="text-2xl font-semibold text-[#172033]">Marco Rossi</p>
                            <p className="mt-1 text-sm font-medium text-emerald-600">Identity Verified</p>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-3">
                          {[
                            ["Identity",    "✓ Verified"  ],
                            ["Reservation", "✓ Confirmed" ],
                            ["Consent",     "✓ Signed"    ],
                            ["Check-in",    "✓ Ready"     ],
                          ].map(([label, val]) => (
                            <div
                              key={label}
                              className="flex items-center justify-between rounded-2xl bg-[#FAF8F4] p-4"
                            >
                              <span className="text-sm text-slate-500">{label}</span>
                              <span className="text-sm font-semibold text-[#8A6B2F]">{val}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 rounded-2xl bg-[#FAF8F4] p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Hotel</p>
                          <p className="mt-1 font-semibold text-[#172033]">Grand Hotel Verona</p>
                          <div className="mt-3 border-t border-[#E8E0D2] pt-3">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Arrival</p>
                            <p className="mt-1 font-semibold text-[#172033]">12 June 2026</p>
                          </div>
                        </div>

                        {/* Fix #12: Added type="button" */}
                        <button
                          type="button"
                          className="glow-btn glow-gold mt-4 w-full rounded-2xl bg-[#C9A65C] py-4 font-semibold text-[#172033] transition hover:opacity-90"
                        >
                          Share Data
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════ PROBLEM / SOLUTION ══════════════════════════════ */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">

            <p className="font-semibold text-[#B8944E]" data-reveal="">{t.problem}</p>
            <h2
              className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl"
              data-reveal="" data-delay="1"
            >
              {t.problemTitle}
            </h2>
            <p
              className="mt-5 max-w-3xl text-lg leading-8 text-slate-600"
              data-reveal="" data-delay="2"
            >
              {t.problemText}
            </p>

            <div id="solution" className="mt-20 grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="shimmer card-glow rounded-[2rem] border border-[#ECE7DD] bg-white p-8 shadow-xl shadow-slate-200/40"
                  data-reveal="" data-delay={String(i + 1)}
                >
                  <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-3xl ${feature.color}`}>
                    <Icon type={feature.icon} />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0F2445]">{feature.title}</h3>
                  <div className="mt-5 h-1 w-10 rounded-full bg-[#C8A96A]" />
                  <p className="mt-6 leading-7 text-slate-600">{feature.text}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ═════════════════════════════════════ */}
        <section
          id="how"
          className="relative overflow-hidden bg-gradient-to-r from-[#0F2A57] via-[#13376F] to-[#0B2550] py-24 text-white"
        >
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.4fr]">
            <div>
              <p
                className="font-semibold uppercase tracking-[0.2em] text-[#E8C57A]"
                data-reveal=""
              >
                {t.how}
              </p>
              <h2
                className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-5xl"
                data-reveal="" data-delay="1"
              >
                {t.howTitle}
              </h2>
              <div className="mt-8 h-1 w-16 rounded-full bg-[#E8C57A]" data-reveal="" data-delay="2" />
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} data-reveal="" data-delay={String(index + 1)}>
                  <div
                    className="pulse-ring mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E8C57A] bg-white/5 text-2xl font-semibold text-[#E8C57A]"
                    style={{ animationDelay: `${index * 0.65}s` }}
                  >
                    0{index + 1}
                  </div>
                  <p className="text-lg font-semibold leading-7">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ DASHBOARD ════════════════════════════════════════ */}
        <section id="dashboard" className="bg-[#FAF8F4] py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">

            <div>
              <p className="font-semibold text-[#B8944E]" data-reveal="">{t.dashboard}</p>
              <h2
                className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl"
                data-reveal="" data-delay="1"
              >
                {t.dashboardTitle}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600" data-reveal="" data-delay="2">
                {lang === "it"
                  ? "Una dashboard pensata per ridurre il lavoro manuale della reception e rendere più chiara la gestione degli arrivi."
                  : "A dashboard designed to reduce manual work at reception and make arrival management clearer."}
              </p>
            </div>

            <div
              className="shimmer rounded-[2rem] border border-[#E8E0D2] bg-white p-5 shadow-2xl shadow-slate-300/40"
              data-reveal="" data-delay="1"
            >
              <div className="rounded-[1.5rem] bg-[#F8F6F1] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Hotel Dashboard</p>
                    <h3 className="text-2xl font-semibold">Guest Operations Center</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                    Live PMS Sync
                  </span>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["24", "Today's Arrivals"],
                    ["18", "Verified Guests" ],
                    ["6",  "Check-ins Ready" ],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                      <p className="text-2xl font-semibold text-[#172033]">{value}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                {[
                  ["Marco Rossi",   "Verified",           "Room 204"],
                  ["Claire Martin", "Ready For Check-in", "Room 118"],
                  ["Anna Keller",   "Verified",           "Suite 12"],
                  ["James Wilson",  "Consent Pending",    "Room 315"],
                ].map(([name, status, room]) => (
                  <div
                    key={name}
                    className="mb-3 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm text-slate-500">{room}</p>
                    </div>
                    <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-xs font-semibold text-[#8A6B2F]">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════ TRUST ════════════════════════════════════════════ */}
        <section className="bg-[#172033] py-24 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-[#C9A65C]"
              data-reveal=""
            >
              VALTIQSTAY
            </p>
            <h2
              className="text-5xl font-semibold tracking-[-0.04em]"
              data-reveal="" data-delay="1"
            >
              {lang === "it" ? "Fiducia. Identità. Connessione." : "Trust. Identity. Connection."}
            </h2>
            <p
              className="mx-auto mt-6 max-w-3xl text-lg text-slate-300"
              data-reveal="" data-delay="2"
            >
              {lang === "it"
                ? "Un livello di identità digitale affidabile progettato specificamente per l'ospitalità."
                : "A trusted digital identity layer built specifically for hospitality."}
            </p>
            <div className="mx-auto mt-12 h-px max-w-md bg-gradient-to-r from-transparent via-[#C9A65C] to-transparent" />
          </div>
        </section>

        {/* ════════════════ PMS ══════════════════════════════════════════════ */}
        <section id="pms" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="font-semibold text-[#B8944E]" data-reveal="">{t.pms}</p>
            <h2
              className="mx-auto mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.03em]"
              data-reveal="" data-delay="1"
            >
              {t.pmsTitle}
            </h2>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {/* Fix #3 + #11: raw <img> replaced with next/image (optimization + CLS) */}
              {pms.map((item, i) => (
                <div
                  key={item.name}
                  className="pms-card flex h-32 items-center justify-center rounded-2xl border border-[#E8E0D2] bg-[#FAF8F4] p-8 shadow-sm"
                  data-reveal="" data-delay={String((i % 4) + 1)}
                >
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={140}
                    height={56}
                    loading="lazy"
                    className="h-14 w-auto max-w-[120px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ DEMO CTA ═════════════════════════════════════════ */}
        <section id="demo" className="bg-[#FAF8F4] px-6 py-24">
          <div
            className="shimmer card-glow mx-auto max-w-5xl rounded-[2rem] border border-[#D8C49A] bg-white p-12 text-center shadow-2xl shadow-slate-300/40"
            data-reveal=""
          >
            <p className="font-semibold text-[#B8944E]">ValtiqStay Demo</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              {t.finalTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t.finalText}
            </p>
            {/* Fix #17: URL-encoded subject (%20 instead of raw space) */}
            <a
              href="mailto:hello@valtiqstay.com?subject=ValtiqStay%20Demo"
              className="glow-btn mt-10 inline-flex rounded-full bg-[#1D4ED8] px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              {t.demo}
            </a>
          </div>
        </section>

        {/* ════════════════ FOOTER ═══════════════════════════════════════════ */}
        <footer className="border-t border-[#E8E0D2] bg-white px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
            <Logo />
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
              <a href="mailto:hello@valtiqstay.com?subject=ValtiqStay%20Demo">Contact</a>
              <a href="#demo">Demo</a>
              <a href="#pms">PMS</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
