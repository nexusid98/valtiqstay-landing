"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCheckInStore } from "@/lib/checkin-store";
import { formatDate, formatPrice } from "@/lib/checkin/validation";
import type { UpsellItemData } from "@/lib/checkin/types";

/**
 * Confirmation — shown only after submit_checkin_session succeeded.
 * Subtle gold check animation, summary of everything submitted.
 */
export function ConfirmationStep({ upsellItems }: { upsellItems: UpsellItemData[] }) {
  const t = useTranslations("checkin");
  const locale = useLocale();
  const stay = useCheckInStore((state) => state.stay);
  const hotel = useCheckInStore((state) => state.hotel);
  const guests = useCheckInStore((state) => state.guests);
  const upsellSelections = useCheckInStore((state) => state.upsellSelections);

  const selectedItems = upsellItems.filter((item) =>
    upsellSelections.some((selection) => selection.item_id === item.id),
  );

  return (
    <div className="flex flex-col items-center text-center">
      <div
        aria-hidden="true"
        className="checkin-check-pop flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-gold" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-6 font-serif text-[1.5rem] leading-snug text-navy">
        {t("confirmation.title")}
      </h2>
      <p className="mt-2 text-navy-500">{t("confirmation.message")}</p>

      <dl className="mt-8 w-full space-y-3 rounded-xl border border-champagne/40 p-5 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-navy-500">{t("confirmation.stay")}</dt>
          <dd className="font-medium text-navy">
            {hotel?.name}
          </dd>
        </div>
        {stay ? (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-navy-500">{t("confirmation.arrival")}</dt>
              <dd className="font-medium text-navy">
                {formatDate(stay.arrival_date, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-navy-500">{t("confirmation.departure")}</dt>
              <dd className="font-medium text-navy">
                {formatDate(stay.departure_date, locale)}
              </dd>
            </div>
            {stay.room_label ? (
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">{t("confirmation.room")}</dt>
                <dd className="font-medium text-navy">{stay.room_label}</dd>
              </div>
            ) : null}
            {stay.booking_ref ? (
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">{t("confirmation.bookingRef")}</dt>
                <dd className="font-medium text-navy">{stay.booking_ref}</dd>
              </div>
            ) : null}
          </>
        ) : null}

        <div className="border-t border-champagne/40 pt-3">
          <dt className="text-navy-500">{t("confirmation.guests")}</dt>
          <dd className="mt-1 space-y-1">
            {guests.map((guest, index) => (
              <p key={guest.id ?? `guest-${index}`} className="font-medium text-navy">
                {guest.first_name} {guest.last_name}
              </p>
            ))}
          </dd>
        </div>

        <div className="border-t border-champagne/40 pt-3">
          <dt className="text-navy-500">{t("confirmation.extras")}</dt>
          <dd className="mt-1">
            {selectedItems.length === 0 ? (
              <span className="font-medium text-navy">{t("confirmation.none")}</span>
            ) : (
              <ul className="space-y-1">
                {selectedItems.map((item) => {
                  const label =
                    locale === "en" && item.label_en ? item.label_en : (item.label_it ?? item.key);
                  const selection = upsellSelections.find((s) => s.item_id === item.id);
                  const quantity = selection?.quantity ?? 1;
                  return (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span className="font-medium text-navy">
                        {label} × {quantity}
                      </span>
                      <span className="font-medium text-gold-dark">
                        {formatPrice(item.price, locale)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
