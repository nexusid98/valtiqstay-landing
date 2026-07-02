"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

/* ═══ PALETTE ═══════════════════════════════════════════════════════════
   Navy      #0A1931   Dominant
   Gold      #D4B483   Interactions / CTA / Highlight
   Ivory     #F5E9D3   Premium typography
   Midnight  #050B17   Depth maximum
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
    videoEyebrow:"Guarda come funziona",
    videoTitle:"Scopri ValtiqStay\nin azione.",
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
    manifesto:"«L'ospitalità vera inizia prima che l'ospite varchi la soglia.»",
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
    videoEyebrow:"See how it works",
    videoTitle:"Experience ValtiqStay\nin action.",
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
    manifesto:"«Real hospitality begins before the guest crosses the threshold.»",
  },
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES=`
  @keyframes logo-emerge{0%{opacity:0;letter-spacing:0.6em;filter:blur(16px);}50%{opacity:1;filter:blur(0);}100%{opacity:1;letter-spacing:0.4em;}}
  .logo-emerge{animation:logo-emerge 2.4s cubic-bezier(0.22,1,0.36,1) forwards;}
  @keyframes tl-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .tl-in{animation:tl-in 1s ease forwards;}
  @keyframes approach{0%{transform:scale(1) translateY(0);}100%{transform:scale(1.5) translateY(-5%);}}
  .approach{animation:approach 5s cubic-bezier(0.25,0.1,0.25,1) forwards;}
  @keyframes panel-in{from{opacity:0;transform:scale(0.95) translateY(20px)}to{opacity:1;transform:none}}
  .panel-in{animation:panel-in 0.7s cubic-bezier(0.22,1,0.36,1) forwards;}
  @keyframes laser{0%{top:4%;opacity:0;}5%{opacity:1;}95%{opacity:1;}100%{top:96%;opacity:0;}}
  @keyframes v-check{from{opacity:0;transform:scale(0.65)translateY(10px);}to{opacity:1;transform:scale(1)translateY(0);}}
  .v-check{animation:v-check 0.9s cubic-bezier(0.22,1,0.36,1) both;}
  @keyframes onescan{from{opacity:0;letter-spacing:0.1em}to{opacity:1;letter-spacing:0.35em}}
  .onescan{animation:onescan 1.4s ease forwards;}
  .door-l{transition:transform 1.8s cubic-bezier(0.76,0,0.24,1);}
  .door-r{transition:transform 1.8s cubic-bezier(0.76,0,0.24,1);}
  .door-l.open{transform:perspective(1400px) rotateY(-82deg);}
  .door-r.open{transform:perspective(1400px) rotateY(82deg);}
  @keyframes intro-out{from{opacity:1}to{opacity:0;pointer-events:none}}
  .intro-out{animation:intro-out 1s ease forwards;}
  [data-reveal]{will-change:opacity,transform;}
  .shim{position:relative;overflow:hidden;}
  .shim::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background:linear-gradient(108deg,transparent 36%,rgba(212,180,131,0.1) 50%,transparent 64%);transform:translateX(-130%);transition:transform 0.8s ease;}
  .shim:hover::after{transform:translateX(130%);}
  .ch{transition:transform 0.35s ease,box-shadow 0.35s ease;}
  .ch:hover{transform:translateY(-3px);box-shadow:0 24px 60px rgba(212,180,131,0.1),0 4px 16px rgba(0,0,0,0.4);}
  .bg_{position:relative;z-index:0;transition:opacity 0.3s,transform 0.2s;}
  .bg_::before{content:'';position:absolute;inset:-6px;border-radius:inherit;z-index:-1;background:linear-gradient(135deg,#D4B483,#C9A065,#D4B483);opacity:0;filter:blur(14px);transition:opacity 0.35s;}
  .bg_:hover::before{opacity:0.6;}
  .bg_:hover{transform:translateY(-1px);opacity:0.92;}
  .bgh{transition:background 0.3s,border-color 0.3s,color 0.3s;}
  .bgh:hover{background:rgba(212,180,131,0.08);border-color:rgba(212,180,131,0.45);color:#F5E9D3;}
  @keyframes sp{0%,100%{box-shadow:0 0 0 0 rgba(212,180,131,0.4)}50%{box-shadow:0 0 0 14px rgba(212,180,131,0)}}
  .sp{animation:sp 2.8s ease-out infinite;}
  @keyframes app-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .app-fade{animation:app-fade 0.5s ease forwards;}
  @keyframes blink{0%,100%{opacity:0.15}50%{opacity:0.85}}
  @media(max-width:767px){.nav-desktop{display:none!important;}.nav-ham{display:flex!important;}.nav-demo-btn{display:none!important;}.nav-lang-btn{display:none!important;}}
  @media(min-width:768px){.nav-desktop{display:flex!important;}.nav-ham{display:none!important;}.nav-demo-btn{display:inline-flex!important;}.nav-lang-btn{display:block!important;}}
  @keyframes mob-in{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
  .mob-menu{animation:mob-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards;}
  .mob-link{display:block;width:100%;padding:18px 0;font-size:13px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(212,180,131,0.5);text-decoration:none;text-align:center;border-bottom:1px solid rgba(212,180,131,0.07);transition:color 0.2s;}
  .mob-link:hover,.mob-link:active{color:#D4B483;}
  .sk{position:absolute;top:-100px;left:1rem;z-index:9999;background:#D4B483;color:#0A1931;padding:0.5rem 1rem;border-radius:6px;font-weight:700;font-size:13px;transition:top 0.2s;}
  .sk:focus{top:1rem;}
  @keyframes scroll-bounce{0%,100%{transform:translateY(0);opacity:0.4;}50%{transform:translateY(7px);opacity:0.85;}}
  .scroll-chev{animation:scroll-bounce 2.2s ease-in-out infinite;}
  @keyframes modal-in{from{opacity:0;transform:scale(0.97)translateY(12px)}to{opacity:1;transform:none}}
  .modal-card{animation:modal-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards;}
  .form-field{width:100%;padding:12px 16px;border-radius:10px;border:1px solid rgba(212,180,131,0.15);background:rgba(212,180,131,0.04);color:#F5E9D3;font-size:13px;outline:none;transition:border-color 0.2s;box-sizing:border-box;}
  .form-field::placeholder{color:rgba(245,233,211,0.25);}
  .form-field:focus{border-color:rgba(212,180,131,0.4);}
  .pms-logo{opacity:0.35;filter:grayscale(1) invert(1);transition:opacity 0.3s,filter 0.3s;}
  .pms-logo:hover{opacity:0.75;filter:grayscale(0) invert(0);}
  .hd{font-family:var(--font-cormorant,'Cormorant Garamond',Georgia,serif);font-variant-ligatures:common-ligatures;}
  button{cursor:pointer;}
  button:focus-visible,a:focus-visible{outline:2px solid rgba(212,180,131,0.7);outline-offset:3px;border-radius:4px;}
  .form-field:focus-visible{outline:none;}
  @media(prefers-reduced-motion:reduce){.shim::after,.bg_::before{display:none}.sp,.scroll-chev{animation:none}}

  /* ── StarField ── */
  @keyframes sd1{0%{opacity:0.35;transform:translateY(0)}50%{opacity:1}100%{opacity:0.35;transform:translateY(-4px)}}
  @keyframes sd2{0%{opacity:0.15;transform:translateY(0)}50%{opacity:0.65}100%{opacity:0.15;transform:translateY(3px)}}

  /* ── SpinCTA ── */
  @property --ca{syntax:'<angle>';initial-value:0deg;inherits:false;}
  @keyframes spin-ca{to{--ca:360deg}}
  .cta-s{position:relative;z-index:0;padding:16px 40px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:0.35em;text-transform:uppercase;color:#0A1931;cursor:pointer;border:none;background:linear-gradient(135deg,#D4B483,#C9A065,#D4B483);transition:opacity 0.3s,transform 0.2s;display:inline-flex;align-items:center;}
  .cta-s::before{content:'';position:absolute;inset:-2px;border-radius:100px;z-index:-1;background:conic-gradient(from var(--ca),transparent 0deg,#D4B483 60deg,transparent 120deg);animation:spin-ca 2.4s linear infinite;opacity:0;transition:opacity 0.3s;}
  .cta-s:hover::before{opacity:1;}
  .cta-s:hover{transform:translateY(-2px);opacity:0.92;}

  /* ── Badge ping ── */
  @keyframes badge-ping{0%,100%{box-shadow:0 0 0 0 rgba(212,180,131,0.6)}50%{box-shadow:0 0 0 6px rgba(212,180,131,0)}}
  .badge-ping{animation:badge-ping 2.4s ease-out infinite;display:block;}

  /* ── Bento ── */
  .bento{display:grid;gap:12px;}
  @media(max-width:767px){.bento{grid-template-columns:1fr!important;}.bento>*{grid-column:span 1!important;}}

  /* ── Footer ghost ── */
  .fghost{position:absolute;bottom:-0.1em;left:50%;transform:translateX(-50%);font-size:clamp(64px,12vw,160px);font-weight:700;letter-spacing:0.12em;white-space:nowrap;pointer-events:none;user-select:none;color:transparent;-webkit-text-stroke:1px rgba(212,180,131,0.07);line-height:1;}

  /* ── Dark body ── */
  body{background:#050B17;}

  /* ── Custom cursor ── */
  @media(pointer:fine){*{cursor:none!important;}}

  /* ── Ambient phone glow ── */
  @keyframes ambient-pulse{0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(0.92);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08);}}

  /* ── Editorial number ── */
  .ed-num{font-size:clamp(80px,11vw,130px);font-weight:200;color:rgba(212,180,131,0.05);line-height:1;letter-spacing:-0.04em;font-family:var(--font-cormorant,'Cormorant Garamond',Georgia,serif);pointer-events:none;user-select:none;position:absolute;top:-10px;right:16px;}

  /* ── Glow card ── */
  .glow-card{position:relative;overflow:hidden;border-radius:20px;background:rgba(212,180,131,0.03);border:1px solid rgba(212,180,131,0.08);transition:border-color 0.4s ease,transform 0.4s ease;}
  .glow-card:hover{border-color:rgba(212,180,131,0.18);transform:translateY(-5px);}

  /* ── Testimonial card ── */
  .tcard-v2{padding:40px 36px;border-radius:20px;background:rgba(212,180,131,0.03);border:1px solid rgba(212,180,131,0.08);transition:border-color 0.35s,transform 0.35s;}
  .tcard-v2:hover{border-color:rgba(212,180,131,0.15);transform:translateY(-4px);}

  /* ── Grid overlay ── */
  .grid-ov{position:absolute;inset:0;background-image:linear-gradient(rgba(212,180,131,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,180,131,0.025) 1px,transparent 1px);background-size:80px 80px;pointer-events:none;}

  /* ── Steps grid ── */
  .steps-grid{display:grid;gap:32px 16px;grid-template-columns:repeat(2,1fr);margin-top:64px;}
  @media(min-width:768px){.steps-grid{grid-template-columns:repeat(4,1fr);}}
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

/* ─── VLogo mark ──────────────────────────────────────────────────────────── */
function VLogo({size=72}:{size?:number}){
  return(<svg viewBox="0 0 120 105" width={size} height={size} aria-hidden="true">
    <path d="M10 8 L62 82" stroke="#D4B483" strokeWidth="11" strokeLinecap="round"/>
    <path d="M110 8 L62 82" stroke="#D4B483" strokeWidth="11" strokeLinecap="round"/>
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
        <Image src={src} alt="" fill className="object-cover object-center" quality={92} sizes="100vw"/>
      </motion.div>
      <div className="absolute inset-0" style={{background:overlay}}/>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─── App Mockup ──────────────────────────────────────────────────────────── */
function AppMockup({screen,lang}:{screen:number;lang:Lang}){
  type Screen={title:string;sub:string;badge:string;type:"standard"|"chat"|"profile";fields:string[];chatMsg?:string;};
  const screensIT:Screen[]=[
    {type:"standard",title:"Identità Digitale",sub:"Marco Rossi",badge:"✓ Verificato",fields:["Passaporto IT · ●●●● 3421","Data nascita: 12/03/1988","Nazionalità: Italiana"]},
    {type:"standard",title:"Prenotazione",sub:"Aureum · Suite 401",badge:"Confermata",fields:["Check-in: 15 Giu · 15:00","Check-out: 18 Giu · 12:00","Camera: Junior Suite"]},
    {type:"standard",title:"Guest Verificato",sub:"Stato accesso",badge:"Pronto al check-in",fields:["Identità verificata","Consenso firmato","QR attivo"]},
    {type:"standard",title:"Accesso Camera",sub:"Suite 401 · Piano 4°",badge:"Autorizzato",fields:["Chiave digitale attiva","Scade: 18 Giu 12:00","Tocca per aprire"]},
    {type:"chat",title:"Concierge",sub:"Pre-arrival Services",badge:"Online",chatMsg:"Buongiorno Marco! Come possiamo rendere perfetto il tuo soggiorno?",fields:["🍽  Tavolo prenotato: Ven 20:00","🧖  Spa: Sab 10:00","🚗  Transfer aeroporto: confermato"]},
    {type:"profile",title:"Profilo Ospite",sub:"Marco Rossi",badge:"Profilo Completo",fields:["🪪  Passaporto IT · ●●●● 3421","✉   marco.rossi@email.com","📱  +39 344 ●●●● 821","💳  Visa ●●●● ●●●● ●●●● 4521"]},
  ];
  const screensEN:Screen[]=[
    {type:"standard",title:"Digital Identity",sub:"Marco Rossi",badge:"✓ Verified",fields:["Passport IT · ●●●● 3421","Date of birth: 12/03/1988","Nationality: Italian"]},
    {type:"standard",title:"Reservation",sub:"Aureum · Suite 401",badge:"Confirmed",fields:["Check-in: 15 Jun · 15:00","Check-out: 18 Jun · 12:00","Room: Junior Suite"]},
    {type:"standard",title:"Verified Guest",sub:"Access status",badge:"Ready for check-in",fields:["Identity verified","Consent signed","QR active"]},
    {type:"standard",title:"Room Access",sub:"Suite 401 · 4th Floor",badge:"Authorized",fields:["Digital key active","Expires: 18 Jun 12:00","Tap to open"]},
    {type:"chat",title:"Concierge",sub:"Pre-arrival Services",badge:"Online",chatMsg:"Good morning Marco! How can we make your stay perfect?",fields:["🍽  Table reserved: Fri 8:00 PM","🧖  Spa: Sat 10:00 AM","🚗  Airport transfer: confirmed"]},
    {type:"profile",title:"Guest Profile",sub:"Marco Rossi",badge:"Complete Profile",fields:["🪪  Passport IT · ●●●● 3421","✉   marco.rossi@email.com","📱  +39 344 ●●●● 821","💳  Visa ●●●● ●●●● ●●●● 4521"]},
  ];
  const screens=lang==="it"?screensIT:screensEN;
  const s=screens[screen%screens.length];
  return(
    <div className="mx-auto" style={{width:"240px",position:"relative"}}>
      <div style={{borderRadius:"38px",padding:"12px",background:"linear-gradient(145deg,#1C1810,#0E0C08)",boxShadow:"0 40px 80px rgba(5,11,23,0.8),0 0 0 1px rgba(212,180,131,0.12),inset 0 1px 0 rgba(255,255,255,0.05)",position:"relative"}}>
        <div style={{position:"absolute",top:"16px",left:"50%",transform:"translateX(-50%)",width:"80px",height:"24px",borderRadius:"16px",background:"#050505",zIndex:10}}/>
        <div key={screen} className="app-fade" style={{borderRadius:"26px",overflow:"hidden",background:"#080808",aspectRatio:"9/19.5",position:"relative",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 18px 4px",display:"flex",justifyContent:"space-between",fontSize:"10px",color:"rgba(212,180,131,0.3)"}}>
            <span>9:41</span><span>●●●</span>
          </div>
          <div style={{padding:"8px 18px 14px",borderBottom:"1px solid rgba(212,180,131,0.07)"}}>
            <div style={{fontSize:"8px",letterSpacing:"0.5em",color:"rgba(212,180,131,0.4)",textTransform:"uppercase",marginBottom:"4px"}}>VALTIQSTAY</div>
            <div style={{fontSize:"19px",fontWeight:600,color:"#F5E9D3",lineHeight:1.2}}>{s.title}</div>
          </div>
          {s.type==="chat"&&(
            <>
              <div style={{margin:"12px 14px 6px",padding:"10px 12px",borderRadius:"12px 12px 12px 4px",background:"rgba(212,180,131,0.08)",border:"1px solid rgba(212,180,131,0.12)"}}>
                <div style={{fontSize:"8px",color:"rgba(212,180,131,0.4)",marginBottom:"4px",letterSpacing:"0.05em"}}>AUREUM · CONCIERGE</div>
                <div style={{fontSize:"11px",color:"rgba(245,233,211,0.7)",lineHeight:1.5}}>{s.chatMsg}</div>
              </div>
              <div style={{margin:"0 14px 10px",padding:"8px 12px",borderRadius:"12px 12px 4px 12px",background:"linear-gradient(135deg,#D4B483,#B8943E)",alignSelf:"flex-end"}}>
                <div style={{fontSize:"10px",color:"#0A1931",fontWeight:500}}>{lang==="it"?"Ho già qualche richiesta 😊":"I have some requests 😊"}</div>
              </div>
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.35em",color:"rgba(212,180,131,0.35)",textTransform:"uppercase",marginBottom:"4px"}}>{lang==="it"?"SERVIZI PRE-ARRIVO":"PRE-ARRIVAL SERVICES"}</div>
                {s.fields.map((f,i)=>(<div key={i} style={{padding:"8px 10px",borderRadius:"9px",background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)",fontSize:"10px",color:"rgba(245,233,211,0.78)"}}>{f}</div>))}
              </div>
              <div style={{margin:"8px 14px",padding:"8px 12px",borderRadius:"20px",background:"rgba(212,180,131,0.05)",border:"1px solid rgba(212,180,131,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"10px",color:"rgba(212,180,131,0.25)"}}>{lang==="it"?"Scrivi un messaggio…":"Write a message…"}</span>
                <span style={{fontSize:"14px",color:"rgba(212,180,131,0.4)"}}>↑</span>
              </div>
            </>
          )}
          {s.type==="profile"&&(
            <>
              <div style={{margin:"10px 14px",borderRadius:"12px",background:"linear-gradient(135deg,#D4B483,#B8943E)",padding:"12px 14px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(10,25,49,0.5)",marginBottom:"4px"}}>GUEST · VERIFIED</div>
                <div style={{fontSize:"15px",fontWeight:700,color:"#0A1931"}}>{s.sub}</div>
                <div style={{fontSize:"9px",color:"rgba(10,25,49,0.5)",marginTop:"2px"}}>{lang==="it"?"Ospite ValtiqStay · Platinum":"ValtiqStay Guest · Platinum"}</div>
                <div style={{display:"inline-flex",alignItems:"center",marginTop:"8px",background:"rgba(10,25,49,0.15)",borderRadius:"20px",padding:"2px 8px",fontSize:"9px",fontWeight:600,color:"#0A1931"}}>✓ {s.badge}</div>
              </div>
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                {s.fields.map((f,i)=>{
                  const labels=lang==="it"?["Documento","Email","Telefono","Pagamento"]:["Document","Email","Phone","Payment"];
                  return(<div key={i} style={{padding:"8px 10px",borderRadius:"9px",background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)"}}>
                    <div style={{fontSize:"8px",letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)",marginBottom:"2px"}}>{labels[i]}</div>
                    <div style={{fontSize:"10px",color:"rgba(245,233,211,0.6)",fontFamily:"monospace"}}>{f}</div>
                  </div>);
                })}
              </div>
            </>
          )}
          {s.type==="standard"&&(
            <>
              <div style={{margin:"12px 14px",borderRadius:"12px",background:"linear-gradient(135deg,#D4B483,#B8943E,#D4B483)",padding:"12px 14px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.35em",textTransform:"uppercase",color:"rgba(10,25,49,0.5)",marginBottom:"3px"}}>AUREUM</div>
                <div style={{fontSize:"15px",fontWeight:700,color:"#0A1931"}}>{s.sub}</div>
                <div style={{display:"inline-flex",alignItems:"center",marginTop:"7px",background:"rgba(10,25,49,0.15)",borderRadius:"20px",padding:"2px 9px",fontSize:"9px",fontWeight:600,color:"#0A1931"}}>{s.badge}</div>
              </div>
              <div style={{padding:"0 14px",flex:1,display:"flex",flexDirection:"column",gap:"5px"}}>
                {s.fields.map((f,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:"9px",background:"rgba(212,180,131,0.04)",border:"1px solid rgba(212,180,131,0.07)"}}>
                  <span style={{fontSize:"10px",color:"rgba(245,233,211,0.5)"}}>{f}</span>
                  <span style={{fontSize:"10px",color:"rgba(212,180,131,0.4)"}}>→</span>
                </div>))}
              </div>
            </>
          )}
          <div style={{height:"24px",display:"flex",alignItems:"center",justifyContent:"center",marginTop:"4px"}}>
            <div style={{width:"80px",height:"3px",borderRadius:"2px",background:"rgba(212,180,131,0.12)"}}/>
          </div>
        </div>
        <div style={{position:"absolute",right:"-3px",top:"68px",width:"3px",height:"28px",borderRadius:"2px",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{position:"absolute",left:"-3px",top:"58px",width:"3px",height:"22px",borderRadius:"2px",background:"rgba(255,255,255,0.06)"}}/>
        <div style={{position:"absolute",left:"-3px",top:"88px",width:"3px",height:"22px",borderRadius:"2px",background:"rgba(255,255,255,0.06)"}}/>
      </div>
    </div>
  );
}

/* ─── Hotel Doors ─────────────────────────────────────────────────────────── */
function HotelDoors({open}:{open:boolean}){
  return(
    <>
      <div className={`door-l ${open?"open":""}`} style={{position:"absolute",left:0,top:0,width:"50%",height:"100%",zIndex:20,background:"linear-gradient(to right,rgba(5,11,23,0.98),rgba(10,25,49,0.95))",transformOrigin:"left center",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px"}}>
        <div style={{width:"2px",height:"40%",background:"linear-gradient(to bottom,transparent,rgba(212,180,131,0.5),rgba(212,180,131,0.7),rgba(212,180,131,0.5),transparent)"}}/>
      </div>
      <div className={`door-r ${open?"open":""}`} style={{position:"absolute",right:0,top:0,width:"50%",height:"100%",zIndex:20,background:"linear-gradient(to left,rgba(5,11,23,0.98),rgba(10,25,49,0.95))",transformOrigin:"right center",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"16px"}}>
        <div style={{width:"2px",height:"40%",background:"linear-gradient(to bottom,transparent,rgba(212,180,131,0.5),rgba(212,180,131,0.7),rgba(212,180,131,0.5),transparent)"}}/>
      </div>
      {!open&&(<div style={{position:"absolute",left:"50%",top:0,bottom:0,width:"2px",zIndex:21,background:"linear-gradient(to bottom,transparent 5%,rgba(212,180,131,0.6) 30%,rgba(245,233,211,0.8) 50%,rgba(212,180,131,0.6) 70%,transparent 95%)"}}/>)}
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
      lenisInstance=new Lenis({duration:1.4,easing:(t:number)=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
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
      <motion.div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,#D4B483,transparent)"}}
        initial={{x:"-100%"}} whileInView={{x:"100%"}} viewport={{once:true}} transition={{duration:1.5,ease:"easeInOut"}}/>
    </div>
  );
}

/* ─── Logo Marquee ─────────────────────────────────────────────────────────── */
function LogoMarquee(){
  const logos=["mews","opera","protel","ericsoft","simplebooking","leonardo"];
  return(
    <div style={{overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"100px",zIndex:2,background:"linear-gradient(to right,#0A1931,transparent)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"100px",zIndex:2,background:"linear-gradient(to left,#0A1931,transparent)",pointerEvents:"none"}}/>
      <motion.div style={{display:"flex",gap:"72px",alignItems:"center",width:"max-content"}}
        animate={{x:["0%","-50%"]}} transition={{duration:24,repeat:Infinity,ease:"linear"}}>
        {[...logos,...logos].map((name,i)=>(
          <Image key={i} src={`/pms/${name}.png`} alt={name} width={96} height={32}
            className="pms-logo" style={{height:"28px",width:"auto",objectFit:"contain",flexShrink:0}}/>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Star Field ──────────────────────────────────────────────────────────── */
function StarField(){
  const stars=useMemo(()=>{
    const arr:{x:number;y:number;r:number;dur:number;del:number;anim:string}[]=[];
    for(let i=0;i<120;i++){
      arr.push({x:Math.random()*100,y:Math.random()*100,r:Math.random()*1.2+0.3,dur:Math.random()*3+2,del:Math.random()*4,anim:Math.random()>0.5?"sd1":"sd2"});
    }
    return arr;
  },[]);
  return(
    <div aria-hidden="true" style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {stars.map((s,i)=>(<div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:`${s.r*2}px`,height:`${s.r*2}px`,borderRadius:"50%",background:"#D4B483",animation:`${s.anim} ${s.dur}s ${s.del}s ease-in-out infinite`}}/>))}
    </div>
  );
}

/* ─── Ecosystem Icon ──────────────────────────────────────────────────────── */
function EcoIcon({i}:{i:number}){
  const p={width:22,height:22,viewBox:"0 0 24 24",fill:"none",stroke:"#D4B483",strokeWidth:1.5,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  if(i===0)return<svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M7 10h2m4 0h3M7 14h5"/></svg>;
  if(i===1)return<svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
  if(i===2)return<svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if(i===3)return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(i===4)return<svg {...p}><circle cx="8" cy="15" r="5"/><path d="M20.5 8.5L22 7l-2-2-1.5 1.5M13 13l7.5-7.5"/></svg>;
  return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

/* ─── Cookie Banner ───────────────────────────────────────────────────────── */
function CookieBanner({t,onAccept}:{t:typeof copy["it"];onAccept:()=>void}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,background:"rgba(5,11,23,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(212,180,131,0.1)",padding:"16px 24px",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
      <p style={{fontSize:"12px",color:"rgba(245,233,211,0.72)",maxWidth:"640px",lineHeight:1.6,margin:0}}>{t.cookieText}</p>
      <div style={{display:"flex",gap:"12px",alignItems:"center",flexShrink:0}}>
        <Link href="/privacy" style={{fontSize:"11px",letterSpacing:"0.15em",color:"rgba(212,180,131,0.45)",textDecoration:"underline",textUnderlineOffset:"3px"}}>{t.cookieMore}</Link>
        <button type="button" onClick={onAccept} className="bg_" style={{borderRadius:"100px",padding:"10px 24px",background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",fontSize:"11px",fontWeight:600,letterSpacing:"0.25em",textTransform:"uppercase",color:"#0A1931",cursor:"pointer",border:"none",whiteSpace:"nowrap"}}>{t.cookieAccept}</button>
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
    e.preventDefault();setStatus("sending");
    try{
      const res=await fetch("/api/demo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,hotel,email,phone})});
      setStatus(res.ok?"success":"error");
      if(res.ok)setTimeout(onClose,3200);
    }catch{setStatus("error");}
  },[name,hotel,email,phone,onClose]);
  return(
    <div role="dialog" aria-modal="true" style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(5,11,23,0.96)",backdropFilter:"blur(24px)"}}>
      <div className="modal-card" style={{background:"#0A1931",border:"1px solid rgba(212,180,131,0.15)",borderRadius:"24px",padding:"48px 40px",maxWidth:"480px",width:"calc(100% - 48px)",position:"relative",boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}}>
        <button type="button" onClick={onClose} aria-label="Close" style={{position:"absolute",top:"20px",right:"20px",width:"36px",height:"36px",borderRadius:"50%",border:"1px solid rgba(212,180,131,0.15)",background:"transparent",color:"rgba(212,180,131,0.5)",cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <div style={{marginBottom:"8px",fontSize:"9px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.5)"}}>VALTIQSTAY</div>
        <h2 className="hd" style={{fontSize:"26px",fontWeight:300,color:"#F5E9D3",letterSpacing:"-0.02em",marginBottom:"10px"}}>{t.demoTitle}</h2>
        <p style={{fontSize:"13px",color:"rgba(245,233,211,0.4)",lineHeight:1.6,marginBottom:"32px"}}>{t.demoSub}</p>
        {status==="success"?(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:"36px",color:"#D4B483",marginBottom:"12px"}}>✓</div>
            <p style={{fontSize:"14px",color:"rgba(245,233,211,0.6)",lineHeight:1.7}}>{t.demoFields.success}</p>
          </div>
        ):(
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <input className="form-field" placeholder={t.demoFields.name} value={name} onChange={e=>setName(e.target.value)} required/>
            <input className="form-field" placeholder={t.demoFields.hotel} value={hotel} onChange={e=>setHotel(e.target.value)} required/>
            <input className="form-field" type="email" placeholder={t.demoFields.email} value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="form-field" placeholder={t.demoFields.phone} value={phone} onChange={e=>setPhone(e.target.value)}/>
            {status==="error"&&(<p style={{fontSize:"12px",color:"rgba(220,80,80,0.8)",margin:0}}>{t.demoFields.error}</p>)}
            <button type="submit" disabled={status==="sending"} className="bg_" style={{marginTop:"8px",borderRadius:"100px",padding:"14px",background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",color:"#0A1931",cursor:status==="sending"?"wait":"pointer",border:"none",opacity:status==="sending"?0.7:1}}>
              {status==="sending"?t.demoFields.sending:t.demoFields.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Custom Cursor ───────────────────────────────────────────────────────── */
function CustomCursor(){
  const dotRef=useRef<HTMLDivElement>(null);
  const ringRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const dot=dotRef.current;const ring=ringRef.current;
    if(!dot||!ring) return;
    let ax=0,ay=0,rx=0,ry=0,rafId:number;
    const onMove=(e:MouseEvent)=>{
      ax=e.clientX;ay=e.clientY;
      dot.style.transform=`translate(${ax-4}px,${ay-4}px)`;
      dot.style.opacity="1";ring.style.opacity="1";
    };
    const onLeave=()=>{dot.style.opacity="0";ring.style.opacity="0";};
    const lerp=(a:number,b:number,n:number)=>a+(b-a)*n;
    const tick=()=>{
      rx=lerp(rx,ax,0.11);ry=lerp(ry,ay,0.11);
      ring.style.transform=`translate(${rx-20}px,${ry-20}px)`;
      rafId=requestAnimationFrame(tick);
    };
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseleave",onLeave);
    rafId=requestAnimationFrame(tick);
    return()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseleave",onLeave);cancelAnimationFrame(rafId);};
  },[]);
  return(
    <>
      <div ref={dotRef} aria-hidden="true" style={{position:"fixed",width:"8px",height:"8px",borderRadius:"50%",background:"#D4B483",pointerEvents:"none",zIndex:9999,opacity:0,top:0,left:0,willChange:"transform"}}/>
      <div ref={ringRef} aria-hidden="true" style={{position:"fixed",width:"40px",height:"40px",borderRadius:"50%",border:"1px solid rgba(212,180,131,0.5)",pointerEvents:"none",zIndex:9998,opacity:0,top:0,left:0,willChange:"transform",transition:"opacity 0.3s"}}/>
    </>
  );
}

/* ─── Magnetic Button ─────────────────────────────────────────────────────── */
function MagneticButton({children,onClick,className,style,strength=0.28}:{
  children:React.ReactNode;onClick?:()=>void;className?:string;style?:React.CSSProperties;strength?:number;
}){
  const ref=useRef<HTMLDivElement>(null);
  const x=useMotionValue(0);const y=useMotionValue(0);
  const sx=useSpring(x,{stiffness:260,damping:24,mass:0.5});
  const sy=useSpring(y,{stiffness:260,damping:24,mass:0.5});
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const onMove=(e:MouseEvent)=>{const r=el.getBoundingClientRect();x.set((e.clientX-r.left-r.width/2)*strength);y.set((e.clientY-r.top-r.height/2)*strength);};
    const onLeave=()=>{x.set(0);y.set(0);};
    el.addEventListener("mousemove",onMove);el.addEventListener("mouseleave",onLeave);
    return()=>{el.removeEventListener("mousemove",onMove);el.removeEventListener("mouseleave",onLeave);};
  },[x,y,strength]);
  return(
    <div ref={ref} style={{display:"inline-block"}}>
      <motion.button type="button" style={{x:sx,y:sy,...(style??{})}} className={className} onClick={onClick}>
        {children}
      </motion.button>
    </div>
  );
}

/* ─── Glow Card ───────────────────────────────────────────────────────────── */
function GlowCard({children,className,style}:{children:React.ReactNode;className?:string;style?:React.CSSProperties}){
  const ref=useRef<HTMLDivElement>(null);
  const glowRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=ref.current;const glow=glowRef.current;if(!el||!glow)return;
    const onMove=(e:MouseEvent)=>{const r=el.getBoundingClientRect();glow.style.transform=`translate(${e.clientX-r.left-150}px,${e.clientY-r.top-150}px)`;glow.style.opacity="1";};
    const onLeave=()=>{glow.style.opacity="0";};
    el.addEventListener("mousemove",onMove);el.addEventListener("mouseleave",onLeave);
    return()=>{el.removeEventListener("mousemove",onMove);el.removeEventListener("mouseleave",onLeave);};
  },[]);
  return(
    <div ref={ref} className={`glow-card${className?" "+className:""}`} style={style}>
      <div ref={glowRef} style={{position:"absolute",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(212,180,131,0.12) 0%,transparent 70%)",pointerEvents:"none",opacity:0,transition:"opacity 0.35s",zIndex:0,top:0,left:0}}/>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
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

  const [navVisible,setNavVisible]=useState(true);
  const lastScrollY=useRef(0);
  useEffect(()=>{
    const onScroll=()=>{const y=window.scrollY;setNavVisible(y<80||y<lastScrollY.current);lastScrollY.current=y;};
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);

  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  useEffect(()=>{setLaser(k=>k+1);},[]);
  useEffect(()=>{try{const v=localStorage.getItem("valtiq-cookie");setCookieConsent(v==="1");}catch{setCookieConsent(false);}},[]);
  const acceptCookies=useCallback(()=>{try{localStorage.setItem("valtiq-cookie","1");}catch{}setCookieConsent(true);},[]);
  useEffect(()=>{if(phase!=="content")return;const id=setInterval(()=>setAppS(s=>(s+1)%6),2600);return()=>clearInterval(id);},[phase]);
  useEffect(()=>{
    const T:ReturnType<typeof setTimeout>[]=[];
    T.push(setTimeout(()=>setPhase("exterior"),2200));
    T.push(setTimeout(()=>setPhase("scanning"),4800));
    T.push(setTimeout(()=>{setPhase("opening");setOpen(true);},6800));
    T.push(setTimeout(()=>setExit(true),7600));
    T.push(setTimeout(()=>setPhase("content"),8400));
    return()=>T.forEach(clearTimeout);
  },[]);
  const skip=useCallback(()=>{setExit(true);setTimeout(()=>setPhase("content"),700);},[]);

  /* hero line reveals — only play when content phase starts */
  const isContent=phase==="content";

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <a href="#main" className="sk">{t.skipNav}</a>

      {/* ══════════════ CINEMATIC INTRO ════════════════════════════════════ */}
      {phase!=="content"&&(
        <div className={`fixed inset-0 z-50 ${exit?"intro-out":""}`}>
          {phase!=="splash"&&(
            <button type="button" onClick={skip} style={{position:"absolute",top:"24px",right:"24px",zIndex:60,fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.5)",fontWeight:500,cursor:"pointer"}}>{t.skip} →</button>
          )}
          {phase==="splash"&&(
            <div style={{position:"absolute",inset:0,background:"#050B17",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 50% 40% at 50% 50%,rgba(212,180,131,0.06),transparent 70%)"}}/>
              <div className="logo-emerge" style={{textAlign:"center"}}>
                <Image src="/logo-valtiqstay.png" alt="ValtiqStay" width={420} height={300} priority style={{width:"clamp(220px,30vw,380px)",height:"auto"}}/>
              </div>
              <div className="tl-in" style={{animationDelay:"1.6s",opacity:0,textAlign:"center",marginTop:"16px"}}>
                <div style={{height:"1px",width:"60px",margin:"0 auto 14px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.4),transparent)"}}/>
                <div style={{fontSize:"10px",letterSpacing:"0.3em",color:"rgba(212,180,131,0.35)",textTransform:"uppercase"}}>{t.tagline}</div>
              </div>
            </div>
          )}
          {phase==="exterior"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              <video autoPlay muted playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center"}} poster="/images/aureum-doors.jpg">
                <source src="/videos/aureum-approach.mp4" type="video/mp4"/>
              </video>
              <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(5,11,23,0.08),rgba(5,11,23,0.04) 70%,rgba(5,11,23,0.15))"}}/>
            </div>
          )}
          {phase==="scanning"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              <Image src="/images/aureum-doors.jpg" alt="" fill className="object-cover object-center" quality={92} sizes="100vw" priority/>
              <div style={{position:"absolute",inset:0,background:"rgba(5,11,23,0.55)",zIndex:1}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                <div className="panel-in">
                  <div style={{padding:"28px 32px",borderRadius:"20px",textAlign:"center",background:"rgba(250,248,244,0.92)",border:"1.5px solid rgba(212,180,131,0.45)",backdropFilter:"blur(24px)",boxShadow:"0 32px 80px rgba(5,11,23,0.35)"}}>
                    {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([p,b],i)=>(
                      <div key={i} className={`absolute ${p} w-5 h-5 ${b}`} style={{borderColor:"#D4B483"}}/>
                    ))}
                    <div style={{fontSize:"9px",letterSpacing:"0.55em",color:"rgba(10,25,49,0.4)",textTransform:"uppercase",marginBottom:"20px"}}>{t.scanSub}</div>
                    <div style={{position:"relative",display:"inline-block",padding:"12px",borderRadius:"12px",background:"rgba(10,25,49,0.04)",border:"1px solid rgba(212,180,131,0.15)"}}>
                      <QRCode size={152}/>
                      <div key={laser} style={{position:"absolute",left:"12px",right:"12px",height:"2px",top:"12px",background:"linear-gradient(90deg,transparent,#D4B483,#FFF0C8,#D4B483,transparent)",boxShadow:"0 0 12px #D4B483,0 0 24px rgba(212,180,131,0.4)",animation:"laser 1.1s ease-in-out 3"}}/>
                    </div>
                    <div style={{fontSize:"12px",color:"rgba(10,25,49,0.45)",letterSpacing:"0.1em",marginTop:"16px"}}>{t.scanLabel}</div>
                    <div style={{display:"flex",gap:"8px",justifyContent:"center",marginTop:"12px"}}>
                      {[0,1,2].map(i=>(<div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#D4B483",animation:`blink 1.3s ease ${i*.2}s infinite`}}/>))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {phase==="opening"&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#050B17 0%,#0A1931 50%,#050B17 100%)"}}/>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 40% 50% at 50% 50%,rgba(212,180,131,0.06),transparent 70%)",opacity:open?1:0,transition:"opacity 1s ease"}}/>
              <HotelDoors open={open}/>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ MAIN CONTENT ════════════════════════════════════════ */}
      <main id="main" style={{background:"transparent"}} className="text-[#F5E9D3] min-h-screen">
        <CustomCursor/>
        <StarField/>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <motion.nav
          animate={{y:navVisible?0:-80,opacity:navVisible?1:0}}
          transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
          style={{position:"fixed",top:"16px",left:"20px",right:"20px",zIndex:40,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderRadius:"9999px",background:"rgba(5,11,23,0.85)",backdropFilter:"blur(24px)",border:"1px solid rgba(212,180,131,0.1)"}}>
          <Logo light/>
          <div className="nav-desktop" style={{gap:"28px",alignItems:"center"}}>
            {t.nav.map((item,i)=>(
              <a key={i} href={["#aureum","#solution","#how","#eco"][i]}
                style={{fontSize:"11px",letterSpacing:"0.32em",textTransform:"uppercase",color:"rgba(212,180,131,0.45)",textDecoration:"none",transition:"color 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.color="#D4B483")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.45)")}>
                {item}
              </a>
            ))}
          </div>
          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
            <button type="button" className="nav-lang-btn bgh" onClick={()=>setLang(lang==="it"?"en":"it")} style={{fontSize:"10px",letterSpacing:"0.35em",textTransform:"uppercase",border:"1px solid rgba(212,180,131,0.18)",borderRadius:"100px",padding:"8px 16px",color:"rgba(212,180,131,0.45)",cursor:"pointer",background:"transparent"}}>
              {lang==="it"?"EN":"IT"}
            </button>
            <button type="button" onClick={()=>setShowModal(true)} className="nav-demo-btn bg_" style={{borderRadius:"100px",padding:"10px 22px",background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",fontSize:"11px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",color:"#0A1931",border:"none",cursor:"pointer"}}>
              {t.demoBtn}
            </button>
            <button type="button" className="nav-ham" onClick={()=>setMob(!mob)} aria-label={mob?t.closeMenu:t.openMenu} aria-expanded={mob} style={{alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"8px",border:"1px solid rgba(212,180,131,0.2)",background:"transparent",cursor:"pointer",color:"rgba(212,180,131,0.7)",flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {mob?<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>:<><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>}
              </svg>
            </button>
          </div>
        </motion.nav>

        {/* ── MOBILE MENU ──────────────────────────────────────────────────── */}
        {mob&&(
          <div className="mob-menu" style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:50,background:"rgba(5,11,23,0.98)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid rgba(212,180,131,0.08)"}}>
              <Logo light/>
              <button type="button" onClick={()=>setMob(false)} aria-label={t.closeMenu} style={{display:"flex",alignItems:"center",justifyContent:"center",width:"40px",height:"40px",borderRadius:"8px",border:"1px solid rgba(212,180,131,0.2)",background:"transparent",cursor:"pointer",color:"rgba(212,180,131,0.7)"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 32px"}}>
              {t.nav.map((item,i)=>(
                <a key={i} href={["#aureum","#solution","#how","#eco"][i]} className="mob-link" onClick={()=>setMob(false)}>{item}</a>
              ))}
            </div>
            <div style={{padding:"24px 32px 40px",display:"flex",flexDirection:"column",gap:"12px"}}>
              <button type="button" onClick={()=>{setShowModal(true);setMob(false);}} className="bg_" style={{display:"flex",justifyContent:"center",borderRadius:"100px",padding:"16px",background:"linear-gradient(135deg,#D4B483,#C9A065,#D4B483)",fontSize:"12px",fontWeight:600,letterSpacing:"0.3em",textTransform:"uppercase",color:"#0A1931",border:"none",cursor:"pointer"}}>{t.demoBtn}</button>
              <button type="button" onClick={()=>{setLang(lang==="it"?"en":"it");setMob(false);}} className="bgh" style={{borderRadius:"100px",padding:"13px",border:"1px solid rgba(212,180,131,0.2)",fontSize:"11px",letterSpacing:"0.35em",textTransform:"uppercase",color:"rgba(212,180,131,0.5)",background:"transparent",cursor:"pointer"}}>
                {lang==="it"?"Switch to English":"Passa all'Italiano"}
              </button>
            </div>
          </div>
        )}

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <PhotoBg src="/images/aureum-exterior.jpg"
          overlay="linear-gradient(to right,rgba(5,11,23,0.92) 0%,rgba(10,25,49,0.78) 55%,rgba(5,11,23,0.6) 100%)"
          className="min-h-screen flex items-center pt-40 pb-32 px-6" id="aureum">
          {/* Grid overlay */}
          <div className="grid-ov" aria-hidden="true"/>
          <div className="mx-auto max-w-6xl w-full">
            {/* Badge */}
            <motion.div
              initial={{opacity:0,y:20}}
              animate={{opacity:isContent?1:0,y:isContent?0:20}}
              transition={{duration:0.7,delay:0.15,ease:[0.22,1,0.36,1]}}
              style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 18px",borderRadius:"100px",border:"1px solid rgba(212,180,131,0.2)",background:"rgba(212,180,131,0.06)",marginBottom:"40px"}}
            >
              <span className="badge-ping" style={{width:"6px",height:"6px",borderRadius:"50%",background:"#D4B483",flexShrink:0}}/>
              <span style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)"}}>{t.heroTag}</span>
            </motion.div>

            {/* H1 — line-by-line reveal */}
            <h1 className="hd" style={{fontSize:"clamp(44px,8vw,106px)",fontWeight:200,lineHeight:0.95,letterSpacing:"-0.03em",color:"#F5E9D3",maxWidth:"860px",marginBottom:"28px"}}>
              {(lang==="it"
                ?[["Il sistema"],["operativo dell'"],["ospitalità."]]
                :[ ["The Operating"],["System for"],["Hospitality."]]
              ).map((line,li)=>(
                <span key={li} style={{display:"block",overflow:"hidden",lineHeight:1.05}}>
                  <motion.span
                    initial={{y:"105%"}}
                    animate={{y:isContent?"0%":"105%"}}
                    transition={{duration:0.9,delay:0.25+li*0.14,ease:[0.22,1,0.36,1]}}
                    style={{display:"block",color:li===2?"#D4B483":"#F5E9D3",fontStyle:li===2?"italic":"normal"}}
                  >
                    {line[0]}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <motion.p
              initial={{opacity:0,y:24}}
              animate={{opacity:isContent?1:0,y:isContent?0:24}}
              transition={{duration:0.8,delay:0.72,ease:[0.22,1,0.36,1]}}
              style={{maxWidth:"440px",fontSize:"15px",lineHeight:1.9,color:"rgba(245,233,211,0.68)",marginBottom:"44px"}}
            >
              {t.heroText}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{opacity:0,y:24}}
              animate={{opacity:isContent?1:0,y:isContent?0:24}}
              transition={{duration:0.8,delay:0.88,ease:[0.22,1,0.36,1]}}
              style={{display:"flex",flexWrap:"wrap",gap:"14px",alignItems:"center",marginBottom:"56px"}}
            >
              <MagneticButton onClick={()=>setShowModal(true)} className="cta-s bg_">{t.demoBtn}</MagneticButton>
              <MagneticButton
                className="bgh"
                style={{borderRadius:"100px",padding:"16px 36px",border:"1px solid rgba(212,180,131,0.2)",fontSize:"11px",fontWeight:500,letterSpacing:"0.35em",textTransform:"uppercase",color:"rgba(212,180,131,0.55)",background:"transparent"}}
                onClick={()=>{const el=document.getElementById("solution");if(el)el.scrollIntoView({behavior:"smooth"});}}
              >
                {t.partnerBtn}
              </MagneticButton>
            </motion.div>

            {/* Metrics bar */}
            <motion.div
              initial={{opacity:0,y:30}}
              animate={{opacity:isContent?1:0,y:isContent?0:30}}
              transition={{duration:0.8,delay:1.05,ease:[0.22,1,0.36,1]}}
              style={{display:"inline-flex",borderRadius:"20px",padding:"22px 4px",background:"rgba(5,11,23,0.7)",border:"1px solid rgba(212,180,131,0.1)",backdropFilter:"blur(20px)"}}
            >
              {[["-70%","check-in time"],["1 QR","to access"],["100%","guest control"]].map(([v,l],i)=>(
                <div key={i} style={{textAlign:"center",padding:"0 32px",borderRight:i<2?"1px solid rgba(212,180,131,0.1)":"none"}}>
                  <div style={{fontSize:"clamp(22px,3vw,34px)",fontWeight:600,color:"#F5E9D3",letterSpacing:"-0.02em"}}>{v}</div>
                  <div style={{fontSize:"9px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.4)",marginTop:"6px"}}>{l}</div>
                </div>
              ))}
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{opacity:0}}
              animate={{opacity:isContent?1:0}}
              transition={{duration:1,delay:1.5}}
              style={{marginTop:"48px",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"8px"}}
            >
              <span style={{fontSize:"9px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.25)"}}>{t.scrollDown}</span>
              <svg className="scroll-chev" width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
                <path d="M1 1l9 9 9-9" stroke="rgba(212,180,131,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </PhotoBg>

        {/* ── PMS LOGOS ────────────────────────────────────────────────────── */}
        <section style={{background:"#0A1931",padding:"44px 24px",borderTop:"1px solid rgba(212,180,131,0.06)"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <p style={{textAlign:"center",fontSize:"9px",letterSpacing:"0.55em",textTransform:"uppercase",color:"rgba(212,180,131,0.25)",marginBottom:"28px"}}>{t.pmsTitle}</p>
            <LogoMarquee/>
          </div>
        </section>

        {/* ── MANIFESTO ────────────────────────────────────────────────────── */}
        <section style={{background:"#050B17",padding:"140px 24px",position:"relative",overflow:"hidden"}}>
          <div aria-hidden="true" style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(212,180,131,0.03),transparent 70%)"}}/>
          <div style={{maxWidth:"860px",margin:"0 auto",textAlign:"center",position:"relative"}}>
            <motion.div
              initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
              transition={{duration:1.2,ease:[0.22,1,0.36,1]}}
              style={{height:"1px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)",marginBottom:"60px",transformOrigin:"left"}}
            />
            <motion.blockquote
              className="hd"
              initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
              viewport={{once:true,margin:"-80px"}}
              transition={{duration:1.1,ease:[0.22,1,0.36,1]}}
              style={{fontSize:"clamp(26px,4vw,58px)",fontWeight:300,fontStyle:"italic",lineHeight:1.2,color:"#F5E9D3",letterSpacing:"-0.02em",border:"none",margin:0,padding:0}}
            >
              {t.manifesto}
            </motion.blockquote>
            <motion.p
              initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
              transition={{duration:0.8,delay:0.4}}
              style={{marginTop:"40px",fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)"}}
            >
              VALTIQSTAY · 2025
            </motion.p>
            <motion.div
              initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
              transition={{duration:1.2,delay:0.25,ease:[0.22,1,0.36,1]}}
              style={{height:"1px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.2),transparent)",marginTop:"60px",transformOrigin:"right"}}
            />
          </div>
        </section>

        {/* ── PROBLEM / SOLUTION ───────────────────────────────────────────── */}
        <section id="solution" style={{background:"#0A1931",padding:"120px 24px"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:"32px",marginBottom:"80px"}}>
              <div>
                <motion.p
                  initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{duration:0.7}}
                  style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.6)",marginBottom:"20px"}}
                >
                  {t.problemEyebrow}
                </motion.p>
                <motion.h2
                  className="hd"
                  initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
                  style={{fontSize:"clamp(30px,4vw,54px)",fontWeight:300,lineHeight:1.1,color:"#F5E9D3",letterSpacing:"-0.02em",maxWidth:"500px"}}
                >
                  {t.problemTitle}
                </motion.h2>
              </div>
              <motion.div
                initial={{opacity:0,scaleX:0}} whileInView={{opacity:1,scaleX:1}} viewport={{once:true}}
                transition={{duration:1.1,ease:[0.22,1,0.36,1]}}
                style={{height:"1px",width:"100px",background:"linear-gradient(to right,#D4B483,transparent)",transformOrigin:"left",flexShrink:0}}
              />
            </div>
            {/* Editorial numbered cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"2px"}}>
              {t.problemItems.map((item,i)=>(
                <motion.div
                  key={i}
                  initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
                  viewport={{once:true,margin:"-40px"}}
                  transition={{duration:0.8,delay:i*0.1,ease:[0.22,1,0.36,1]}}
                >
                  <GlowCard style={{padding:"44px 32px 36px",height:"100%",minHeight:"200px"}}>
                    <div className="ed-num">0{i+1}</div>
                    <div style={{height:"1px",width:"28px",background:"rgba(212,180,131,0.3)",marginBottom:"20px"}}/>
                    <div style={{fontSize:"clamp(22px,2.8vw,30px)",fontWeight:300,color:"#F5E9D3",letterSpacing:"-0.02em",marginBottom:"10px",lineHeight:1.15}}>{item.t}</div>
                    <div style={{fontSize:"12px",color:"rgba(212,180,131,0.45)",lineHeight:1.75}}>{item.s}</div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRANSFORMATION ───────────────────────────────────────────────── */}
        <section style={{background:"#050B17",padding:"120px 24px",position:"relative",overflow:"hidden"}}>
          {/* Ghosted word */}
          <div aria-hidden="true" style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",fontSize:"clamp(60px,14vw,200px)",fontWeight:700,fontFamily:"var(--font-cormorant,'Cormorant Garamond',Georgia,serif)",color:"transparent",WebkitTextStroke:"1px rgba(212,180,131,0.025)",whiteSpace:"nowrap",pointerEvents:"none",userSelect:"none",letterSpacing:"0.06em"}}>
            {lang==="it"?"TRASFORMAZIONE":"TRANSFORMATION"}
          </div>
          <div style={{maxWidth:"960px",margin:"0 auto",textAlign:"center",position:"relative"}}>
            <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}}
              style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.6)",marginBottom:"20px"}}>
              {t.transEyebrow}
            </motion.p>
            <motion.h2 className="hd"
              initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
              style={{fontSize:"clamp(32px,5vw,68px)",fontWeight:300,lineHeight:1.08,color:"#F5E9D3",letterSpacing:"-0.02em",whiteSpace:"pre-line",marginBottom:"24px"}}>
              {t.transTitle}
            </motion.h2>
            <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.1,ease:[0.22,1,0.36,1]}}
              style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)",margin:"0 auto 24px",transformOrigin:"left"}}/>
            <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,delay:0.2}}
              style={{fontSize:"16px",color:"rgba(245,233,211,0.65)",lineHeight:1.85,marginBottom:"72px"}}>
              {t.transSub}
            </motion.p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"2px",position:"relative"}}>
              {[
                {n:"01",t:lang==="it"?"L'ospite arriva":"Guest arrives",s:lang==="it"?"Identità già verificata":"Identity already verified"},
                {n:"02",t:lang==="it"?"QR scansionato":"QR scanned",s:lang==="it"?"Check-in immediato":"Instant check-in"},
                {n:"03",t:lang==="it"?"Accesso garantito":"Access granted",s:lang==="it"?"Esperienza superiore":"Superior experience"},
              ].map((p,i)=>(
                <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:i*0.12,ease:[0.22,1,0.36,1]}}>
                  <GlowCard style={{padding:"36px 28px",textAlign:"center"}}>
                    <div style={{fontSize:"10px",letterSpacing:"0.4em",color:"rgba(212,180,131,0.25)",textTransform:"uppercase",marginBottom:"18px"}}>{p.n}</div>
                    <div className="sp mx-auto mb-4" style={{width:"56px",height:"56px",borderRadius:"50%",border:"1px solid rgba(212,180,131,0.25)",background:"rgba(212,180,131,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:200,color:"#D4B483",animationDelay:`${i*.7}s`}}>
                      {p.n}
                    </div>
                    <div style={{fontSize:"16px",fontWeight:400,color:"#F5E9D3",marginBottom:"8px",letterSpacing:"-0.01em"}}>{p.t}</div>
                    <div style={{height:"1px",width:"24px",background:"rgba(212,180,131,0.25)",margin:"0 auto 10px"}}/>
                    <div style={{fontSize:"12px",color:"rgba(212,180,131,0.4)",lineHeight:1.7}}>{p.s}</div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <GoldDivider/>

        {/* ── APP ──────────────────────────────────────────────────────────── */}
        <PhotoBg src="/images/interior-chandelier.jpg"
          overlay="linear-gradient(to right,rgba(5,11,23,0.96),rgba(10,25,49,0.9) 60%,rgba(5,11,23,0.88))"
          className="py-36 px-6">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p data-reveal="" style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>{t.appEyebrow}</p>
              <h2 data-reveal="" data-delay="1" className="hd" style={{fontSize:"clamp(34px,5vw,64px)",fontWeight:300,lineHeight:1.1,color:"#F5E9D3",letterSpacing:"-0.02em",whiteSpace:"pre-line",marginBottom:"24px"}}>{t.appTitle}</h2>
              <div data-reveal="" data-delay="2" style={{height:"1px",width:"48px",background:"linear-gradient(to right,#D4B483,transparent)",marginBottom:"32px"}}/>
              <div data-reveal="" data-delay="3" style={{display:"grid",gap:"6px"}}>
                {t.appItems.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"14px",padding:"11px 14px",borderRadius:"10px",cursor:"pointer",transition:"all 0.2s",background:appS===i?"rgba(212,180,131,0.08)":"transparent",border:`1px solid ${appS===i?"rgba(212,180,131,0.2)":"transparent"}`}}>
                    <div style={{width:"6px",height:"6px",borderRadius:"50%",background:appS===i?"#D4B483":"rgba(212,180,131,0.2)",flexShrink:0}}/>
                    <span style={{fontSize:"13px",color:appS===i?"#F5E9D3":"rgba(245,233,211,0.3)"}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal="" data-delay="1" style={{position:"relative"}}>
              {/* Ambient glow ring */}
              <div aria-hidden="true" style={{position:"absolute",left:"50%",top:"50%",width:"360px",height:"360px",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(212,180,131,0.14) 0%,transparent 70%)",pointerEvents:"none",animation:"ambient-pulse 4s ease-in-out infinite"}}/>
              <AppMockup screen={appS} lang={lang}/>
            </div>
          </div>
        </PhotoBg>

        <GoldDivider/>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how" style={{background:"#050B17",padding:"120px 24px"}}>
          <div style={{maxWidth:"1000px",margin:"0 auto",textAlign:"center"}}>
            <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}}
              style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.55)",marginBottom:"20px"}}>
              {t.receptionEyebrow}
            </motion.p>
            <motion.h2 className="hd"
              initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
              style={{fontSize:"clamp(36px,6vw,84px)",fontWeight:300,lineHeight:1.06,color:"#F5E9D3",letterSpacing:"-0.03em",whiteSpace:"pre-line",marginBottom:"20px"}}>
              {t.receptionTitle}
            </motion.h2>
            <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.1,ease:[0.22,1,0.36,1]}}
              style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)",margin:"0 auto 20px",transformOrigin:"left"}}/>
            <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,delay:0.15}}
              style={{fontSize:"16px",color:"rgba(245,233,211,0.65)",lineHeight:1.85,marginBottom:"0"}}>
              {t.receptionSub}
            </motion.p>
            <div className="steps-grid">
              {t.steps.map((step,i)=>(
                <motion.div key={step} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:i*0.1,ease:[0.22,1,0.36,1]}}>
                  <div className="sp mx-auto mb-5" style={{width:"64px",height:"64px",borderRadius:"50%",border:"1px solid rgba(212,180,131,0.3)",background:"rgba(212,180,131,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:200,color:"#D4B483",animationDelay:`${i*.7}s`}}>
                    0{i+1}
                  </div>
                  <p style={{fontSize:"12px",fontWeight:400,color:"rgba(245,233,211,0.65)",lineHeight:1.65}}>{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <GoldDivider/>

        {/* ── VIDEO SHOWCASE ───────────────────────────────────────────────── */}
        <section style={{background:"#050B17",padding:"100px 24px"}}>
          <div style={{maxWidth:"960px",margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:"56px"}}>
              <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}}
                style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.6)",marginBottom:"18px"}}>
                {t.videoEyebrow}
              </motion.p>
              <motion.h2 className="hd"
                initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
                style={{fontSize:"clamp(30px,4.5vw,60px)",fontWeight:300,lineHeight:1.1,color:"#F5E9D3",letterSpacing:"-0.03em",whiteSpace:"pre-line"}}>
                {t.videoTitle}
              </motion.h2>
            </div>
            <motion.div initial={{opacity:0,y:32,scale:0.98}} whileInView={{opacity:1,y:0,scale:1}} viewport={{once:true}}
              transition={{duration:1,delay:0.15,ease:[0.22,1,0.36,1]}}
              style={{position:"relative",borderRadius:"20px",overflow:"hidden",border:"1px solid rgba(212,180,131,0.12)",boxShadow:"0 40px 100px rgba(0,0,0,0.5)"}}>
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/aureum-exterior.jpg"
                style={{width:"100%",display:"block",borderRadius:"20px"}}
              >
                <source src="/videos/valtiqstay-explainer.mp4" type="video/mp4"/>
              </video>
              {/* Gold shimmer border top */}
              <div aria-hidden="true" style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)"}}/>
            </motion.div>
          </div>
        </section>

        <GoldDivider/>

        {/* ── ECOSYSTEM ────────────────────────────────────────────────────── */}
        <section id="eco" style={{background:"#0A1931",padding:"120px 24px"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:"72px"}}>
              <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}}
                style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.7)",marginBottom:"20px"}}>
                {t.ecoEyebrow}
              </motion.p>
              <motion.h2 className="hd"
                initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
                style={{fontSize:"clamp(32px,5vw,64px)",fontWeight:300,lineHeight:1.1,color:"#F5E9D3",whiteSpace:"pre-line",letterSpacing:"-0.02em"}}>
                {t.ecoTitle}
              </motion.h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"2px"}}>
              {t.ecoItems.map((item,i)=>(
                <motion.div key={item} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}}
                  transition={{duration:0.7,delay:(i%3)*0.1,ease:[0.22,1,0.36,1]}}>
                  <GlowCard style={{padding:"32px 28px",height:"100%"}}>
                    <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"rgba(212,180,131,0.07)",border:"1px solid rgba(212,180,131,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"20px"}}>
                      <EcoIcon i={i}/>
                    </div>
                    <div style={{fontSize:"15px",fontWeight:500,color:"#F5E9D3",letterSpacing:"0.02em",marginBottom:"8px"}}>{item}</div>
                    <div style={{fontSize:"11px",color:"rgba(212,180,131,0.4)",lineHeight:1.7}}>{t.ecoDescs[i]}</div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <GoldDivider/>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section style={{background:"#050B17",padding:"120px 24px"}}>
          <div style={{maxWidth:"1152px",margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:"72px"}}>
              <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.7}}
                style={{fontSize:"10px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.6)",marginBottom:"20px"}}>
                {t.socialProofEyebrow}
              </motion.p>
              <motion.h2 className="hd"
                initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{duration:0.9,delay:0.1,ease:[0.22,1,0.36,1]}}
                style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:300,lineHeight:1.15,color:"#F5E9D3",letterSpacing:"-0.02em",maxWidth:"640px",margin:"0 auto"}}>
                {t.socialProofTitle}
              </motion.h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"2px"}}>
              {t.testimonials.map((item,i)=>(
                <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}}
                  transition={{duration:0.8,delay:i*0.1,ease:[0.22,1,0.36,1]}}>
                  <GlowCard className="tcard-v2" style={{height:"100%"}}>
                    {/* Quote mark */}
                    <div className="hd" style={{fontSize:"64px",lineHeight:0.8,color:"rgba(212,180,131,0.15)",marginBottom:"20px",fontStyle:"italic"}}>&ldquo;</div>
                    <p style={{fontSize:"14px",lineHeight:1.85,color:"rgba(245,233,211,0.72)",marginBottom:"32px"}}>{item.q}</p>
                    <div style={{borderTop:"1px solid rgba(212,180,131,0.08)",paddingTop:"20px"}}>
                      <div style={{fontSize:"13px",fontWeight:500,color:"#F5E9D3",marginBottom:"4px"}}>{item.name}</div>
                      <div style={{fontSize:"11px",color:"rgba(212,180,131,0.45)",letterSpacing:"0.05em"}}>{item.role}</div>
                      <div style={{fontSize:"11px",color:"rgba(212,180,131,0.3)",marginTop:"2px",letterSpacing:"0.03em"}}>{item.hotel}</div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <GoldDivider/>

        {/* ── FINALE ───────────────────────────────────────────────────────── */}
        <PhotoBg src="/images/aureum-alpine.jpg"
          overlay="linear-gradient(to bottom,rgba(5,11,23,0.94),rgba(5,11,23,0.97))"
          className="min-h-screen flex flex-col items-center justify-center px-6 py-32 text-center">
          <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
            transition={{duration:1.2,ease:[0.22,1,0.36,1]}}
            style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,#D4B483,transparent)",marginBottom:"56px",transformOrigin:"left"}}/>

          <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{duration:1,delay:0.1,ease:[0.22,1,0.36,1]}}>
            <div className="hd" style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,lineHeight:1.06,color:"#FAF8F4",letterSpacing:"-0.02em"}}>{t.f1}</div>
            <div className="hd" style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,lineHeight:1.06,color:"#FAF8F4",letterSpacing:"-0.02em"}}>{t.f2}</div>
            <div className="hd" style={{fontSize:"clamp(36px,6vw,80px)",fontWeight:300,fontStyle:"italic",lineHeight:1.06,color:"#D4B483",letterSpacing:"-0.02em"}}>{t.f3}</div>
          </motion.div>

          <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
            transition={{duration:1.1,delay:0.2,ease:[0.22,1,0.36,1]}}
            style={{height:"1px",width:"100px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.3),transparent)",margin:"36px auto"}}/>

          <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.8,delay:0.3}}
            style={{fontSize:"10px",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(212,180,131,0.35)",marginBottom:"44px"}}>
            {t.finalSub}
          </motion.p>

          {/* Trust badges */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,delay:0.35}}
            style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center",marginBottom:"40px"}}>
            {[
              {label:"GDPR Compliant",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>},
              {label:"End-to-End Encrypted",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>},
              {label:"SOC 2 Ready",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 16px",borderRadius:"100px",background:"rgba(212,180,131,0.05)",border:"1px solid rgba(212,180,131,0.12)",color:"rgba(212,180,131,0.5)"}}>
                {b.icon}
                <span style={{fontSize:"9px",letterSpacing:"0.25em",textTransform:"uppercase"}}>{b.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,delay:0.45}}
            style={{display:"flex",flexWrap:"wrap",gap:"16px",justifyContent:"center"}}>
            <MagneticButton onClick={()=>setShowModal(true)} className="cta-s bg_">{t.demoBtn}</MagneticButton>
            <MagneticButton
              className="bgh"
              style={{borderRadius:"100px",padding:"16px 36px",border:"1px solid rgba(212,180,131,0.2)",fontSize:"11px",fontWeight:500,letterSpacing:"0.35em",textTransform:"uppercase",color:"rgba(212,180,131,0.5)",background:"transparent"}}
              onClick={()=>setShowModal(true)}
            >
              {t.partnerBtn}
            </MagneticButton>
          </motion.div>

          <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
            transition={{duration:1.1,delay:0.5,ease:[0.22,1,0.36,1]}}
            style={{height:"1px",width:"80px",background:"linear-gradient(90deg,transparent,rgba(212,180,131,0.2),transparent)",marginTop:"56px",transformOrigin:"left"}}/>
        </PhotoBg>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{borderTop:"1px solid rgba(212,180,131,0.07)",background:"#050B17",padding:"60px 24px 40px",position:"relative",overflow:"hidden"}}>
          <div aria-hidden="true" className="fghost">VALTIQSTAY</div>
          <div style={{maxWidth:"1152px",margin:"0 auto",position:"relative",zIndex:1}}>
            {/* Top row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"40px",marginBottom:"48px",flexWrap:"wrap"}}>
              {/* Brand col */}
              <div>
                <Logo light/>
                <p style={{fontSize:"11px",color:"rgba(212,180,131,0.28)",lineHeight:1.75,marginTop:"16px",maxWidth:"220px"}}>
                  {lang==="it"?"Il sistema operativo per l'ospitalità moderna.":"The operating system for modern hospitality."}
                </p>
              </div>
              {/* Links col 1 */}
              <div>
                <div style={{fontSize:"9px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)",marginBottom:"20px"}}>
                  {lang==="it"?"PIATTAFORMA":"PLATFORM"}
                </div>
                {[
                  [lang==="it"?"Soluzione":"Solution","#solution"],
                  [lang==="it"?"Come funziona":"How it works","#how"],
                  [lang==="it"?"Ecosistema":"Ecosystem","#eco"],
                ].map(([l,h])=>(
                  <a key={l} href={h} style={{display:"block",fontSize:"11px",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)",textDecoration:"none",marginBottom:"12px",transition:"color 0.2s"}}
                    onMouseEnter={e=>(e.currentTarget.style.color="rgba(212,180,131,0.7)")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.3)")}>{l}</a>
                ))}
              </div>
              {/* Links col 2 */}
              <div>
                <div style={{fontSize:"9px",letterSpacing:"0.5em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)",marginBottom:"20px"}}>
                  {lang==="it"?"AZIENDA":"COMPANY"}
                </div>
                {[
                  ["Contact","mailto:alisamaffei@valtiqstay.com"],
                  [t.privacyLabel,"/privacy"],
                  [t.linkedinLabel,"https://www.linkedin.com/company/valtiqstay"],
                ].map(([l,h])=>(
                  <a key={l} href={h} style={{display:"block",fontSize:"11px",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(212,180,131,0.3)",textDecoration:"none",marginBottom:"12px",transition:"color 0.2s"}}
                    onMouseEnter={e=>(e.currentTarget.style.color="rgba(212,180,131,0.7)")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(212,180,131,0.3)")}
                    target={h.startsWith("http")?"_blank":undefined}
                    rel={h.startsWith("http")?"noopener noreferrer":undefined}>{l}</a>
                ))}
              </div>
            </div>
            {/* Bottom row */}
            <div style={{borderTop:"1px solid rgba(212,180,131,0.05)",paddingTop:"24px",display:"flex",flexWrap:"wrap",gap:"16px",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"10px",color:"rgba(212,180,131,0.2)",margin:0,letterSpacing:"0.05em"}}>{t.footerLegal}</p>
              <VLogo size={28}/>
            </div>
          </div>
        </footer>

      </main>

      {showModal&&<DemoModal t={t} onClose={()=>setShowModal(false)}/>}
      {cookieConsent===false&&<CookieBanner t={t} onAccept={acceptCookies}/>}
    </>
  );
}
