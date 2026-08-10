"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useCheckInStore } from "@/lib/checkin-store";
import { validateGuest } from "@/lib/checkin/validation";
import { Field, Select, StepHeading, TextInput, cn } from "../ui";

/** Common nationalities (ISO 3166-1 alpha-3 codes) as a quick-pick list. */
const NATIONALITY_OPTIONS: Array<[string, string]> = [
  ["ITA", "Italia"],
  ["FRA", "Francia"],
  ["DEU", "Germania"],
  ["GBR", "Regno Unito"],
  ["ESP", "Spagna"],
  ["USA", "Stati Uniti"],
  ["AUT", "Austria"],
  ["CHE", "Svizzera"],
  ["NLD", "Paesi Bassi"],
  ["BEL", "Belgio"],
  ["PRT", "Portogallo"],
  ["GRC", "Grecia"],
  ["ROU", "Romania"],
  ["POL", "Polonia"],
  ["HUN", "Ungheria"],
  ["CZE", "Repubblica Ceca"],
  ["SVK", "Slovacchia"],
  ["SVN", "Slovenia"],
  ["HRV", "Croazia"],
  ["SRB", "Serbia"],
  ["ALB", "Albania"],
  ["UKR", "Ucraina"],
  ["CHN", "Cina"],
  ["JPN", "Giappone"],
  ["BRA", "Brasile"],
  ["ARG", "Argentina"],
  ["MEX", "Messico"],
  ["CAN", "Canada"],
  ["AUS", "Australia"],
  ["IND", "India"],
];

export function GuestsStep({ onValidChange }: { onValidChange: (valid: boolean) => void }) {
  const t = useTranslations("checkin");
  const guests = useCheckInStore((state) => state.guests);
  const updateGuest = useCheckInStore((state) => state.updateGuest);
  const addGuest = useCheckInStore((state) => state.addGuest);
  const removeGuest = useCheckInStore((state) => state.removeGuest);

  const required = t("guests.required");

  const errors = useMemo(
    () => guests.map((guest) => validateGuest(guest, required)),
    [guests, required],
  );
  const valid = errors.every((guestErrors) => Object.keys(guestErrors).length === 0);

  useEffect(() => {
    onValidChange(valid);
  }, [valid, onValidChange]);

  return (
    <div>
      <StepHeading title={t("guests.title")} subtitle={t("guests.subtitle")} />

      <div className="space-y-5">
        {guests.map((guest, index) => {
          const guestErrors = errors[index];
          const prefix = `guest-${index}`;
          return (
            <section
              key={guest.id ?? `new-guest-${index}`}
              aria-label={`${t("step.guests")} ${index + 1}`}
              className="rounded-xl border border-champagne/40 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-serif text-lg text-navy">
                  {t("step.guests")} {index + 1}
                </span>
                {guest.is_lead ? (
                  <span className="rounded-full border border-gold/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gold-dark">
                    {t("guests.leadBadge")}
                  </span>
                ) : guests.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="inline-flex min-h-[44px] items-center rounded-full px-3 text-sm text-navy-500 underline-offset-4 hover:text-red-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {t("guests.remove")}
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={t("guests.firstName")}
                  htmlFor={`${prefix}-firstName`}
                  error={guestErrors.first_name}
                >
                  <TextInput
                    id={`${prefix}-firstName`}
                    value={guest.first_name}
                    onChange={(event) => updateGuest(index, { first_name: event.target.value })}
                    autoComplete="given-name"
                    aria-invalid={Boolean(guestErrors.first_name)}
                    aria-describedby={guestErrors.first_name ? `${prefix}-firstName-error` : undefined}
                    required
                  />
                </Field>

                <Field
                  label={t("guests.lastName")}
                  htmlFor={`${prefix}-lastName`}
                  error={guestErrors.last_name}
                >
                  <TextInput
                    id={`${prefix}-lastName`}
                    value={guest.last_name}
                    onChange={(event) => updateGuest(index, { last_name: event.target.value })}
                    autoComplete="family-name"
                    aria-invalid={Boolean(guestErrors.last_name)}
                    aria-describedby={guestErrors.last_name ? `${prefix}-lastName-error` : undefined}
                    required
                  />
                </Field>

                <Field
                  label={t("guests.birthDate")}
                  htmlFor={`${prefix}-birthDate`}
                  error={guestErrors.birth_date}
                >
                  <TextInput
                    id={`${prefix}-birthDate`}
                    type="date"
                    value={guest.birth_date}
                    onChange={(event) => updateGuest(index, { birth_date: event.target.value })}
                    aria-invalid={Boolean(guestErrors.birth_date)}
                    aria-describedby={guestErrors.birth_date ? `${prefix}-birthDate-error` : undefined}
                    required
                  />
                </Field>

                <Field
                  label={t("guests.birthPlace")}
                  htmlFor={`${prefix}-birthPlace`}
                  error={guestErrors.birth_place}
                >
                  <TextInput
                    id={`${prefix}-birthPlace`}
                    value={guest.birth_place}
                    onChange={(event) => updateGuest(index, { birth_place: event.target.value })}
                    aria-invalid={Boolean(guestErrors.birth_place)}
                    aria-describedby={guestErrors.birth_place ? `${prefix}-birthPlace-error` : undefined}
                    required
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label={t("guests.nationality")}
                  htmlFor={`${prefix}-nationality`}
                  error={guestErrors.nationality}
                >
                  <TextInput
                    id={`${prefix}-nationality`}
                    value={guest.nationality}
                    onChange={(event) => updateGuest(index, { nationality: event.target.value })}
                    list="checkin-nationalities"
                    autoComplete="country"
                    placeholder="ITA"
                    aria-invalid={Boolean(guestErrors.nationality)}
                    aria-describedby={guestErrors.nationality ? `${prefix}-nationality-error` : undefined}
                    required
                  />
                </Field>
              </div>
            </section>
          );
        })}
      </div>

      <datalist id="checkin-nationalities">
        {NATIONALITY_OPTIONS.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </datalist>

      <button
        type="button"
        onClick={addGuest}
        className={cn(
          "mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full",
          "border border-dashed border-gold/70 text-gold-dark hover:border-gold hover:bg-gold/5",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        )}
      >
        <span aria-hidden="true" className="text-lg leading-none">+</span>
        {t("guests.add")}
      </button>
    </div>
  );
}
