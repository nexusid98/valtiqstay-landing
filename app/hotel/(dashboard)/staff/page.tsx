import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StaffClient from "./StaffClient";

export const metadata: Metadata = {
  title: "Staff",
  robots: "noindex, nofollow",
};

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();

  const admin = createAdminClient();
  let staffList: {
    user_id: string;
    email: string | null;
    last_sign_in: string | null;
    invited_at: string | null;
    confirmed: boolean;
  }[] = [];

  if (hu) {
    const { data: rows } = await admin
      .from("hotel_users")
      .select("user_id")
      .eq("hotel_id", hu.hotel_id);

    staffList = await Promise.all(
      (rows ?? []).map(async (row) => {
        const { data } = await admin.auth.admin.getUserById(row.user_id);
        return {
          user_id: row.user_id,
          email: data?.user?.email ?? null,
          last_sign_in: data?.user?.last_sign_in_at ?? null,
          invited_at: data?.user?.invited_at ?? null,
          confirmed: !!data?.user?.confirmed_at,
        };
      })
    );
  }

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
          width: "fit-content",
          transition: "color 0.15s",
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
          }}
        >
          Gestione Staff
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,233,211,0.4)", margin: 0 }}>
          Invita collaboratori e gestisci gli accessi al portale.
        </p>
      </div>

      <StaffClient staff={staffList} currentUserId={user.id} />
    </div>
  );
}
