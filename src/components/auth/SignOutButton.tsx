"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

/** Signs the staff member out via POST /api/auth/signout, then returns to login. */
export function SignOutButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await fetch("/api/auth/signout", { method: "POST" });
    router.push(`/${params.locale}/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className="rounded-sm border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:border-gold hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter disabled:opacity-60"
    >
      {t("signOut")}
    </button>
  );
}
