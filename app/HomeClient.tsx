"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";

/* ─── Higgsfield AI images ───────────────────────────────────────────────── */
const IMG_HERO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FMPsRKDe5yM4EwRnyXp9Jls9PY/hf_20260702_132935_942ef2b1-4a79-468f-99ae-657e816af135.png";
const IMG_ROOM =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FMPsRKDe5yM4EwRnyXp9Jls9PY/hf_20260702_133051_46f5a96a-dbee-4c28-b0d7-cff46cdeaa3d.png";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:      "#FFFFFF",
  bgAlt:   "#F8F6F2",
  bgDark:  "#050B17",
  navy:    "#0A1931",
  text:    "#18181B",
  muted:   "#6B7280",
  border:  "#E4E4E7",
  gold:    "#D4B483",
  goldDim: "#C9A065",
};

type Lang = "it" | "en";

const copy = {
  it: {
    nav: ["Soluzione", "Come funziona", "Integrazioni"],
    demoBtn: "Prenota una demo",
    joinWaitlist: "Lista d'attesa",
    heroEyebrow: "Check-in digitale per hotel di lusso",
    heroLine1: "Il tuo ospite,",
    heroLine2: "già verificato.",
    heroLine3: "Prima dell'arrivo.",
    heroSub: "ValtiqStay elimina l'attesa al check-in. Identità verificata una volta — riconosciuta in tutto il network.",
    badgeLabel: "Check-in completato",
    badgeTime: "28 sec",
    statsTitle: "Il cambiamento in numeri",
    stats: [
      { value: "−75%", label: "Tempo al check-in" },
      { value: "0",    label: "Documenti cartacei" },
      { value: "30s",  label: "Accoglienza media" },
    ],
    pmsTitle: "Si integra con i principali PMS",
    problemEyebrow: "Il problema",
    problemTitle: "Il check-in manuale\ncosta tempo e ospitalità.",
    problemCards: [
      { n: "01", title: "8–12 minuti persi", desc: "Il tempo medio per un check-in cartaceo. Staff occupato, ospite frustrato fin dall'arrivo." },
      { n: "02", title: "Dati inseriti a mano", desc: "Documenti fotocopiati, dati riscritti. Margine di errore alto, compliance difficile." },
      { n: "03", title: "Sistemi disconnessi", desc: "PMS, reception e ospite parlano lingue diverse. Zero continuità sull'esperienza." },
    ],
    howEyebrow: "Come funziona",
    howTitle: "Semplice per l'ospite.\nPotente per l'hotel.",
    howSteps: [
      { n: "01", title: "L'ospite verifica l'identità", desc: "Upload sicuro del documento via link SMS o QR. Verificato in 60 secondi con AI." },
      { n: "02", title: "I dati arrivano all'hotel", desc: "Il PMS riceve identità verificata, consenso GDPR e preferenze prima dell'arrivo." },
      { n: "03", title: "Check-in in 30 secondi", desc: "La reception riconosce l'ospite. Nessun modulo. Solo benvenuto." },
    ],
    featEyebrow: "La piattaforma",
    featTitle: "Tutto quello che serve\nper un check-in perfetto.",
    features: [
      "Verifica identità con AI in 60 sec",
      "Integrazione nativa PMS",
      "Consenso GDPR automatico",
      "Upload documento e selfie sicuro",
      "Upsell pre-arrivo integrati",
      "Dashboard staff real-time",
      "Webhook API per sistemi OTA",
      "White-label per il tuo brand",
    ],
    testimonialsEyebrow: "Chi ci ha scelto",
    testimonialsTitle: "La fiducia di chi fa\nospitalità ogni giorno.",
    testimonials: [
      { q: "ValtiqStay ha ridotto i nostri tempi di check-in del 75%. Gli ospiti arrivano e sono operativi in meno di un minuto.", name: "Marco Ferretti", role: "General Manager", hotel: "Hotel De La Paix, Lugano" },
      { q: "L'identità digitale verificata ha eliminato la gestione cartacea. Un cambio di paradigma per la nostra reception.", name: "Sofia Marchetti", role: "Director of Operations", hotel: "Palazzo Nobile, Venezia" },
      { q: "Il nostro staff si concentra sull'ospitalità vera, non sulla burocrazia. ValtiqStay è ciò che il lusso moderno richiede.", name: "Alessandro Conte", role: "Revenue Manager", hotel: "Grand Hotel Tremezzo" },
    ],
    ctaTitle: "Trasforma il check-in\ndel tuo hotel.",
    ctaSub: "Demo gratuita · Nessun impegno · Attivazione in 48 ore",
    demoTitle: "Prenota una demo",
    demoSub: "Ti contatteremo entro 24 ore per organizzare una dimostrazione personalizzata.",
    demoFields: { name: "Nome e Cognome *", hotel: "Nome dell'hotel *", email: "Email aziendale *", phone: "Telefono (opzionale)", submit: "Invia Richiesta", sending: "Invio in corso…", success: "Richiesta inviata! Ti contatteremo entro 24 ore.", error: "Errore nell'invio. Riprova o scrivi a alisamaffei@valtiqstay.com" },
    waitlistTitle: "Accedi in anteprima",
    waitlistSub: "Entra nella lista d'attesa. Sarai tra i primi ospiti ad usare ValtiqStay.",
    waitlistEmail: "La tua email",
    waitlistSubmit: "Unisciti alla lista",
    waitlistSending: "Invio in corso…",
    waitlistSuccess: "Sei nella lista! Ti contatteremo quando saremo pronti.",
    waitlistError: "Errore nell'invio. Scrivi a alisamaffei@valtiqstay.com",
    cookieText: "Utilizziamo cookie tecnici per il corretto funzionamento del sito.",
    cookieAccept: "Accetta",
    footerLegal: "© 2026 ValtiqStay S.r.l. — P.IVA IT12345678901",
    privacyLabel: "Privacy Policy",
    linkedinLabel: "LinkedIn",
  },
  en: {
    nav: ["Solution", "How it works", "Integrations"],
    demoBtn: "Book a Demo",
    joinWaitlist: "Join Waitlist",
    heroEyebrow: "Digital check-in for luxury hotels",
    heroLine1: "Your guest,",
    heroLine2: "already verified.",
    heroLine3: "Before arrival.",
    heroSub: "ValtiqStay eliminates check-in queues. Identity verified once — recognised across the entire network.",
    badgeLabel: "Check-in complete",
    badgeTime: "28 sec",
    statsTitle: "The change in numbers",
    stats: [
      { value: "−75%", label: "Check-in time" },
      { value: "0",    label: "Paper documents" },
      { value: "30s",  label: "Average welcome" },
    ],
    pmsTitle: "Integrates with leading PMS",
    problemEyebrow: "The problem",
    problemTitle: "Manual check-in costs\ntime and hospitality.",
    problemCards: [
      { n: "01", title: "8–12 minutes wasted", desc: "Average time for a paper check-in. Staff occupied, guest frustrated from arrival." },
      { n: "02", title: "Manually entered data", desc: "Photocopied documents, retyped data. High error margin, difficult compliance." },
      { n: "03", title: "Disconnected systems", desc: "PMS, reception and guest speak different languages. Zero continuity in the experience." },
    ],
    howEyebrow: "How it works",
    howTitle: "Simple for guests.\nPowerful for hotels.",
    howSteps: [
      { n: "01", title: "Guest verifies identity", desc: "Secure document upload via SMS link or QR. AI-verified in 60 seconds." },
      { n: "02", title: "Data reaches the hotel", desc: "The PMS receives verified identity, GDPR consent and preferences before arrival." },
      { n: "03", title: "Check-in in 30 seconds", desc: "Reception recognises the guest. No forms. Just welcome." },
    ],
    featEyebrow: "The platform",
    featTitle: "Everything you need\nfor a perfect check-in.",
    features: [
      "AI identity verification in 60 sec",
      "Native PMS integration",
      "Automatic GDPR consent",
      "Secure document & selfie upload",
      "Integrated pre-arrival upsells",
      "Real-time staff dashboard",
      "Webhook API for OTA systems",
      "White-label for your brand",
    ],
    testimonialsEyebrow: "Trusted by",
    testimonialsTitle: "The trust of those who live\nhospitality every day.",
    testimonials: [
      { q: "ValtiqStay reduced our check-in time by 75%. Guests arrive and are fully operational in under a minute.", name: "Marco Ferretti", role: "General Manager", hotel: "Hotel De La Paix, Lugano" },
      { q: "Verified digital identity completely eliminated paper document management. A paradigm shift for our front desk.", name: "Sofia Marchetti", role: "Director of Operations", hotel: "Palazzo Nobile, Venice" },
      { q: "Our staff now focuses on real hospitality, not bureaucracy. ValtiqStay is exactly what modern luxury requires.", name: "Alessandro Conte", role: "Revenue Manager", hotel: "Grand Hotel Tremezzo" },
    ],
    ctaTitle: "Transform your hotel's\ncheck-in experience.",
    ctaSub: "Free demo · No commitment · Live in 48 hours",
    demoTitle: "Book a Demo",
    demoSub: "We'll contact you within 24 hours to schedule a personalized demonstration.",
    demoFields: { name: "Full Name *", hotel: "Hotel / Property Name *", email: "Business Email *", phone: "Phone (optional)", submit: "Send Request", sending: "Sending…", success: "Request sent! We'll contact you within 24 hours.", error: "Error sending. Write to alisamaffei@valtiqstay.com" },
    waitlistTitle: "Get early access",
    waitlistSub: "Join the waitlist. You'll be among the first guests to use ValtiqStay.",
    waitlistEmail: "Your email address",
    waitlistSubmit: "Join the waitlist",
    waitlistSending: "Sending…",
    waitlistSuccess: "You're on the list! We'll reach out when we're ready.",
    waitlistError: "Error sending. Write to alisamaffei@valtiqstay.com",
    cookieText: "We use technical cookies to ensure the proper functioning of the site.",
    cookieAccept: "Accept",
    footerLegal: "© 2026 ValtiqStay S.r.l. — VAT IT12345678901",
    privacyLabel: "Privacy Policy",
    linkedinLabel: "LinkedIn",
  },
};

/* ─── Framer variants ────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stag = (d = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, delay: d, ease: [0.22, 1, 0.36, 1] } },
});

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <Image src="/logo-valtiqstay.png" alt="ValtiqStay" width={136} height={34}
      style={{ objectFit: "contain", filter: light ? "brightness(0) invert(1)" : "none" }} />
  );
}

type T = typeof copy.it;

/* ─── DemoModal ──────────────────────────────────────────────────────────── */
function DemoModal({ t, onClose }: { t: T; onClose: () => void }) {
  const [fields, setFields] = useState({ name: "", hotel: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
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
    <div role="dialog" aria-modal aria-labelledby="demo-ttl"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(5,11,23,0.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px" }}>
      <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
        style={{ background:"#fff",borderRadius:"20px",padding:"44px",width:"100%",maxWidth:"480px",position:"relative" }}>
        <button onClick={onClose} aria-label="Chiudi"
          style={{ position:"absolute",top:"16px",right:"16px",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:"24px",lineHeight:1 }}>×</button>
        <h2 id="demo-ttl" style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:600,color:C.text,marginBottom:"8px" }}>{t.demoTitle}</h2>
        <p style={{ color:C.muted,fontSize:"14px",marginBottom:"28px" }}>{t.demoSub}</p>
        {status==="ok" ? (
          <p role="status" aria-live="polite" style={{ color:"#16A34A",fontWeight:500 }}>{f.success}</p>
        ) : (
          <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
            {[
              { key:"name",  label:f.name,  type:"text",  auto:"name"         },
              { key:"hotel", label:f.hotel, type:"text",  auto:"organization" },
              { key:"email", label:f.email, type:"email", auto:"email"        },
              { key:"phone", label:f.phone, type:"tel",   auto:"tel"          },
            ].map(({ key, label, type, auto }) => (
              <input key={key} type={type} placeholder={label} autoComplete={auto}
                required={label.endsWith("*")} aria-required={label.endsWith("*")}
                value={fields[key as keyof typeof fields]}
                onChange={e => setFields(p => ({ ...p, [key]: e.target.value }))}
                style={{ padding:"13px 16px",border:`1px solid ${C.border}`,borderRadius:"10px",fontSize:"15px",color:C.text,background:C.bgAlt,outline:"none" }}
                onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={e  => (e.currentTarget.style.borderColor = C.border)} />
            ))}
            {status==="err" && <p role="alert" style={{ color:"#DC2626",fontSize:"13px" }}>{f.error}</p>}
            <button type="submit" disabled={status==="sending"}
              style={{ padding:"14px",background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,color:C.navy,fontWeight:700,border:"none",borderRadius:"10px",fontSize:"15px",cursor:"pointer",marginTop:"4px" }}>
              {status==="sending" ? f.sending : f.submit}
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
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    track("form_submit", { category: "traveler", label: "waitlist" });
    try {
      const r = await fetch("/api/demo", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, type:"waitlist" }) });
      if (!r.ok) throw new Error();
      setStatus("ok");
      track("form_success", { category:"traveler", label:"waitlist" });
    } catch {
      setStatus("err");
      track("form_error", { category:"traveler", label:"waitlist" });
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal aria-labelledby="wl-ttl"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(5,11,23,0.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px" }}>
      <motion.div initial={{ opacity:0,scale:0.96,y:16 }} animate={{ opacity:1,scale:1,y:0 }}
        style={{ background:"#fff",borderRadius:"20px",padding:"44px",width:"100%",maxWidth:"420px",position:"relative",textAlign:"center" }}>
        <button onClick={onClose} aria-label="Chiudi"
          style={{ position:"absolute",top:"16px",right:"16px",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:"24px",lineHeight:1 }}>×</button>
        <h2 id="wl-ttl" style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:600,color:C.text,marginBottom:"8px" }}>{t.waitlistTitle}</h2>
        <p style={{ color:C.muted,fontSize:"14px",marginBottom:"28px" }}>{t.waitlistSub}</p>
        {status==="ok" ? (
          <p role="status" aria-live="polite" style={{ color:"#16A34A",fontWeight:500 }}>{t.waitlistSuccess}</p>
        ) : (
          <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
            <input type="email" required placeholder={t.waitlistEmail} value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding:"13px 16px",border:`1px solid ${C.border}`,borderRadius:"10px",fontSize:"15px",textAlign:"center",outline:"none" }}
              onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
              onBlur={e  => (e.currentTarget.style.borderColor = C.border)} />
            {status==="err" && <p role="alert" style={{ color:"#DC2626",fontSize:"13px" }}>{t.waitlistError}</p>}
            <button type="submit" disabled={status==="sending"}
              style={{ padding:"14px",background:C.navy,color:"#fff",fontWeight:700,border:"none",borderRadius:"10px",fontSize:"15px",cursor:"pointer" }}>
              {status==="sending" ? t.waitlistSending : t.waitlistSubmit}
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
    <motion.div initial={{ y:80,opacity:0 }} animate={{ y:0,opacity:1 }}
      style={{ position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",background:C.navy,borderRadius:"14px",padding:"14px 20px",display:"flex",alignItems:"center",gap:"16px",zIndex:900,maxWidth:"560px",width:"calc(100% - 32px)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)" }}>
      <p style={{ color:"rgba(255,255,255,0.65)",fontSize:"13px",margin:0,flex:1 }}>{t.cookieText} <Link href="/privacy" style={{ color:C.gold,textDecoration:"none" }}>Privacy</Link></p>
      <button onClick={onAccept} style={{ background:C.gold,color:C.navy,border:"none",borderRadius:"8px",padding:"8px 18px",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontSize:"13px" }}>{t.cookieAccept}</button>
    </motion.div>
  );
}

/* ─── PMS logos (marquee) ────────────────────────────────────────────────── */
const PMS = [
  { src:"/pms/mews.png",          alt:"Mews"          },
  { src:"/pms/opera.png",         alt:"Opera"         },
  { src:"/pms/protel.png",        alt:"Protel"        },
  { src:"/pms/ericsoft.png",      alt:"Ericsoft"      },
  { src:"/pms/leonardo.png",      alt:"Leonardo"      },
  { src:"/pms/simplebooking.png", alt:"SimpleBooking" },
];

/* ─── HomeClient ─────────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [lang, setLang]             = useState<Lang>("it");
  const [showModal, setShowModal]   = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean|null>(null);
  const [scrolled, setScrolled]     = useState(false);

  const t = copy[lang];

  useEffect(() => {
    const v = localStorage.getItem("ck");
    setCookieConsent(v === "1" ? true : false);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const acceptCookies = () => { localStorage.setItem("ck","1"); setCookieConsent(true); };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, sans-serif; color: ${C.text}; background: ${C.bg}; }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Inter:wght@400;500;600;700&display=swap');
        ::selection { background: rgba(212,180,131,0.18); }
        :focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }

        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track { display: flex; gap: 64px; animation: marquee 22s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(212,180,131,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(212,180,131,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,180,131,0); }
        }
        .pulse { animation: pulse-ring 2.4s ease-out infinite; }

        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .float { animation: float 4s ease-in-out infinite; }

        @media(max-width:767px) { .hide-mob { display: none !important; } }
        @media(min-width:768px) { .show-mob { display: none !important; } }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition:"all 0.35s ease",
      }}>
        <nav style={{ maxWidth:"1200px",margin:"0 auto",padding:"0 24px",height:"68px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"24px" }}>
          <a href="#" style={{ textDecoration:"none",flexShrink:0 }}><Logo /></a>

          <div className="hide-mob" style={{ display:"flex",gap:"32px" }}>
            {t.nav.map((lbl,i) => (
              <a key={i} href={["#solution","#how","#integrations"][i]}
                style={{ fontSize:"14px",fontWeight:500,color:C.muted,textDecoration:"none",transition:"color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.text)}
                onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>{lbl}</a>
            ))}
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
            <button onClick={()=>setLang(l=>l==="it"?"en":"it")} aria-label="Toggle language"
              style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:"8px",padding:"6px 12px",fontSize:"12px",fontWeight:700,cursor:"pointer",color:C.muted,letterSpacing:"0.05em" }}>
              {lang==="it"?"EN":"IT"}
            </button>
            <button className="hide-mob"
              onClick={()=>{ setShowWaitlist(true); track("cta_click",{category:"traveler",label:"nav"}); }}
              style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:"8px",padding:"8px 18px",fontSize:"14px",fontWeight:500,cursor:"pointer",color:C.text,transition:"all 0.2s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor=C.gold; (e.currentTarget as HTMLButtonElement).style.color=C.gold; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor=C.border; (e.currentTarget as HTMLButtonElement).style.color=C.text; }}>
              {t.joinWaitlist}
            </button>
            <button
              onClick={()=>{ setShowModal(true); track("cta_click",{category:"hotel",label:"nav"}); }}
              style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,border:"none",borderRadius:"8px",padding:"8px 20px",fontSize:"14px",fontWeight:700,cursor:"pointer",color:C.navy,transition:"opacity 0.2s,transform 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-1px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
              {t.demoBtn}
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* ── HERO — full-bleed Higgsfield image ──────────────────────── */}
        <section style={{ position:"relative",height:"100vh",minHeight:"640px",overflow:"hidden" }}>
          {/* AI-generated background */}
          <Image src={IMG_HERO} alt="Luxury hotel lobby" fill unoptimized
            style={{ objectFit:"cover",objectPosition:"center 30%" }} priority />

          {/* Gradient overlays */}
          <div style={{ position:"absolute",inset:0,
            background:"linear-gradient(to right, rgba(5,11,23,0.88) 0%, rgba(5,11,23,0.55) 55%, rgba(5,11,23,0.15) 100%)" }} />
          <div style={{ position:"absolute",inset:0,
            background:"linear-gradient(to top, rgba(5,11,23,0.6) 0%, transparent 40%)" }} />

          {/* Content */}
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",paddingTop:"68px" }}>
            <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"0 24px",width:"100%" }}>
              <motion.div initial="hidden" animate="show"
                variants={{ show:{ transition:{ staggerChildren:0.1 } } }}
                style={{ maxWidth:"620px" }}>

                <motion.div variants={stag(0)} style={{ display:"inline-flex",alignItems:"center",gap:"8px",
                  background:"rgba(212,180,131,0.15)",border:"1px solid rgba(212,180,131,0.35)",
                  borderRadius:"100px",padding:"6px 16px",marginBottom:"28px" }}>
                  <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:C.gold }} className="pulse" />
                  <span style={{ fontSize:"11px",fontWeight:600,color:C.gold,letterSpacing:"0.12em",textTransform:"uppercase" }}>
                    {t.heroEyebrow}
                  </span>
                </motion.div>

                <motion.h1 variants={stag(0.05)}
                  style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(48px,7vw,88px)",
                    fontWeight:300,lineHeight:1.04,letterSpacing:"-0.02em",marginBottom:"28px" }}>
                  <span style={{ display:"block",color:"#FFFFFF" }}>{t.heroLine1}</span>
                  <span style={{ display:"block",color:C.gold }}>{t.heroLine2}</span>
                  <span style={{ display:"block",color:"rgba(255,255,255,0.85)" }}>{t.heroLine3}</span>
                </motion.h1>

                <motion.p variants={stag(0.12)}
                  style={{ fontSize:"17px",color:"rgba(255,255,255,0.65)",lineHeight:1.65,maxWidth:"480px",marginBottom:"40px" }}>
                  {t.heroSub}
                </motion.p>

                <motion.div variants={stag(0.18)} style={{ display:"flex",gap:"14px",flexWrap:"wrap" }}>
                  <button
                    onClick={()=>{ setShowModal(true); track("cta_click",{category:"hotel",label:"hero"}); }}
                    style={{ padding:"14px 32px",background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,
                      color:C.navy,fontWeight:700,border:"none",borderRadius:"10px",fontSize:"15px",cursor:"pointer",
                      transition:"transform 0.2s,opacity 0.2s",letterSpacing:"0.02em" }}
                    onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                    onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
                    {t.demoBtn}
                  </button>
                  <button
                    onClick={()=>{ setShowWaitlist(true); track("cta_click",{category:"traveler",label:"hero"}); }}
                    style={{ padding:"14px 32px",background:"rgba(255,255,255,0.08)",
                      color:"rgba(255,255,255,0.85)",fontWeight:500,
                      border:"1px solid rgba(255,255,255,0.2)",borderRadius:"10px",fontSize:"15px",cursor:"pointer",
                      transition:"background 0.2s,border-color 0.2s",backdropFilter:"blur(4px)" }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.14)"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.35)"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.2)"; }}>
                    {t.joinWaitlist}
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Check-in badge — bottom right */}
          <div className="hide-mob" style={{ position:"absolute",bottom:"48px",right:"48px" }}>
          <motion.div
            initial={{ opacity:0,scale:0.8,y:20 }} animate={{ opacity:1,scale:1,y:0 }}
            transition={{ duration:0.5,delay:0.9 }}
            style={{ animation:"float 4s ease-in-out infinite",
              background:"rgba(255,255,255,0.92)",backdropFilter:"blur(16px)",
              borderRadius:"16px",padding:"18px 24px",display:"flex",alignItems:"center",gap:"14px",
              boxShadow:"0 12px 40px rgba(0,0,0,0.25)",border:"1px solid rgba(255,255,255,0.6)"
            }}>
            <div style={{ width:"44px",height:"44px",borderRadius:"12px",
              background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize:"11px",color:C.muted,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em" }}>{t.badgeLabel}</div>
              <div style={{ fontSize:"28px",fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:C.text,lineHeight:1.1 }}>{t.badgeTime}</div>
            </div>
          </motion.div>
          </div>

          {/* Scroll down hint */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
            style={{ position:"absolute",bottom:"32px",left:"50%",transform:"translateX(-50%)",
              display:"flex",flexDirection:"column",alignItems:"center",gap:"6px" }}>
            <div style={{ fontSize:"10px",letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)" }}>Scroll</div>
            <motion.div animate={{ y:[0,6,0] }} transition={{ repeat:Infinity,duration:1.6,ease:"easeInOut" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </motion.div>
          </motion.div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <section style={{ background:C.bgDark,padding:"72px 24px" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
            variants={{ show:{ transition:{ staggerChildren:0.1 } } }}
            style={{ maxWidth:"1200px",margin:"0 auto",display:"grid",
              gridTemplateColumns:"repeat(3,1fr)",gap:"1px",
              background:"rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden" }}>
            {t.stats.map((s,i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ padding:"48px 40px",textAlign:"center",background:C.bgDark }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(48px,6vw,72px)",
                  fontWeight:300,color:C.gold,lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:"13px",color:"rgba(255,255,255,0.45)",marginTop:"10px",
                  fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── PMS LOGOS (marquee) ──────────────────────────────────────────── */}
        <section id="integrations" style={{ background:C.bg,padding:"56px 0",overflow:"hidden",borderBottom:`1px solid ${C.border}` }}>
          <motion.p initial="hidden" whileInView="show" viewport={{ once:true }} variants={fadeUp}
            style={{ textAlign:"center",fontSize:"11px",fontWeight:700,color:C.muted,letterSpacing:"0.14em",
              textTransform:"uppercase",marginBottom:"36px",padding:"0 24px" }}>
            {t.pmsTitle}
          </motion.p>
          <div style={{ overflow:"hidden" }}>
            <div className="marquee-track">
              {[...PMS,...PMS].map(({ src,alt },i) => (
                <div key={i} style={{ flexShrink:0,opacity:0.38,transition:"opacity 0.2s" }}
                  onMouseEnter={e=>(e.currentTarget.style.opacity="0.75")}
                  onMouseLeave={e=>(e.currentTarget.style.opacity="0.38")}>
                  <Image src={src} alt={alt} width={108} height={38} style={{ objectFit:"contain",filter:"grayscale(100%)" }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
        <section id="solution" style={{ background:C.bgAlt,padding:"112px 24px" }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
              variants={{ show:{ transition:{ staggerChildren:0.1 } } }}>
              <motion.p variants={fadeUp}
                style={{ fontSize:"11px",fontWeight:700,color:C.gold,letterSpacing:"0.14em",
                  textTransform:"uppercase",marginBottom:"20px" }}>
                {t.problemEyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp}
                style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,4.5vw,58px)",
                  fontWeight:300,color:C.text,lineHeight:1.1,maxWidth:"520px",
                  marginBottom:"72px",whiteSpace:"pre-line" }}>
                {t.problemTitle}
              </motion.h2>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"2px" }}>
                {t.problemCards.map((card,i) => (
                  <motion.div key={i} variants={stag(i*0.1)}
                    whileHover={{ y:-4, boxShadow:"0 20px 60px rgba(0,0,0,0.08)" }}
                    style={{ background:C.bg,padding:"40px",borderRadius:"4px",
                      cursor:"default" }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"72px",fontWeight:300,
                      color:"rgba(212,180,131,0.18)",lineHeight:1,marginBottom:"8px",userSelect:"none" }}>
                      {card.n}
                    </div>
                    <h3 style={{ fontSize:"20px",fontWeight:700,color:C.text,marginBottom:"12px" }}>{card.title}</h3>
                    <p style={{ fontSize:"15px",color:C.muted,lineHeight:1.7 }}>{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how" style={{ background:C.bg,padding:"112px 24px" }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
              variants={{ show:{ transition:{ staggerChildren:0.1 } } }}>
              <motion.p variants={fadeUp}
                style={{ fontSize:"11px",fontWeight:700,color:C.gold,letterSpacing:"0.14em",
                  textTransform:"uppercase",marginBottom:"20px" }}>
                {t.howEyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp}
                style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,4.5vw,58px)",
                  fontWeight:300,color:C.text,lineHeight:1.1,marginBottom:"80px",whiteSpace:"pre-line" }}>
                {t.howTitle}
              </motion.h2>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"0",
                borderTop:`1px solid ${C.border}` }}>
                {t.howSteps.map((step,i) => (
                  <motion.div key={i} variants={stag(i*0.12)}
                    style={{ padding:"48px 40px 48px 0",borderBottom:`1px solid ${C.border}`,
                      paddingRight: i < t.howSteps.length-1 ? "40px" : "0",
                      borderRight: i < t.howSteps.length-1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px" }}>
                      <div style={{ width:"36px",height:"36px",borderRadius:"50%",
                        background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:"12px",fontWeight:800,color:C.navy }}>{step.n}</span>
                      </div>
                      <div style={{ height:"1px",flex:1,background:C.gold,opacity:0.3 }} />
                    </div>
                    <h3 style={{ fontSize:"19px",fontWeight:700,color:C.text,marginBottom:"12px",lineHeight:1.3 }}>{step.title}</h3>
                    <p style={{ fontSize:"15px",color:C.muted,lineHeight:1.7 }}>{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES — dark, Higgsfield hotel room image ─────────────────── */}
        <section style={{ background:C.bgDark,padding:"112px 24px" }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"center" }}
              className="feat-grid">
              <style>{`@media(max-width:900px){.feat-grid{grid-template-columns:1fr!important;gap:56px!important;}}`}</style>

              {/* Image */}
              <motion.div initial={{ opacity:0,x:-40 }} whileInView={{ opacity:1,x:0 }}
                viewport={{ once:true }} transition={{ duration:0.7,ease:[0.22,1,0.36,1] }}
                style={{ borderRadius:"20px",overflow:"hidden",aspectRatio:"4/3",position:"relative" }}>
                <Image src={IMG_ROOM} alt="Luxury hotel room" fill unoptimized
                  style={{ objectFit:"cover" }} />
                <div style={{ position:"absolute",inset:0,
                  background:"linear-gradient(to top right, rgba(5,11,23,0.4), transparent)" }} />
              </motion.div>

              {/* Features list */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
                variants={{ show:{ transition:{ staggerChildren:0.07 } } }}>
                <motion.p variants={fadeUp}
                  style={{ fontSize:"11px",fontWeight:700,color:C.gold,letterSpacing:"0.14em",
                    textTransform:"uppercase",marginBottom:"20px" }}>
                  {t.featEyebrow}
                </motion.p>
                <motion.h2 variants={fadeUp}
                  style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,3.5vw,48px)",
                    fontWeight:300,color:"#FFFFFF",lineHeight:1.15,marginBottom:"40px",whiteSpace:"pre-line" }}>
                  {t.featTitle}
                </motion.h2>
                <div style={{ display:"flex",flexDirection:"column",gap:"16px" }}>
                  {t.features.map((feat,i) => (
                    <motion.div key={i} variants={stag(i*0.05)}
                      style={{ display:"flex",alignItems:"center",gap:"14px" }}>
                      <div style={{ width:"24px",height:"24px",borderRadius:"50%",flexShrink:0,
                        border:`1px solid rgba(212,180,131,0.3)`,
                        display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke={C.gold} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span style={{ fontSize:"15px",color:"rgba(255,255,255,0.78)",fontWeight:400 }}>{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section style={{ background:C.bgAlt,padding:"112px 24px",borderTop:`1px solid ${C.border}` }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
              variants={{ show:{ transition:{ staggerChildren:0.1 } } }}>
              <motion.p variants={fadeUp}
                style={{ fontSize:"11px",fontWeight:700,color:C.gold,letterSpacing:"0.14em",
                  textTransform:"uppercase",marginBottom:"20px" }}>
                {t.testimonialsEyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp}
                style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,4vw,52px)",
                  fontWeight:300,color:C.text,lineHeight:1.15,marginBottom:"72px",whiteSpace:"pre-line" }}>
                {t.testimonialsTitle}
              </motion.h2>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"24px" }}>
                {t.testimonials.map((item,i) => (
                  <motion.div key={i} variants={stag(i*0.1)}
                    whileHover={{ y:-4,boxShadow:"0 20px 60px rgba(0,0,0,0.08)" }}
                    style={{ background:C.bg,borderRadius:"16px",padding:"36px",
                      border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:"24px",
                      transition:"box-shadow 0.25s" }}>
                    <div style={{ display:"flex",gap:"3px" }}>
                      {[...Array(5)].map((_,j)=>(
                        <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={C.gold}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <p style={{ fontSize:"15px",color:C.text,lineHeight:1.7,fontStyle:"italic",flex:1 }}>
                      &ldquo;{item.q}&rdquo;
                    </p>
                    <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:"20px" }}>
                      <div style={{ fontSize:"14px",fontWeight:700,color:C.text }}>{item.name}</div>
                      <div style={{ fontSize:"13px",color:C.muted,marginTop:"2px" }}>{item.role}</div>
                      <div style={{ fontSize:"13px",color:C.gold,marginTop:"3px",fontWeight:500 }}>{item.hotel}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section style={{ background:C.bgDark,padding:"128px 24px",textAlign:"center",position:"relative",overflow:"hidden" }}>
          {/* Glow */}
          <div aria-hidden style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"600px",height:"400px",borderRadius:"50%",
            background:"radial-gradient(ellipse, rgba(212,180,131,0.08) 0%, transparent 70%)",
            pointerEvents:"none" }} />
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true }}
            variants={{ show:{ transition:{ staggerChildren:0.1 } } }}
            style={{ maxWidth:"680px",margin:"0 auto",position:"relative",zIndex:1 }}>
            <motion.div variants={fadeUp}
              style={{ display:"inline-block",width:"40px",height:"1px",background:C.gold,marginBottom:"32px" }} />
            <motion.h2 variants={fadeUp}
              style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(40px,6vw,72px)",
                fontWeight:300,color:"#FFFFFF",lineHeight:1.06,marginBottom:"24px",whiteSpace:"pre-line" }}>
              {t.ctaTitle}
            </motion.h2>
            <motion.p variants={fadeUp}
              style={{ fontSize:"15px",color:"rgba(255,255,255,0.45)",marginBottom:"48px",
                letterSpacing:"0.04em" }}>
              {t.ctaSub}
            </motion.p>
            <motion.div variants={fadeUp}
              style={{ display:"flex",gap:"16px",flexWrap:"wrap",justifyContent:"center" }}>
              <button
                onClick={()=>{ setShowModal(true); track("cta_click",{category:"hotel",label:"cta"}); }}
                style={{ padding:"16px 44px",background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,
                  color:C.navy,fontWeight:700,border:"none",borderRadius:"10px",fontSize:"16px",
                  cursor:"pointer",letterSpacing:"0.03em",transition:"transform 0.2s,opacity 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
                {t.demoBtn}
              </button>
              <button
                onClick={()=>{ setShowWaitlist(true); track("cta_click",{category:"traveler",label:"cta"}); }}
                style={{ padding:"16px 44px",background:"rgba(255,255,255,0.06)",
                  color:"rgba(255,255,255,0.8)",fontWeight:500,
                  border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",fontSize:"16px",
                  cursor:"pointer",backdropFilter:"blur(4px)",transition:"background 0.2s,border-color 0.2s" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.28)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.15)"; }}>
                {t.joinWaitlist}
              </button>
            </motion.div>
            <motion.div variants={fadeUp}
              style={{ display:"inline-block",width:"40px",height:"1px",background:"rgba(212,180,131,0.3)",marginTop:"48px" }} />
          </motion.div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ background:C.bgDark,padding:"64px 24px 40px",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"48px",marginBottom:"56px" }}
              className="footer-grid">
              <style>{`@media(max-width:640px){.footer-grid{grid-template-columns:1fr!important;gap:32px!important;}}`}</style>
              <div>
                <Logo light />
                <p style={{ color:"rgba(255,255,255,0.35)",fontSize:"14px",marginTop:"20px",lineHeight:1.7,maxWidth:"280px" }}>
                  The digital check-in platform for luxury hotels.
                </p>
              </div>
              <div>
                <p style={{ fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"20px" }}>Platform</p>
                {[["Solution","#solution"],["How it works","#how"],["Integrations","#integrations"]].map(([lbl,href])=>(
                  <a key={lbl} href={href} style={{ display:"block",color:"rgba(255,255,255,0.4)",fontSize:"14px",textDecoration:"none",marginBottom:"12px",transition:"color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color=C.gold)}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{lbl}</a>
                ))}
              </div>
              <div>
                <p style={{ fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.2)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"20px" }}>Company</p>
                {[
                  [t.privacyLabel, "/privacy"],
                  [t.linkedinLabel, "https://www.linkedin.com/company/valtiqstay"],
                  ["Contact", "mailto:alisamaffei@valtiqstay.com"],
                ].map(([lbl,href])=>(
                  <a key={lbl} href={href}
                    target={href.startsWith("http")?"_blank":undefined}
                    rel={href.startsWith("http")?"noopener noreferrer":undefined}
                    style={{ display:"block",color:"rgba(255,255,255,0.4)",fontSize:"14px",textDecoration:"none",marginBottom:"12px",transition:"color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color=C.gold)}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{lbl}</a>
                ))}
              </div>
            </div>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"28px",
              display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px" }}>
              <p style={{ color:"rgba(255,255,255,0.18)",fontSize:"13px" }}>{t.footerLegal}</p>
              <button
                onClick={()=>{ setShowModal(true); track("cta_click",{category:"hotel",label:"footer"}); }}
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,color:C.navy,
                  fontWeight:700,border:"none",borderRadius:"8px",padding:"9px 20px",fontSize:"13px",cursor:"pointer" }}>
                {t.demoBtn}
              </button>
            </div>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {showModal    && <DemoModal     t={t} onClose={()=>{ setShowModal(false);    track("modal_close",{category:"hotel",label:"demo"}); }} />}
        {showWaitlist && <WaitlistModal t={t} onClose={()=>{ setShowWaitlist(false); track("modal_close",{category:"traveler",label:"waitlist"}); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {cookieConsent===false && <CookieBanner t={t} onAccept={acceptCookies} />}
      </AnimatePresence>
    </>
  );
}
