"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type Phase = "exterior" | "scanning" | "verified" | "opening" | "content";
type Lang  = "it" | "en";

/* ─── Copy ───────────────────────────────────────────────────────────────── */
const copy = {
  it: {
    nav: ["Soluzione", "Come funziona", "Dashboard", "PMS"],
    hotelName: "GRAND HOTEL VERONA",
    scanSub: "SECURE ACCESS TERMINAL",
    scanLabel: "Avvicina il tuo QR all'ingresso",
    verified: "IDENTITÀ VERIFICATA",
    verifiedSub: "Accesso autorizzato — benvenuto",
    heroEyebrow: "Trust • Identity • Connection",
    heroTitle: "Identità digitale verificata per",
    heroHighlight: "l'ospitalità moderna.",
    heroText: "Riduci i tempi di check-in, verifica l'identità degli ospiti e raccogli il consenso ai dati in pochi secondi.",
    demo: "Richiedi una Demo",
    discover: "Scopri come funziona",
    problemEyebrow: "Il problema",
    problemTitle: "Il check-in tradizionale non è più all'altezza dell'ospitalità moderna.",
    problemText: "Documenti raccolti manualmente, dati inseriti a mano e procedure lente riducono l'efficienza della reception e peggiorano l'esperienza ospite.",
    solutionEyebrow: "La soluzione",
    feat1Title: "Passaporto Digitale",
    feat1Text: "L'ospite conserva documenti e dati in un profilo digitale sicuro.",
    feat2Title: "QR con consenso ospite",
    feat2Text: "L'hotel accede ai dati solo dopo conferma esplicita dell'ospite.",
    feat3Title: "Integrazione PMS",
    feat3Text: "Progettato per integrarsi con i software già usati dagli hotel.",
    howEyebrow: "Come funziona",
    howTitle: "Un flusso sicuro progettato per hotel, ospiti e strutture ricettive.",
    steps: ["L'ospite crea il proprio profilo verificato","La struttura conferma la prenotazione","Il QR abilita il check-in","L'ospite approva la condivisione dei dati"],
    dashEyebrow: "Dashboard Hotel",
    dashTitle: "Gestisci arrivi, identità e check-in da una vista chiara.",
    dashSub: "Una dashboard pensata per ridurre il lavoro manuale della reception e rendere più chiara la gestione degli arrivi.",
    pmsEyebrow: "PMS Integration",
    pmsTitle: "Pensato per integrarsi con i sistemi già utilizzati dagli hotel.",
    ctaEyebrow: "ValtiqStay Demo",
    ctaTitle: "Porta un check-in premium nel tuo hotel.",
    ctaText: "Una piattaforma progettata per hotel, gruppi alberghieri e strutture ricettive che vogliono digitalizzare il check-in.",
    ctaBtn: "Richiedi una Demo",
    skip: "Salta intro",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    skipNav: "Salta al contenuto principale",
    problemItems: ["Check-in manuale: 8–12 minuti","Documenti cartacei e dati duplicati","Errori di inserimento alla reception","Nessun consenso esplicito ai dati"],
  },
  en: {
    nav: ["Solution", "How it works", "Dashboard", "PMS"],
    hotelName: "GRAND HOTEL VERONA",
    scanSub: "SECURE ACCESS TERMINAL",
    scanLabel: "Hold your QR to the reader",
    verified: "IDENTITY VERIFIED",
    verifiedSub: "Access granted — welcome",
    heroEyebrow: "Trust • Identity • Connection",
    heroTitle: "Trusted guest identity for",
    heroHighlight: "modern hospitality.",
    heroText: "Reduce check-in time, verify guest identity and collect data consent in seconds.",
    demo: "Request a Demo",
    discover: "See how it works",
    problemEyebrow: "The problem",
    problemTitle: "Traditional check-in no longer matches modern hospitality.",
    problemText: "Manual document collection, repetitive data entry and slow front-desk procedures reduce efficiency and weaken the guest experience.",
    solutionEyebrow: "The solution",
    feat1Title: "Digital Passport",
    feat1Text: "Guests securely store identity data in one verified profile.",
    feat2Title: "Consent-Based QR",
    feat2Text: "Hotels access guest data only after explicit guest approval.",
    feat3Title: "PMS Ready",
    feat3Text: "Designed to integrate with existing hotel management systems.",
    howEyebrow: "How it works",
    howTitle: "A secure flow designed for hotel reception teams.",
    steps: ["Guest creates a verified profile","Hotel confirms reservation","QR unlocks check-in","Guest approves data sharing"],
    dashEyebrow: "Hotel Dashboard",
    dashTitle: "Manage arrivals, identity and check-in from one clear view.",
    dashSub: "A dashboard designed to reduce manual work at reception and make arrival management clearer.",
    pmsEyebrow: "PMS Integration",
    pmsTitle: "Designed to integrate with systems already used by hotels.",
    ctaEyebrow: "ValtiqStay Demo",
    ctaTitle: "Bring premium digital check-in to your hotel.",
    ctaText: "A platform for hotels, hospitality groups and premium properties that want to digitalize check-in.",
    ctaBtn: "Request a Demo",
    skip: "Skip intro",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skipNav: "Skip to main content",
    problemItems: ["Manual check-in: 8–12 minutes","Paper documents and duplicated data","Front-desk data entry errors","No explicit data consent"],
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
  ["-70%", "tempo al check-in",    "check-in time" ],
  ["1 QR", "per condividere dati", "to share data" ],
  ["100%", "controllo ospite",     "guest control" ],
];

/* ─── Palette ─────────────────────────────────────────────────────────────
   Navy    #172033  │  Gold     #C9A65C  │  Champagne  #D8C49A
   Ivory   #FAF8F4  │  White    #FFFFFF  │  Border     #E8E0D2
   Text    #172033  │  Muted    #64748B  │  Gold light #E8C57A
────────────────────────────────────────────────────────────────────────── */

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const STYLES = `
  /* Hotel approach zoom */
  @keyframes approach {
    0%   { transform: scale(1)    translateY(0); }
    100% { transform: scale(1.45) translateY(-2%); }
  }
  .scene-zoom { animation: approach 4s cubic-bezier(0.25,0.1,0.25,1) forwards; }

  /* Intro fade out */
  @keyframes intro-out { from{opacity:1} to{opacity:0;pointer-events:none} }
  .intro-exit { animation: intro-out 0.9s ease forwards; }

  /* QR panel slide in */
  @keyframes panel-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .panel-in { animation: panel-in 0.6s ease forwards; }

  /* Laser line */
  @keyframes laser { 0%{top:4%;opacity:0} 6%{opacity:1} 94%{opacity:1} 100%{top:96%;opacity:0} }

  /* V logo appear */
  @keyframes v-in {
    from{opacity:0;transform:scale(0.75);filter:blur(10px)}
    to  {opacity:1;transform:scale(1);  filter:blur(0)}
  }
  .v-in { animation: v-in 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* Glow pulse */
  @keyframes glow-pulse {
    0%,100%{box-shadow:0 0 20px rgba(201,166,92,0.2)}
    50%    {box-shadow:0 0 48px rgba(201,166,92,0.5),0 0 80px rgba(201,166,92,0.15)}
  }
  .glow-pulse { animation: glow-pulse 2s ease infinite; }

  /* Dot blink */
  @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }

  /* Scroll reveal */
  [data-reveal] { will-change: opacity, transform; }

  /* Shimmer */
  .shimmer { position:relative; overflow:hidden; }
  .shimmer::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background:linear-gradient(108deg,transparent 38%,rgba(255,255,255,0.55) 50%,transparent 62%);
    transform:translateX(-120%); transition:transform 0.65s ease;
  }
  .shimmer:hover::after { transform:translateX(120%); }

  /* Card hover */
  .card-hover {
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .card-hover:hover {
    box-shadow: 0 24px 64px rgba(201,166,92,0.18), 0 6px 20px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }

  /* Button glow */
  .glow-btn { position:relative; z-index:0; }
  .glow-btn::before {
    content:''; position:absolute; inset:-5px; border-radius:inherit;
    z-index:-1; opacity:0; filter:blur(10px);
    background:linear-gradient(90deg,#1D4ED8,#60A5FA,#1D4ED8);
    transition:opacity 0.35s;
  }
  .glow-btn:hover::before { opacity:0.55; }
  .glow-gold::before { background:linear-gradient(90deg,#B8944E,#E8C57A,#B8944E); }

  /* Step pulse */
  @keyframes pulse-ring {
    0%  {box-shadow:0 0 0 0 rgba(201,166,92,0.5)}
    70% {box-shadow:0 0 0 14px rgba(201,166,92,0)}
    100%{box-shadow:0 0 0 0 rgba(201,166,92,0)}
  }
  .pulse-ring { animation: pulse-ring 2.4s ease-out infinite; }

  /* PMS card */
  .pms-card { transition:border-color 0.25s,transform 0.25s; }
  .pms-card:hover { border-color:#C9A65C!important; transform:translateY(-2px); }

  /* Counter flash */
  @keyframes flash-gold { 0%{color:#C9A65C} 100%{color:#172033} }
  .counter-flash { animation:flash-gold 0.5s ease forwards; }

  /* Focus */
  a:focus-visible, button:focus-visible {
    outline:2px solid #C9A65C; outline-offset:3px; border-radius:3px;
  }
  .skip-link {
    position:absolute; top:-100px; left:1rem; z-index:9999;
    background:#172033; color:#FAF8F4; padding:0.5rem 1rem;
    border-radius:6px; font-weight:600; font-size:14px; transition:top 0.2s;
  }
  .skip-link:focus { top:1rem; }

  @media (prefers-reduced-motion:reduce) {
    .shimmer::after,.glow-btn::before { display:none; }
    .pulse-ring { animation:none; }
  }
`;

/* ─── Hotel Scene — Champagne / Navy / Gold ──────────────────────────────── */
function HotelScene({ doorsOpen, hotelName }: { doorsOpen:boolean; hotelName:string }) {
  return (
    <div className="absolute inset-0 overflow-hidden select-none" aria-hidden="true">

      {/* Sky — warm champagne gradient */}
      <div className="absolute inset-0" style={{
        background:"linear-gradient(to bottom,#EDE5D4 0%,#F0E8D6 35%,#F5EFE3 65%,#FAF8F4 100%)"
      }}/>

      {/* Subtle architectural texture on upper sky */}
      <div className="absolute top-0 left-0 right-0 h-[55%]" style={{
        background:"linear-gradient(to bottom,rgba(201,166,92,0.04),transparent)"
      }}/>

      {/* Hotel name */}
      <div className="absolute top-[7%] left-1/2 -translate-x-1/2 text-center z-10">
        <div className="text-[9px] tracking-[0.55em] text-[#8A7448] uppercase">{hotelName}</div>
        <div className="mt-2 h-px w-28 mx-auto" style={{
          background:"linear-gradient(90deg,transparent,#C9A65C,transparent)"
        }}/>
      </div>

      {/* Top cornice */}
      <div className="absolute top-[16%] left-[6%] right-[6%] h-[3px] rounded-full" style={{
        background:"linear-gradient(90deg,transparent,#D8C49A,#C9A65C,#D8C49A,transparent)"
      }}/>
      <div className="absolute top-[17%] left-[6%] right-[6%] h-[1px]" style={{
        background:"linear-gradient(90deg,transparent,rgba(201,166,92,0.3),transparent)"
      }}/>

      {/* Left wing facade */}
      <div className="absolute top-[17%] bottom-[26%] left-[6%] w-[21%]" style={{
        background:"linear-gradient(to right,#EDE5D0,#EAE0CC)",
        borderRight:"2px solid rgba(201,166,92,0.25)"
      }}>
        {/* Windows */}
        {[0,1,2,3].map(row=>[0,1].map(col=>(
          <div key={`${row}-${col}`} className="absolute" style={{
            top:`${14+row*21}%`, left:`${14+col*42}%`, width:"28%", height:"11%",
            background:"linear-gradient(135deg,rgba(201,166,92,0.12),rgba(230,210,150,0.06))",
            border:"1px solid rgba(201,166,92,0.2)",
            boxShadow:"inset 0 0 8px rgba(201,166,92,0.06)"
          }}/>
        )))}
        {/* Horizontal string courses */}
        {[35,65].map(p=>(
          <div key={p} className="absolute left-0 right-0 h-px" style={{
            top:`${p}%`, background:"rgba(201,166,92,0.2)"
          }}/>
        ))}
      </div>

      {/* Right wing facade */}
      <div className="absolute top-[17%] bottom-[26%] right-[6%] w-[21%]" style={{
        background:"linear-gradient(to left,#EDE5D0,#EAE0CC)",
        borderLeft:"2px solid rgba(201,166,92,0.25)"
      }}>
        {[0,1,2,3].map(row=>[0,1].map(col=>(
          <div key={`${row}-${col}`} className="absolute" style={{
            top:`${14+row*21}%`, left:`${14+col*42}%`, width:"28%", height:"11%",
            background:"linear-gradient(135deg,rgba(201,166,92,0.12),rgba(230,210,150,0.06))",
            border:"1px solid rgba(201,166,92,0.2)",
            boxShadow:"inset 0 0 8px rgba(201,166,92,0.06)"
          }}/>
        )))}
        {[35,65].map(p=>(
          <div key={p} className="absolute left-0 right-0 h-px" style={{
            top:`${p}%`, background:"rgba(201,166,92,0.2)"
          }}/>
        ))}
      </div>

      {/* Grand arch — gold frame */}
      <div className="absolute left-[27%] right-[27%] top-[17%] bottom-[26%]">
        <div className="absolute inset-0 rounded-t-[45%]" style={{
          border:"3px solid rgba(201,166,92,0.5)", borderBottom:"none"
        }}/>
        <div className="absolute inset-[4px] rounded-t-[45%]" style={{
          border:"1px solid rgba(201,166,92,0.2)", borderBottom:"none"
        }}/>
      </div>

      {/* Left column — navy with gold capitals */}
      <div className="absolute top-[17%] bottom-[26%] z-10" style={{ left:"27%", width:"4%", background:"linear-gradient(to right,#1A2540,#172033,#1A2540)" }}>
        {/* Capital top */}
        <div className="absolute top-0 left-[-20%] right-[-20%] h-[3.5%]" style={{ background:"linear-gradient(to bottom,#C9A65C,#B8944E)", boxShadow:"0 2px 8px rgba(201,166,92,0.4)" }}/>
        {/* Capital bottom */}
        <div className="absolute bottom-0 left-[-15%] right-[-15%] h-[2%]" style={{ background:"#C9A65C", opacity:0.7 }}/>
        {/* Flute highlight */}
        <div className="absolute top-[3.5%] bottom-[2%] left-[40%] w-px" style={{ background:"rgba(255,255,255,0.06)" }}/>
      </div>

      {/* Right column */}
      <div className="absolute top-[17%] bottom-[26%] z-10" style={{ right:"27%", width:"4%", background:"linear-gradient(to left,#1A2540,#172033,#1A2540)" }}>
        <div className="absolute top-0 left-[-20%] right-[-20%] h-[3.5%]" style={{ background:"linear-gradient(to bottom,#C9A65C,#B8944E)", boxShadow:"0 2px 8px rgba(201,166,92,0.4)" }}/>
        <div className="absolute bottom-0 left-[-15%] right-[-15%] h-[2%]" style={{ background:"#C9A65C", opacity:0.7 }}/>
        <div className="absolute top-[3.5%] bottom-[2%] right-[40%] w-px" style={{ background:"rgba(255,255,255,0.06)" }}/>
      </div>

      {/* Interior warm glow (behind doors) */}
      <div className="absolute transition-all duration-[1200ms]" style={{
        left:"31%", right:"31%", top:"20%", bottom:"26%",
        background:"radial-gradient(ellipse at 50% 55%,rgba(255,240,190,0.95) 0%,rgba(240,215,140,0.6) 35%,rgba(201,166,92,0.1) 70%,transparent 100%)",
        opacity: doorsOpen ? 1 : 0.35,
        filter: doorsOpen ? "blur(0)" : "blur(6px)",
      }}/>

      {/* Warm light spill on floor */}
      <div className="absolute transition-all duration-[1200ms]" style={{
        left:"22%", right:"22%", bottom:"10%", height:"20%",
        background:"radial-gradient(ellipse at 50% 0%,rgba(201,166,92,0.25),transparent 70%)",
        opacity: doorsOpen ? 1 : 0,
      }}/>

      {/* LEFT DOOR — Navy with gold trim */}
      <div className="absolute z-20 transition-all duration-[1500ms]" style={{
        left:"31%", top:"20%", width:"19%", bottom:"26%",
        transformOrigin:"left center",
        transform: doorsOpen ? "perspective(1100px) rotateY(-78deg)" : "perspective(1100px) rotateY(0deg)",
        background:"linear-gradient(160deg,#1E2D4A,#172033,#1A293F)",
        borderRight:"2px solid #C9A65C",
        borderTop:"1px solid rgba(201,166,92,0.5)",
        boxShadow: doorsOpen ? "none" : "-4px 0 24px rgba(23,32,51,0.35), inset -2px 0 8px rgba(201,166,92,0.06)",
      }}>
        {/* Panel top inset */}
        <div className="absolute" style={{top:"5%",left:"8%",right:"8%",height:"36%",border:"1px solid rgba(201,166,92,0.25)"}}/>
        {/* Panel bottom inset */}
        <div className="absolute" style={{top:"46%",left:"8%",right:"8%",height:"44%",border:"1px solid rgba(201,166,92,0.25)"}}/>
        {/* Gold horizontal rail */}
        <div className="absolute left-0 right-0 h-[1px]" style={{top:"45%",background:"rgba(201,166,92,0.4)"}}/>
        {/* Handle */}
        <div className="absolute" style={{
          right:"10%", top:"50%", transform:"translateY(-50%)",
          width:"5%", height:"18%", borderRadius:"3px",
          background:"linear-gradient(180deg,#E8C57A,#C9A65C,#A07A30)",
          boxShadow:"0 0 12px rgba(201,166,92,0.5)"
        }}/>
        {/* Right trim line */}
        <div className="absolute top-0 bottom-0 right-0 w-[2px]" style={{
          background:"linear-gradient(180deg,transparent,#C9A65C,#E8C57A,#C9A65C,transparent)"
        }}/>
      </div>

      {/* RIGHT DOOR */}
      <div className="absolute z-20 transition-all duration-[1500ms]" style={{
        right:"31%", top:"20%", width:"19%", bottom:"26%",
        transformOrigin:"right center",
        transform: doorsOpen ? "perspective(1100px) rotateY(78deg)" : "perspective(1100px) rotateY(0deg)",
        background:"linear-gradient(160deg,#1A293F,#172033,#1E2D4A)",
        borderLeft:"2px solid #C9A65C",
        borderTop:"1px solid rgba(201,166,92,0.5)",
        boxShadow: doorsOpen ? "none" : "4px 0 24px rgba(23,32,51,0.35), inset 2px 0 8px rgba(201,166,92,0.06)",
      }}>
        <div className="absolute" style={{top:"5%",left:"8%",right:"8%",height:"36%",border:"1px solid rgba(201,166,92,0.25)"}}/>
        <div className="absolute" style={{top:"46%",left:"8%",right:"8%",height:"44%",border:"1px solid rgba(201,166,92,0.25)"}}/>
        <div className="absolute left-0 right-0 h-[1px]" style={{top:"45%",background:"rgba(201,166,92,0.4)"}}/>
        <div className="absolute" style={{
          left:"10%", top:"50%", transform:"translateY(-50%)",
          width:"5%", height:"18%", borderRadius:"3px",
          background:"linear-gradient(180deg,#E8C57A,#C9A65C,#A07A30)",
          boxShadow:"0 0 12px rgba(201,166,92,0.5)"
        }}/>
        <div className="absolute top-0 bottom-0 left-0 w-[2px]" style={{
          background:"linear-gradient(180deg,transparent,#C9A65C,#E8C57A,#C9A65C,transparent)"
        }}/>
      </div>

      {/* Door threshold */}
      <div className="absolute z-20" style={{
        left:"31%", right:"31%", bottom:"26%", height:"2px",
        background:"linear-gradient(90deg,transparent,#C9A65C,#E8C57A,#C9A65C,transparent)"
      }}/>

      {/* Gold lanterns */}
      {["28.5%","68.5%"].map((x,i)=>(
        <div key={i} className="absolute z-10" style={{left:x, top:"22%", width:"2.2%"}}>
          <div style={{
            width:"100%", paddingTop:"100%", borderRadius:"50%",
            background:"radial-gradient(circle,rgba(201,166,92,0.9),rgba(180,130,40,0.4) 50%,transparent 80%)",
            boxShadow:"0 0 18px rgba(201,166,92,0.35), 0 0 40px rgba(201,166,92,0.12)"
          }}/>
        </div>
      ))}

      {/* Floor — warm marble */}
      <div className="absolute left-0 right-0 bottom-0 z-10" style={{height:"28%"}}>
        <div className="absolute inset-0" style={{
          background:"linear-gradient(to bottom,#E8DFCA,#DDD5BC)"
        }}/>
        {/* Perspective tile lines */}
        {[-4,-3,-2,-1,0,1,2,3,4].map(i=>(
          <div key={i} className="absolute top-0 bottom-0 w-px" style={{
            left:`calc(50% + ${i*11}%)`,
            background:"linear-gradient(to bottom,rgba(201,166,92,0.15),transparent 70%)",
          }}/>
        ))}
        {[20,45,70].map(p=>(
          <div key={p} className="absolute left-[10%] right-[10%] h-px" style={{
            top:`${p}%`,
            background:"linear-gradient(90deg,transparent,rgba(201,166,92,0.2),rgba(201,166,92,0.3),rgba(201,166,92,0.2),transparent)"
          }}/>
        ))}
        {/* Warm floor glow when doors open */}
        <div className="absolute top-0 left-[28%] right-[28%] h-[50%] transition-opacity duration-[1200ms]" style={{
          background:"radial-gradient(ellipse at 50% 0%,rgba(255,220,120,0.3),transparent 70%)",
          opacity: doorsOpen ? 1 : 0,
        }}/>
      </div>

      {/* Ground floor line */}
      <div className="absolute left-0 right-0 z-10" style={{
        bottom:"28%", height:"2px",
        background:"linear-gradient(90deg,transparent 4%,#C9A65C 18%,#E8C57A 50%,#C9A65C 82%,transparent 96%)"
      }}/>
    </div>
  );
}

/* ─── QR Code SVG ──────────────────────────────────────────────────── */
function QRCode({ size=160 }: { size?: number }) {
  const N=21, S=10;
  const cells: boolean[][] = Array(N).fill(null).map(()=>Array(N).fill(false));
  const finder=(r:number,c:number)=>{
    for(let i=0;i<7;i++) for(let j=0;j<7;j++)
      cells[r+i][c+j]=i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4);
  };
  finder(0,0); finder(0,14); finder(14,0);
  for(let r=8;r<N;r++) for(let c=8;c<N;c++){
    if(r>=14&&c<7) continue;
    cells[r][c]=((r*11+c*7+r*c)%5)<2;
  }
  for(let r=0;r<7;r++) for(let c=8;c<13;c++) cells[r][c]=(r+c)%2===0;
  return (
    <svg viewBox={`0 0 ${N*S} ${N*S}`} width={size} height={size} aria-hidden="true">
      {cells.map((row,r)=>row.map((on,c)=> on
        ? <rect key={`${r}-${c}`} x={c*S+1} y={r*S+1} width={S-2} height={S-2} rx={1} fill="#172033"/>
        : null
      ))}
    </svg>
  );
}

/* ─── V Logo ─────────────────────────────────────────────────────────── */
function VLogoMark({ size=72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 72" width={size} height={size} aria-hidden="true">
      <path d="M4 4 L40 66" stroke="#C9A65C"  strokeWidth="10" strokeLinecap="round"/>
      <path d="M76 4 L40 66" stroke="#172033" strokeWidth="10" strokeLinecap="round"/>
      <polygon points="40,60 35,70 40,79 45,70" fill="#C9A65C"/>
    </svg>
  );
}

/* ─── Logo ───────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <Image src="/logo-valtiqstay.png" alt="ValtiqStay" width={420} height={151} priority
      sizes="(max-width:768px) 120px, 180px"
      className="h-auto w-[120px] md:w-[180px]"/>
  );
}

/* ─── Icon ───────────────────────────────────────────────────────────── */
function Icon({ type }: { type:"passport"|"qr"|"hotel" }) {
  if(type==="passport") return(
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if(type==="qr") return(
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 15h2v2h-2zM19 14h1v6h-6v-1M14 19h2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
  return(
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V8l8-5 8 5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 21v-7h6v7M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Animated Metric ────────────────────────────────────────────────── */
function AnimatedMetric({ value, label }: { value:string; label:string }) {
  const ref=useRef<HTMLDivElement>(null);
  const m=value.match(/^(-?)(\d+)(.*)/);
  const pre=m?.[1]??""; const num=parseInt(m?.[2]??"0",10); const suf=m?.[3]??"";
  const [text,setText]=useState(`${pre}${num}${suf}`);
  const [flash,setFlash]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    let fired=false;
    const obs=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting||fired) return; fired=true;
      setText(`${pre}0${suf}`);
      let t0=0;
      const tick=(ts:number)=>{
        if(!t0) t0=ts;
        const p=Math.min((ts-t0)/1600,1), ease=1-Math.pow(1-p,3);
        setText(`${pre}${Math.round(ease*num)}${suf}`);
        if(p<1) requestAnimationFrame(tick);
        else { setText(`${pre}${num}${suf}`); setFlash(true); }
      };
      requestAnimationFrame(tick);
    },{threshold:0.5});
    obs.observe(el); return()=>obs.disconnect();
  },[num,pre,suf]);
  return(
    <div ref={ref} className="text-center px-6 border-r border-[#E8E0D2] last:border-r-0">
      <p className={`text-3xl font-semibold tabular-nums text-[#172033] ${flash?"counter-flash":""}`}
         onAnimationEnd={()=>setFlash(false)}>{text}</p>
      <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

/* ─── Scroll Reveal ──────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const els=document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach(el=>{
      const {top,bottom}=el.getBoundingClientRect();
      if(top>=window.innerHeight||bottom<=0){
        const d=el.getAttribute("data-delay");
        el.style.opacity="0"; el.style.transform="translateY(28px)";
        el.style.transition=`opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${d?parseInt(d)*80:0}ms,transform 0.7s cubic-bezier(0.22,1,0.36,1) ${d?parseInt(d)*80:0}ms`;
      }
    });
    const obs=new IntersectionObserver(entries=>{
      for(const e of entries) if(e.isIntersecting){
        const el=e.target as HTMLElement;
        el.style.opacity="1"; el.style.transform="none";
        obs.unobserve(el);
      }
    },{threshold:0.08});
    els.forEach(el=>{ if(el.style.opacity==="0") obs.observe(el); });
    return()=>obs.disconnect();
  },[]);
}

/* ─── Particle Canvas ────────────────────────────────────────────────── */
function Particles() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d"); if(!ctx) return;
    let id=0, vis=true;
    type P={x:number;y:number;vx:number;vy:number;r:number;a:number;hex:string};
    const pal=["#C9A65C","#E8C57A","#D8C49A","rgba(201,166,92,0.35)"];
    let pts:P[]=[];
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    const spawn=():P=>({
      x:Math.random()*c.width, y:Math.random()*c.height,
      vx:(Math.random()-.5)*.22, vy:-(Math.random()*.18+.04),
      r:Math.random()*1.6+.3, a:Math.random()*.3+.06,
      hex:pal[Math.floor(Math.random()*pal.length)],
    });
    const init=()=>{pts=Array.from({length:45},spawn);};
    const draw=()=>{
      if(!vis){id=0;return;}
      ctx.clearRect(0,0,c.width,c.height);
      for(const p of pts){
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<-4){p.y=c.height+4;p.x=Math.random()*c.width;}
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        ctx.globalAlpha=p.a; ctx.fillStyle=p.hex;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1; id=requestAnimationFrame(draw);
    };
    const vo=new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis&&id===0)draw();},{threshold:0});
    vo.observe(c);
    const onR=()=>{resize();init();};
    resize();init();draw();
    window.addEventListener("resize",onR);
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",onR);vo.disconnect();};
  },[]);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none"/>;
}

/* ══════════════════════════════════════════════════════════════════════
   HOME CLIENT
══════════════════════════════════════════════════════════════════════ */
export default function HomeClient() {
  const [lang,setLang]     = useState<Lang>("it");
  const [phase,setPhase]   = useState<Phase>("exterior");
  const [doorsOpen,setDoors] = useState(false);
  const [exitIntro,setExit]  = useState(false);
  const [mobileOpen,setMob]  = useState(false);
  const [laserKey,setLaser]  = useState(0);
  useScrollReveal();
  const t = copy[lang];

  useEffect(()=>{ document.documentElement.lang=lang; },[lang]);
  useEffect(()=>{ setLaser(k=>k+1); },[]);

  /* Intro timeline */
  useEffect(()=>{
    const T: ReturnType<typeof setTimeout>[] = [];
    T.push(setTimeout(()=>setPhase("scanning"),           4000));   // hotel → qr
    T.push(setTimeout(()=>setPhase("verified"),           8500));   // qr → verified
    T.push(setTimeout(()=>{ setPhase("opening"); setDoors(true); }, 10800)); // → doors
    T.push(setTimeout(()=>setExit(true),                 12400));  // start fade
    T.push(setTimeout(()=>setPhase("content"),           13300));  // remove overlay
    return()=>T.forEach(clearTimeout);
  },[]);

  const skip=()=>{ setExit(true); setTimeout(()=>setPhase("content"),800); };

  const features=[
    {icon:"passport"as const,title:t.feat1Title,text:t.feat1Text,color:"bg-blue-50 text-blue-700"},
    {icon:"qr"as const,      title:t.feat2Title,text:t.feat2Text,color:"bg-[#FFF3D8] text-[#9A742C]"},
    {icon:"hotel"as const,   title:t.feat3Title,text:t.feat3Text,color:"bg-emerald-50 text-emerald-700"},
  ];

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <a href="#main-content" className="skip-link">{t.skipNav}</a>

      {/* ══════════ CINEMATIC INTRO ══════════════════════════════════════ */}
      {phase!=="content" && (
        <div className={`fixed inset-0 z-50 ${exitIntro?"intro-exit":""}`}
             style={{background:"#F5EFE3"}}>

          {/* Skip */}
          <button type="button" onClick={skip}
            className="absolute top-6 right-6 z-20 text-[10px] tracking-[0.4em] text-[#8A7448] hover:text-[#172033] transition uppercase font-medium">
            {t.skip} →
          </button>

          {/* Hotel scene */}
          <div className={`absolute inset-0 ${phase==="exterior"?"scene-zoom":""}`}
               style={{transformOrigin:"50% 62%"}}>
            <HotelScene doorsOpen={doorsOpen} hotelName={t.hotelName}/>
          </div>

          {/* QR scanning panel */}
          {phase==="scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center panel-in">
              <div className="relative rounded-2xl p-7 text-center" style={{
                background:"rgba(250,248,244,0.92)",
                border:"2px solid rgba(201,166,92,0.4)",
                backdropFilter:"blur(16px)",
                boxShadow:"0 24px 60px rgba(23,32,51,0.12), 0 0 0 1px rgba(201,166,92,0.1)"
              }}>
                {/* Corner marks */}
                {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],
                  ["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos,brd],i)=>(
                  <div key={i} className={`absolute ${pos} w-4 h-4 ${brd} border-[#C9A65C] rounded-sm`}/>
                ))}

                <p className="text-[9px] tracking-[0.55em] text-[#8A7448] uppercase mb-5">{t.scanSub}</p>

                {/* QR + laser */}
                <div className="relative inline-block p-3 rounded-xl" style={{background:"rgba(23,32,51,0.04)", border:"1px solid rgba(201,166,92,0.15)"}}>
                  <QRCode size={156}/>
                  <div key={laserKey} className="absolute left-3 right-3 h-[2px] pointer-events-none" style={{
                    background:"linear-gradient(90deg,transparent,#C9A65C,#FFF8DC,#C9A65C,transparent)",
                    boxShadow:"0 0 10px #C9A65C, 0 0 20px rgba(201,166,92,0.35)",
                    animation:"laser 1.15s ease-in-out 2.8",
                    position:"absolute", top:"8px"
                  }}/>
                </div>

                <p className="mt-4 text-xs text-[#6A5F4A] tracking-wide">{t.scanLabel}</p>
                <div className="mt-3 flex gap-2 justify-center">
                  {[0,1,2].map(i=>(
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A65C]"
                         style={{animation:`blink 1.3s ease ${i*.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verified */}
          {phase==="verified" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full" style={{
                  background:"radial-gradient(circle,rgba(201,166,92,0.12),transparent 70%)",
                  animation:"glow-pulse 2s ease infinite"
                }}/>
                <div className="v-in w-28 h-28 rounded-full flex items-center justify-center glow-pulse" style={{
                  background:"#FAF8F4",
                  border:"2px solid rgba(201,166,92,0.5)",
                  boxShadow:"0 8px 32px rgba(201,166,92,0.2)"
                }}>
                  <VLogoMark size={56}/>
                </div>
              </div>
              <div className="v-in text-center" style={{animationDelay:"0.35s"}}>
                <p className="text-[10px] tracking-[0.55em] text-[#C9A65C] uppercase font-medium">✓ {t.verified}</p>
                <p className="mt-1 text-xs text-[#8A7448] tracking-[0.25em]">{t.verifiedSub}</p>
              </div>
            </div>
          )}

          {/* V between opening doors */}
          {phase==="opening" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="v-in drop-shadow-lg"><VLogoMark size={64}/></div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ MAIN CONTENT — Navy / Gold / Champagne / Ivory ══════ */}
      <main id="main-content" className="min-h-screen bg-[#FAF8F4] text-[#172033]">

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
             style={{background:"rgba(250,248,244,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(232,224,210,0.6)"}}>
          <Logo/>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {t.nav.map((item,i)=>(
              <a key={i} href={["#solution","#how","#dashboard","#pms"][i]}
                 className="hover:text-[#C9A65C] transition">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={()=>setLang(lang==="it"?"en":"it")}
              className="hidden md:block rounded-full border border-[#D8C49A] bg-white px-4 py-2 text-sm font-semibold text-[#8A6B2F] hover:bg-[#FFFDF8] transition">
              {lang==="it"?"EN":"IT"}
            </button>
            <a href="#cta"
               className="glow-btn hidden md:inline-flex rounded-full bg-[#172033] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]">
              {t.demo}
            </a>
            <button type="button" className="md:hidden text-[#172033]"
              onClick={()=>setMob(!mobileOpen)}
              aria-label={mobileOpen?t.closeMenu:t.openMenu}
              aria-expanded={mobileOpen}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {mobileOpen?<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>:<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-[#FAF8F4] flex flex-col items-center justify-center gap-7">
            {t.nav.map((item,i)=>(
              <a key={i} href={["#solution","#how","#dashboard","#pms"][i]}
                 className="text-sm font-medium text-slate-600 hover:text-[#C9A65C] transition"
                 onClick={()=>setMob(false)}>{item}</a>
            ))}
            <a href="#cta" onClick={()=>setMob(false)}
               className="mt-4 rounded-full bg-[#172033] px-8 py-3 text-sm font-semibold text-white">
              {t.demo}
            </a>
          </div>
        )}

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-24 px-6"
                 style={{background:"radial-gradient(circle at top right,#DBEAFE 0%,transparent 35%),radial-gradient(circle at top left,#F3E7C8 0%,transparent 30%),#FAF8F4"}}>
          <Particles/>
          <div className="relative mx-auto max-w-6xl w-full">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#B8944E] uppercase mb-7" data-reveal="">
              {t.heroEyebrow}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-[84px] font-semibold leading-[1.04] tracking-[-0.04em] max-w-5xl"
                data-reveal="" data-delay="1">
              {t.heroTitle}<br/>
              <span className="bg-gradient-to-r from-[#B8944E] via-[#D8C49A] to-[#B8944E] bg-clip-text text-transparent">
                {t.heroHighlight}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600" data-reveal="" data-delay="2">
              {t.heroText}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4" data-reveal="" data-delay="3">
              <a href="#cta"
                 className="glow-btn glow-gold inline-flex justify-center rounded-full bg-[#1D4ED8] px-8 py-4 font-semibold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700">
                {t.demo}
              </a>
              <a href="#how"
                 className="inline-flex justify-center rounded-full border border-[#D8C49A] bg-white px-8 py-4 font-semibold text-[#172033] shadow-sm transition hover:bg-[#FFFDF8]">
                {t.discover}
              </a>
            </div>
            <div className="mt-14 inline-flex rounded-3xl border border-[#E8E0D2] bg-white/80 p-6 shadow-sm"
                 data-reveal="" data-delay="4">
              {metrics.map(([v,it,en])=>(
                <AnimatedMetric key={v} value={v} label={lang==="it"?it:en}/>
              ))}
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-10 bg-gradient-to-b from-[#C9A65C] to-transparent mx-auto opacity-40"/>
          </div>
        </section>

        {/* ── PROBLEM ──────────────────────────────────────────────────── */}
        <section className="py-32 px-6 bg-white">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="font-semibold text-[#B8944E] mb-5" data-reveal="">{t.problemEyebrow}</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] max-w-xl" data-reveal="" data-delay="1">
                {t.problemTitle}
              </h2>
              <div className="mt-6 h-1 w-12 rounded-full bg-[#C9A65C]" data-reveal="" data-delay="2"/>
              <p className="mt-7 text-lg leading-8 text-slate-600" data-reveal="" data-delay="2">
                {t.problemText}
              </p>
            </div>
            <div className="grid gap-3" data-reveal="" data-delay="2">
              {t.problemItems.map((item,i)=>(
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#ECE7DD] bg-[#FAF8F4] px-5 py-4">
                  <div className="w-2 h-2 rounded-full bg-[#C9A65C] opacity-60 flex-shrink-0"/>
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOLUTION ─────────────────────────────────────────────────── */}
        <section id="solution" className="py-32 px-6 bg-[#FAF8F4]">
          <div className="mx-auto max-w-6xl">
            <p className="font-semibold text-[#B8944E] mb-4" data-reveal="">{t.solutionEyebrow}</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] max-w-2xl" data-reveal="" data-delay="1">
              {lang==="it"?"Un'identità digitale al centro di ogni arrivo.":"One digital identity at the heart of every arrival."}
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {features.map((f,i)=>(
                <div key={f.title}
                     className="shimmer card-hover rounded-[2rem] border border-[#ECE7DD] bg-white p-8 shadow-xl shadow-slate-200/40"
                     data-reveal="" data-delay={String(i+1)}>
                  <div className={`mb-7 flex h-16 w-16 items-center justify-center rounded-3xl ${f.color}`}>
                    <Icon type={f.icon}/>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0F2445]">{f.title}</h3>
                  <div className="mt-4 h-1 w-10 rounded-full bg-[#C8A96A]"/>
                  <p className="mt-5 leading-7 text-slate-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how" className="py-32 px-6"
                 style={{background:"linear-gradient(to right,#0F2A57,#13376F,#0B2550)"}}>
          <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_2fr] gap-16 items-start text-white">
            <div className="lg:sticky lg:top-32">
              <p className="font-semibold uppercase tracking-[0.2em] text-[#E8C57A] mb-5" data-reveal="">
                {t.howEyebrow}
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]" data-reveal="" data-delay="1">
                {t.howTitle}
              </h2>
              <div className="mt-6 h-1 w-14 rounded-full bg-[#E8C57A]" data-reveal="" data-delay="2"/>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {t.steps.map((step,i)=>(
                <div key={step} data-reveal="" data-delay={String(i+1)}>
                  <div className="pulse-ring mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#E8C57A] bg-white/5 text-2xl font-semibold text-[#E8C57A]"
                       style={{animationDelay:`${i*.65}s`}}>
                    0{i+1}
                  </div>
                  <p className="text-lg font-semibold leading-7">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD ────────────────────────────────────────────────── */}
        <section id="dashboard" className="py-32 px-6 bg-[#FAF8F4]">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-semibold text-[#B8944E] mb-4" data-reveal="">{t.dashEyebrow}</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]" data-reveal="" data-delay="1">
                {t.dashTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600" data-reveal="" data-delay="2">
                {t.dashSub}
              </p>
            </div>
            <div className="shimmer rounded-[2rem] border border-[#E8E0D2] bg-white p-5 shadow-2xl shadow-slate-300/40"
                 data-reveal="" data-delay="1">
              <div className="rounded-[1.5rem] bg-[#F8F6F1] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Hotel Dashboard</p>
                    <h3 className="text-2xl font-semibold">Guest Operations Center</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Live PMS Sync</span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[["24","Today's Arrivals"],["18","Verified Guests"],["6","Check-ins Ready"]].map(([v,l])=>(
                    <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                      <p className="text-2xl font-semibold text-[#172033]">{v}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{l}</p>
                    </div>
                  ))}
                </div>
                {[["Marco Rossi","Verified","Room 204"],["Claire Martin","Ready For Check-in","Room 118"],["Anna Keller","Verified","Suite 12"],["James Wilson","Consent Pending","Room 315"]].map(([n,s,r])=>(
                  <div key={n} className="mb-2 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                    <div>
                      <p className="font-semibold">{n}</p>
                      <p className="text-sm text-slate-500">{r}</p>
                    </div>
                    <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-xs font-semibold text-[#8A6B2F]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST ────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#172033] text-white text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-[#C9A65C]" data-reveal="">VALTIQSTAY</p>
            <h2 className="text-5xl font-semibold tracking-[-0.04em]" data-reveal="" data-delay="1">
              {lang==="it"?"Fiducia. Identità. Connessione.":"Trust. Identity. Connection."}
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300" data-reveal="" data-delay="2">
              {lang==="it"
                ?"Un livello di identità digitale affidabile progettato specificamente per l'ospitalità."
                :"A trusted digital identity layer built specifically for hospitality."}
            </p>
            <div className="mx-auto mt-10 h-px max-w-xs bg-gradient-to-r from-transparent via-[#C9A65C] to-transparent"/>
          </div>
        </section>

        {/* ── PMS ──────────────────────────────────────────────────────── */}
        <section id="pms" className="py-24 px-6 bg-white">
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-semibold text-[#B8944E] mb-3" data-reveal="">{t.pmsEyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] max-w-2xl mx-auto" data-reveal="" data-delay="1">
              {t.pmsTitle}
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {pms.map((item,i)=>(
                <div key={item.name}
                     className="pms-card flex h-32 items-center justify-center rounded-2xl border border-[#E8E0D2] bg-[#FAF8F4] p-8 shadow-sm"
                     data-reveal="" data-delay={String((i%4)+1)}>
                  <Image src={item.logo} alt={item.name} width={140} height={56} loading="lazy"
                         className="h-14 w-auto max-w-[110px] object-contain"/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section id="cta" className="bg-[#FAF8F4] px-6 py-28">
          <div className="shimmer card-hover mx-auto max-w-5xl rounded-[2rem] border border-[#D8C49A] bg-white p-14 text-center shadow-2xl shadow-slate-300/40"
               data-reveal="">
            <p className="font-semibold text-[#B8944E] mb-4">{t.ctaEyebrow}</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]">{t.ctaTitle}</h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-slate-600">{t.ctaText}</p>
            <a href="mailto:hello@valtiqstay.com?subject=ValtiqStay%20Demo"
               className="glow-btn mt-10 inline-flex rounded-full bg-[#1D4ED8] px-10 py-4 font-semibold text-white transition hover:bg-blue-700">
              {t.ctaBtn}
            </a>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="border-t border-[#E8E0D2] bg-white px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6">
            <Logo/>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="mailto:hello@valtiqstay.com?subject=ValtiqStay%20Demo" className="hover:text-[#C9A65C] transition">Contact</a>
              <a href="#cta" className="hover:text-[#C9A65C] transition">Demo</a>
              <a href="#pms" className="hover:text-[#C9A65C] transition">PMS</a>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
