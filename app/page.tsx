"use client";

import Image from "next/image";
import { useState } from "react";

const copy = {
  it: {
    nav: ["Soluzione", "Come funziona", "Dashboard", "PMS", "Demo"],
    heroBadge: "Trust • Identity • Connection",
    heroTitleStart: "Identità digitale verificata per",
    heroTitleHighlight: "l'ospitalità moderna.",
heroText: "Riduci i tempi di check-in, verifica l'identità degli ospiti e raccogli il consenso ai dati in pochi secondi.",
demo: "Richiedi una Demo",
    discover: "Scopri come funziona",

    problem: "Il problema",

    problemTitle:
      "Il check-in tradizionale non è più all’altezza dell’ospitalità moderna.",

    problemText:
      "Documenti raccolti manualmente, dati inseriti a mano e procedure lente riducono l’efficienza della reception e peggiorano l’esperienza ospite.",

    solution: "La soluzione",

    how: "Come funziona",

    howTitle:
      "Un flusso sicuro progettato per hotel, ospiti e strutture ricettive.",

    dashboard: "Dashboard Hotel",

    dashboardTitle:
      "Gestisci arrivi, identità e check-in da una vista chiara.",

    pms: "PMS Integration",

    pmsTitle:
      "Pensato per integrarsi con i sistemi già utilizzati dagli hotel.",

    finalTitle:
      "Porta un check-in premium nel tuo hotel.",

    finalText:
      "Una piattaforma progettata per hotel, gruppi alberghieri e strutture ricettive che vogliono digitalizzare il check-in senza complicare l’esperienza dell’ospite.",
  },

  en: {
    nav: ["Solution", "How it works", "Dashboard", "PMS", "Demo"],

    heroBadge: "Trust • Identity • Connection",

    heroTitleStart:
      "Trusted guest identity for",

    heroTitleHighlight:
      "modern hospitality.",

    heroText:
      "ValtiqStay connects guests and hotels through verified digital identity, secure consent-based data sharing and frictionless check-in.",

    demo: "Request a Demo",

    discover: "See how it works",

    problem: "The problem",

    problemTitle:
      "Traditional check-in no longer matches modern hospitality.",

    problemText:
      "Manual document collection, repetitive data entry and slow front-desk procedures reduce efficiency and weaken the guest experience.",

    solution: "The solution",

    how: "How it works",

    howTitle:
      "A secure flow designed for hotel reception teams.",

    dashboard: "Hotel Dashboard",

    dashboardTitle:
      "Manage arrivals, identity and check-in from one clear view.",

    pms: "PMS Integration",

    pmsTitle:
      "Designed to integrate with systems already used by hotels.",

    finalTitle:
      "Bring premium digital check-in to your hotel.",

    finalText:
      "A platform designed for hotels, hospitality groups and premium properties that want to digitalize check-in without adding friction to the guest experience.",
  },
};

const pms = [
  { name: "Leonardo", logo: "/pms/leonardo.png" },
  { name: "Simple Booking", logo: "/pms/simplebooking.png" },
  { name: "Mews", logo: "/pms/mews.png" },
  { name: "Ericsoft", logo: "/pms/ericsoft.png" },
  { name: "Protel", logo: "/pms/protel.png" },
  { name: "Oracle Opera", logo: "/pms/opera.png" },
];

const metrics = [
  ["-70%", "tempo medio al check-in", "average check-in time"],
  ["1 QR", "per condividere i dati", "to share verified data"],
  ["100%", "controllo dell’ospite", "guest control"],
];

function Logo() {
  return (
    <Image
      src="/logo-valtiqstay.png"
      alt="ValtiqStay"
      width={500}
      height={180}
      priority
      className="h-auto w-[420px]"
    />
  );
}function Icon({ type }: { type: "passport" | "qr" | "hotel" }) {
  if (type === "passport") {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect
          x="6"
          y="3"
          width="12"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="10"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 16h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "qr") {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M15 15h2v2h-2zM19 14h1v6h-6v-1M14 19h2"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 21V8l8-5 8 5v13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 21v-7h6v7M8 10h.01M12 10h.01M16 10h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  const [lang, setLang] = useState<"it" | "en">("it");

  const t = copy[lang];

  const features = [
    {
      icon: "passport" as const,
      title: lang === "it" ? "Passaporto Digitale" : "Digital Passport",
      text:
        lang === "it"
          ? "L’ospite conserva documenti e dati in un profilo digitale sicuro."
          : "Guests securely store identity data and documents in one verified profile.",
      color: "bg-blue-50 text-blue-700",
    },
    {
      icon: "qr" as const,
      title:
        lang === "it"
          ? "QR con conferma ospite"
          : "Consent-Based QR",
      text:
        lang === "it"
          ? "L’hotel accede ai dati solo dopo la conferma dell’ospite."
          : "Hotels access guest data only after explicit approval.",
      color: "bg-[#FFF3D8] text-[#9A742C]",
    },
    {
      icon: "hotel" as const,
      title:
        lang === "it"
          ? "Pensato per i PMS"
          : "PMS Ready",
      text:
        lang === "it"
          ? "Progettato per integrarsi con i software già usati dagli hotel."
          : "Designed to integrate with existing hospitality systems.",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const steps =
    lang === "it"
      ? [
          "L’ospite crea il proprio profilo verificato",
          "La struttura conferma la prenotazione",
          "Il QR abilita il check-in",
          "L’ospite approva la condivisione dei dati",
        ]
      : [
          "Guest creates a verified profile",
          "Hotel confirms reservation",
          "QR unlocks check-in",
          "Guest approves data sharing",
        ];

  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#172033]">      <section className="relative overflow-hidden border-b border-[#E8E0D2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#DBEAFE_0%,transparent_35%),radial-gradient(circle_at_top_left,#F3E7C8_0%,transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-4">

          <nav className="flex items-center justify-between">
            <Logo />

            <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
              <a href="#solution">{t.nav[0]}</a>
              <a href="#how">{t.nav[1]}</a>
              <a href="#dashboard">{t.nav[2]}</a>
              <a href="#pms">{t.nav[3]}</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === "it" ? "en" : "it")}
                className="rounded-full border border-[#D8C49A] bg-white px-4 py-2 text-sm font-semibold text-[#8A6B2F]"
              >
                {lang === "it" ? "EN" : "IT"}
              </button>

              <a
                href="#demo"
                className="rounded-full bg-[#172033] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                {t.demo}
              </a>
            </div>
          </nav>

          <section className="grid min-h-[80vh] items-center gap-14 py-8 lg:grid-cols-2">

            <div>

              <div className="mb-6 inline-flex rounded-full border border-[#D8C49A] bg-white/80 px-4 py-2 text-sm font-semibold text-[#8A6B2F] shadow-sm">
                {t.heroBadge}
              </div>

              <h1 className="max-w-5xl text-5xl font-semibold leading-tight tracking-[-0.05em] md:text-7xl">
                {t.heroTitleStart}{" "}
                <span className="text-[#B8944E]">
                  {t.heroTitleHighlight}
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
                {t.heroText}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                <a
                  href="#demo"
                  className="rounded-full bg-[#1D4ED8] px-8 py-4 text-center font-semibold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
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

              <div className="mt-10 grid max-w-2xl grid-cols-3 rounded-3xl border border-[#E8E0D2] bg-white/80 p-6 shadow-sm">

                {metrics.map(([value, itLabel, enLabel]) => (
                  <div
                    key={value}
                    className="border-r border-[#E8E0D2] px-4 text-center last:border-r-0"
                  >
                    <p className="text-3xl font-semibold text-[#172033]">
                      {value}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {lang === "it" ? itLabel : enLabel}
                    </p>
                  </div>
                ))}

              </div>

            </div>

            <div className="flex justify-center">

              <div className="w-full max-w-sm rounded-[2.5rem] border border-[#E8E0D2] bg-white p-4 shadow-2xl shadow-slate-300/50">

                <div className="rounded-[2rem] bg-[#172033] p-4">

                  <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-white/20" />

                  <div className="rounded-[1.5rem] bg-white p-5">

                    <div className="flex items-center justify-between">

                      <div className="text-lg font-semibold text-[#172033]">
                        ValtiqStay
                      </div>

     <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
  Verified Guest
</span>

                    </div>

                    <div className="mt-8 flex items-center gap-4">

                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
                        <Icon type="passport" />
                      </div>

                      <div>
  <p className="text-sm text-slate-500">
  Guest Passport
</p>

<h2 className="text-2xl font-semibold text-[#172033]">
  Marco Rossi
</h2>

<p className="mt-1 text-sm font-medium text-emerald-600">
  Identity Verified
</p>
</div>

                    </div>                    <div className="mt-8 grid gap-3">

                      
 {[
  [
    "Identity",
    "✓ Verified",
  ],

  [
    "Reservation",
    "✓ Confirmed",
  ],

  [
    "Consent",
    "✓ Signed",
  ],

  [
    "Check-in",
    "✓ Ready",
  ],
].map(([label, value]) => (

                        <div
                          key={label}
                          className="flex items-center justify-between rounded-2xl bg-[#FAF8F4] p-4"
                        >

                          <span className="text-sm text-slate-500">
                            {label}
                          </span>

                          <span className="text-sm font-semibold text-[#8A6B2F]">
                            {value}
                          </span>

                        </div>

                      ))}

                    </div>

                    <div className="mt-4 rounded-2xl bg-[#FAF8F4] p-4">

  <p className="text-xs uppercase tracking-wide text-slate-400">
    Hotel
  </p>

  <p className="mt-1 font-semibold text-[#172033]">
    Grand Hotel Verona
  </p>

  <div className="mt-3 border-t border-[#E8E0D2] pt-3">

    <p className="text-xs uppercase tracking-wide text-slate-400">
      Arrival
    </p>

    <p className="mt-1 font-semibold text-[#172033]">
      12 June 2026
    </p>

  </div>

</div>

<button
  className="mt-4 w-full rounded-2xl bg-[#C9A65C] py-4 font-semibold text-[#172033] transition hover:opacity-90"
>
  Share Data
</button>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </section>      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6">

          <p className="font-semibold text-[#B8944E]">
            {t.problem}
          </p>

          <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            {t.problemTitle}
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {t.problemText}
          </p>

          <div
            id="solution"
            className="mt-20 grid gap-8 md:grid-cols-3"
          >

            {features.map((feature) => (

              <div
                key={feature.title}
                className="rounded-[2rem] border border-[#ECE7DD] bg-white p-8 shadow-xl shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >

                <div
                  className={`mb-8 flex h-16 w-16 items-center justify-center rounded-3xl ${feature.color}`}
                >
                  <Icon type={feature.icon} />
                </div>

                <h3 className="text-2xl font-semibold text-[#0F2445]">
                  {feature.title}
                </h3>

                <div className="mt-5 h-1 w-10 rounded-full bg-[#C8A96A]" />

                <p className="mt-6 leading-7 text-slate-600">
                  {feature.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>      <section
        id="how"
        className="relative overflow-hidden bg-gradient-to-r from-[#0F2A57] via-[#13376F] to-[#0B2550] py-24 text-white"
      >
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#E8C57A]">
              {t.how}
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              {t.howTitle}
            </h2>

            <div className="mt-8 h-1 w-16 rounded-full bg-[#E8C57A]" />
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step}>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E8C57A] bg-white/5 text-2xl font-semibold text-[#E8C57A]">
                  0{index + 1}
                </div>

                <p className="text-lg font-semibold leading-7">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>      <section id="dashboard" className="bg-[#FAF8F4] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">

          <div>
            <p className="font-semibold text-[#B8944E]">
              {t.dashboard}
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              {t.dashboardTitle}
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {lang === "it"
                ? "Una dashboard pensata per ridurre il lavoro manuale della reception e rendere più chiara la gestione degli arrivi."
                : "A dashboard designed to reduce manual work at reception and make arrival management clearer."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#E8E0D2] bg-white p-5 shadow-2xl shadow-slate-300/40">

            <div className="rounded-[1.5rem] bg-[#F8F6F1] p-5">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Hotel Dashboard
                  </p>

                  <h3 className="text-2xl font-semibold">
                    Guest Operations Center
                  </h3>
                </div>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  Live PMS Sync
                </span>

              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">

                {[
  ["24", "Today's Arrivals"],
  ["18", "Verified Guests"],
  ["6", "Check-ins Ready"],
].map(([value, label]) => (

                  <div
                    key={label}
                    className="rounded-2xl bg-white p-4 text-center shadow-sm"
                  >
                    <p className="text-2xl font-semibold text-[#172033]">
                      {value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {label}
                    </p>
                  </div>

                ))}

              </div>

              {[
  ["Marco Rossi", "Verified", "Room 204"],
  ["Claire Martin", "Ready For Check-in", "Room 118"],
  ["Anna Keller", "Verified", "Suite 12"],
  ["James Wilson", "Consent Pending", "Room 315"],
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
      </section>      <section className="bg-[#172033] py-24 text-white">

  <div className="mx-auto max-w-6xl px-6 text-center">

    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-[#C9A65C]">
      VALTIQSTAY
    </p>

    <h2 className="text-5xl font-semibold tracking-[-0.04em]">
  {lang === "it"
    ? "Fiducia. Identità. Connessione."
    : "Trust. Identity. Connection."}
</h2>

<p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
  {lang === "it"
    ? "Un livello di identità digitale affidabile progettato specificamente per l'ospitalità."
    : "A trusted digital identity layer built specifically for hospitality."}
</p>

    <div className="mx-auto mt-12 h-px max-w-md bg-gradient-to-r from-transparent via-[#C9A65C] to-transparent" />

  </div>

</section>

<section id="pms" className="bg-white py-24">

  <div className="mx-auto max-w-7xl px-6 text-center">

          <p className="font-semibold text-[#B8944E]">
            {t.pms}
          </p>

          <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.03em]">
            {t.pmsTitle}
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

            {pms.map((item) => (

  <div
    key={item.name}
    className="flex h-32 items-center justify-center rounded-2xl border border-[#E8E0D2] bg-[#FAF8F4] p-8 shadow-sm"
  >

    <img
      src={item.logo}
      alt={item.name}
      className="h-14 w-auto object-contain"
    />

  </div>

))}

          </div>

        </div>

      </section>

      <section id="demo" className="bg-[#FAF8F4] px-6 py-24">

        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#D8C49A] bg-white p-12 text-center shadow-2xl shadow-slate-300/40">

          <p className="font-semibold text-[#B8944E]">
            ValtiqStay Demo
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            {t.finalTitle}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {t.finalText}
          </p>

          <a
            href="mailto:hello@valtiqstay.com?subject=ValtiqStay Demo"
            className="mt-10 inline-flex rounded-full bg-[#1D4ED8] px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            {t.demo}
          </a>

        </div>

      </section>

      <footer className="border-t border-[#E8E0D2] bg-white px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">

          <Logo />

          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">

            <a href="mailto:hello@valtiqstay.com">
              Contact
            </a>

            <a href="#demo">
              Demo
            </a>

            <a href="#pms">
              PMS
            </a>

          </div>

        </div>

      </footer>

    </main>
  );
}