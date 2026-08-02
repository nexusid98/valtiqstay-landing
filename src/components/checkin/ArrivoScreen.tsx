"use client";

import { useTranslations } from "next-intl";
import type { HotelData } from "@/lib/checkin/types";
import { Button } from "./ui";

/**
 * L'Arrivo — the first screen of the guest flow.
 * Full-bleed navy, hotel hero at 30% opacity, the hotel name in Playfair,
 * the single gold hairline animation, and one gold CTA.
 */
export function ArrivoScreen({
  hotel,
  onBegin,
}: {
  hotel: HotelData;
  onBegin: () => void;
}) {
  const t = useTranslations("checkin");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy px-6 text-center">
      {hotel.hero_url ? (
        <>
          <div aria-hidden="true" className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote hotel hero */}
            <img
              src={hotel.hero_url}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]"
        />
      )}

      <div className="relative z-10 flex w-full flex-col items-center">
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
          {hotel.name}
        </h1>

        <div aria-hidden="true" className="arrivo-hairline my-8 h-px w-[200px] bg-gold" />

        <p className="text-xs font-medium uppercase tracking-[0.35em] text-champagne">
          {t("arrivo.kicker")}
        </p>

        <Button
          onClick={onBegin}
          className="mt-12 min-h-[52px] w-full max-w-[280px] text-lg"
        >
          {t("arrivo.cta")}
        </Button>
      </div>
    </main>
  );
}
