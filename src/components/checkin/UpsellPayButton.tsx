"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * "Pay this extra" button for the guest's confirmation step.
 *
 * It only ever sends { token, stayId, itemKey } — never an amount. The server
 * route (/api/billing/upsell-checkout) validates the token with the guest
 * security-definer RPC and recomputes the price from the hotel's upsell_items
 * rows before creating the Stripe Checkout session.
 *
 *  503 billing_not_configured → "payments unavailable" (no Stripe keys yet)
 *  400 no_items / invalid_price → "extra no longer available"
 *  anything else → generic error
 */
export function UpsellPayButton({
  token,
  stayId,
  itemKey,
  amountLabel,
  className = "",
}: {
  token: string;
  stayId: string;
  itemKey: string;
  amountLabel: string;
  className?: string;
}) {
  const t = useTranslations("checkin.payment");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/upsell-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, stayId, itemKey }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.status === 503) {
        setError(t("unavailable"));
        setPending(false);
        return;
      }
      if (res.status === 400) {
        setError(t("noItems"));
        setPending(false);
        return;
      }
      if (!res.ok || !body.url) {
        setError(t("error"));
        setPending(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3.5 text-base font-medium text-champagne transition-colors hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? t("pending") : t("pay", { amount: amountLabel })}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
