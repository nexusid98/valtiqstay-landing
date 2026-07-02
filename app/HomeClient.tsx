"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:      "#FFFFFF",
  bgAlt:   "#F9F7F4",
  bgDark:  "#050B17",
  navy:    "#0A1931",
  text:    "#18181B",
  muted:   "#6B7280",
  border:  "#E4E4E7",
  gold:    "#D4B483",
  goldSub: "#C9A065",
  goldBg:  "rgba(212,180,131,0.10)",
};

/* ─── Copy ───────────────────────────────────────────────────────────────── */
type Lang = "it" | "en";

const copy = {
  it: {
    nav: ["Soluzione", "Come funziona", "Integrazioni"],
    demoBtn: "Prenota una demo",
    joinWaitlist: "Lista d'attesa",
    heroEyebrow: "Il check-in digitale per hotel di lusso",
    heroLine1: "Il tuo ospite",
    heroLine2: "già verificato.",
    heroLine3: "Prima dell'arrivo.",
    heroSub: "ValtiqStay ridefinisce il check-in. Identità digitale verificata una volta sola — riconosciuta in ogni hotel del network.",
    badgeLabel: "Check-in completato",
    badgeTime: "28 sec",
    stats: [
      { value: "−75%", label: "Tempo al check-in" },
      { value: "0",    label: "Documenti cartacei" },
      { value: "30s",  label: "Accoglienza media" },
    ],
    pmsTitle: "Si integra con i principali PMS",
    problemEyebrow: "Il problema",
    problemTitle: "L'ospitalità merita un check-in migliore.",
    problemCards: [
      { icon: "⏱", title: "8–12 minuti", desc: "Il tempo medio per un check-in manuale. Staff occupato, ospite frustrato." },
      { icon: "📋", title: "Documenti cartacei", desc: "Dati inseriti a mano, margine di errore alto, compliance difficile." },
      { icon: "🔗", title: "Sistemi frammentati", desc: "PMS, reception e ospite parlano lingue diverse. Zero continuità." },
    ],
    howEyebrow: "Come funziona",
    howTitle: "Semplice per l'ospite.\nPotente per l'hotel.",
    howSteps: [
      { n: "01", title: "L'ospite verifica l'identità", desc: "Upload sicuro del documento via app o link SMS. Verificato in 60 secondi." },
      { n: "02", title: "Dati arrivano all'hotel", desc: "Il PMS riceve identità verificata, consenso GDPR e preferenze prima dell'arrivo." },
      { n: "03", title: "Check-in in 30 secondi", desc: "La reception riconosce l'ospite. Nessun modulo. Benvenuto immediato." },
    ],
    featEyebrow: "La piattaforma",
    featTitle: "Tutto ciò che serve\nper un check-in perfetto.",
    features: [
      "Verifica identità con AI in 60 sec",
      "Integrazione nativa con i principali PMS",
      "Consenso GDPR automatico e tracciabile",
      "Upload documento e selfie sicuro",
      "Upsell pre-arrivo integrati",
      "Dashboard staff in tempo reale",
      "API webhook per sistemi OTA",
      "White-label per il tuo brand",
    ],
    testimonialsEyebrow: "Chi ci ha scelto",
    testimonialsTitle: "La fiducia di chi fa ospitalità ogni giorno.",
    testimonials: [
      { q: "ValtiqStay ha ridotto i nostri tempi di check-in del 75%. Gli ospiti arrivano e sono operativi in meno di un minuto.", name: "Marco Ferretti", role: "General Manager", hotel: "Hotel De La Paix, Lugano" },
      { q: "L'identità digitale verificata ha eliminato la gestione cartacea. Un cambio di paradigma per la nostra reception.", name: "Sofia Marchetti", role: "Director of Operations", hotel: "Palazzo Nobile, Venezia" },
      { q: "Il nostro staff ora si concentra sull'ospitalità vera, non sulla burocrazia. ValtiqStay è esattamente ciò che il lusso moderno richiede.", name: "Alessandro Conte", role: "Revenue Manager", hotel: "Grand Hotel Tremezzo" },
    ],
    ctaEyebrow: "Inizia ora",
    ctaTitle: "Trasforma il check-in\ndel tuo hotel.",
    ctaSub: "Demo gratuita. Nessun impegno. Attivazione in 48 ore.",
    demoTitle: "Prenota una demo",
    demoSub: "Ti contatteremo entro 24 ore per organizzare una dimostrazione personalizzata.",
    demoFields: { name: "Nome e Cognome *", hotel: "Nome dell'hotel / Struttura *", email: "Email aziendale *", phone: "Telefono (opzionale)", submit: "Invia Richiesta", sending: "Invio in corso…", success: "Richiesta inviata! Ti contatteremo entro 24 ore.", error: "Errore nell'invio. Riprova o scrivi a alisamaffei@valtiqstay.com" },
    waitlistTitle: "Accedi in anteprima",
    waitlistSub: "Entra nella lista d'attesa. Sarai tra i primi ospiti ad usare ValtiqStay.",
    waitlistEmail: "La tua email",
    waitlistSubmit: "Unisciti alla lista",
    waitlistSending: "Invio in corso…",
    waitlistSuccess: "Sei nella lista! Ti contatteremo quando saremo pronti.",
    waitlistError: "Errore nell'invio. Riprova o scrivi a alisamaffei@valtiqstay.com",
    cookieText: "Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito.",
    cookieAccept: "Accetta",
    cookieMore: "Privacy Policy",
    footerLegal: "© 2026 ValtiqStay S.r.l. — P.IVA IT12345678901",
    privacyLabel: "Privacy Policy",
    linkedinLabel: "LinkedIn",
    contactLabel: "Contatti",
  },
  en: {
    nav: ["Solution", "How it works", "Integrations"],
    demoBtn: "Book a Demo",
    joinWaitlist: "Join Waitlist",
    heroEyebrow: "Digital check-in for luxury hotels",
    heroLine1: "Your guest,",
    heroLine2: "already verified.",
    heroLine3: "Before arrival.",
    heroSub: "ValtiqStay redefines check-in. Digital identity verified once — recognised across every hotel in the network.",
    badgeLabel: "Check-in complete",
    badgeTime: "28 sec",
    stats: [
      { value: "−75%", label: "Check-in time" },
      { value: "0",    label: "Paper documents" },
      { value: "30s",  label: "Average welcome" },
    ],
    pmsTitle: "Integrates with leading PMS",
    problemEyebrow: "The problem",
    problemTitle: "Hospitality deserves a better check-in.",
    problemCards: [
      { icon: "⏱", title: "8–12 minutes", desc: "Average manual check-in time. Staff occupied, guest frustrated." },
      { icon: "📋", title: "Paper documents", desc: "Manually entered data, high error margin, difficult compliance." },
      { icon: "🔗", title: "Fragmented systems", desc: "PMS, reception and guest speak different languages. Zero continuity." },
    ],
    howEyebrow: "How it works",
    howTitle: "Simple for guests.\nPowerful for hotels.",
    howSteps: [
      { n: "01", title: "Guest verifies identity", desc: "Secure document upload via app or SMS link. Verified in 60 seconds." },
      { n: "02", title: "Data reaches the hotel", desc: "The PMS receives verified identity, GDPR consent and preferences before arrival." },
      { n: "03", title: "Check-in in 30 seconds", desc: "Reception recognises the guest. No forms. Instant welcome." },
    ],
    featEyebrow: "The platform",
    featTitle: "Everything you need\nfor a perfect check-in.",
    features: [
      "AI identity verification in 60 sec",
      "Native integration with leading PMS",
      "Automatic traceable GDPR consent",
      "Secure document and selfie upload",
      "Integrated pre-arrival upsells",
      "Real-time staff dashboard",
      "Webhook API for OTA systems",
      "White-label for your brand",
    ],
    testimonialsEyebrow: "Trusted by",
    testimonialsTitle: "The trust of those who live hospitality every day.",
    testimonials: [
      { q: "ValtiqStay reduced our check-in time by 75%. Guests arrive and are fully operational in under a minute.", name: "Marco Ferretti", role: "General Manager", hotel: "Hotel De La Paix, Lugano" },
      { q: "Verified digital identity completely eliminated paper document management. A paradigm shift for our front desk.", name: "Sofia Marchetti", role: "Director of Operations", hotel: "Palazzo Nobile, Venice" },
      { q: "Our staff now focuses on real hospitality, not bureaucracy. ValtiqStay is exactly what modern luxury requires.", name: "Alessandro Conte", role: "Revenue Manager", hotel: "Grand Hotel Tremezzo" },
    ],
    ctaEyebrow: "Get started",
    ctaTitle: "Transform your hotel's\ncheck-in experience.",
    ctaSub: "Free demo. No commitment. Live in 48 hours.",
    demoTitle: "Book a Demo",
    demoSub: "We'll contact you within 24 hours to schedule a personalized demonstration.",
    demoFields: { name: "Full Name *", hotel: "Hotel / Property Name *", email: "Business Email *", phone: "Phone (optional)", submit: "Send Request", sending: "Sending…", success: "Request sent! We'll contact you within 24 hours.", error: "Error sending. Please try again or write to alisamaffei@valtiqstay.com" },
    waitlistTitle: "Get early access",
    waitlistSub: "Join the waitlist. You'll be among the first guests to use ValtiqStay.",
    waitlistEmail: "Your email address",
    waitlistSubmit: "Join the waitlist",
    waitlistSending: "Sending…",
    waitlistSuccess: "You're on the list! We'll reach out when we're ready.",
    waitlistError: "Error sending. Try again or write to alisamaffei@valtiqstay.com",
    cookieText: "We use technical cookies to ensure the proper functioning of the site.",
    cookieAccept: "Accept",
    cookieMore: "Privacy Policy",
    footerLegal: "© 2026 ValtiqStay S.r.l. — VAT IT12345678901",
    privacyLabel: "Privacy Policy",
    linkedinLabel: "LinkedIn",
    contactLabel: "Contact",
  },
};

/* ─── Animation helpers ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
});

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Image
      src="/logo-valtiqstay.png"
      alt="ValtiqStay"
      width={140}
      height={36}
      style={{ objectFit: "contain", filter: dark ? "brightness(0) invert(1)" : "none" }}
    />
  );
}

/* ─── DemoModal ──────────────────────────────────────────────────────────── */
type T = typeof copy.it;
function DemoModal({ t, onClose }: { t: T; onClose: () => void }) {
  const [fields, setFields] = useState({ name: "", hotel: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const f = t.demoFields;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    track("form_submit", { category: "hotel", label: "demo" });
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, type: "demo" }) });
      if (!r.ok) throw new Error();
      setStatus("ok");
      track("form_success", { category: "hotel", label: "demo" });
    } catch {
      setStatus("err");
      track("form_error", { category: "hotel", label: "demo" });
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal aria-labelledby="demo-title"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        style={{ background: "#fff", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "480px", position: "relative" }}
      >
        <button onClick={onClose} aria-label="Chiudi" style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: "22px", lineHeight: 1 }}>×</button>
        <h2 id="demo-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{t.demoTitle}</h2>
        <p style={{ color: C.muted, fontSize: "14px", marginBottom: "28px" }}>{t.demoSub}</p>
        {status === "ok" ? (
          <p role="status" aria-live="polite" style={{ color: "#16A34A", fontWeight: 500 }}>{f.success}</p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { key: "name", label: f.name, type: "text", auto: "name" },
              { key: "hotel", label: f.hotel, type: "text", auto: "organization" },
              { key: "email", label: f.email, type: "email", auto: "email" },
              { key: "phone", label: f.phone, type: "tel", auto: "tel" },
            ].map(({ key, label, type, auto }) => (
              <input
                key={key}
                type={type}
                placeholder={label}
                autoComplete={auto}
                required={label.endsWith("*")}
                aria-required={label.endsWith("*")}
                value={fields[key as keyof typeof fields]}
                onChange={e => setFields(p => ({ ...p, [key]: e.target.value }))}
                style={{ padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "15px", outline: "none", color: C.text, background: C.bgAlt }}
              />
            ))}
            {status === "err" && <p role="alert" style={{ color: "#DC2626", fontSize: "13px" }}>{f.error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              style={{ padding: "14px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, color: C.navy, fontWeight: 700, border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer", letterSpacing: "0.03em" }}
            >
              {status === "sending" ? f.sending : f.submit}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── WaitlistModal ──────────────────────────────────────────────────────── */
function WaitlistModal({ t, onClose }: { t: T; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    track("form_submit", { category: "traveler", label: "waitlist" });
    try {
      const r = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, type: "waitlist" }) });
      if (!r.ok) throw new Error();
      setStatus("ok");
      track("form_success", { category: "traveler", label: "waitlist" });
    } catch {
      setStatus("err");
      track("form_error", { category: "traveler", label: "waitlist" });
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal aria-labelledby="waitlist-title"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        style={{ background: "#fff", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", position: "relative", textAlign: "center" }}
      >
        <button onClick={onClose} aria-label="Chiudi" style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: "22px", lineHeight: 1 }}>×</button>
        <h2 id="waitlist-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{t.waitlistTitle}</h2>
        <p style={{ color: C.muted, fontSize: "14px", marginBottom: "28px" }}>{t.waitlistSub}</p>
        {status === "ok" ? (
          <p role="status" aria-live="polite" style={{ color: "#16A34A", fontWeight: 500 }}>{t.waitlistSuccess}</p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              type="email" required placeholder={t.waitlistEmail} value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "15px", outline: "none", textAlign: "center" }}
            />
            {status === "err" && <p role="alert" style={{ color: "#DC2626", fontSize: "13px" }}>{t.waitlistError}</p>}
            <button type="submit" disabled={status === "sending"}
              style={{ padding: "14px", background: C.navy, color: "#fff", fontWeight: 700, border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer" }}>
              {status === "sending" ? t.waitlistSending : t.waitlistSubmit}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── CookieBanner ───────────────────────────────────────────────────────── */
function CookieBanner({ t, onAccept }: { t: T; onAccept: () => void }) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: C.navy, borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "20px", zIndex: 900, maxWidth: "600px", width: "calc(100% - 32px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
    >
      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0, flex: 1 }}>{t.cookieText} <Link href="/privacy" style={{ color: C.gold, textDecoration: "none" }}>{t.cookieMore}</Link></p>
      <button onClick={onAccept} style={{ background: C.gold, color: C.navy, border: "none", borderRadius: "8px", padding: "8px 20px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontSize: "13px" }}>{t.cookieAccept}</button>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [lang, setLang] = useState<Lang>("it");
  const [showModal, setShowModal] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const t = copy[lang];

  useEffect(() => {
    const stored = localStorage.getItem("ck");
    if (stored === "1") setCookieConsent(true);
    else setCookieConsent(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function acceptCookies() {
    localStorage.setItem("ck", "1");
    setCookieConsent(true);
  }

  const pmsLogos = [
    { src: "/pms/mews.png", alt: "Mews" },
    { src: "/pms/opera.png", alt: "Opera" },
    { src: "/pms/protel.png", alt: "Protel" },
    { src: "/pms/ericsoft.png", alt: "Ericsoft" },
    { src: "/pms/leonardo.png", alt: "Leonardo" },
    { src: "/pms/simplebooking.png", alt: "SimpleBooking" },
  ];

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'Inter',system-ui,sans-serif;color:${C.text};background:${C.bg};}
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@400;500;600;700&display=swap');
        ::selection{background:${C.goldBg};color:${C.text};}
        :focus-visible{outline:2px solid ${C.gold};outline-offset:2px;}
        input:focus{outline:2px solid ${C.gold};outline-offset:0;}
        @media(max-width:767px){.hide-mobile{display:none!important;}}
        @media(min-width:768px){.show-mobile{display:none!important;}}
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <nav style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <a href="#" style={{ textDecoration: "none", flexShrink: 0 }}>
            <Logo />
          </a>
          <div className="hide-mobile" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {t.nav.map((label, i) => (
              <a key={i} href={["#solution", "#how", "#integrations"][i]}
                style={{ fontSize: "14px", fontWeight: 500, color: C.muted, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setLang(l => l === "it" ? "en" : "it")}
              aria-label="Toggle language"
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: C.muted, letterSpacing: "0.05em" }}
            >{lang === "it" ? "EN" : "IT"}</button>
            <button
              onClick={() => { setShowWaitlist(true); track("cta_click", { category: "traveler", label: "nav" }); }}
              className="hide-mobile"
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: 500, cursor: "pointer", color: C.text, transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold; (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
            >{t.joinWaitlist}</button>
            <button
              onClick={() => { setShowModal(true); track("cta_click", { category: "hotel", label: "nav" }); }}
              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", color: C.navy, transition: "opacity 0.2s", letterSpacing: "0.02em" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >{t.demoBtn}</button>
          </div>
        </nav>
      </header>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "68px", background: C.bg, overflow: "hidden" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="hero-grid">
            <style>{`@media(max-width:900px){.hero-grid{grid-template-columns:1fr!important;gap:48px!important;}}`}</style>

            {/* Left */}
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div variants={stagger(0)} style={{ display: "inline-block", background: C.goldBg, border: `1px solid rgba(212,180,131,0.3)`, borderRadius: "100px", padding: "6px 16px", marginBottom: "28px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.heroEyebrow}</span>
              </motion.div>
              <motion.h1 variants={stagger(0.05)} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "28px" }}>
                <span style={{ display: "block", color: C.text }}>{t.heroLine1}</span>
                <span style={{ display: "block", color: C.gold }}>{t.heroLine2}</span>
                <span style={{ display: "block", color: C.text }}>{t.heroLine3}</span>
              </motion.h1>
              <motion.p variants={stagger(0.1)} style={{ fontSize: "17px", color: C.muted, lineHeight: 1.65, maxWidth: "480px", marginBottom: "40px" }}>
                {t.heroSub}
              </motion.p>
              <motion.div variants={stagger(0.15)} style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <button
                  onClick={() => { setShowModal(true); track("cta_click", { category: "hotel", label: "hero" }); }}
                  style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, color: C.navy, fontWeight: 700, border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer", letterSpacing: "0.03em", transition: "transform 0.2s, opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                >{t.demoBtn}</button>
                <button
                  onClick={() => { setShowWaitlist(true); track("cta_click", { category: "traveler", label: "hero" }); }}
                  style={{ padding: "14px 32px", background: "none", color: C.text, fontWeight: 500, border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "15px", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold; (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
                >{t.joinWaitlist}</button>
              </motion.div>
            </motion.div>

            {/* Right — hotel photo with badge */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", borderRadius: "24px", overflow: "hidden", aspectRatio: "4/5" }}
            >
              <Image
                src="/images/reception-aureum.jpg"
                alt="Hotel reception"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Overlay gradient */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(5,11,23,0.4))" }} />
              {/* Check-in badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                style={{
                  position: "absolute", bottom: "28px", left: "24px", right: "24px",
                  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
                  borderRadius: "14px", padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: C.muted, fontWeight: 500 }}>{t.badgeLabel}</div>
                  <div style={{ fontSize: "22px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: C.text, lineHeight: 1.1 }}>{t.badgeTime}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                  {[1,2,3].map(i => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.08 }}
                      style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === 1 ? "#22C55E" : i === 2 ? "#86EFAC" : "#BBF7D0" }} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAR ───────────────────────────────────────────────────── */}
        <section style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", textAlign: "center" }}
          >
            {t.stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 300, color: C.gold, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "14px", color: C.muted, marginTop: "8px", fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── PMS LOGOS ───────────────────────────────────────────────────── */}
        <section id="integrations" style={{ background: C.bg, padding: "64px 24px" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} style={{ textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "40px" }}>{t.pmsTitle}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center", justifyContent: "center" }}>
              {pmsLogos.map(({ src, alt }) => (
                <div key={alt} style={{ opacity: 0.45, transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.45")}>
                  <Image src={src} alt={alt} width={100} height={36} style={{ objectFit: "contain", filter: "grayscale(100%)" }} />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── PROBLEM ─────────────────────────────────────────────────────── */}
        <section id="solution" style={{ background: C.bgAlt, padding: "100px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.p variants={fadeUp} style={{ fontSize: "12px", fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>{t.problemEyebrow}</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: C.text, lineHeight: 1.15, maxWidth: "560px", marginBottom: "60px" }}>{t.problemTitle}</motion.h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                {t.problemCards.map((card, i) => (
                  <motion.div key={i} variants={stagger(i * 0.08)}
                    style={{ background: C.bg, borderRadius: "16px", padding: "32px", border: `1px solid ${C.border}`, transition: "box-shadow 0.25s, transform 0.25s" }}
                    whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "16px" }}>{card.icon}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600, color: C.text, marginBottom: "10px" }}>{card.title}</h3>
                    <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.6 }}>{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section id="how" style={{ background: C.bg, padding: "100px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.p variants={fadeUp} style={{ fontSize: "12px", fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>{t.howEyebrow}</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: C.text, lineHeight: 1.15, maxWidth: "560px", marginBottom: "80px", whiteSpace: "pre-line" }}>{t.howTitle}</motion.h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px" }}>
                {t.howSteps.map((step, i) => (
                  <motion.div key={i} variants={stagger(i * 0.1)} style={{ position: "relative" }}>
                    {/* Connector line */}
                    {i < t.howSteps.length - 1 && (
                      <div className="hide-mobile" style={{ position: "absolute", top: "28px", left: "calc(100% + 24px)", width: "calc(100% - 48px + 48px)", height: "1px", background: `linear-gradient(to right, ${C.border}, transparent)`, pointerEvents: "none" }} />
                    )}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "72px", fontWeight: 300, color: "rgba(212,180,131,0.2)", lineHeight: 1, marginBottom: "8px", userSelect: "none" }}>{step.n}</div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>{step.title}</h3>
                    <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.65 }}>{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES (dark) ─────────────────────────────────────────────── */}
        <section style={{ background: C.bgDark, padding: "100px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="feat-grid">
            <style>{`@media(max-width:900px){.feat-grid{grid-template-columns:1fr!important;gap:48px!important;}}`}</style>

            {/* Left text */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
              <motion.p variants={fadeUp} style={{ fontSize: "12px", fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>{t.featEyebrow}</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300, color: "#FFFFFF", lineHeight: 1.15, marginBottom: "40px", whiteSpace: "pre-line" }}>{t.featTitle}</motion.h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {t.features.map((feat, i) => (
                  <motion.div key={i} variants={stagger(i * 0.05)} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.goldBg, border: `1px solid rgba(212,180,131,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>{feat}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ borderRadius: "20px", overflow: "hidden", aspectRatio: "4/3" }}
            >
              <Image src="/images/interior-chandelier.jpg" alt="Hotel interior" fill style={{ objectFit: "cover" }} />
            </motion.div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <section style={{ background: C.bgAlt, padding: "100px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
              <motion.p variants={fadeUp} style={{ fontSize: "12px", fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>{t.testimonialsEyebrow}</motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, color: C.text, lineHeight: 1.2, marginBottom: "64px" }}>{t.testimonialsTitle}</motion.h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                {t.testimonials.map((item, i) => (
                  <motion.div key={i} variants={stagger(i * 0.1)}
                    style={{ background: C.bg, borderRadius: "16px", padding: "32px", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "20px" }}
                    whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.06)" }}
                  >
                    <div style={{ display: "flex", gap: "3px" }}>
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={C.gold}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "15px", color: C.text, lineHeight: 1.65, fontStyle: "italic", flex: 1 }}>"{item.q}"</p>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: C.muted }}>{item.role}</div>
                      <div style={{ fontSize: "13px", color: C.gold, marginTop: "2px" }}>{item.hotel}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section style={{ background: C.bg, padding: "120px 24px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} style={{ maxWidth: "640px", margin: "0 auto" }}>
            <motion.p variants={fadeUp} style={{ fontSize: "12px", fontWeight: 700, color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>{t.ctaEyebrow}</motion.p>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 300, color: C.text, lineHeight: 1.1, marginBottom: "20px", whiteSpace: "pre-line" }}>{t.ctaTitle}</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: "16px", color: C.muted, marginBottom: "40px" }}>{t.ctaSub}</motion.p>
            <motion.div variants={fadeUp} style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => { setShowModal(true); track("cta_click", { category: "hotel", label: "cta" }); }}
                style={{ padding: "16px 40px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, color: C.navy, fontWeight: 700, border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", letterSpacing: "0.03em", transition: "transform 0.2s, opacity 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "none")}
              >{t.demoBtn}</button>
              <button
                onClick={() => { setShowWaitlist(true); track("cta_click", { category: "traveler", label: "cta" }); }}
                style={{ padding: "16px 40px", background: "none", color: C.text, fontWeight: 500, border: `1.5px solid ${C.border}`, borderRadius: "10px", fontSize: "16px", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold; (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
              >{t.joinWaitlist}</button>
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ background: C.bgDark, padding: "64px 24px 40px", borderTop: "none" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "48px", marginBottom: "48px", flexWrap: "wrap", alignItems: "start" }} className="footer-grid">
              <style>{`@media(max-width:640px){.footer-grid{grid-template-columns:1fr!important;gap:32px!important;}}`}</style>
              <div>
                <Logo dark />
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "16px", lineHeight: 1.6, maxWidth: "280px" }}>The digital check-in platform for luxury hotels.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  ["Contact", "mailto:alisamaffei@valtiqstay.com"],
                  [t.privacyLabel, "/privacy"],
                  [t.linkedinLabel, "https://www.linkedin.com/company/valtiqstay"],
                ].map(([label, href]) => (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>{label}</a>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => { setShowModal(true); track("cta_click", { category: "hotel", label: "footer" }); }}
                  style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldSub})`, color: C.navy, fontWeight: 700, border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
                >{t.demoBtn}</button>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "28px" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>{t.footerLegal}</p>
            </div>
          </div>
        </footer>
      </main>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && <DemoModal t={t} onClose={() => { setShowModal(false); track("modal_close", { category: "hotel", label: "demo" }); }} />}
        {showWaitlist && <WaitlistModal t={t} onClose={() => { setShowWaitlist(false); track("modal_close", { category: "traveler", label: "waitlist" }); }} />}
      </AnimatePresence>

      {/* ── COOKIE BANNER ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cookieConsent === false && <CookieBanner t={t} onAccept={acceptCookies} />}
      </AnimatePresence>
    </>
  );
}
