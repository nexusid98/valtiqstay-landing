"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { uploadDocumentFile } from "@/lib/checkin/api";
import { useCheckInStore } from "@/lib/checkin-store";
import { isValidDate } from "@/lib/checkin/validation";
import type { DocType } from "@/lib/checkin/types";
import { Field, Select, StepHeading, TextInput } from "../ui";

const DOC_TYPES: DocType[] = ["id_card", "passport", "drivers_license"];

const ISSUING_COUNTRIES: Array<[string, string]> = [
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

/** Client-side reference for guests not yet persisted (no DB id yet). */
function makeGuestRef(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `pending-${random}`;
}

export function DocumentStep({ onValidChange }: { onValidChange: (valid: boolean) => void }) {
  const t = useTranslations("checkin");
  const token = useCheckInStore((state) => state.token);
  const guests = useCheckInStore((state) => state.guests);
  const updateGuest = useCheckInStore((state) => state.updateGuest);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrorIndex, setUploadErrorIndex] = useState<number | null>(null);

  const valid = useMemo(
    () =>
      guests.every(
        (guest) =>
          guest.doc_type !== "" &&
          guest.doc_number.trim().length > 0 &&
          isValidDate(guest.doc_expiry_date) &&
          guest.document.upload_state === "done" &&
          guest.document.storage_path.length > 0,
      ),
    [guests],
  );

  useEffect(() => {
    onValidChange(valid);
  }, [valid, onValidChange]);

  async function handleFile(index: number, file: File | undefined) {
    if (!file) return;
    const guest = guests[index];
    const guestRef = guest.id ?? makeGuestRef();

    setUploadingIndex(index);
    setUploadErrorIndex(null);
    updateGuest(index, {
      document: {
        storage_path: "",
        preview_url: null,
        file_name: file.name,
        upload_state: "uploading",
      },
    });

    try {
      const { storagePath } = await uploadDocumentFile(token, guestRef, file);
      updateGuest(index, {
        document: {
          storage_path: storagePath,
          preview_url: URL.createObjectURL(file),
          file_name: file.name,
          upload_state: "done",
        },
      });
    } catch {
      setUploadErrorIndex(index);
      updateGuest(index, {
        document: {
          storage_path: "",
          preview_url: null,
          file_name: null,
          upload_state: "error",
        },
      });
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <div>
      <StepHeading title={t("documents.title")} subtitle={t("documents.subtitle")} />

      <div className="space-y-6">
        {guests.map((guest, index) => {
          const prefix = `doc-${index}`;
          const isUploading = uploadingIndex === index;
          const hasError = uploadErrorIndex === index;
          const isDone = guest.document.upload_state === "done";
          return (
            <section
              key={guest.id ?? `new-doc-${index}`}
              aria-label={`${t("step.documents")} ${index + 1}`}
              className="space-y-4 rounded-xl border border-champagne/40 p-4"
            >
              <p className="font-serif text-lg text-navy">
                {guest.first_name.trim() || guest.last_name.trim()
                  ? `${guest.first_name} ${guest.last_name}`.trim()
                  : `${t("step.documents")} ${index + 1}`}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Field label={t("documents.docType")} htmlFor={`${prefix}-type`}>
                  <Select
                    id={`${prefix}-type`}
                    value={guest.doc_type}
                    onChange={(event) =>
                      updateGuest(index, { doc_type: event.target.value as DocType })
                    }
                    required
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {DOC_TYPES.map((docType) => (
                      <option key={docType} value={docType}>
                        {t(`documents.docTypes.${docType}`)}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label={t("documents.docNumber")} htmlFor={`${prefix}-number`}>
                  <TextInput
                    id={`${prefix}-number`}
                    value={guest.doc_number}
                    onChange={(event) => updateGuest(index, { doc_number: event.target.value })}
                    autoComplete="off"
                    required
                  />
                </Field>

                <Field
                  label={t("documents.issuingCountry")}
                  htmlFor={`${prefix}-country`}
                >
                  <TextInput
                    id={`${prefix}-country`}
                    value={guest.doc_issuing_country}
                    onChange={(event) =>
                      updateGuest(index, { doc_issuing_country: event.target.value })
                    }
                    list="checkin-issuing-countries"
                    placeholder="ITA"
                  />
                </Field>

                <Field label={t("documents.expiryDate")} htmlFor={`${prefix}-expiry`}>
                  <TextInput
                    id={`${prefix}-expiry`}
                    type="date"
                    value={guest.doc_expiry_date}
                    onChange={(event) =>
                      updateGuest(index, { doc_expiry_date: event.target.value })
                    }
                    required
                  />
                </Field>
              </div>

              <div>
                {guest.document.preview_url ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                    <img
                      src={guest.document.preview_url}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-champagne/40 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">
                        {guest.document.file_name}
                      </p>
                      <p className="text-sm text-emerald-700">{t("documents.uploaded")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateGuest(index, {
                          document: {
                            storage_path: "",
                            preview_url: null,
                            file_name: null,
                            upload_state: "idle",
                          },
                        })
                      }
                      className="inline-flex min-h-[44px] items-center rounded-full px-3 text-sm text-navy-500 underline-offset-4 hover:text-red-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      {t("documents.removeUpload")}
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center transition-colors ${
                      isUploading
                        ? "border-gold/50 bg-gold/5"
                        : hasError
                          ? "border-red-300 bg-red-50"
                          : "border-champagne/50 hover:border-gold/70 hover:bg-gold/5"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      disabled={isUploading}
                      onChange={(event) => handleFile(index, event.target.files?.[0])}
                    />
                    {isUploading ? (
                      <span className="text-sm font-medium text-navy">
                        {t("documents.uploading")}
                      </span>
                    ) : hasError ? (
                      <span className="text-sm font-medium text-red-700">
                        {t("documents.uploadError")}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-navy">
                        {t("documents.uploadLabel")}
                      </span>
                    )}
                  </label>
                )}

                {isUploading ? (
                  <div
                    aria-hidden="true"
                    className="relative mt-2 h-1 overflow-hidden rounded-full bg-champagne/30"
                  >
                    <div className="checkin-shimmer absolute inset-y-0 w-1/2 bg-gold/70" />
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <datalist id="checkin-issuing-countries">
        {ISSUING_COUNTRIES.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </datalist>
    </div>
  );
}
