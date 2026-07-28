"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const router = useRouter();

  async function handleClick() {
    if (step === "idle") {
      setStep("confirm");
      return;
    }
    setStep("loading");
    try {
      const res = await fetch(`/api/hotel/reservations/${reservationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/hotel");
      } else {
        setStep("idle");
      }
    } catch {
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
        background: isConfirm ? "rgba(220,38,38,0.1)" : "transparent",
        color: isConfirm ? "#fca5a5" : "rgba(220,38,38,0.55)",
        border: `1px solid ${isConfirm ? "rgba(220,38,38,0.45)" : "rgba(220,38,38,0.25)"}`,
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
      {isLoading
        ? "Annullamento…"
        : isConfirm
        ? "Conferma annullamento"
        : "Annulla prenotazione"}
    </button>
  );
}
