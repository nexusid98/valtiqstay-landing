import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UpsellsClient from "./UpsellsClient";

export const metadata: Metadata = {
  title: "Gestione Upsell",
  robots: "noindex, nofollow",
};

export default async function UpsellsPage() {
  const supabase = await createClient();

  const { data: upsells } = await supabase
    .from("upsells")
    .select("id, name, category, description, price, active")
    .order("category")
    .order("name");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
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
          width: "fit-content",
          transition: "color 0.15s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Dashboard
      </Link>

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
          Gestione Upsell
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,233,211,0.4)", margin: 0 }}>
          Configura i servizi aggiuntivi proposti agli ospiti durante il check-in.
        </p>
      </div>

      <UpsellsClient initialUpsells={upsells ?? []} />
    </div>
  );
}
