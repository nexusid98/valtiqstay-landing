"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualCheckInButton({ reservationId }: { reservationId: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const router = useRouter();

  async function handleClick() {
    if (step === "idle") { setStep("confirm"); return; }
    setStep("loading");
    try {
      const res = await fetch(`/api/hotel/reservations/${reservationId}/checkin`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setStep("idle");
    }
  }

  const isConfirm = step === "confirm";
  const isLoading = step === "loading";

  return (
    <button
      onClick={handleClick}
      onBlur={() => step === "confirm" && setStep("idle")}
      disabled={isLoading}
      style={{
        background: isConfirm ? "rgba(34,197,94,0.12)" : "rgba(212,180,131,0.07)",
        color: isConfirm ? "#4ade80" : "#D4B483",
        border: `1px solid ${isConfirm ? "rgba(34,197,94,0.35)" : "rgba(212,180,131,0.22)"}`,
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 12,
        fontWeight: 600,
        cursor: isLoading ? "not-allowed" : "pointer",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {isLoading ? "Salvataggio…" : isConfirm ? "Conferma ✓" : "Segna check-in"}
    </button>
  );
}
