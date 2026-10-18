"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Variant = "primary" | "secondary";

/**
 * Client button that POSTs to a billing endpoint and redirects the browser to
 * the Stripe-hosted URL it returns (Checkout or Billing Portal).
 *
 * Billing degrades gracefully: when the API answers 503
 * { error: "billing_not_configured" } (i.e. no Stripe keys in the
 * environment yet) the button shows a plain error line instead of breaking —
 * the server page normally hides the button in that case, this is a belt-and-
 * braces path for a key removed between render and click.
 */
export function BillingActionButton({
  endpoint,
  label,
  pendingLabel,
  errorLabel,
  variant = "primary",
  className = "",
}: {
  endpoint: string;
  label: string;
  pendingLabel: string;
  errorLabel: string;
  variant?: Variant;
  className?: string;
}) {
  const t = useTranslations("dashboard.billing");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.status === 503) {
        setError(t("notConfigured.title"));
        setPending(false);
        return;
      }
      if (!res.ok || !body.url) {
        setError(errorLabel);
        setPending(false);
        return;
      }
      // Full navigation to Stripe's hosted page.
      window.location.assign(body.url);
    } catch {
      setError(errorLabel);
      setPending(false);
    }
  }

  const base =
    "inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-gold text-navy-950 hover:bg-gold-light"
      : "border border-navy-600 text-champagne hover:border-gold hover:text-gold";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className={`${base} ${styles}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-champagne">
          {error}
        </p>
      ) : null}
    </div>
  );
}
