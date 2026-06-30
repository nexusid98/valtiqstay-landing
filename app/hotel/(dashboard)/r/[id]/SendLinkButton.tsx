"use client";

import { useState } from "react";

const C = {
  midnight: "#050B17",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  border: "rgba(212,180,131,0.18)",
  input: "rgba(255,255,255,0.04)",
};

function buildWhatsAppUrl(url: string, guestName: string): string {
  const msg = `Gentile ${guestName},\nQui trovi il link per completare il check-in online prima del tuo arrivo:\n${url}\nÈ sufficiente seguire i passaggi indicati. A presto!`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

function buildMailtoUrl(url: string, guestName: string): string {
  const subject = encodeURIComponent("Check-in online — ValtiqStay");
  const body = encodeURIComponent(
    `Gentile ${guestName},\n\nla invitiamo a completare il check-in online prima del suo arrivo tramite il seguente link:\n\n${url}\n\nÈ sufficiente pochi minuti per completare la procedura.\n\nGrazie e a presto,\nLo staff dell'hotel`
  );
  return `mailto:?subject=${subject}&body=${body}`;
}

type Props = { url: string; guestName?: string };

export default function SendLinkButton({ url, guestName = "Ospite" }: Props) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState<"copy" | "wa" | "email" | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 15px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.05em",
    cursor: "pointer",
    border: "none",
    transition: "background 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {/* Copy */}
      <button
        onClick={handleCopy}
        onMouseEnter={() => setHovered("copy")}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...btnBase,
          background: copied
            ? "rgba(34,197,94,0.12)"
            : hovered === "copy"
            ? "rgba(212,180,131,0.12)"
            : C.input,
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : hovered === "copy" ? "rgba(212,180,131,0.4)" : C.border}`,
          color: copied ? "#4ade80" : C.gold,
          transform: hovered === "copy" && !copied ? "translateY(-1px)" : "none",
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copiato
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copia
          </>
        )}
      </button>

      {/* WhatsApp */}
      <a
        href={buildWhatsAppUrl(url, guestName)}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered("wa")}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...btnBase,
          background: hovered === "wa" ? "rgba(37,211,102,0.15)" : "rgba(37,211,102,0.07)",
          border: `1px solid ${hovered === "wa" ? "rgba(37,211,102,0.5)" : "rgba(37,211,102,0.2)"}`,
          color: hovered === "wa" ? "#25d366" : "rgba(37,211,102,0.8)",
          transform: hovered === "wa" ? "translateY(-1px)" : "none",
          boxShadow: hovered === "wa" ? "0 4px 16px rgba(37,211,102,0.12)" : "none",
        }}
      >
        {/* WhatsApp icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>

      {/* Email */}
      <a
        href={buildMailtoUrl(url, guestName)}
        onMouseEnter={() => setHovered("email")}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...btnBase,
          background: hovered === "email" ? "rgba(212,180,131,0.1)" : C.input,
          border: `1px solid ${hovered === "email" ? "rgba(212,180,131,0.35)" : C.border}`,
          color: hovered === "email" ? C.gold : "rgba(212,180,131,0.6)",
          transform: hovered === "email" ? "translateY(-1px)" : "none",
          boxShadow: hovered === "email" ? "0 4px 16px rgba(212,180,131,0.1)" : "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Email
      </a>
    </div>
  );
}
