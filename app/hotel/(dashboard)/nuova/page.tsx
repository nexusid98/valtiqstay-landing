import type { Metadata } from "next";
import NuovaClient from "./NuovaClient";

export const metadata: Metadata = {
  title: "Nuova prenotazione",
  robots: "noindex, nofollow",
};

export default function NuovaPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 32,
            fontWeight: 300,
            color: "#F5E9D3",
            margin: "0 0 6px",
          }}
        >
          Nuova prenotazione
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,233,211,0.5)", margin: 0 }}>
          Compila i dati della prenotazione. Il link check-in verrà generato automaticamente.
        </p>
      </div>
      <NuovaClient siteUrl={siteUrl} />
    </div>
  );
}
