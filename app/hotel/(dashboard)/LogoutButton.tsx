"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/hotel/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "transparent",
        border: "1px solid rgba(212,180,131,0.25)",
        color: "rgba(245,233,211,0.55)",
        borderRadius: 6,
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        letterSpacing: "0.04em",
      }}
    >
      Esci
    </button>
  );
}
