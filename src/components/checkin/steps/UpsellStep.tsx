"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCheckInStore } from "@/lib/checkin-store";
import { formatPrice } from "@/lib/checkin/validation";
import type { UpsellItemData } from "@/lib/checkin/types";
import { Button, StepHeading } from "../ui";

export function UpsellStep({
  items,
  onValidChange,
}: {
  items: UpsellItemData[];
  onValidChange: (valid: boolean) => void;
}) {
  const t = useTranslations("checkin");
  const locale = useLocale();
  const selections = useCheckInStore((state) => state.upsellSelections);
  const setUpsell = useCheckInStore((state) => state.setUpsell);
  const removeUpsell = useCheckInStore((state) => state.removeUpsell);

  // Extras are always optional — the step is never blocking.
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div>
      <StepHeading title={t("upsell.title")} subtitle={t("upsell.subtitle")} />

      {items.length === 0 ? (
        <p className="text-navy-500">{t("upsell.empty")}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const label =
              locale === "en" && item.label_en ? item.label_en : (item.label_it ?? item.key);
            const description =
              locale === "en" && item.description_en
                ? item.description_en
                : (item.description_it ?? "");
            const selection = selections.find((s) => s.item_id === item.id);
            const isSelected = Boolean(selection);
            const quantity = selection?.quantity ?? 1;

            return (
              <li
                key={item.id}
                className="rounded-xl border border-champagne/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg text-navy">{label}</h3>
                    {description ? (
                      <p className="mt-1 text-sm text-navy-500">{description}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-base font-semibold text-gold-dark">
                    {formatPrice(item.price, locale)}
                  </p>
                </div>

                {isSelected ? (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3" role="group" aria-label={t("upsell.quantity")}>
                      <button
                        type="button"
                        aria-label={`${t("upsell.quantity")} −`}
                        onClick={() => setUpsell(item.id, Math.max(1, quantity - 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-lg text-gold-dark hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-lg font-semibold text-navy" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`${t("upsell.quantity")} +`}
                        onClick={() => setUpsell(item.id, quantity + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-lg text-gold-dark hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        +
                      </button>
                    </div>
                    <Button variant="secondary" onClick={() => removeUpsell(item.id)}>
                      {t("upsell.remove")}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto"
                      onClick={() => setUpsell(item.id, 1)}
                    >
                      {t("upsell.add")}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
