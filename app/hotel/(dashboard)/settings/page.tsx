import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Impostazioni Hotel",
  robots: "noindex, nofollow",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/hotel/login");

  const { data: hotel } = await supabase
    .from("hotels")
    .select("id, name, checkin_time, checkout_time, tourist_tax_per_person_night, tourist_tax_max_nights, welcome_info")
    .single();

  if (!hotel) redirect("/hotel");

  const wi = (hotel.welcome_info ?? {}) as {
    inclusi?: string[];
    location?: string;
    wifi?: { rete: string; password: string };
    concierge?: { telefono: string; orari: string };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 680 }}>
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
          Impostazioni Hotel
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,233,211,0.4)", margin: 0 }}>
          Dati visibili agli ospiti durante il check-in digitale.
        </p>
      </div>

      <SettingsClient
        hotelId={hotel.id}
        initial={{
          name: hotel.name,
          checkin_time: hotel.checkin_time ?? "15:00",
          checkout_time: hotel.checkout_time ?? "11:00",
          tourist_tax_per_person_night: hotel.tourist_tax_per_person_night ?? 0,
          tourist_tax_max_nights: hotel.tourist_tax_max_nights ?? 0,
          inclusi: wi.inclusi ?? [],
          location: wi.location ?? "",
          wifi_rete: wi.wifi?.rete ?? "",
          wifi_password: wi.wifi?.password ?? "",
          concierge_tel: wi.concierge?.telefono ?? "",
          concierge_orari: wi.concierge?.orari ?? "",
        }}
      />
    </div>
  );
}
