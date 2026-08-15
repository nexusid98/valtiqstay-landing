"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import {
  createSessionAction,
  type CreateSessionResult,
} from "@/app/[locale]/dashboard/sessioni/nuova/actions";

/**
 * Create-link form. Client-side interactive: validates the date range and
 * expiry window locally, then calls the createSessionAction server action,
 * which invokes the staff-only create_checkin_session RPC. On success the form
 * is replaced by the generated link with a copy button and a "Nuova sessione"
 * reset.
 */
export function CreateSessionForm({
  defaultArrival,
  defaultDeparture,
  defaultExpires,
}: {
  defaultArrival: string;
  defaultDeparture: string;
  defaultExpires: number;
}) {
  const t = useTranslations("dashboard.create");
  const [result, setResult] = useState<CreateSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const arrival = String(formData.get("arrival_date") ?? "");
    const departure = String(formData.get("departure_date") ?? "");
    const expiresHours = Number(formData.get("expires_hours") ?? 48);

    if (!arrival || !departure || arrival >= departure) {
      setError(t("error.dateRange"));
      return;
    }
    if (!Number.isInteger(expiresHours) || expiresHours < 1 || expiresHours > 720) {
      setError(t("error.invalidData"));
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const res = await createSessionAction(formData);
      setResult(res);
      if (!res.ok) setError(t(`error.${res.errorKey}`));
    } catch {
      setError(t("error.generic"));
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  if (result?.ok) {
    return (
      <div className="rounded-sm border border-gold/40 bg-navy-950/60 p-6 text-center">
        <h2 className="font-serif text-xl text-gold">{t("successTitle")}</h2>
        <p className="mt-1 text-sm text-champagne/80">{t("successBody")}</p>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-sm border border-navy-700 bg-navy-900 px-4 py-3">
          <span className="min-w-0 truncate font-mono text-sm text-champagne">
            {result.url}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <CopyLinkButton url={result.url} label={t("copyLink")} copiedLabel={t("copied")} />
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center rounded-sm border border-navy-600 px-3 py-1.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
          >
            {t("reset")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="arrival_date" className="block text-sm text-champagne">
            {t("arrival")}
          </label>
          <input
            id="arrival_date"
            name="arrival_date"
            type="date"
            required
            defaultValue={defaultArrival}
            className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="departure_date" className="block text-sm text-champagne">
            {t("departure")}
          </label>
          <input
            id="departure_date"
            name="departure_date"
            type="date"
            required
            defaultValue={defaultDeparture}
            className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="room_label" className="block text-sm text-champagne">
          {t("roomLabel")}
        </label>
        <input
          id="room_label"
          name="room_label"
          type="text"
          placeholder={t("roomLabelPlaceholder")}
          className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-navy-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label htmlFor="booking_ref" className="block text-sm text-champagne">
          {t("bookingRef")}
        </label>
        <input
          id="booking_ref"
          name="booking_ref"
          type="text"
          placeholder={t("bookingRefPlaceholder")}
          className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white placeholder:text-navy-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label htmlFor="expires_hours" className="block text-sm text-champagne">
          {t("expiresHours")}
        </label>
        <input
          id="expires_hours"
          name="expires_hours"
          type="number"
          inputMode="numeric"
          min={1}
          max={720}
          required
          defaultValue={defaultExpires}
          className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold [color-scheme:dark]"
        />
        <p className="mt-1 text-xs text-navy-400">{t("expiresHint")}</p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-gold-light">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-sm bg-gold px-4 py-3 font-medium text-navy-950 transition-colors hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter disabled:opacity-60"
      >
        {busy ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
