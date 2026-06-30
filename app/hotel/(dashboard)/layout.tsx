import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/hotel/login");

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotels(name)")
    .eq("user_id", user.id)
    .single();

  const hotelName =
    (hu?.hotels as unknown as { name: string } | null)?.name ?? "ValtiqStay";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#050B17",
        color: "#F5E9D3",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid rgba(212,180,131,0.15)",
          position: "sticky",
          top: 0,
          background: "#050B17",
          zIndex: 10,
        }}
      >
        <Link
          href="/hotel"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: "#D4B483",
            textDecoration: "none",
          }}
        >
          {hotelName}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(245,233,211,0.4)" }}>
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </header>
      <main style={{ flex: 1, padding: "32px 16px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
