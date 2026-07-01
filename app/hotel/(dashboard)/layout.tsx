import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import ScanQRButton from "./ScanQRButton";

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
    <>
      <style>{`
        .vq-logo:hover { opacity: 0.8; }
        .vq-nav-link {
          color: rgba(245,233,211,0.45);
          font-size: 13px;
          text-decoration: none;
          padding: 7px 13px;
          border-radius: 7px;
          transition: color 0.18s ease, background 0.18s ease;
          letter-spacing: 0.03em;
        }
        .vq-nav-link:hover {
          color: #D4B483;
          background: rgba(212,180,131,0.08);
        }
        .vq-nav-nuova {
          color: rgba(212,180,131,0.75);
          font-size: 13px;
          text-decoration: none;
          padding: 7px 13px;
          border-radius: 7px;
          border: 1px solid rgba(212,180,131,0.2);
          transition: all 0.18s ease;
          letter-spacing: 0.03em;
        }
        .vq-nav-nuova:hover {
          color: #D4B483;
          border-color: rgba(212,180,131,0.45);
          background: rgba(212,180,131,0.06);
        }
      `}</style>
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
            padding: "0 28px",
            height: 62,
            borderBottom: "1px solid rgba(212,180,131,0.12)",
            position: "sticky",
            top: 0,
            background: "rgba(5, 11, 23, 0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 10,
            boxShadow: "0 1px 0 rgba(212,180,131,0.07), 0 4px 24px rgba(0,0,0,0.25)",
          }}
        >
          {/* Logo */}
          <Link
            href="/hotel"
            className="vq-logo"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 21,
              fontWeight: 300,
              letterSpacing: "0.2em",
              color: "#D4B483",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "opacity 0.2s ease",
              flexShrink: 0,
            }}
          >
            {hotelName}
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/hotel" className="vq-nav-link">
              Dashboard
            </Link>
            <Link href="/hotel/upsells" className="vq-nav-link">
              Upsell
            </Link>
            <Link href="/hotel/alloggiati" className="vq-nav-link">
              Alloggiati
            </Link>
            <Link href="/hotel/staff" className="vq-nav-link">
              Staff
            </Link>
            <Link href="/hotel/settings" className="vq-nav-link">
              Impostazioni
            </Link>
            <Link href="/hotel/nuova" className="vq-nav-nuova">
              + Prenotazione
            </Link>
            <ScanQRButton />
          </nav>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <span
              style={{
                fontSize: 12,
                color: "rgba(245,233,211,0.3)",
                letterSpacing: "0.02em",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main style={{ flex: 1, padding: "36px 20px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </>
  );
}
