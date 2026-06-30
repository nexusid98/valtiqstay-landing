"use client";

import { useState } from "react";

const C = {
  border: "rgba(212,180,131,0.18)",
  gold: "#D4B483",
  input: "rgba(255,255,255,0.04)",
};

export default function SendLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "rgba(34,197,94,0.12)" : C.input,
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : C.border}`,
        color: copied ? "#4ade80" : C.gold,
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copiato" : "Copia link"}
    </button>
  );
}
