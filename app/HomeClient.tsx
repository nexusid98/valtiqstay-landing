"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
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
    verifiedSub: "Accesso autorizzato",
    heroEyebrow: "Trust • Identity • Connection",
    heroTitle: "Identità digitale verificata per",
    heroHighlight: "l'ospitalità moderna.",
    heroText: "Riduci i tempi di check-in, verifica l'identità degli ospiti e raccogli il consenso ai dati in pochi secondi.",
    demo: "Richiedi una Demo",
    discover: "Scopri come funziona",
    problemEyebrow: "Il problema",
    problemTitle: "Il check-in tradizionale ferma l'ospitalità moderna.",
    problemText: "Documenti cartacei, code alla reception, dati inseriti a mano. Ogni attrito è un'opportunità persa.",
    solutionEyebrow: "La soluzione",
    feat1Title: "Passaporto Digitale",
    feat1Text: "L'ospite conserva documenti e dati in un profilo sicuro e verificato.",
    feat2Title: "QR con consenso ospite",
    feat2Text: "L'hotel accede ai dati solo dopo conferma esplicita dell'ospite.",
    feat3Title: "Integrazione PMS",
    feat3Text: "Progettato per integrarsi con i software già usati dagli hotel.",
    howEyebrow: "Come funziona",
    howTitle: "Un flusso sicuro in quattro passi.",
    steps: ["L'ospite crea il proprio profilo verificato","La struttura conferma la prenotazione","Il QR abilita il check-in","L'ospite approva la condivisione dei dati"],
    dashEyebrow: "Dashboard Hotel",
    dashTitle: "Gestisci arrivi e identità da un'unica vista.",
    dashSub: "Una dashboard pensata per ridurre il lavoro manuale e rendere più chiara la gestione degli arrivi.",
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
    verifiedSub: "Access granted",
    heroEyebrow: "Trust • Identity • Connection",
    heroTitle: "Trusted guest identity for",
    heroHighlight: "modern hospitality.",
    heroText: "Reduce check-in time, verify guest identity and collect data consent in seconds.",
    demo: "Request a Demo",
    discover: "See how it works",
    problemEyebrow: "The problem",
    problemTitle: "Traditional check-in is holding back modern hospitality.",
    problemText: "Paper documents, front-desk queues, manual data entry. Every friction point is a lost opportunity.",
    solutionEyebrow: "The solution",
    feat1Title: "Digital Passport",
    feat1Text: "Guests securely store identity data in one verified profile.",
    feat2Title: "Consent-Based QR",
    feat2Text: "Hotels access guest data only after explicit guest approval.",
    feat3Title: "PMS Ready",
    feat3Text: "Designed to integrate with existing hotel management systems.",
    howEyebrow: "How it works",
    howTitle: "A secure flow in four steps.",
    steps: ["Guest creates a verified profile","Hotel confirms reservation","QR unlocks check-in","Guest approves data sharing"],
    dashEyebrow: "Hotel Dashboard",
    dashTitle: "Manage arrivals and identity from one clear view.",
    dashSub: "A dashboard designed to reduce manual work and make arrival management clearer.",
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

/* ─── Global styles ──────────────────────────────────────────────────────── */
const STYLES = `
  /* Hotel approach zoom */
  @keyframes approach {
    0%   { transform: scale(1) translateY(0); }
    100% { transform: scale(1.55) translateY(-3%); }
  }
  .scene-zoom { animation: approach 3s cubic-bezier(0.25,0.1,0.25,1) forwards; }

  /* Intro fade-out */
  @keyframes intro-out {
    0%   { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
  }
  .intro-exit { animation: intro-out 0.8s ease forwards; }

  /* QR panel slide up */
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .panel-in { animation: panel-in 0.5s ease forwards; }

  /* Laser scan */
  @keyframes laser {
    0%   { top: 5%;   opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { top: 95%;  opacity: 0; }
  }

  /* V logo appear */
  @keyframes v-in {
    from { opacity: 0; transform: scale(0.7); filter: blur(12px); }
    to   { opacity: 1; transform: scale(1);   filter: blur(0); }
  }
  .v-in { animation: v-in 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* Glow pulse around V */
  @keyframes glow-pulse {
    0%,100% { box-shadow: 0 0 30px rgba(201,166,92,0.15); }
    50%     { box-shadow: 0 0 60px rgba(201,166,92,0.35), 0 0 120px rgba(201,166,92,0.1); }
  }
  .glow-pulse { animation: glow-pulse 1.8s ease infinite; }

  /* Dots blink */
  @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }

  /* Shimmer */
  .shimmer { position: relative; overflow: hidden; }
  .shimmer::after {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
    background: linear-gradient(108deg,transparent 38%,rgba(201,166,92,0.1) 50%,transparent 62%);
    transform:translateX(-120%); transition:transform 0.7s ease;
  }
  .shimmer:hover::after { transform:translateX(120%); }

  /* Card glow */
  .card-glow { transition: box-shadow 0.3s; }
  .card-glow:hover { box-shadow: 0 0 40px rgba(201,166,92,0.12), 0 20px 60px rgba(0,0,0,0.5); }

  /* Button glow */
  .glow-btn { position:relative; z-index:0; }
  .glow-btn::before {
    content:''; position:absolute; inset:-5px; border-radius:inherit; z-index:-1;
    opacity:0; filter:blur(12px);
    background: linear-gradient(90deg,#1D4ED8,#60A5FA,#1D4ED8);
    transition:opacity 0.35s;
  }
  .glow-btn:hover::before { opacity:0.5; }
  .glow-gold::before { background: linear-gradient(90deg,#B8944E,#E8C57A,#B8944E); }

  /* Step pulse */
  @keyframes pulse-ring {
    0%   { box-shadow:0 0 0 0 rgba(201,166,92,0.5); }
    70%  { box-shadow:0 0 0 14px rgba(201,166,92,0); }
    100% { box-shadow:0 0 0 0 rgba(201,166,92,0); }
  }
  .pulse-ring { animation: pulse-ring 2.4s ease-out infinite; }

  /* Counter flash */
  @keyframes flash-gold { 0%{color:#C9A65C} 100%{color:#F0EDE4} }
  .counter-flash { animation: flash-gold 0.5s ease forwards; }

  /* PMS card */
  .pms-card { transition: border-color 0.25s, transform 0.25s; }
  .pms-card:hover { border-color:rgba(201,166,92,0.4)!important; transform:translateY(-2px); }

  /* Focus */
  a:focus-visible, button:focus-visible {
    outline:2px solid #C9A65C; outline-offset:3px; border-radius:3px;
  }
  .skip-link {
    position:absolute; top:-100px; left:1rem; z-index:9999;
    background:#C9A65C; color:#080808; padding:0.5rem 1rem;
    border-radius:6px; font-weight:600; font-size:14px; transition:top 0.2s;
  }
  .skip-link:focus { top:1rem; }

  @media (prefers-reduced-motion:reduce) {
    .shimmer::after,.glow-btn::before { display:none; }
    .pulse-ring { animation:none; }
  }
`;

/* ─── QR Code SVG ─────────────────────────────────────────────────────────── */
function QRCode({ size = 160 }: { size?: number }) {
  const N = 21;
  const cells: boolean[][] = Array(N).fill(null).map(() => Array(N).fill(false));
  const finder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      cells[r+i][c+j] = i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4);
    }
  };
  finder(0,0); finder(0,14); finder(14,0);
  for (let r=8;r<N;r++) for (let c=8;c<N;c++) {
    if (r>=14&&c<7) continue;
    cells[r][c] = ((r*11+c*7+r*c)%5)<2;
  }
  for (let r=0;r<7;r++) for (let c=8;c<13;c++) cells[r][c] = (r+c)%2===0;
  const S = 10;
  return (
    <svg viewBox={`0 0 ${N*S} ${N*S}`} width={size} height={size} aria-hidden="true">
      {cells.map((row,r)=>row.map((on,c)=> on
        ? <rect key={`${r}-${c}`} x={c*S+1} y={r*S+1} width={S-2} height={S-2} rx={1} fill="#C9A65C"/>
        : null
      ))}
    </svg>
  );
}

/* ─── V Logo ─────────────────────────────────────────────────────────────── */
function VLogoMark({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 72" width={size} height={size} aria-hidden="true">
      <path d="M4 4 L40 66" stroke="#C9A65C" strokeWidth="10" strokeLinecap="round"/>
      <path d="M76 4 L40 66" stroke="#1E3A6E" strokeWidth="10" strokeLinecap="round"/>
      <polygon points="40,60 35,70 40,79 45,70" fill="#C9A65C"/>
    </svg>
  );
}

/* ─── Hotel Entrance Scene ────────────────────────────────────────────────── */
function HotelScene({ doorsOpen, hotelName }: { doorsOpen: boolean; hotelName: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ── Sky / facade background ─── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, #04030A 0%, #070510 40%, #080808 100%)"
      }}/>

      {/* ── Subtle star field ─── */}
      {[...Array(24)].map((_,i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random()*1.5+0.5}px`, height: `${Math.random()*1.5+0.5}px`,
            top: `${Math.random()*45}%`, left: `${Math.random()*100}%`,
            opacity: Math.random()*0.25+0.05,
          }}/>
      ))}

      {/* ── Hotel name above entrance ─── */}
      <div className="absolute top-[9%] left-1/2 -translate-x-1/2 text-center">
        <div className="text-[10px] tracking-[0.45em] text-[#4A3F28] uppercase mb-1">{hotelName}</div>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[rgba(201,166,92,0.3)] to-transparent"/>
      </div>

      {/* ── Top cornice ─── */}
      <div className="absolute top-[17%] left-[8%] right-[8%] h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,rgba(201,166,92,0.25),rgba(201,166,92,0.5),rgba(201,166,92,0.25),transparent)" }}/>

      {/* ── Far wings (hotel facade sides) ─── */}
      <div className="absolute top-[17%] bottom-[28%] left-[8%] w-[19%]"
        style={{ background: "linear-gradient(to right,#04030A,#070608)", borderRight:"1px solid rgba(201,166,92,0.06)" }}>
        {/* Window rows */}
        {[0,1,2,3].map(row=>[0,1,2].map(col=>(
          <div key={`${row}-${col}`} className="absolute"
            style={{ top:`${15+row*22}%`, left:`${12+col*28}%`, width:"16%", height:"9%",
              background:"rgba(180,140,60,0.04)", border:"1px solid rgba(201,166,92,0.07)",
              boxShadow:"inset 0 0 4px rgba(180,140,60,0.05)" }}/>
        )))}
      </div>
      <div className="absolute top-[17%] bottom-[28%] right-[8%] w-[19%]"
        style={{ background:"linear-gradient(to left,#04030A,#070608)", borderLeft:"1px solid rgba(201,166,92,0.06)" }}>
        {[0,1,2,3].map(row=>[0,1,2].map(col=>(
          <div key={`${row}-${col}`} className="absolute"
            style={{ top:`${15+row*22}%`, left:`${12+col*28}%`, width:"16%", height:"9%",
              background:"rgba(180,140,60,0.04)", border:"1px solid rgba(201,166,92,0.07)",
              boxShadow:"inset 0 0 4px rgba(180,140,60,0.05)" }}/>
        )))}
      </div>

      {/* ── Grand arch frame ─── */}
      <div className="absolute left-[27%] right-[27%] top-[17%] bottom-[28%]" style={{ position:"absolute" }}>
        {/* Arch outline — gold border */}
        <div className="absolute inset-0 rounded-t-[40%]"
          style={{ border:"2px solid rgba(201,166,92,0.25)", borderBottom:"none" }}/>
        {/* Inner arch glow */}
        <div className="absolute inset-[3px] rounded-t-[40%]"
          style={{ border:"1px solid rgba(201,166,92,0.1)", borderBottom:"none" }}/>
      </div>

      {/* ── Column left ─── */}
      <div className="absolute" style={{ left:"27%", top:"17%", width:"3.5%", bottom:"28%",
        background:"linear-gradient(to right,#06050A,#0C0B10,#07060B)",
        borderRight:"1px solid rgba(201,166,92,0.2)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3%]"
          style={{ background:"#C9A65C", opacity:0.35 }}/>
        <div className="absolute bottom-0 left-0 right-0 h-[2%]"
          style={{ background:"#C9A65C", opacity:0.2 }}/>
        {/* Column flute lines */}
        {[25,50,75].map(p=>(
          <div key={p} className="absolute top-[3%] bottom-[2%] w-px"
            style={{ left:`${p}%`, background:"rgba(201,166,92,0.05)" }}/>
        ))}
      </div>

      {/* ── Column right ─── */}
      <div className="absolute" style={{ right:"27%", top:"17%", width:"3.5%", bottom:"28%",
        background:"linear-gradient(to left,#06050A,#0C0B10,#07060B)",
        borderLeft:"1px solid rgba(201,166,92,0.2)" }}>
        <div className="absolute top-0 left-0 right-0 h-[3%]"
          style={{ background:"#C9A65C", opacity:0.35 }}/>
        <div className="absolute bottom-0 left-0 right-0 h-[2%]"
          style={{ background:"#C9A65C", opacity:0.2 }}/>
        {[25,50,75].map(p=>(
          <div key={p} className="absolute top-[3%] bottom-[2%] w-px"
            style={{ left:`${p}%`, background:"rgba(201,166,92,0.05)" }}/>
        ))}
      </div>

      {/* ── Interior warm glow (behind the doors) ─── */}
      <div className="absolute transition-all duration-1000"
        style={{
          left:"30.5%", right:"30.5%", top:"20%", bottom:"28%",
          background:"radial-gradient(ellipse at 50% 60%, rgba(90,55,10,0.9) 0%, rgba(50,30,5,0.5) 40%, rgba(10,8,2,0.1) 80%, transparent 100%)",
          opacity: doorsOpen ? 1 : 0.25,
          filter: doorsOpen ? "blur(0px)" : "blur(4px)",
        }}/>

      {/* Warm light spill on floor when doors open */}
      <div className="absolute transition-all duration-1000"
        style={{
          left:"25%", right:"25%", bottom:"10%", height:"25%",
          background:"radial-gradient(ellipse at 50% 0%, rgba(80,48,8,0.4) 0%, transparent 70%)",
          opacity: doorsOpen ? 1 : 0,
        }}/>

      {/* ── LEFT DOOR ─── */}
      <div className="absolute transition-all duration-[1400ms] ease-in-out"
        style={{
          left:"30.5%", top:"20%", width:"19%", bottom:"28%",
          transformOrigin:"left center",
          transform: doorsOpen ? "perspective(1000px) rotateY(-75deg)" : "perspective(1000px) rotateY(0deg)",
          background:"linear-gradient(160deg,#18140C,#0E0B07,#16120A)",
          borderRight:"2px solid rgba(201,166,92,0.35)",
          borderTop:"1px solid rgba(201,166,92,0.15)",
          boxShadow: doorsOpen ? "none" : "-6px 0 30px rgba(0,0,0,0.8)",
        }}>
        {/* Door panel inset (top) */}
        <div className="absolute" style={{ top:"5%",left:"10%",right:"10%",height:"38%",
          border:"1px solid rgba(201,166,92,0.12)" }}/>
        {/* Door panel inset (bottom) */}
        <div className="absolute" style={{ top:"48%",left:"10%",right:"10%",height:"42%",
          border:"1px solid rgba(201,166,92,0.12)" }}/>
        {/* Gold handle */}
        <div className="absolute" style={{ right:"10%", top:"50%", transform:"translateY(-50%)",
          width:"6%", height:"20%", borderRadius:"2px",
          background:"linear-gradient(180deg,#E8C57A,#C9A65C,#A07A30)",
          boxShadow:"0 0 8px rgba(201,166,92,0.4)" }}/>
        {/* Gold side trim */}
        <div className="absolute top-0 bottom-0 right-0 w-px"
          style={{ background:"linear-gradient(180deg,transparent,rgba(201,166,92,0.5),rgba(201,166,92,0.6),rgba(201,166,92,0.5),transparent)" }}/>
      </div>

      {/* ── RIGHT DOOR ─── */}
      <div className="absolute transition-all duration-[1400ms] ease-in-out"
        style={{
          right:"30.5%", top:"20%", width:"19%", bottom:"28%",
          transformOrigin:"right center",
          transform: doorsOpen ? "perspective(1000px) rotateY(75deg)" : "perspective(1000px) rotateY(0deg)",
          background:"linear-gradient(160deg,#16120A,#0E0B07,#18140C)",
          borderLeft:"2px solid rgba(201,166,92,0.35)",
          borderTop:"1px solid rgba(201,166,92,0.15)",
          boxShadow: doorsOpen ? "none" : "6px 0 30px rgba(0,0,0,0.8)",
        }}>
        <div className="absolute" style={{ top:"5%",left:"10%",right:"10%",height:"38%",
          border:"1px solid rgba(201,166,92,0.12)" }}/>
        <div className="absolute" style={{ top:"48%",left:"10%",right:"10%",height:"42%",
          border:"1px solid rgba(201,166,92,0.12)" }}/>
        <div className="absolute" style={{ left:"10%", top:"50%", transform:"translateY(-50%)",
          width:"6%", height:"20%", borderRadius:"2px",
          background:"linear-gradient(180deg,#E8C57A,#C9A65C,#A07A30)",
          boxShadow:"0 0 8px rgba(201,166,92,0.4)" }}/>
        <div className="absolute top-0 bottom-0 left-0 w-px"
          style={{ background:"linear-gradient(180deg,transparent,rgba(201,166,92,0.5),rgba(201,166,92,0.6),rgba(201,166,92,0.5),transparent)" }}/>
      </div>

      {/* ── Door step / threshold ─── */}
      <div className="absolute" style={{ left:"30.5%", right:"30.5%", bottom:"28%", height:"0.5%",
        background:"linear-gradient(90deg,transparent,rgba(201,166,92,0.4),rgba(201,166,92,0.5),rgba(201,166,92,0.4),transparent)" }}/>

      {/* ── Floor ─── */}
      <div className="absolute left-0 right-0 bottom-0" style={{ height:"30%" }}>
        {/* Base floor */}
        <div className="absolute inset-0"
          style={{ background:"linear-gradient(to bottom,#0A0806,#050404)" }}/>
        {/* Marble reflection lines (perspective) */}
        {[-3,-2,-1,0,1,2,3].map(i=>(
          <div key={i} className="absolute top-0 bottom-0"
            style={{
              left:`calc(50% + ${i * 14}%)`, width:"1px",
              background:"linear-gradient(to bottom,rgba(201,166,92,0.05),transparent 60%)",
              transform:`perspective(400px) rotateX(45deg)`,
            }}/>
        ))}
        {/* Horizontal floor seams */}
        {[20,40,60,80].map(p=>(
          <div key={p} className="absolute left-[20%] right-[20%]"
            style={{ top:`${p}%`, height:"1px",
              background:"linear-gradient(90deg,transparent,rgba(201,166,92,0.04),rgba(201,166,92,0.06),rgba(201,166,92,0.04),transparent)" }}/>
        ))}
        {/* Floor center glow (when doors open) */}
        <div className="absolute top-0 left-[30%] right-[30%] h-[40%] transition-opacity duration-1000"
          style={{
            background:"radial-gradient(ellipse at 50% 0%,rgba(80,48,8,0.35),transparent 80%)",
            opacity: doorsOpen ? 1 : 0,
          }}/>
      </div>

      {/* ── Lanterns flanking the entrance ─── */}
      {[{ x:"28.5%" }, { x:"68%" }].map((pos, i) => (
        <div key={i} className="absolute" style={{ left:pos.x, top:"22%", width:"2%", paddingTop:"3%" }}>
          <div className="w-full aspect-square rounded-full"
            style={{ background:"radial-gradient(circle,rgba(201,166,92,0.6),rgba(150,110,30,0.2) 60%,transparent 100%)",
              boxShadow:"0 0 20px rgba(201,166,92,0.2), 0 0 40px rgba(201,166,92,0.08)" }}/>
        </div>
      ))}

      {/* ── Bottom ground/step line ─── */}
      <div className="absolute left-0 right-0" style={{ bottom:"28%", height:"1px",
        background:"linear-gradient(90deg,transparent 5%,rgba(201,166,92,0.2) 20%,rgba(201,166,92,0.35) 50%,rgba(201,166,92,0.2) 80%,transparent 95%)" }}/>
    </div>
  );
}

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <Image src="/logo-valtiqstay.png" alt="ValtiqStay" width={420} height={151} priority
      sizes="(max-width:768px) 120px, 180px"
      className="h-auto w-[120px] md:w-[180px]"/>
  );
}

/* ─── Icon ───────────────────────────────────────────────────────────────── */
function Icon({ type }: { type:"passport"|"qr"|"hotel" }) {
  if (type==="passport") return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (type==="qr") return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 15h2v2h-2zM19 14h1v6h-6v-1M14 19h2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
  return (
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 21V8l8-5 8 5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 21v-7h6v7M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Animated Metric ────────────────────────────────────────────────────── */
function AnimatedMetric({ value, label }: { value:string; label:string }) {
  const ref  = useRef<HTMLDivElement>(null);
  const m    = value.match(/^(-?)(\d+)(.*)/);
  const pre  = m?.[1]??""; const num = parseInt(m?.[2]??"0",10); const suf = m?.[3]??"";
  const [text,setText]   = useState(`${pre}${num}${suf}`);
  const [flash,setFlash] = useState(false);
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
        if(p<1) requestAnimationFrame(tick); else { setText(`${pre}${num}${suf}`); setFlash(true); }
      };
      requestAnimationFrame(tick);
    },{threshold:0.5});
    obs.observe(el); return()=>obs.disconnect();
  },[num,pre,suf]);
  return (
    <div ref={ref} className="text-center px-6 border-r border-[rgba(201,166,92,0.15)] last:border-r-0">
      <p className={`text-3xl md:text-4xl font-semibold tabular-nums text-[#C9A65C] ${flash?"counter-flash":""}`}
         onAnimationEnd={()=>setFlash(false)}>{text}</p>
      <p className="mt-1 text-[10px] text-[#4A3F2A] uppercase tracking-widest">{label}</p>
    </div>
  );
}

/* ─── Scroll Reveal ──────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const els=document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach(el=>{
      const {top,bottom}=el.getBoundingClientRect();
      if(top>=window.innerHeight||bottom<=0){
        const d=el.getAttribute("data-delay");
        el.style.opacity="0"; el.style.transform="translateY(32px)";
        el.style.transition=`opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${d?parseInt(d)*80:0}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${d?parseInt(d)*80:0}ms`;
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

/* ─── Particle Canvas ────────────────────────────────────────────────────── */
function Particles() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d"); if(!ctx) return;
    let id=0, vis=true;
    type P={x:number;y:number;vx:number;vy:number;r:number;a:number;hex:string};
    const pal=["#C9A65C","#E8C57A","#B8944E","rgba(201,166,92,0.2)"];
    let pts: P[]=[];
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    const spawn=():P=>({x:Math.random()*c.width,y:Math.random()*c.height,
      vx:(Math.random()-.5)*.25,vy:-(Math.random()*.2+.05),
      r:Math.random()*1.5+.3,a:Math.random()*.3+.05,
      hex:pal[Math.floor(Math.random()*pal.length)]});
    const init=()=>{pts=Array.from({length:45},spawn);};
    const draw=()=>{
      if(!vis){id=0;return;}
      ctx.clearRect(0,0,c.width,c.height);
      for(const p of pts){
        p.x+=p.vx;p.y+=p.vy;
        if(p.y<-4){p.y=c.height+4;p.x=Math.random()*c.width;}
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        ctx.globalAlpha=p.a;ctx.fillStyle=p.hex;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;id=requestAnimationFrame(draw);
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

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function HomeClient() {
  const [lang, setLang]       = useState<Lang>("it");
  const [phase, setPhase]     = useState<Phase>("exterior");
  const [doorsOpen, setDoors] = useState(false);
  const [exitIntro, setExit]  = useState(false);
  const [mobileOpen, setMob]  = useState(false);
  const [laserKey, setLaser]  = useState(0);
  useScrollReveal();
  const t = copy[lang];

  useEffect(()=>{ document.documentElement.lang=lang; },[lang]);
  useEffect(()=>{ setLaser(k=>k+1); },[]);

  // ── Intro timeline ──────────────────────────────────────────────────────
  useEffect(()=>{
    const timers: ReturnType<typeof setTimeout>[] = [];
    // exterior (hotel scene approach): 0 → 2800ms
    timers.push(setTimeout(()=>setPhase("scanning"), 2800));
    // scanning (QR): 2800 → 6000ms
    timers.push(setTimeout(()=>setPhase("verified"), 6000));
    // verified (V logo): 6000 → 7500ms
    timers.push(setTimeout(()=>{ setPhase("opening"); setDoors(true); }, 7500));
    // opening (doors): 7500 → 9200ms
    timers.push(setTimeout(()=>{ setExit(true); }, 9200));
    // remove overlay: 9200 → 10000ms
    timers.push(setTimeout(()=>setPhase("content"), 10000));
    return ()=>timers.forEach(clearTimeout);
  },[]);

  const skip = ()=>{ setExit(true); setTimeout(()=>setPhase("content"),800); };

  const features = [
    {icon:"passport"as const, title:t.feat1Title, text:t.feat1Text, accent:"text-blue-400"},
    {icon:"qr"as const,       title:t.feat2Title, text:t.feat2Text, accent:"text-[#C9A65C]"},
    {icon:"hotel"as const,    title:t.feat3Title, text:t.feat3Text, accent:"text-emerald-400"},
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <a href="#main-content" className="skip-link">{t.skipNav}</a>

      {/* ══════════ CINEMATIC INTRO ══════════════════════════════════════ */}
      {phase !== "content" && (
        <div className={`fixed inset-0 z-50 bg-[#080808] ${exitIntro?"intro-exit":""}`}>

          {/* Skip */}
          <button type="button" onClick={skip}
            className="absolute top-6 right-6 z-10 text-[10px] tracking-[0.4em] text-[#3A3020] hover:text-[#C9A65C] transition uppercase">
            {t.skip} →
          </button>

          {/* ── Hotel scene ─────────────────────────────────────────────── */}
          <div className={`absolute inset-0 ${phase==="exterior"?"scene-zoom":""}`}
            style={{ transformOrigin:"50% 65%" }}>
            <HotelScene doorsOpen={doorsOpen} hotelName={t.hotelName}/>
          </div>

          {/* ── QR scanning overlay ─────────────────────────────────────── */}
          {phase==="scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 panel-in">
              {/* Frosted card */}
              <div className="relative rounded-2xl p-6 text-center"
                style={{ background:"rgba(8,6,3,0.82)", border:"1px solid rgba(201,166,92,0.2)",
                  backdropFilter:"blur(12px)", boxShadow:"0 0 60px rgba(0,0,0,0.6)" }}>
                <p className="text-[9px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-5">{t.scanSub}</p>

                {/* Corner accents */}
                {[["top-0 left-0","border-t-2 border-l-2","rounded-tl-lg"],
                  ["top-0 right-0","border-t-2 border-r-2","rounded-tr-lg"],
                  ["bottom-0 left-0","border-b-2 border-l-2","rounded-bl-lg"],
                  ["bottom-0 right-0","border-b-2 border-r-2","rounded-br-lg"]].map(([pos,brd,rad],i)=>(
                  <div key={i} className={`absolute ${pos} w-4 h-4 ${brd} border-[#C9A65C] ${rad}`}/>
                ))}

                {/* QR + laser */}
                <div className="relative inline-block">
                  <QRCode size={160}/>
                  <div key={laserKey} className="absolute left-0 right-0 h-[2px] pointer-events-none"
                    style={{ background:"linear-gradient(90deg,transparent,#C9A65C,#FFF8DC,#C9A65C,transparent)",
                      boxShadow:"0 0 12px #C9A65C,0 0 24px rgba(201,166,92,0.4)",
                      animation:"laser 1.1s ease-in-out 2.5",
                      position:"absolute", top:"5%" }}/>
                </div>

                <p className="mt-4 text-xs text-[#4A3F2A] tracking-wider">{t.scanLabel}</p>
                {/* Dots */}
                <div className="mt-3 flex gap-1.5 justify-center">
                  {[0,1,2].map(i=>(
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A65C]"
                      style={{ animation:`blink 1.3s ease ${i*.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Verified: V logo ─────────────────────────────────────────── */}
          {phase==="verified" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              {/* Glowing ring behind V */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-40 h-40 rounded-full glow-pulse"
                  style={{ background:"radial-gradient(circle,rgba(201,166,92,0.08),transparent 70%)" }}/>
                <div className="v-in glow-pulse w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ border:"1px solid rgba(201,166,92,0.2)",
                    background:"rgba(8,6,3,0.9)",backdropFilter:"blur(16px)" }}>
                  <VLogoMark size={56}/>
                </div>
              </div>
              <div className="v-in text-center" style={{animationDelay:"0.3s"}}>
                <p className="text-[10px] tracking-[0.5em] text-[#C9A65C] uppercase">✓ {t.verified}</p>
                <p className="mt-1 text-xs text-[#3A2E1A] tracking-[0.25em]">{t.verifiedSub}</p>
              </div>
            </div>
          )}

          {/* ── V mark visible between doors during opening ──────────────── */}
          {phase==="opening" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="v-in" style={{animationDelay:"0.1s"}}>
                <VLogoMark size={64}/>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════ MAIN CONTENT ════════════════════════════════════════ */}
      <main id="main-content" className="bg-[#080808] text-[#F0EDE4] min-h-screen">

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5"
          style={{background:"linear-gradient(to bottom,rgba(8,8,8,0.97),transparent)",backdropFilter:"blur(8px)"}}>
          <Logo/>
          <div className="hidden md:flex items-center gap-7 text-xs tracking-widest text-[#3A3020] uppercase">
            {t.nav.map((item,i)=>(
              <a key={i} href={["#solution","#how","#dashboard","#pms"][i]}
                className="hover:text-[#C9A65C] transition">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={()=>setLang(lang==="it"?"en":"it")}
              className="hidden md:block text-[10px] tracking-widest text-[#3A2E1A] hover:text-[#C9A65C] transition px-3 py-2 border border-[rgba(201,166,92,0.12)] rounded-full">
              {lang==="it"?"EN":"IT"}
            </button>
            <a href="#cta"
              className="glow-btn hidden md:inline-flex rounded-full bg-[#C9A65C] px-5 py-2.5 text-xs font-semibold tracking-widest text-[#080808] uppercase transition hover:opacity-90">
              {t.demo}
            </a>
            <button type="button"
              className="md:hidden text-[#3A3020] hover:text-[#C9A65C] transition"
              onClick={()=>setMob(!mobileOpen)}
              aria-label={mobileOpen?t.closeMenu:t.openMenu}
              aria-expanded={mobileOpen}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {mobileOpen?<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>:<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-[#080808] flex flex-col items-center justify-center gap-8">
            {t.nav.map((item,i)=>(
              <a key={i} href={["#solution","#how","#dashboard","#pms"][i]}
                className="text-xs tracking-[0.4em] text-[#4A4030] hover:text-[#C9A65C] transition uppercase"
                onClick={()=>setMob(false)}>{item}</a>
            ))}
            <a href="#cta" onClick={()=>setMob(false)}
              className="mt-4 rounded-full bg-[#C9A65C] px-8 py-3 text-xs font-semibold tracking-widest text-[#080808] uppercase">
              {t.demo}
            </a>
          </div>
        )}

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-20 px-6">
          <Particles/>
          <div className="absolute inset-0 pointer-events-none"
            style={{background:"radial-gradient(ellipse 55% 55% at 25% 55%,rgba(201,166,92,0.03) 0%,transparent 70%)"}}/>
          <div className="relative mx-auto max-w-6xl w-full">
            <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-8" data-reveal="">
              {t.heroEyebrow}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-[86px] font-light leading-[1.04] tracking-[-0.03em] max-w-5xl"
              data-reveal="" data-delay="1">
              {t.heroTitle}<br/>
              <span className="bg-gradient-to-r from-[#C9A65C] via-[#E8C57A] to-[#C9A65C] bg-clip-text text-transparent">
                {t.heroHighlight}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base text-[#4A4030] leading-8" data-reveal="" data-delay="2">
              {t.heroText}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4" data-reveal="" data-delay="3">
              <a href="#cta"
                className="glow-btn glow-gold inline-flex justify-center rounded-full bg-[#C9A65C] px-8 py-4 text-sm font-semibold text-[#080808] transition hover:opacity-90">
                {t.demo}
              </a>
              <a href="#how"
                className="inline-flex justify-center rounded-full border border-[rgba(201,166,92,0.15)] px-8 py-4 text-sm text-[#4A4030] hover:text-[#C9A65C] hover:border-[rgba(201,166,92,0.3)] transition">
                {t.discover}
              </a>
            </div>
            <div className="mt-16 inline-flex rounded-2xl border border-[rgba(201,166,92,0.1)] bg-[rgba(201,166,92,0.02)] px-2 py-5"
              data-reveal="" data-delay="4">
              {metrics.map(([v,it,en])=>(
                <AnimatedMetric key={v} value={v} label={lang==="it"?it:en}/>
              ))}
            </div>
          </div>
          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-10 bg-gradient-to-b from-[rgba(201,166,92,0.3)] to-transparent mx-auto"/>
          </div>
        </section>

        {/* ── PROBLEM ─────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex items-center py-32 px-6 bg-[#05080F]">
          <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6" data-reveal="">
                {t.problemEyebrow}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight"
                data-reveal="" data-delay="1">
                {t.problemTitle}
              </h2>
              <div className="mt-8 h-px w-16 bg-gradient-to-r from-[#C9A65C] to-transparent" data-reveal="" data-delay="2"/>
              <p className="mt-8 text-base text-[#4A4030] leading-8" data-reveal="" data-delay="2">
                {t.problemText}
              </p>
            </div>
            <div className="grid gap-3" data-reveal="" data-delay="2">
              {[["⏱","🔴"],["📋","🔴"],["⚡","🔴"],["🔒","🔴"]].map(([icon,_],i)=>(
                <div key={i} className="flex items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-5 py-4">
                  <span className="text-lg opacity-30">{icon}</span>
                  <span className="text-sm text-[#3A3020]">{t.problemItems[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOLUTION ────────────────────────────────────────────────────── */}
        <section id="solution" className="py-32 px-6 bg-[#080808]">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6" data-reveal="">
              {t.solutionEyebrow}
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight max-w-2xl" data-reveal="" data-delay="1">
              {lang==="it"?"Un'identità digitale al centro di ogni arrivo.":"One digital identity at the heart of every arrival."}
            </h2>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {features.map((f,i)=>(
                <div key={f.title}
                  className="shimmer card-glow rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-8"
                  data-reveal="" data-delay={String(i+1)}>
                  <div className={`mb-5 ${f.accent}`}><Icon type={f.icon}/></div>
                  <h3 className="text-xl font-medium mb-3">{f.title}</h3>
                  <div className="h-px w-8 bg-[#C9A65C] mb-5 opacity-50"/>
                  <p className="text-sm text-[#4A4030] leading-7">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section id="how" className="py-32 px-6 bg-[#05080F]">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6" data-reveal="">
                {t.howEyebrow}
              </p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight" data-reveal="" data-delay="1">
                {t.howTitle}
              </h2>
              <div className="mt-6 h-px w-10 bg-[#C9A65C] opacity-50" data-reveal="" data-delay="2"/>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {t.steps.map((step,i)=>(
                <div key={step}
                  className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-7"
                  data-reveal="" data-delay={String(i+1)}>
                  <div className="pulse-ring mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,166,92,0.25)] text-base font-light text-[#C9A65C]"
                    style={{animationDelay:`${i*.6}s`}}>
                    0{i+1}
                  </div>
                  <p className="text-sm font-medium leading-7 text-[#6A5F4A]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD ───────────────────────────────────────────────────── */}
        <section id="dashboard" className="py-32 px-6 bg-[#080808]">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6" data-reveal="">
                {t.dashEyebrow}
              </p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight" data-reveal="" data-delay="1">
                {t.dashTitle}
              </h2>
              <p className="mt-6 text-base text-[#4A4030] leading-8" data-reveal="" data-delay="2">
                {t.dashSub}
              </p>
            </div>
            <div className="shimmer rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5"
              data-reveal="" data-delay="1">
              <div className="rounded-xl bg-[#0A0908] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#2A2418] mb-1">Hotel Dashboard</p>
                    <h3 className="text-lg font-medium">Guest Operations Center</h3>
                  </div>
                  <span className="rounded-full border border-[rgba(201,166,92,0.15)] bg-[rgba(201,166,92,0.04)] px-3 py-1 text-xs text-[#C9A65C]">
                    Live PMS Sync
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[["24","Arrivals"],["18","Verified"],["6","Ready"]].map(([v,l])=>(
                    <div key={l} className="rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3 text-center">
                      <p className="text-xl font-semibold text-[#C9A65C]">{v}</p>
                      <p className="text-[10px] text-[#2A2418] mt-1">{l}</p>
                    </div>
                  ))}
                </div>
                {[["Marco Rossi","Verified","Room 204"],["Claire Martin","Ready","Room 118"],["Anna Keller","Pending","Suite 12"]].map(([n,s,r])=>(
                  <div key={n} className="mb-2 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{n}</p>
                      <p className="text-xs text-[#2A2418]">{r}</p>
                    </div>
                    <span className="text-xs text-[#C9A65C] border border-[rgba(201,166,92,0.18)] rounded-full px-3 py-1">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST SECTION ───────────────────────────────────────────────── */}
        <section className="py-28 px-6 bg-[#05080F] text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6" data-reveal="">VALTIQSTAY</p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight" data-reveal="" data-delay="1">
              {lang==="it"?"Fiducia. Identità. Connessione.":"Trust. Identity. Connection."}
            </h2>
            <div className="mx-auto mt-10 h-px max-w-xs bg-gradient-to-r from-transparent via-[#C9A65C] to-transparent opacity-30"/>
          </div>
        </section>

        {/* ── PMS ─────────────────────────────────────────────────────────── */}
        <section id="pms" className="py-24 px-6 bg-[#080808]">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-4" data-reveal="">
              {t.pmsEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight max-w-2xl mx-auto" data-reveal="" data-delay="1">
              {t.pmsTitle}
            </h2>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {pms.map((item,i)=>(
                <div key={item.name}
                  className="pms-card flex h-24 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-6"
                  data-reveal="" data-delay={String((i%4)+1)}>
                  <Image src={item.logo} alt={item.name} width={120} height={48} loading="lazy"
                    className="h-10 w-auto max-w-[100px] object-contain"/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section id="cta" className="py-32 px-6 bg-[#05080F]">
          <div className="shimmer card-glow mx-auto max-w-4xl rounded-3xl border border-[rgba(201,166,92,0.1)] bg-[rgba(201,166,92,0.02)] p-14 text-center"
            data-reveal="">
            <p className="text-[10px] tracking-[0.5em] text-[#3A2E1A] uppercase mb-6">{t.ctaEyebrow}</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">{t.ctaTitle}</h2>
            <p className="mt-6 max-w-xl mx-auto text-base text-[#4A4030] leading-8">{t.ctaText}</p>
            <a href="mailto:hello@valtiqstay.com?subject=ValtiqStay%20Demo"
              className="glow-btn glow-gold mt-10 inline-flex rounded-full bg-[#C9A65C] px-10 py-4 text-sm font-semibold text-[#080808] transition hover:opacity-90">
              {t.ctaBtn}
            </a>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-[rgba(255,255,255,0.04)] bg-[#080808] px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6">
            <Logo/>
            <div className="flex gap-6 text-[10px] tracking-[0.35em] text-[#2A2418] uppercase">
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
