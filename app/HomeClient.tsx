"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ═══ PALETTE ═══════════════════════════════════════════════════════════
   Navy      #0A1931   Dominant
   Gold      #D4B483   Interactions / CTA / Highlight
   Ivory     #F5E9D3   Premium typography
   Midnight  #050B17   Depth maximum
   White     #FAF8F4   Rich white
   Stone     #E8E2D8   Borders
═══════════════════════════════════════════════════════════════════════ */

type Phase = "splash"|"exterior"|"scanning"|"opening"|"content";
type Lang  = "it"|"en";

const copy = {
  it: {
    nav:["Aureum","Soluzione","Come funziona","Ecosistema"],
    tagline:"Il futuro dell'hospitality inizia prima del check-in.",
    aureum:"AUREUM · BOUTIQUE HOTEL",
    pathWords:["Luxury","Security","Connection","Experience"],
    scanSub:"VALTIQSTAY SECURE ACCESS",
    scanLabel:"Scansiona per accedere",
    verified:"Identity Verified",
    verifiedSub:"Accesso autorizzato · Benvenuto ad Aureum",
    oneScan:"One Scan.\nEvery Stay.",
    heroTag:"AUREUM × VALTIQSTAY",
    heroSub:"The Operating System\nFor Modern Hospitality.",
    heroText:"ValtiqStay ridefinisce il check-in per hotel di lusso. Un'identità digitale verificata per ogni ospite, ogni soggiorno.",
    demoBtn:"Book a Demo",
    partnerBtn:"Partner with Valtiq",
    problemEyebrow:"Il problema",
    problemTitle:"L'ospitalità moderna merita un accesso migliore.",
    problemItems:[
      {t:"8–12 minuti",s:"check-in manuale medio"},
      {t:"Documenti cartacei",s:"dati inseriti a mano"},
      {t:"Sistemi frammentati",s:"esperienze scollegate"},
      {t:"Zero consenso",s:"nessuna identità digitale"},
    ],
    transEyebrow:"La trasformazione",
    transTitle:"Una trasformazione.\nNon un miglioramento.",
    transSub:"L'ospite arriva. L'identità è già verificata. Il check-in è immediato.",
    appEyebrow:"L'app ValtiqStay",
    appTitle:"Un profilo.\nOgni soggiorno.",
    appItems:["Identità Digitale","Prenotazione","Guest Verificato","Accesso Camera","Concierge","Profilo Ospite"],
    receptionEyebrow:"Check-in",
    receptionTitle:"Meno Attesa.\nPiù Ospitalità.",
    receptionSub:"La reception riconosce l'ospite immediatamente. Check-in completato in pochi secondi.",
    ecoEyebrow:"Ecosistema",
    ecoTitle:"Il sistema operativo\ndell'hospitality moderna.",
    ecoItems:["Identità","Pagamenti","Loyalty","Concierge","Accesso","Guest Experience"],
    ecoDescs:["Documenti verificati e consenso digitale","Pagamenti integrati pre-arrivo","Profilo ospite cross-property","Servizi prenotabili prima del check-in","Chiave digitale via QR sicuro","Personalizzazione basata sul profilo"],
    f1:"Un Ospite.",f2:"Una Identità.",f3:"Ogni Soggiorno.",
    finalSub:"VALTIQSTAY · The Operating System For Modern Hospitality",
    skip:"Salta intro",
    skipNav:"Salta al contenuto",
    openMenu:"Apri menu",
    closeMenu:"Chiudi menu",
    steps:["Ospite arriva","QR verificato","Identità confermata","Accesso immediato"],
    socialProofEyebrow:"Chi ci ha scelto",
    socialProofTitle:"La fiducia di chi fa hospitality ogni giorno.",
    testimonials:[
      {q:"ValtiqStay ha ridotto i nostri tempi di check-in del 75%. Gli ospiti arrivano e sono operativi in meno di un minuto.",name:"Marco Ferretti",role:"General Manager",hotel:"Hotel De La Paix, Lugano"},
      {q:"L'identità digitale verificata ha eliminato la gestione cartacea. Un cambio di paradigma per la nostra reception.",name:"Sofia Marchetti",role:"Director of Operations",hotel:"Palazzo Nobile, Venezia"},
      {q:"Il nostro staff ora si concentra sull'ospitalità vera, non sulla burocrazia. ValtiqStay è esattamente ciò che il lusso moderno richiede.",name:"Alessandro Conte",role:"Revenue Manager",hotel:"Grand Hotel Tremezzo"},
    ],
    pmsTitle:"Integra con i principali PMS",
    demoTitle:"Prenota una demo",
    demoSub:"Ti contatteremo entro 24 ore per organizzare una dimostrazione personalizzata.",
    demoFields:{name:"Nome e Cognome *",hotel:"Nome dell'hotel / Struttura *",email:"Email aziendale *",phone:"Telefono (opzionale)",submit:"Invia Richiesta",sending:"Invio in corso…",success:"Richiesta inviata! Ti contatteremo entro 24 ore.",error:"Errore nell'invio. Riprova o scrivi a alisamaffei@valtiqstay.com"},
    cookieText:"Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito. Nessun dato personale viene raccolto senza consenso.",
    cookieAccept:"Accetta",
    cookieMore:"Privacy Policy",
    scrollDown:"Scopri",
    footerLegal:"© 2025 ValtiqStay S.r.l. — P.IVA IT12345678901",
    privacyLabel:"Privacy Policy",
    linkedinLabel:"LinkedIn",
  },
  en: {
    nav:["Aureum","Solution","How it works","Ecosystem"],
    tagline:"The future of hospitality begins before check-in.",
    aureum:"AUREUM · BOUTIQUE HOTEL",
    pathWords:["Luxury","Security","Connection","Experience"],
    scanSub:"VALTIQSTAY SECURE ACCESS",
    scanLabel:"Scan to access",
    verified:"Identity Verified",
    verifiedSub:"Access granted · Welcome to Aureum",
    oneScan:"One Scan.\nEvery Stay.",
    heroTag:"AUREUM × VALTIQSTAY",
    heroSub:"The Operating System\nFor Modern Hospitality.",
    heroText:"ValtiqStay redefines check-in for luxury hotels. Verified digital identity for every guest, every stay.",
    demoBtn:"Book a Demo",
    partnerBtn:"Partner with Valtiq",
    problemEyebrow:"The problem",
    problemTitle:"Modern hospitality deserves better access.",
    problemItems:[
      {t:"8–12 minutes",s:"average manual check-in"},
      {t:"Paper documents",s:"manual data entry"},
      {t:"Fragmented systems",s:"disconnected experiences"},
      {t:"Zero consent",s:"no digital identity"},
    ],
    transEyebrow:"The transformation",
    transTitle:"A transformation.\nNot an improvement.",
    transSub:"The guest arrives. Identity already verified. Check-in is instant.",
    appEyebrow:"The ValtiqStay app",
    appTitle:"One profile.\nEvery stay.",
    appItems:["Digital Identity","Reservation","Verified Guest","Room Access","Concierge","Guest Profile"],
    receptionEyebrow:"Check-in",
    receptionTitle:"Less Waiting.\nMore Hospitality.",
    receptionSub:"Reception recognizes the guest immediately. Check-in completed in seconds.",
    ecoEyebrow:"Ecosystem",
    ecoTitle:"The operating system\nfor modern hospitality.",
    ecoItems:["Identity","Payments","Loyalty","Concierge","Access","Guest Experience"],
    ecoDescs:["Verified documents and digital consent","Integrated pre-arrival payments","Cross-property guest profile","Services bookable before check-in","Digital key via secure QR","Profile-based personalization"],
    f1:"One Guest.",f2:"One Identity.",f3:"Every Stay.",
    finalSub:"VALTIQSTAY · The Operating System For Modern Hospitality",
    skip:"Skip intro",
    skipNav:"Skip to content",
    openMenu:"Open menu",
    closeMenu:"Close menu",
    steps:["Guest arrives","QR verified","Identity confirmed","Instant access"],
    socialProofEyebrow:"Trusted by",
    socialProofTitle:"The trust of those who live hospitality every day.",
    testimonials:[
      {q:"ValtiqStay reduced our check-in time by 75%. Guests arrive and are fully operational in under a minute.",name:"Marco Ferretti",role:"General Manager",hotel:"Hotel De La Paix, Lugano"},
      {q:"Verified digital identity completely eliminated paper document management. A paradigm shift for our front desk.",name:"Sofia Marchetti",role:"Director of Operations",hotel:"Palazzo Nobile, Venice"},
      {q:"Our staff now focuses on real hospitality, not bureaucracy. ValtiqStay is exactly what modern luxury requires.",name:"Alessandro Conte",role:"Revenue Manager",hotel:"Grand Hotel Tremezzo"},
    ],
    pmsTitle:"Integrates with leading PMS",
    demoTitle:"Book a Demo",
    demoSub:"We'll contact you within 24 hours to schedule a personalized demonstration.",
    demoFields:{name:"Full Name *",hotel:"Hotel / Property Name *",email:"Business Email *",phone:"Phone (optional)",submit:"Send Request",sending:"Sending…",success:"Request sent! We'll contact you within 24 hours.",error:"Error sending. Please try again or write to alisamaffei@valtiqstay.com"},
    cookieText:"We use technical cookies to ensure the proper functioning of the site. No personal data is collected without consent.",
    cookieAccept:"Accept",
    cookieMore:"Privacy Policy",
    scrollDown:"Discover",
    footerLegal:"© 2025 ValtiqStay S.r.l. — VAT IT12345678901",
    privacyLabel:"Privacy Policy",
    linkedinLabel:"LinkedIn",
  },
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES=`
  /* Splash logo emerge */
  @keyframes logo-emerge {
    0%  {opacity:0;letter-spacing:0.6em;filter:blur(16px);}
    50% {opacity:1;filter:blur(0);}
    100%{opacity:1;letter-spacing:0.4em;}
  }
  .logo-emerge{animation:logo-emerge 2.4s cubic-bezier(0.22,1,0.36,1) forwards;}

  /* Tagline */
  @keyframes tl-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .tl-in{animation:tl-in 1s ease forwards;}

  /* Approach zoom */
  @keyframes approach{
    0%  {transform:scale(1) translateY(0);}
    100%{transform:scale(1.5) translateY(-5%);}
  }
  .approach{animation:approach 5s cubic-bezier(0.25,0.1,0.25,1) forwards;}

  /* Path word */
  @keyframes word-up{
    0%  {opacity:0;transform:translateY(24px) scale(0.94);}
    20% {opacity:1;transform:none;}
    80% {opacity:1;}
    100%{opacity:0;transform:translateY(-12px);}
  }

  /* QR panel */
  @keyframes panel-in{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
  .panel-in{animation:panel-in 0.7s cubic-bezier(0.22,1,0.36,1) forwards;}

  /* Laser */
  @keyframes laser{
    0%  {top:4%;opacity:0;}
    5%  {opacity:1;}
    95% {opacity:1;}
    100%{top:96%;opacity:0;}
  }

  /* Verified — NO filter:blur (causes GPU compositing glitch on mobile/Safari) */
  @keyframes v-check{
    from{opacity:0;transform:scale(0.65)translateY(10px);}
    to  {opacity:1;transform:scale(1)  translateY(0);}
  }
  .v-check{animation:v-check 0.9s cubic-bezier(0.22,1,0.36,1) both;}

  /* One Scan text */
  @keyframes onescan{from{opacity:0;letter-spacing:0.1em}to{opacity:1;letter-spacing:0.35em}}
  .onescan{animation:onescan 1.4s ease forwards;}

  /* Doors */
  .door-l{transition:transform 1.8s cubic-bezier(0.76,0,0.24,1);}
  .door-r{transition:transform 1.8s cubic-bezier(0.76,0,0.24,1);}
  .door-l.open{transform:perspective(1400px) rotateY(-82deg);}
  .door-r.open{transform:perspective(1400px) rotateY(82deg);}

  /* Intro exit */
  @keyframes intro-out{from{opacity:1}to{opacity:0;pointer-events:none}}
  .intro-out{animation:intro-out 1s ease forwards;}

  /* Reveal */
  [data-reveal]{will-change:opacity,transform;}

  /* Shimmer */
  .shim{position:relative;overflow:hidden;}
  .shim::after{
    content:'';position:absolute;inset:0;pointer-events:none;z-index:1;
    background:linear-gradient(108deg,transparent 36%,rgba(212,180,131,0.1) 50%,transparent 64%);
    transform:translateX(-130%);transition:transform 0.8s ease;
  }
  .shim:hover::after{transform:translateX(130%);}

  /* Card */
  .ch{transition:transform 0.35s ease,box-shadow 0.35s ease;}
  .ch:hover{transform:translateY(-3px);box-shadow:0 24px 60px rgba(212,180,131,0.1),0 4px 16px rgba(0,0,0,0.4);}

  /* Btn gold */
  .bg_{position:relative;z-index:0;transition:opacity 0.3s,transform 0.2s;}
  .bg_::before{
    content:'';position:absolute;inset:-6px;border-radius:inherit;z-index:-1;
    background:linear-gradient(135deg,#D4B483,#C9A065,#D4B483);
    opacity:0;filter:blur(14px);transition:opacity 0.35s;
  }
  .bg_:hover::before{opacity:0.6;}
  .bg_:hover{transform:translateY(-1px);opacity:0.92;}

  /* Btn ghost */
  .bgh{transition:background 0.3s,border-color 0.3s,color 0.3s;}
  .bgh:hover{background:rgba(212,180,131,0.08);border-color:rgba(212,180,131,0.45);color:#F5E9D3;}

  /* Step pulse */
  @keyframes sp{0%,100%{box-shadow:0 0 0 0 rgba(212,180,131,0.4)}50%{box-shadow:0 0 0 14px rgba(212,180,131,0)}}
  .sp{animation:sp 2.8s ease-out infinite;}

  /* App screen fade */
  @keyframes app-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .app-fade{animation:app-fade 0.5s ease forwards;}

  /* Blink */
  @keyframes blink{0%,100%{opacity:0.15}50%{opacity:0.85}}

  /* ── Responsive nav ───────────────────────────────── */
  @media (max-width: 767px) {
    .nav-desktop  { display: none !important; }
    .nav-ham      { display: flex !important; }
    .nav-demo-btn { display: none !important; }
    .nav-lang-btn { display: none !important; }
  }
  @media (min-width: 768px) {
    .nav-desktop  { display: flex !important; }
    .nav-ham      { display: none !important; }
    .nav-demo-btn { display: inline-flex !important; }
    .nav-lang-btn { display: block !important; }
  }

  /* ── Mobile menu slide ─────────────────────────────── */
  @keyframes mob-in  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
  @keyframes mob-out { from{opacity:1} to{opacity:0} }
  .mob-menu { animation: mob-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* ── Mobile menu link ──────────────────────────────── */
  .mob-link {
    display:block; width:100%; padding:18px 0;
    font-size:13px; letter-spacing:0.45em; text-transform:uppercase;
    color:rgba(212,180,131,0.5); text-decoration:none; text-align:center;
    border-bottom:1px solid rgba(212,180,131,0.07);
    transition:color 0.2s;
  }
  .mob-link:hover, .mob-link:active { color:#D4B483; }
  .sk{position:absolute;top:-100px;left:1rem;z-index:9999;background:#D4B483;color:#0A1931;padding:0.5rem 1rem;border-radius:6px;font-weight:700;font-size:13px;transition:top 0.2s;}
  .sk:focus{top:1rem;}

  /* Steps grid — 2 col mobile, 4 col desktop */
  .steps-grid{display:grid;gap:32px 16px;grid-template-columns:repeat(2,1fr);margin-top:64px;}
  @media(min-width:768px){.steps-grid{grid-template-columns:repeat(4,1fr);}}

  /* Scroll indicator bounce */
  @keyframes scroll-bounce{0%,100%{transform:translateY(0);opacity:0.4;}50%{transform:translateY(7px);opacity:0.85;}}
  .scroll-chev{animation:scroll-bounce 2.2s ease-in-out infinite;}

  /* Demo modal fade */
  @keyframes modal-in{from{opacity:0;transform:scale(0.97)translateY(12px)}to{opacity:1;transform:none}}
  .modal-card{animation:modal-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards;}

  /* Form field */
  .form-field{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(212,180,131,0.15);
    background:rgba(212,180,131,0.04);color:#F5E9D3;font-size:13px;outline:none;
    transition:border-color 0.2s;box-sizing:border-box;}
  .form-field::placeholder{color:rgba(245,233,211,0.25);}
  .form-field:focus{border-color:rgba(212,180,131,0.4);}

  /* Testimonial card */
  .tcard{transition:transform 0.35s ease,box-shadow 0.35s ease;}
  .tcard:hover{transform:translateY(-4px);box-shadow:0 28px 64px rgba(212,180,131,0.07),0 4px 16px rgba(0,0,0,0.4);}

  /* PMS logo */
  .pms-logo{opacity:0.6;filter:grayscale(1) brightness(4);transition:opacity 0.3s;}
  .pms-logo:hover{opacity:1;filter:grayscale(0) brightness(1);}

  /* Luxury serif headings — Cormorant Garamond */
  .hd{font-family:var(--font-cormorant,'Cormorant Garamond',Georgia,serif);font-variant-ligatures:common-ligatures;}

  /* Global button cursor */
  button{cursor:pointer;}

  /* Focus states — accessibility */
  button:focus-visible,a:focus-visible{outline:2px solid rgba(212,180,131,0.7);outline-offset:3px;border-radius:4px;}
  .form-field:focus-visible{outline:none;}

  /* Reduced motion — also stop scroll chevron */
  @media(prefers-reduced-motion:reduce){
    .shim::after,.bg_::before{display:none}
    .sp,.scroll-chev{animation:none}
  }
`;

/* ─── QR Code ─────────────────────────────────────────────────────────────── */
function QRCode({size=160}:{size?:number}){
  const N=21,S=10;
  const c:boolean[][]=Array(N).fill(null).map(()=>Array(N).fill(false));
  const f=(r:number,c2:number)=>{for(let i=0;i<7;i++)for(let j=0;j<7;j++) c[r+i][c2+j]=i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4);};
  f(0,0);f(0,14);f(14,0);
  for(let r=8;r<N;r++)for(let cc=8;cc<N;cc++){if(r>=14&&cc<7)continue;c[r][cc]=((r*11+cc*7+r*cc)%5)<2;}
  for(let r=0;r<7;r++)for(let cc=8;cc<13;cc++)c[r][cc]=(r+cc)%2===0;
  return(<svg viewBox={`0 0 ${N*S} ${N*S}`} width={size} height={size} aria-hidden="true">
    {c.map((row,r)=>row.map((on,cc)=>on?<rect key={`${r}-${cc}`} x={cc*S+1} y={r*S+1} width={S-2} height={S-2} rx={1.5} fill="#0A1931"/>:null))}
  </svg>);
}

/* ─── Logo ────────────────────────────────────────────────────────────────── */
function Logo({light=false}:{light?:boolean}){
  return(<Image src="/logo-valtiqstay.png" alt="ValtiqStay" width={420} height={151} priority
    sizes="(max-width:768px) 110px, 170px"
    className={`h-auto w-[110px] md:w-[170px] ${light?"brightness-0 invert":""}`}/>);
}

/* ─── VLogo mark — replica fedele del logo, tutto oro ────────────────────── */
function VLogo({size=72}:{size?:number}){
  return(<svg viewBox="0 0 120 105" width={size} height={size} aria-hidden="true">
    {/* Braccio sinistro */}
    <path d="M10 8 L62 82" stroke="#D4B483" strokeWidth="11" strokeLinecap="round"/>
    {/* Braccio destro */}
    <path d="M110 8 L62 82" stroke="#D4B483" strokeWidth="11" strokeLinecap="round"/>
    {/* Stella/diamante al centro */}
    <polygon points="62,80 56,90 62,100 68,90" fill="#D4B483"/>
    <polygon points="62,82 58,88 62,94 66,88" fill="#C9A052" opacity="0.6"/>
  </svg>);
}

/* ─── Photo Section — parallax background ─────────────────────────────────── */
function PhotoBg({src,overlay,children,className="",id}:{
  src:string; overlay:string; children:React.ReactNode; className?:string; id?:string
}){
  const ref=useRef<HTMLDivElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start end","end start"]});
  const y=useTransform(scrollYProgress,[0,1],["-12%","12%"]);
  return(
    <div ref={ref} id={id} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{y,position:"absolute",top:"-15%",bottom:"-15%",left:0,right:0}}>
        <Image src={src} alt="" fill
          className="object-cover object-center"
          quality={92} sizes="100vw"/>
      </motion.div>
      <div className="absolute inset-0" style={{background:overlay}}/>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─── App Mockup (Dazzle Century style — dark + gold) ─────────────────────── */
function AppMockup({screen,lang}:{screen:number;lang:Lang}){
  // 6 screens — all nav items now have content
  type Screen = {
    title:string; sub:string; badge:string; type:"standard"|"chat"|"profile";
    fields:string[]; chatMsg?:string;
  };

  const screensIT:Screen[]=[
    {
      type:"standard",
      title:"Identità Digitale",
      sub:"Marco Rossi",
      badge:"✓ Verificato",
      fields:["Passaporto IT · ●●●● 3421","Data nascita: 12/03/1988","Nazionalità: Italiana"],
    },
    {
      type:"standard",
      title:"Prenotazione",
      sub:"Aureum · Suite 401",
      badge:"Confermata",
      fields:["Check-in: 15 Giu · 15:00","Check-out: 18 Giu · 12:00","Camera: Junior Suite"],
    },
    {
      type:"standard",
      title:"Guest Verificato",
      sub:"Stato accesso",
      badge:"Pronto al check-in",
      fields:["Identità verificata","Consenso firmato","QR attivo"],
    },
    {
      type:"standard",
      title:"Accesso Camera",
      sub:"Suite 401 · Piano 4°",
      badge:"Autorizzato",
      fields:["Chiave digitale attiva","Scade: 18 Giu 12:00","Tocca per aprire"],
    },
    // CONCIERGE — pre-arrival chat
    {
      type:"chat",
      title:"Concierge",
      sub:"Pre-arrival Services",
      badge:"Online",
      chatMsg:"Buongiorno Marco! Come possiamo rendere perfetto il tuo soggiorno?",
      fields:["🍽  Tavolo prenotato: Ven 20:00","🧖  Spa: Sab 10:00","🚗  Transfer aeroporto: confermato"],
    },
    // PROFILO OSPITE — doc + contacts + card
    {
      type:"profile",
      title:"Profilo Ospite",
      sub:"Marco Rossi",
      badge:"Profilo Completo",
      fields:[
        "🪪  Passaporto IT · ●●●● 3421",
        "✉   marco.rossi@email.com",
        "📱  +39 344 ●●●● 821",
        "💳  Visa ●●●● ●●●● ●●●● 4521",
      ],
    },
  ];

  const screensEN:Screen[]=[
    {
      type:"standard",
      title:"Digital Identity",
      sub:"Marco Rossi",
      badge:"✓ Verified",
      fields:["Passport IT · ●●●● 3421","Date of birth: 12/03/1988","Nationality: Italian"],
    },
    {
      type:"standard",
      title:"Reservation",
      sub:"Aureum · Suite 401",
      badge:"Confirmed",
      fields:["Check-in: 15 Jun · 15:00","Check-out: 18 Jun · 12:00","Room: Junior Suite"],
    },
    {
      type:"standard",
      title:"Verified Guest",
      sub:"Access status",
      badge:"Ready for check-in",
      fields:["Identity verified","Consent signed","QR active"],
    },
    {
      type:"standard",
      title:"Room Access",
      sub:"Suite 401 · 4th Floor",
      badge:"Authorized",
      fields:["Digital key active","Expires: 18 Jun 12:00","Tap to open"],
    },
    {
      type:"chat",
      title:"Concierge",
      sub:"Pre-arrival Services",
      badge:"Online",
      chatMsg:"Good morning Marco! How can we make your stay perfect?",
      fields:["🍽  Table reserved: Fri 8:00 PM","🧖  Spa: Sat 10:00 AM","🚗  Airport transfer: confirmed"],
    },
    {
      type:"profile",
      title:"Guest Profile",
      sub:"Marco Rossi",
      badge:"Complete Profile",
      fields:[
        "🪪  Passport IT · ●●●● 3421",
        "✉   marco.rossi@email.com",
        "📱  +39 344 ●●●● 821",
        "💳  Visa ●●●● ●●●● ●●●● 4521",
      ],
    },
  ];

  const screens = lang==="it" ? screensIT : screensEN;
  const s=screens[screen%screens.length];

  return(
    <div className="mx-auto" style={{width:"240px",position:"relative"}}>
      <div style={{
        borderRadius:"38px",padding:"12px",
        background:"linear-gradient(145deg,#1C1810,#0E0C08)",
        boxShadow:"0 40px 80px rgba(5,11,23,0.8),0 0 0 1px rgba(212,180,131,0.12),inset 0 1px 0 rgba(255,255,255,0.05)",
        position:"relative",
      }}>
        {/* Notch */}
        <div style={{position:"absolute",top:"16px",left:"50%",transform:"translateX(-50%)",
          width:"80px",height:"24px",borderRadius:"16px",background:"#050505",zIndex:10}}/>

        {/* Screen */}
        <div key={screen} className="app-fade" style={{
          borderRadius:"26px",overflow:"hidden",background:"#080808",
          aspectRatio:"9/19.5",position:"relative",display:"flex",flexDirection:"column"
        }}>
          {/* Status bar */}
          <div style={{padding:"14px 18px 4px",display:"flex",justifyContent:"space-between",
            fontSize:"10px",color:"rgba(212,180,131,0.3)"}}>
            <span>9:41</span><span>●●●</span>
          </div>

          {/* Header */}
          <div style={{padding:"8px 18px 14px",borderBottom:"1px solid rgba(212,180,131,0.07)"}}>
            <div style={{fontSize:"8px",letterSpacing:"0.5em",color:"rgba(212,180,131,0.4)",
              textTransform:"uppercase",marginBottom:"4px"}}>VALTIQSTAY</div>
            <div style={{fontSize:"19px",fontWeight:600,color:"#F5E9D3",lineHeight:1.2}}>
              {s.title}
            </div>
          </div>

          {/* CHAT screen (Concierge) */}
          {s.type==="chat" && (
            <>
              {/* Hotel message bubble */}
              <div style={{margin:"12px 14px 6px",padding:"10px 12px",borderRadius:"12px 12px 12px 4px",
                background:"rgba(212,180,131,0.08)",border:"1px solid rgba(212,180,131,0.12)"}}>
                <div style={{fontSize:"8px",color:"rgba(212,180,131,0.4)",marginBottom:"4px",letterSpacing:"0.05em"}}>AUREUM · CONCIERGE</div>
                <div style={{fontSize:"11px",color:"rgba(245,233,211,0.7)",lineHeight:1.5}}>{s.chatMsg}</div>
              </div>
              {/* Guest reply bubble */}
              <div style={{margin:"0 14px 10px",padding:"8px 12px",borderRadius:"12px 12px 4px 12px",
                background:"linear-gradient(135deg,#D4B483,#B8943E)",alignSelf:"flex-end"}}>
                <div style={{fontSize:"10px",color:"#0A1931",fontWeight:500}}>
                  {lang==="it" ? "Ho già qualche richiesta 😊" : "I have some requests 😊"}
                </div>
              </div>
              {/* Pre-booked services */}
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.35em",color:"rgba(212,180,131,0.35)",
                  textTransform:"uppercase",marginBottom:"4px"}}>
                  {lang==="it" ? "SERVIZI PRE-ARRIVO" : "PRE-ARRIVAL SERVICES"}
                </div>
                {s.fields.map((f,i)=>(
                  <div key={i} style={{padding:"8px 10px",borderRadius:"9px",
                    background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)",
                    fontSize:"10px",color:"rgba(245,233,211,0.78)"}}>
                    {f}
                  </div>
                ))}
              </div>
              {/* Input bar */}
              <div style={{margin:"8px 14px",padding:"8px 12px",borderRadius:"20px",
                background:"rgba(212,180,131,0.05)",border:"1px solid rgba(212,180,131,0.1)",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"10px",color:"rgba(212,180,131,0.25)"}}>
                  {lang==="it" ? "Scrivi un messaggio…" : "Write a message…"}
                </span>
                <span style={{fontSize:"14px",color:"rgba(212,180,131,0.4)"}}>↑</span>
              </div>
            </>
          )}

          {/* PROFILE screen */}
          {s.type==="profile" && (
            <>
              {/* Gold identity card */}
              <div style={{margin:"10px 14px",borderRadius:"12px",
                background:"linear-gradient(135deg,#D4B483,#B8943E)",padding:"12px 14px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.4em",textTransform:"uppercase",
                  color:"rgba(10,25,49,0.5)",marginBottom:"4px"}}>GUEST · VERIFIED</div>
                <div style={{fontSize:"15px",fontWeight:700,color:"#0A1931"}}>{s.sub}</div>
                <div style={{fontSize:"9px",color:"rgba(10,25,49,0.5)",marginTop:"2px"}}>
                  {lang==="it" ? "Ospite ValtiqStay · Platinum" : "ValtiqStay Guest · Platinum"}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",marginTop:"8px",
                  background:"rgba(10,25,49,0.15)",borderRadius:"20px",padding:"2px 8px",
                  fontSize:"9px",fontWeight:600,color:"#0A1931"}}>
                  ✓ {s.badge}
                </div>
              </div>
              {/* Profile fields */}
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                {s.fields.map((f,i)=>{
                  const labelsIT=["Documento","Email","Telefono","Pagamento"];
                  const labelsEN=["Document","Email","Phone","Payment"];
                  const labels = lang==="it" ? labelsIT : labelsEN;
                  return(
                    <div key={i} style={{padding:"8px 10px",borderRadius:"9px",
                      background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)"}}>
                      <div style={{fontSize:"8px",letterSpacing:"0.3em",textTransform:"uppercase",
                        color:"rgba(212,180,131,0.3)",marginBottom:"2px"}}>{labels[i]}</div>
                      <div style={{fontSize:"10px",color:"rgba(245,233,211,0.6)",fontFamily:"monospace"}}>{f}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* STANDARD screen */}
          {s.type==="standard" && (
            <>
              {/* Gold card */}
              <div style={{margin:"12px 14px",borderRadius:"12px",
                background:"linear-gradient(135deg,#D4B483,#B8943E,#D4B483)",padding:"12px 14px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.35em",textTransform:"uppercase",
                  color:"rgba(10,25,49,0.5)",marginBottom:"3px"}}>AUREUM</div>
                <div style={{fontSize:"15px",fontWeight:700,color:"#0A1931"}}>{s.sub}</div>
                <div style={{display:"inline-flex",alignItems:"center",marginTop:"7px",
                  background:"rgba(10,25,49,0.15)",borderRadius:"20px",padding:"2px 9px",
                  fontSize:"9px",fontWeight:600,color:"#0A1931"}}>
                  {s.badge}
                </div>
              </div>
              {/* Fields */}
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                {s.fields.map((f,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"8px 10px",borderRadius:"9px",
                    background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)"}}>
                    <span style={{fontSize:"10px",color:"rgba(245,233,211,0.5)"}}>{f}</span>
                    <span style={{fontSize:"10px",color:"rgba(212,180,131,0.4)"}}>→</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Home bar */}
          <div style={{height:"24px",display:"flex",alignItems:"center",justifyContent:"center",marginTop:"4px"}}>
            <div style={{width:"80px",height:"3px",borderRadius:"2px",background:"rgba(212,180,131,0.12)"}}/>
          </div>
        </div>

        {/* Side buttons */}
        <div style={{position:"absolute",right:"-3px",top:"68px",width:"3px",height:"28px",borderRadius:"2px",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{position:"absolute",left:"-3px",top:"58px",width:"3px",height:"22px",borderRadius:"2px",background:"rgba(255,255,255,0.06)"}}/>
        <div style={{position:"absolute",left:"-3px",top:"88px",width:"3px",height:"22px",borderRadius:"2px",background:"rgba(255,255,255,0.06)"}}/>
      </div>
    </div>
  );
}

/* ─── Hotel Doors Overlay ─────────────────────────────────────────────────── */
function HotelDoors({open}:{open:boolean}){
  return(
    <>
      {/* Left door */}
      <div className={`door-l ${open?"open":""}`} style={{
        position:"absolute",left:0,top:0,width:"50%",height:"100%",zIndex:20,
        background:"linear-gradient(to right,rgba(5,11,23,0.98),rgba(10,25,49,0.95))",
        transformOrigin:"left center",
        display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",
      }}>
        {/* Door detail: gold vertical line */}
        <div style={{width:"2px",height:"40%",background:"linear-gradient(to bottom,transparent,rgba(212,180,131,0.5),rgba(212,180,131,0.7),rgba(212,180,131,0.5),transparent)"}}/>
      </div>
      {/* Right door */}
      <div className={`door-r ${open?"open":""}`} style={{
        position:"absolute",right:0,top:0,width:"50%",height:"100%",zIndex:20,
        background:"linear-gradient(to left,rgba(5,11,23,0.98),rgba(10,25,49,0.95))",
        transformOrigin:"right center",
        display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"16px",
      }}>
        <div style={{width:"2px",height:"40%",background:"linear-gradient(to bottom,transparent,rgba(212,180,131,0.5),rgba(212,180,131,0.7),rgba(212,180,131,0.5),transparent)"}}/>
      </div>
      {/* Center seam */}
      {!open && (
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"2px",zIndex:21,
          background:"linear-gradient(to bottom,transparent 5%,rgba(212,180,131,0.6) 30%,rgba(245,233,211,0.8) 50%,rgba(212,180,131,0.6) 70%,transparent 95%)"
        }}/>
      )}
    </>
  );
}

/* ─── Scroll Reveal ───────────────────────────────────────────────────────── */
function useReveal(){
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;
    const els=document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach(el=>{
      const{top,bottom}=el.getBoundingClientRect();
      if(top>=window.innerHeight||bottom<=0){
        const d=el.getAttribute("data-delay");
        const ms=d?parseInt(d)*80:0;
        el.style.opacity="0";el.style.transform="translateY(32px)";
        el.style.transition=`opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${ms}ms,transform 0.85s cubic-bezier(0.22,1,0.36,1) ${ms}ms`;
      }
    });
    const obs=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting){
        const el=e.target as HTMLElement;
        el.style.opacity="1";el.style.transform="none";
        obs.unobserve(el);
      }
    },{threshold:0.08});
    els.forEach(el=>{if(el.style.opacity==="0")obs.observe(el);});
    return()=>obs.disconnect();
  },[]);
}


/* ─── Lenis Smooth Scroll ─────────────────────────────────────────────────── */
function useLenisScroll(){
  useEffect(()=>{
    let raf:number;
    let lenisInstance:{raf:(t:number)=>void;destroy:()=>void}|null=null;
    import("@studio-freight/lenis").then(mod=>{
      const Lenis=mod.default as new(o:{duration:number;easing:(t:number)=>number;smoothWheel:boolean})=>{raf:(t:number)=>void;destroy:()=>void};
      lenisInstance=new Lenis({
        duration:1.4,
        easing:(t:number)=>Math.min(1,1.001-Math.pow(2,-10*t)),
        smoothWheel:true,
      });
      function tick(time:number){lenisInstance!.raf(time);raf=requestAnimationFrame(tick);}
      raf=requestAnimationFrame(tick);
    });
    return()=>{if(raf)cancelAnimationFrame(raf);if(lenisInstance)lenisInstance.destroy();};
  },[]);
}

/* ─── Gold Divider ────────────────────────────────────────────────────────── */
function GoldDivider(){
  return(
    <div style={{position:"relative",height:"1px",background:"rgba(212,180,131,0.05)",overflow:"hidden"}}>
      <motion.div
        style={{position:"absolute",inset:0,
          background:"linear-gradient(90deg,transparent,#D4B483,transparent)"}}
        initial={{x:"-100%"}}
        whileInView={{x:"100%"}}
        viewport={{once:true}}
        transition={{duration:1.5,ease:"easeInOut"}}
      />
    </div>
  );
}

/* ─── Logo Marquee ─────────────────────────────────────────────────────────── */
function LogoMarquee(){
  const logos=["mews","opera","protel","ericsoft","simplebooking","leonardo"];
  return(
    <div style={{overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"100px",zIndex:2,
        background:"linear-gradient(to right,#050B17,transparent)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"100px",zIndex:2,
        background:"linear-gradient(to left,#050B17,transparent)",pointerEvents:"none"}}/>
      <motion.div
        style={{display:"flex",gap:"72px",alignItems:"center",width:"max-content"}}
        animate={{x:["0%","-50%"]}}
        transition={{duration:24,repeat:Infinity,ease:"linear"}}
      >
        {[...logos,...logos].map((name,i)=>(
          <Image key={i} src={`/pms/${name}.png`} alt={name} width={96} height={32}
            className="pms-logo"
            style={{height:"28px",width:"auto",objectFit:"contain",flexShrink:0}}/>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Cookie Banner ───────────────────────────────────────────────────────── */
function CookieBanner({t,onAccept}:{t:typeof copy["it"];onAccept:()=>void}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,
      background:"rgba(5,11,23,0.97)",backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(212,180,131,0.1)",
      padding:"16px 24px",display:"flex",flexWrap:"wrap",
      alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
      <p style={{fontSize:"12px",color:"rgba(245,233,211,0.72)",maxWidth:"640px",lineHeight:1.6,margin:0}}>
        {t.cookieText}
      </p>
      <div style={{display:"flex",gap:"12px",alignItems:"center",flexShrink:0}}>
        <Link href="/privacy" style={{fontSize:"11px",letterSpacing:"0.15em",
          color:"rgba(212,180,131,0.45)",textDecoration:"underline",textUnderlineOffset:"3px"}}>
          {t.cookieMore}
        </Link>
        <button type="button" onClick={onAccept} className="bg_" style={{
          borderRadius:"100px",padding:"10px 24px",
          background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
          fontSize:"11px",fontWeight:600,letterSpacing:"0.25em",textTransform:"uppercase",
          color:"#0A1931",cursor:"pointer",border:"none",whiteSpace:"nowrap"}}>
          {t.cookieAccept}
        </button>
      </div>
    </div>
  );
}

/* ─── Demo Modal ──────────────────────────────────────────────────────────── */
function DemoModal({t,onClose}:{t:typeof copy["it"];onClose:()=>void}){
  const [name,setName]=useState("");
  const [hotel,setHotel]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");

  const handleSubmit=useCallback(async(e:React.FormEvent)=>{
    e.preventDefault();
    setStatus("sending");
    try{
      const res=await fetch("/api/demo",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,hotel,email,phone}),
      });
      setStatus(res.ok?"success":"error");
      if(res.ok)setTimeout(onClose,3200);
    }catch{
      setStatus("error");
    }
  },[name,hotel,email,phone,onClose]);

  return(
    <div role="dialog" aria-modal="true" style={{position:"fixed",inset:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(5,11,23,0.96)",backdropFilter:"blur(24px)"}}>
      <div className="modal-card" style={{
        background:"#0A1931",border:"1px solid rgba(212,180,131,0.15)",
        borderRadius:"24px",padding:"48px 40px",
        maxWidth:"480px",width:"calc(100% - 48px)",position:"relative",
        boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}}>
        {/* Close */}
        <button type="button" onClick={onClose} aria-label="Close"
          style={{position:"absolute",top:"20px",right:"20px",
            width:"36px",height:"36px",borderRadius:"50%",
            border:"1px solid rgba(212,180,131,0.15)",background:"transparent",
            color:"rgba(212,180,131,0.5)",cursor:"pointer",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        {/* Header */}
        <div style={{marginBottom:"8px",fontSize:"9px",letterSpacing:"0.5em",
          textTransform:"uppercase",color:"rgba(212,180,131,0.5)"}}>VALTIQSTAY</div>
        <h2 className="hd" style={{fontSize:"26px",fontWeight:300,color:"#F5E9D3",letterSpacing:"-0.02em",marginBottom:"10px"}}>
          {t.demoTitle}
        </h2>
        <p style={{fontSize:"13px",color:"rgba(245,233,211,0.4)",lineHeight:1.6,marginBottom:"32px"}}>
          {t.demoSub}
        </p>

        {status==="success"?(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:"36px",color:"#D4B483",marginBottom:"12px"}}>✓</div>
            <p style={{fontSize:"14px",color:"rgba(245,233,211,0.6)",lineHeight:1.7}}>{t.demoFields.success}</p>
          </div>
        ):(
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <input className="form-field" placeholder={t.demoFields.name}
              value={name} onChange={e=>setName(e.target.value)} required/>
            <input className="form-field" placeholder={t.demoFields.hotel}
              value={hotel} onChange={e=>setHotel(e.target.value)} required/>
            <input className="form-field" type="email" placeholder={t.demoFields.email}
              value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="form-field" placeholder={t.demoFields.phone}
              value={phone} onChange={e=>setPhone(e.target.value)}/>
            {status==="error"&&(
              <p style={{fontSize:"12px",color:"rgba(220,80,80,0.8)",margin:0}}>{t.demoFields.error}</p>
            )}
            <button type="submit" disabled={status==="sending"} className="bg_" style={{
              marginTop:"8px",borderRadius:"100px",padding:"14px",
              background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
              fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",
              color:"#0A1931",cursor:status==="sending"?"wait":"pointer",border:"none",
              opacity:status==="sending"?0.7:1}}>
              {status==="sending"?t.demoFields.sending:t.demoFields.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME CLIENT
═══════════════════════════════════════════════════════════════════════════ */
export default function HomeClient(){
  const [lang,setLang]=useState<Lang>("it");
  const [phase,setPhase]=useState<Phase>("splash");
  const [open,setOpen]=useState(false);
  const [exit,setExit]=useState(false);
  const [mob,setMob]=useState(false);
  const [laser,setLaser]=useState(0);
  const [appS,setAppS]=useState(0);
  const [showModal,setShowModal]=useState(false);
  const [cookieConsent,setCookieConsent]=useState<boolean|null>(null);
  useReveal();
  useLenisScroll();
  const t=copy[lang];

  /* Floating nav — hide on scroll down, reveal on scroll up */
  const [navVisible,setNavVisible]=useState(true);
  const lastScrollY=useRef(0);
  useEffect(()=>{
    const onScroll=()=>{
      const y=window.scrollY;
      setNavVisible(y<80||y<lastScrollY.current);
      lastScrollY.current=y;
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);

  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  useEffect(()=>{setLaser(k=>k+1);},[]);

  useEffect(()=>{
    try{
      const v=localStorage.getItem("valtiq-cookie");
      setCookieConsent(v==="1");
    }catch{setCookieConsent(false);}
  },[]);

  const acceptCookies=useCallback(()=>{
    try{localStorage.setItem("valtiq-cookie","1");}catch{}
    setCookieConsent(true);
  },[]);

  useEffect(()=>{
    if(phase!=="content")return;
    const id=setInterval(()=>setAppS(s=>(s+1)%6),2600);
    return()=>clearInterval(id);
  },[phase]);

  useEffect(()=>{
    const T:ReturnType<typeof setTimeout>[]=[];
    T.push(setTimeout(()=>setPhase("exterior"),   2200));  // splash → exterior
    T.push(setTimeout(()=>setPhase("scanning"),   4800));  // exterior → QR scan
    T.push(setTimeout(()=>{setPhase("opening");setOpen(true);}, 6800)); // QR → doors open
    T.push(setTimeout(()=>setExit(true),          7600)); // fade out
    T.push(setTimeout(()=>setPhase("content"),    8400)); // product page
    return()=>T.forEach(clearTimeout);
  },[]);

  const skip=useCallback(()=>{setExit(true);setTimeout(()=>setPhase("content"),700);},[]);

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <a href="#main" className="sk">{t.skipNav}</a>

      {/* ══════════════ CINEMATIC INTRO ════════════════════════════════════ */}
      {phase!=="content"&&(
        <div className={`fixed inset-0 z-50 ${exit?"intro-out":""}`}>

          {/* Skip */}
          {phase!=="splash"&&(
            <button type="button" onClick={skip} style={{
              position:"absolute",top:"24px",right:"24px",zIndex:60,
              fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",
              color:"rgba(212,180,131,0.5)",fontWeight:500,cursor:"pointer"
            }}>{t.skip} →</button>
          )}

          {/* SPLASH — logo reale grande su nero */}
          {phase==="splash"&&(
            <div style={{position:"absolute",inset:0,background:"#050B17",display:"flex",
              flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {/* Glow oro centrato */}
              <div style={{position:"absolute",inset:0,
                background:"radial-gradient(ellipse 50% 40% at 50% 50%,rgba(212,180,131,0.06),transparent 70%)"}}/>
              {/* Logo PNG originale — su sfondo nero i bracci oro + stella + Stay sono perfetti */}
              <div className="logo-emerge" style={{textAlign:"center"}}>
                <Image
                  src="/logo-valtiqstay.png"
                  alt="ValtiqStay"
                  width={420} height={300}
                  priority
                  style={{width:"clamp(220px,30vw,380px)",height:"auto"}}
                />
              </div>
              {/* Tagline */}
              <div className="tl-in" style={{animationDelay:"1.6s",opacity:0,textAlign:"center",marginTop:"16px"}}>
                <div style={{height:"1px",width:"60px",margin:"0 auto 14px",
                  background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.4),transparent)"}}/>
                <div style={{fontSize:"10px",letterSpacing:"0.3em",
                  color:"rgba(212,180,131,0.35)",textTransform:"uppercase"}}>{t.tagline}</div>
              </div>
            </div>
          )}

          {/* EXTERIOR — video hotel approach, solo il video */}
          {phase==="exterior"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              <video
                autoPlay muted playsInline
                style={{position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",objectPosition:"center"}}
                poster="/images/aureum-doors.jpg"
              >
                <source src="/videos/aureum-approach.mp4" type="video/mp4"/>
              </video>
              {/* Overlay quasi assente — il video parla da solo */}
              <div style={{position:"absolute",inset:0,zIndex:1,
                background:"linear-gradient(to bottom,rgba(5,11,23,0.08),rgba(5,11,23,0.04) 70%,rgba(5,11,23,0.15))"
              }}/>
            </div>
          )}

          {/* SCANNING — ultimo frame del video (porte) congelato + QR panel */}
          {phase==="scanning"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              {/* Ultimo frame del video — porte in primo piano, effetto freeze */}
              <Image src="/images/aureum-doors.jpg" alt="" fill
                className="object-cover object-center" quality={92} sizes="100vw" priority/>
              {/* Overlay scuro ma non opaco — si vedono le porte */}
              <div style={{position:"absolute",inset:0,
                background:"rgba(5,11,23,0.55)",zIndex:1}}/>
              {/* QR panel centrato */}
              <div style={{position:"absolute",inset:0,
                display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                <div className="panel-in">
                  <div style={{
                    padding:"28px 32px",borderRadius:"20px",textAlign:"center",
                    background:"rgba(250,248,244,0.92)",
                    border:"1.5px solid rgba(212,180,131,0.45)",
                    backdropFilter:"blur(24px)",
                    boxShadow:"0 32px 80px rgba(5,11,23,0.35)"
                  }}>
                    {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],
                      ["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([p,b],i)=>(
                      <div key={i} className={`absolute ${p} w-5 h-5 ${b}`} style={{borderColor:"#D4B483"}}/>
                    ))}
                    <div style={{fontSize:"9px",letterSpacing:"0.55em",color:"rgba(10,25,49,0.4)",
                      textTransform:"uppercase",marginBottom:"20px"}}>{t.scanSub}</div>
                    <div style={{position:"relative",display:"inline-block",padding:"12px",
                      borderRadius:"12px",background:"rgba(10,25,49,0.04)",
                      border:"1px solid rgba(212,180,131,0.15)"}}>
                      <QRCode size={152}/>
                      <div key={laser} style={{
                        position:"absolute",left:"12px",right:"12px",height:"2px",top:"12px",
                        background:"linear-gradient(90deg,transparent,#D4B483,#FFF0C8,#D4B483,transparent)",
                        boxShadow:"0 0 12px #D4B483,0 0 24px rgba(212,180,131,0.4)",
                        animation:"laser 1.1s ease-in-out 3"
                      }}/>
                    </div>
                    <div style={{fontSize:"12px",color:"rgba(10,25,49,0.45)",
                      letterSpacing:"0.1em",marginTop:"16px"}}>{t.scanLabel}</div>
                    <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"12px"}}>
                      {[0,1,2].map(i=>(<div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",
                        background:"#D4B483",animation:`blink 1.3s ease ${i*.2}s infinite`}}/>))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPENING — porte si aprono su sfondo navy, transizione diretta alla pagina */}
          {phase==="opening"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              {/* Sfondo navy puro — nessuna immagine, transizione fluida alla pagina prodotto */}
              <div style={{position:"absolute",inset:0,
                background:"linear-gradient(135deg,#050B17 0%,#0A1931 50%,#050B17 100%)"}}/>
              {/* Glow centrale oro quando le porte si aprono */}
              <div style={{position:"absolute",inset:0,
                background:"radial-gradient(ellipse 40% 50% at 50% 50%,rgba(212,180,131,0.06),transparent 70%)",
                opacity:open?1:0,transition:"opacity 1s ease"}}/>
              {/* CSS doors swing open */}
              <HotelDoors open={open}/>
            </div>
          )}

        </div>
      )}

      {/* ══════════════ MAIN CONTENT ════════════════════════════════════════ */}
      <main id="main" style={{background:"#0A1931"}} className="text-[#F5E9D3] min-h-screen">

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <motion.nav
          animate={{y:navVisible?0:-80,opacity:navVisible?1:0}}
          transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
          style={{
            position:"fixed",top:0,left:0,right:0,zIndex:40,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"16px 24px",
            background:"rgba(10,25,49,0.96)",
            backdropFilter:"blur(14px)",
            borderBottom:"1px solid rgba(212,180,131,0.08)"
          }}>
          {/* Logo */}
          <Logo light/>

          {/* Desktop links */}
          <div className="nav-desktop" style={{gap:"28px",alignItems:"center"}}>
            {t.nav.map((item,i)=>(
              <a key={i} href={["#aureum","#solution","#how","#eco"][i]}
                 style={{fontSize:"11px",letterSpacing:"0.32em",textTransform:"uppercase",
                   color:"rgba(212,180,131,0.45)",textDecoration:"none",transition:"color 0.2s"}}
                 onMouseEnter={e=>(e.currentTarget.style.color="#D4B483")}
                 onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.45)")}>
                {item}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
            {/* Lang toggle — desktop only */}
            <button type="button" className="nav-lang-btn bgh"
              onClick={()=>setLang(lang==="it"?"en":"it")}
              style={{fontSize:"10px",letterSpacing:"0.35em",textTransform:"uppercase",
                border:"1px solid rgba(212,180,131,0.18)",borderRadius:"100px",padding:"8px 16px",
                color:"rgba(212,180,131,0.45)",cursor:"pointer",background:"transparent"}}>
              {lang==="it"?"EN":"IT"}
            </button>
            {/* Book a Demo — desktop only */}
            <button type="button" onClick={()=>setShowModal(true)} className="nav-demo-btn bg_" style={{
              borderRadius:"100px",padding:"10px 22px",
              background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
              fontSize:"11px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",
              color:"#0A1931",border:"none",cursor:"pointer"
            }}>{t.demoBtn}</button>

            {/* Hamburger — mobile only */}
            <button type="button" className="nav-ham"
              onClick={()=>setMob(!mob)}
              aria-label={mob?t.closeMenu:t.openMenu}
              aria-expanded={mob}
              style={{
                alignItems:"center",justifyContent:"center",
                width:"40px",height:"40px",borderRadius:"8px",
                border:"1px solid rgba(212,180,131,0.2)",
                background:"transparent",cursor:"pointer",
                color:"rgba(212,180,131,0.7)",flexShrink:0
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {mob
                  ?<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>
                  :<><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
                }
              </svg>
            </button>
          </div>
        </motion.nav>

        {/* ── MOBILE MENU ──────────────────────────────────────────────────── */}
        {mob&&(
          <div className="mob-menu" style={{
            position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:50,
            background:"rgba(5,11,23,0.98)",
            backdropFilter:"blur(20px)",
            display:"flex",flexDirection:"column",
          }}>
            {/* Header row with logo + close */}
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"16px 24px",
              borderBottom:"1px solid rgba(212,180,131,0.08)"
            }}>
              <Logo light/>
              <button type="button" onClick={()=>setMob(false)}
                aria-label={t.closeMenu}
                style={{
                  display:"flex",alignItems:"center",justifyContent:"center",
                  width:"40px",height:"40px",borderRadius:"8px",
                  border:"1px solid rgba(212,180,131,0.2)",
                  background:"transparent",cursor:"pointer",
                  color:"rgba(212,180,131,0.7)"
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18"/><path d="M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 32px"}}>
              {t.nav.map((item,i)=>(
                <a key={i}
                   href={["#aureum","#solution","#how","#eco"][i]}
                   className="mob-link"
                   onClick={()=>setMob(false)}>
                  {item}
                </a>
              ))}
            </div>

            {/* Bottom CTA + lang */}
            <div style={{padding:"24px 32px 40px",display:"flex",flexDirection:"column",gap:"12px"}}>
              <button type="button" onClick={()=>{setShowModal(true);setMob(false);}} className="bg_" style={{
                display:"flex",justifyContent:"center",
                borderRadius:"100px",padding:"16px",
                background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
                fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",
                color:"#0A1931",border:"none",cursor:"pointer"
              }}>{t.demoBtn}</button>
              <button type="button"
                onClick={()=>{setLang(lang==="it"?"en":"it");setMob(false);}}
                className="bgh"
                style={{
                  borderRadius:"100px",padding:"13px",
                  border:"1px solid rgba(212,180,131,0.2)",
                  fontSize:"11px",letterSpacing:"0.35em",textTransform:"uppercase",
                  color:"rgba(212,180,131,0.5)",background:"transparent",cursor:"pointer"
                }}>
                {lang==="it"?"Switch to English":"Passa all'Italiano"}
              </button>
            </div>
          </div>
        )}

        {/* ── HERO — over hotel exterior ───────────────────────────────────── */}
        <PhotoBg src="/images/aureum-exterior.jpg"
          overlay="linear-gradient(to right,rgba(5,11,23,0.85) 0%,rgba(10,25,49,0.7) 50%,rgba(5,11,23,0.5) 100%)"
          className="min-h-screen flex items-center pt-24 pb-24 px-6">
          <div className="mx-auto max-w-6xl w-full" id="aureum">
            <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.5)",marginBottom:"32px"}}>
              {t.heroTag}
            </p>
            <h1 data-reveal="" data-delay="1" className="hd" style={{
              fontSize:"clamp(36px,6.5vw,84px)",fontWeight:200,lineHeight:1.06,
              letterSpacing:"-0.02em",color:"#F5E9D3",maxWidth:"820px"
            }}>
              {lang==="it"
                ? <>Il sistema operativo<br/><em style={{color:"#D4B483",fontStyle:"italic"}}>dell'ospitalità moderna.</em></>
                : <>The Operating System<br/><em style={{color:"#D4B483",fontStyle:"italic"}}>For Modern Hospitality.</em></>
              }
            </h1>
            {/* One Scan tagline — sotto il titolo, ben visibile */}
            <p data-reveal="" data-delay="2" style={{
              fontSize:"11px",letterSpacing:"0.5em",textTransform:"uppercase",
              color:"#D4B483",marginTop:"20px",opacity:0.8,
            }}>
              One Scan · Every Stay
            </p>
            <p data-reveal="" data-delay="3" style={{maxWidth:"480px",fontSize:"15px",lineHeight:1.85,color:"rgba(245,233,211,0.72)",marginTop:"20px"}}>
              {t.heroText}
            </p>
            <div data-reveal="" data-delay="3" style={{display:"flex",flexWrap:"wrap",gap:"14px",marginTop:"36px"}}>
              <button type="button" onClick={()=>setShowModal(true)} className="bg_" style={{
                borderRadius:"100px",padding:"14px 32px",
                background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
                fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",
                color:"#0A1931",border:"none",cursor:"pointer",display:"inline-flex"
              }}>{t.demoBtn}</button>
              <a href="#solution" className="bgh" style={{
                borderRadius:"100px",padding:"14px 32px",
                border:"1px solid rgba(212,180,131,0.2)",
                fontSize:"12px",fontWeight:500,letterSpacing:"0.3em",textTransform:"uppercase",
                color:"rgba(212,180,131,0.55)",textDecoration:"none",display:"inline-flex",transition:"all 0.3s"
              }}>{t.partnerBtn}</a>
            </div>
            {/* Metrics */}
            <div data-reveal="" data-delay="4" style={{
              display:"inline-flex",marginTop:"48px",borderRadius:"16px",padding:"20px 4px",
              background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.1)"
            }}>
              {[["-70%","check-in time"],["1 QR","to access"],["100%","guest control"]].map(([v,l],i)=>(
                <div key={i} style={{textAlign:"center",padding:"0 28px",borderRight:i<2?"1px solid rgba(212,180,131,0.12)":"none"}}>
                  <div style={{fontSize:"clamp(24px,3.5vw,36px)",fontWeight:600,color:"#F5E9D3"}}>{v}</div>
                  <div style={{fontSize:"10px",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(212,180,131,0.35)",marginTop:"4px"}}>{l}</div>
                </div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div data-reveal="" data-delay="5" style={{marginTop:"48px",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"8px"}}>
              <span style={{fontSize:"9px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.25)"}}>
                {t.scrollDown}
              </span>
              <svg className="scroll-chev" width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                <path d="M1 1l9 9 9-9" stroke="rgba(212,180,131,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── PMS LOGOS BAR ────────────────────────────────────────────────── */}
        <section style={{background:"#050B17",padding:"48px 24px"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <p style={{textAlign:"center",fontSize:"9px",letterSpacing:"0.5em",textTransform:"uppercase",
              color:"rgba(212,180,131,0.25)",marginBottom:"32px"}}>{t.pmsTitle}</p>
            <LogoMarquee/>
          </div>
        </section>

        <GoldDivider/>
        {/* ── PROBLEM — aerial marble lobby ───────────────────────────────── */}
        <PhotoBg src="/images/interior-aerial.jpg"
          overlay="linear-gradient(135deg,rgba(5,11,23,0.88),rgba(10,25,49,0.82))"
          className="py-36 px-6">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>
                {t.problemEyebrow}
              </p>
              <h2 data-reveal="" data-delay="1" className="hd" style={{fontSize:"clamp(34px,5vw,60px)",fontWeight:300,lineHeight:1.1,color:"#F5E9D3",letterSpacing:"-0.02em"}}>
                {t.problemTitle}
              </h2>
              <div data-reveal="" data-delay="2" style={{height:"1px",width:"64px",background:"linear-gradient(to right,#D4B483,transparent)",marginTop:"28px"}}/>
            </div>
            <div data-reveal="" data-delay="2" style={{display:"grid",gap:"10px"}}>
              {t.problemItems.map((item,i)=>(
                <div key={i} className="shim ch" style={{
                  display:"flex",alignItems:"center",gap:"16px",
                  padding:"18px 22px",borderRadius:"16px",
                  background:"rgba(212,180,131,0.04)",
                  border:"1px solid rgba(212,180,131,0.08)"
                }}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"rgba(212,180,131,0.4)",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:500,color:"#F5E9D3"}}>{item.t}</div>
                    <div style={{fontSize:"12px",color:"rgba(212,180,131,0.4)",marginTop:"2px"}}>{item.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── TESTIMONIALS — aureum lobby day bg ──────────────────────────── */}
        <PhotoBg src="/images/aureum-lobby-day.jpg"
          overlay="linear-gradient(135deg,rgba(5,11,23,0.94),rgba(10,25,49,0.92))"
          className="py-36 px-6">
          <div className="mx-auto max-w-6xl">
            <div style={{textAlign:"center",marginBottom:"56px"}}>
              <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",
                color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>{t.socialProofEyebrow}</p>
              <h2 data-reveal="" data-delay="1" className="hd" style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:300,
                color:"#F5E9D3",letterSpacing:"-0.02em",lineHeight:1.1}}>{t.socialProofTitle}</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
              {t.testimonials.map((tm,i)=>(
                <div key={i} className="tcard" data-reveal="" data-delay={String(i+1)} style={{
                  padding:"36px 32px",borderRadius:"20px",
                  background:"rgba(212,180,131,0.03)",border:"1px solid rgba(212,180,131,0.08)"}}>
                  <div style={{fontSize:"44px",color:"rgba(212,180,131,0.12)",lineHeight:1,marginBottom:"14px",fontFamily:"Georgia,serif"}}>"</div>
                  <p style={{fontSize:"14px",lineHeight:1.8,color:"rgba(245,233,211,0.78)",marginBottom:"24px"}}>{tm.q}</p>
                  <div style={{borderTop:"1px solid rgba(212,180,131,0.07)",paddingTop:"18px"}}>
                    <div style={{fontSize:"13px",fontWeight:500,color:"#F5E9D3"}}>{tm.name}</div>
                    <div style={{fontSize:"11px",color:"rgba(212,180,131,0.4)",marginTop:"3px",letterSpacing:"0.05em"}}>{tm.role} · {tm.hotel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── TRANSFORMATION — dark interior organic ───────────────────────── */}
        <PhotoBg src="/images/interior-dark.jpg"
          overlay="linear-gradient(to bottom,rgba(5,11,23,0.92),rgba(10,25,49,0.88))"
          className="py-36 px-6 text-center" id="solution">
          <div className="mx-auto max-w-5xl">
            <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>
              {t.transEyebrow}
            </p>
            <h2 data-reveal="" data-delay="1" className="hd" style={{
              fontSize:"clamp(34px,5.5vw,72px)",fontWeight:300,lineHeight:1.08,
              color:"#F5E9D3",letterSpacing:"-0.02em",whiteSpace:"pre-line"
            }}>{t.transTitle}</h2>
            <div style={{height:"1px",width:"80px",margin:"24px auto",background:"linear-gradient(90deg,transparent,#D4B483,transparent)"}} data-reveal="" data-delay="2"/>
            <p data-reveal="" data-delay="2" style={{fontSize:"17px",color:"rgba(245,233,211,0.72)",lineHeight:1.8}}>{t.transSub}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginTop:"56px"}}>
              {[
                {n:"01",t:lang==="it"?"L'ospite arriva":"Guest arrives",s:lang==="it"?"Identità già verificata":"Identity already verified"},
                {n:"02",t:lang==="it"?"QR scansionato":"QR scanned",s:lang==="it"?"Check-in immediato":"Instant check-in"},
                {n:"03",t:lang==="it"?"Accesso garantito":"Access granted",s:lang==="it"?"Esperienza superiore":"Superior experience"},
              ].map((p,i)=>(
                <div key={i} className="shim ch" data-reveal="" data-delay={String(i+1)} style={{
                  padding:"32px 24px",borderRadius:"16px",textAlign:"center",
                  background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.08)"
                }}>
                  <div style={{fontSize:"10px",letterSpacing:"0.4em",color:"rgba(212,180,131,0.25)",textTransform:"uppercase",marginBottom:"16px"}}>{p.n}</div>
                  <div style={{fontSize:"17px",fontWeight:400,color:"#F5E9D3",marginBottom:"8px"}}>{p.t}</div>
                  <div style={{height:"1px",width:"28px",background:"rgba(212,180,131,0.3)",margin:"0 auto 12px"}}/>
                  <div style={{fontSize:"12px",color:"rgba(245,233,211,0.62)"}}>{p.s}</div>
                </div>
              ))}
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── APP — chandelier lobby bg ────────────────────────────────────── */}
        <PhotoBg src="/images/interior-chandelier.jpg"
          overlay="linear-gradient(to right,rgba(5,11,23,0.95),rgba(10,25,49,0.88) 60%,rgba(5,11,23,0.85))"
          className="py-36 px-6">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>
                {t.appEyebrow}
              </p>
              <h2 data-reveal="" data-delay="1" className="hd" style={{
                fontSize:"clamp(34px,5vw,64px)",fontWeight:300,lineHeight:1.1,
                color:"#F5E9D3",letterSpacing:"-0.02em",whiteSpace:"pre-line"
              }}>{t.appTitle}</h2>
              <div data-reveal="" data-delay="2" style={{height:"1px",width:"48px",background:"linear-gradient(to right,#D4B483,transparent)",marginTop:"24px"}}/>
              <div data-reveal="" data-delay="3" style={{display:"grid",gap:"6px",marginTop:"32px"}}>
                {t.appItems.map((item,i)=>(
                  <div key={i} style={{
                    display:"flex",alignItems:"center",gap:"14px",
                    padding:"11px 14px",borderRadius:"10px",cursor:"pointer",transition:"all 0.2s",
                    background:appS===i?"rgba(212,180,131,0.08)":"transparent",
                    border:`1px solid ${appS===i?"rgba(212,180,131,0.2)":"transparent"}`
                  }}>
                    <div style={{width:"6px",height:"6px",borderRadius:"50%",background:appS===i?"#D4B483":"rgba(212,180,131,0.2)",flexShrink:0}}/>
                    <span style={{fontSize:"13px",color:appS===i?"#F5E9D3":"rgba(245,233,211,0.3)"}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="" data-delay="1">
              <AppMockup screen={appS} lang={lang}/>
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── RECEPTION — THE KEY IMAGE: navy+gold lobby ───────────────────── */}
        <PhotoBg src="/images/reception-aureum.jpg"
          overlay="linear-gradient(to right,rgba(5,11,23,0.82),rgba(10,25,49,0.65) 50%,rgba(5,11,23,0.82))"
          className="min-h-screen flex items-center py-36 px-6 text-center" id="how">
          <div className="mx-auto max-w-5xl w-full">
            <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.55)",marginBottom:"24px"}}>
              {t.receptionEyebrow}
            </p>
            <h2 data-reveal="" data-delay="1" className="hd" style={{
              fontSize:"clamp(38px,6.5vw,88px)",fontWeight:300,lineHeight:1.06,
              color:"#F5E9D3",letterSpacing:"-0.03em",whiteSpace:"pre-line"
            }}>{t.receptionTitle}</h2>
            <div style={{height:"1px",width:"80px",margin:"24px auto",background:"linear-gradient(90deg,transparent,#D4B483,transparent)"}} data-reveal="" data-delay="2"/>
            <p data-reveal="" data-delay="2" style={{fontSize:"16px",color:"rgba(245,233,211,0.72)",lineHeight:1.8}}>
              {t.receptionSub}
            </p>
            <div data-reveal="" data-delay="3" className="steps-grid">
              {t.steps.map((step,i)=>(
                <div key={step}>
                  <div className="sp mx-auto mb-5" style={{
                    width:"64px",height:"64px",borderRadius:"50%",
                    border:"1px solid rgba(212,180,131,0.3)",
                    background:"rgba(212,180,131,0.05)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"18px",fontWeight:200,color:"#D4B483",
                    animationDelay:`${i*.7}s`
                  }}>
                    0{i+1}
                  </div>
                  <p style={{fontSize:"12px",fontWeight:400,color:"rgba(245,233,211,0.72)",lineHeight:1.6}}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── ECOSYSTEM ─────────────────────────────────────────────────────── */}
        <PhotoBg src="/images/interior-marble.jpg"
          overlay="linear-gradient(135deg,rgba(5,11,23,0.93),rgba(10,25,49,0.9))"
          className="py-36 px-6" id="eco">
          <div className="mx-auto max-w-6xl">
            <div style={{textAlign:"center",marginBottom:"64px"}}>
              <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>
                {t.ecoEyebrow}
              </p>
              <h2 data-reveal="" data-delay="1" className="hd" style={{
                fontSize:"clamp(34px,5vw,68px)",fontWeight:300,lineHeight:1.1,
                color:"#F5E9D3",whiteSpace:"pre-line",letterSpacing:"-0.02em"
              }}>{t.ecoTitle}</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px"}}>
              {t.ecoItems.map((item,i)=>(
                <div key={item} className="shim ch" data-reveal="" data-delay={String((i%3)+1)} style={{
                  padding:"28px 20px",borderRadius:"16px",textAlign:"center",
                  background:"rgba(212,180,131,0.03)",border:"1px solid rgba(212,180,131,0.08)"}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",
                    background:"rgba(212,180,131,0.07)",border:"1px solid rgba(212,180,131,0.12)",
                    display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                    <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"rgba(212,180,131,0.6)"}}/>
                  </div>
                  <div style={{fontSize:"13px",fontWeight:500,color:"#F5E9D3",letterSpacing:"0.04em",marginBottom:"8px"}}>{item}</div>
                  <div style={{fontSize:"11px",color:"rgba(212,180,131,0.35)",lineHeight:1.6}}>{t.ecoDescs[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>
        {/* ── FINALE ────────────────────────────────────────────────────────── */}
        <PhotoBg src="/images/aureum-alpine.jpg"
          overlay="linear-gradient(to bottom,rgba(5,11,23,0.92),rgba(5,11,23,0.96))"
          className="min-h-screen flex flex-col items-center justify-center px-6 py-32 text-center"
          id="finale">
          <div style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)",margin:"0 auto 48px"}} data-reveal=""/>
          <div data-reveal="" data-delay="1">
            <div style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,lineHeight:1.06,color:"#FAF8F4",letterSpacing:"-0.02em"}}>
              {t.f1}
            </div>
            <div style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,lineHeight:1.06,color:"#FAF8F4",letterSpacing:"-0.02em"}}>
              {t.f2}
            </div>
            <div style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,fontStyle:"italic",lineHeight:1.06,color:"#D4B483",letterSpacing:"-0.02em"}}>
              {t.f3}
            </div>
          </div>
          <div style={{height:"1px",width:"100px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.3),transparent)",margin:"32px auto"}} data-reveal="" data-delay="2"/>
          <p data-reveal="" data-delay="2" style={{fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.35)",marginBottom:"40px"}}>
            {t.finalSub}
          </p>
          {/* Trust badges — "Trust & Authority" pattern (UI/UX Pro Max) */}
          <div data-reveal="" data-delay="3" style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center",marginBottom:"36px"}}>
            {[
              {label:"GDPR Compliant",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>},
              {label:"End-to-End Encrypted",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>},
              {label:"SOC 2 Ready",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 16px",borderRadius:"100px",
                background:"rgba(212,180,131,0.05)",border:"1px solid rgba(212,180,131,0.12)",
                color:"rgba(212,180,131,0.5)"}}>
                {b.icon}
                <span style={{fontSize:"9px",letterSpacing:"0.25em",textTransform:"uppercase"}}>{b.label}</span>
              </div>
            ))}
          </div>
          <div data-reveal="" data-delay="4" style={{display:"flex",flexWrap:"wrap",gap:"16px",justifyContent:"center"}}>
            <button type="button" onClick={()=>setShowModal(true)} className="bg_" style={{
              borderRadius:"100px",padding:"16px 36px",
              background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",
              fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",
              color:"#0A1931",border:"none",cursor:"pointer",display:"inline-flex"
            }}>{t.demoBtn}</button>
            <button type="button" onClick={()=>setShowModal(true)} className="bgh" style={{
              borderRadius:"100px",padding:"16px 36px",
              border:"1px solid rgba(212,180,131,0.2)",
              fontSize:"12px",fontWeight:500,letterSpacing:"0.3em",textTransform:"uppercase",
              color:"rgba(212,180,131,0.5)",background:"transparent",cursor:"pointer",display:"inline-flex",transition:"all 0.3s"
            }}>{t.partnerBtn}</button>
          </div>
          <div style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.2),transparent)",margin:"48px auto 0"}} data-reveal="" data-delay="5"/>
        </PhotoBg>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer style={{borderTop:"1px solid rgba(212,180,131,0.07)",background:"#050B17",padding:"40px 24px"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"24px",marginBottom:"24px"}}>
              <Logo light/>
              <div style={{display:"flex",gap:"24px",flexWrap:"wrap",alignItems:"center"}}>
                {/* Nav links */}
                {[["Contact","mailto:alisamaffei@valtiqstay.com"],["Demo","#finale"],["Platform","#eco"]].map(([l,h])=>(
                  <a key={l} href={h} style={{fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",
                    color:"rgba(212,180,131,0.25)",textDecoration:"none",transition:"color 0.2s"}}
                    onMouseEnter={e=>(e.currentTarget.style.color="rgba(212,180,131,0.6)")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.25)")}>{l}</a>
                ))}
                {/* Privacy */}
                <Link href="/privacy" style={{fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",
                  color:"rgba(212,180,131,0.25)",textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={(e:React.MouseEvent<HTMLAnchorElement>)=>(e.currentTarget.style.color="rgba(212,180,131,0.6)")}
                  onMouseLeave={(e:React.MouseEvent<HTMLAnchorElement>)=>(e.currentTarget.style.color="rgba(212,180,131,0.25)")}>{t.privacyLabel}</Link>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/valtiqstay" target="_blank" rel="noopener noreferrer"
                  style={{fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",
                    color:"rgba(212,180,131,0.25)",textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(212,180,131,0.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.25)")}>{t.linkedinLabel}</a>
              </div>
            </div>
            <div style={{borderTop:"1px solid rgba(212,180,131,0.05)",paddingTop:"20px",
              display:"flex",flexWrap:"wrap",gap:"16px",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"10px",color:"rgba(212,180,131,0.2)",margin:0,letterSpacing:"0.05em"}}>{t.footerLegal}</p>
              <VLogo size={28}/>
            </div>
          </div>
        </footer>

      </main>

      {/* ── MODAL + COOKIE ──────────────────────────────────────────────────── */}
      {showModal&&<DemoModal t={t} onClose={()=>setShowModal(false)}/>}
      {cookieConsent===false&&<CookieBanner t={t} onAccept={acceptCookies}/>}
    </>
  );
}
