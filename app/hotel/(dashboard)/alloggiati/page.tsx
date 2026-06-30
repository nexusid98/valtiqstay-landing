import type { Metadata } from "next";
import Link from "next/link";
import AlloggiatiClient from "./AlloggiatiClient";

export const metadata: Metadata = {
  title: "Alloggiati Web",
  robots: "noindex, nofollow",
};

export default function AlloggiatiPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
      {/* Back */}
      <Link
        href="/hotel"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "rgba(245,233,211,0.45)",
          textDecoration: "none",
          letterSpacing: "0.03em",
          transition: "color 0.15s",
          width: "fit-content",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 32,
            fontWeight: 300,
            color: "#F5E9D3",
            margin: "0 0 6px",
            letterSpacing: "0.01em",
          }}
        >
          Alloggiati Web
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,233,211,0.4)", margin: 0 }}>
          Esporta le schedine alloggiati in formato Polizia di Stato per la trasmissione telematica.
        </p>
      </div>

      <AlloggiatiClient />

      {/* Instructions */}
      <div
        style={{
          background: "rgba(212,180,131,0.04)",
          border: "1px solid rgba(212,180,131,0.1)",
          borderRadius: 12,
          padding: "18px 22px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(245,233,211,0.6)",
            margin: "0 0 10px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Come procedere
        </h3>
        <ol
          style={{
            margin: 0,
            paddingLeft: 18,
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          {[
            "Seleziona il periodo di riferimento (data di arrivo degli ospiti).",
            "Scarica il file .txt generato.",
            "Verifica i codici ISTAT per comuni e stati esteri nel file.",
            "Accedi al portale Alloggiati Web (alloggiatiweb.poliziadistato.it).",
            "Importa il file nella sezione «Invio massivo» del portale.",
          ].map((step, i) => (
            <li key={i} style={{ fontSize: 13, color: "rgba(245,233,211,0.4)", lineHeight: 1.6 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
