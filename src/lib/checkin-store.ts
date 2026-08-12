import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CheckinSessionData,
  DocType,
  GuestFormData,
  GuestRecord,
  HotelData,
  StayData,
  UpsellSelection,
} from "./checkin/types";

export const CHECKIN_STORAGE_KEY = "valtiqstay-checkin";

export const CHECKIN_STEPS = [1, 2, 3, 4, 5] as const;

export type CheckinStatus = "idle" | "loaded" | "in_progress" | "submitted" | "error";

/** A pristine guest form row. */
export function blankGuest(isLead: boolean): GuestFormData {
  return {
    id: null,
    is_lead: isLead,
    first_name: "",
    last_name: "",
    birth_date: "",
    birth_place: "",
    nationality: "",
    doc_type: "",
    doc_number: "",
    doc_issuing_country: "",
    doc_expiry_date: "",
    document: {
      storage_path: "",
      preview_url: null,
      file_name: null,
      upload_state: "idle",
    },
  };
}

/** Maps a DB guest row (from the RPC) to editable form state. */
export function guestToForm(record: GuestRecord): GuestFormData {
  const docType = record.doc_type as DocType | null;
  return {
    id: record.id,
    is_lead: record.is_lead,
    first_name: record.first_name ?? "",
    last_name: record.last_name ?? "",
    birth_date: record.birth_date ?? "",
    birth_place: record.birth_place ?? "",
    nationality: record.nationality ?? "",
    doc_type:
      docType === "id_card" || docType === "passport" || docType === "drivers_license"
        ? docType
        : "",
    doc_number: record.doc_number ?? "",
    doc_issuing_country: record.doc_issuing_country ?? "",
    doc_expiry_date: record.doc_expiry_date ?? "",
    document: {
      storage_path: "",
      preview_url: null,
      file_name: null,
      upload_state: "idle",
    },
  };
}

interface CheckInState {
  token: string;
  stay: StayData | null;
  hotel: HotelData | null;
  guests: GuestFormData[];
  /** 0 = L'Arrivo screen, 1-5 = the stepper steps. */
  currentStep: number;
  upsellSelections: UpsellSelection[];
  consentGranted: boolean;
  consentTextShown: string;
  status: CheckinStatus;
  errorCode: string | null;
  // Actions
  setSession: (token: string, data: CheckinSessionData) => void;
  setStep: (step: number) => void;
  updateGuest: (index: number, patch: Partial<GuestFormData>) => void;
  addGuest: () => void;
  removeGuest: (index: number) => void;
  setUpsell: (itemId: string, quantity: number) => void;
  removeUpsell: (itemId: string) => void;
  setConsent: (granted: boolean, textShown: string) => void;
  markInProgress: () => void;
  markSubmitted: () => void;
  setError: (code: string | null) => void;
  reset: () => void;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set) => ({
      token: "",
      stay: null,
      hotel: null,
      guests: [],
      currentStep: 0,
      upsellSelections: [],
      consentGranted: false,
      consentTextShown: "",
      status: "idle",
      errorCode: null,

      setSession: (token, data) =>
        set({
          token,
          stay: data.stay,
          hotel: data.hotel,
          guests:
            data.guests && data.guests.length > 0
              ? data.guests.map(guestToForm)
              : [blankGuest(true)],
          currentStep: 0,
          upsellSelections: [],
          consentGranted: false,
          consentTextShown: "",
          status: "loaded",
          errorCode: null,
        }),

      setStep: (step) => set({ currentStep: step }),

      updateGuest: (index, patch) =>
        set((state) => ({
          guests: state.guests.map((guest, i) =>
            i === index ? { ...guest, ...patch } : guest,
          ),
        })),

      addGuest: () =>
        set((state) => ({
          guests: [...state.guests, blankGuest(false)],
        })),

      removeGuest: (index) =>
        set((state) => ({
          guests: state.guests.filter((_, i) => i !== index),
        })),

      setUpsell: (itemId, quantity) =>
        set((state) => {
          const existing = state.upsellSelections.find(
            (selection) => selection.item_id === itemId,
          );
          const upsellSelections = existing
            ? state.upsellSelections.map((selection) =>
                selection.item_id === itemId ? { ...selection, quantity } : selection,
              )
            : [...state.upsellSelections, { item_id: itemId, quantity }];
          return { upsellSelections };
        }),

      removeUpsell: (itemId) =>
        set((state) => ({
          upsellSelections: state.upsellSelections.filter(
            (selection) => selection.item_id !== itemId,
          ),
        })),

      setConsent: (granted, textShown) =>
        set({ consentGranted: granted, consentTextShown: textShown }),

      markInProgress: () => set({ status: "in_progress", errorCode: null }),

      markSubmitted: () => set({ status: "submitted" }),

      setError: (errorCode) => set({ errorCode, status: errorCode ? "error" : "loaded" }),

      reset: () =>
        set({
          token: "",
          stay: null,
          hotel: null,
          guests: [],
          currentStep: 0,
          upsellSelections: [],
          consentGranted: false,
          consentTextShown: "",
          status: "idle",
          errorCode: null,
        }),
    }),
    {
      name: CHECKIN_STORAGE_KEY,
      version: 1,
      // Throwing when unavailable makes zustand fall back to no persistence
      // (e.g. non-browser environments); the browser path uses sessionStorage.
      storage: createJSONStorage(() => {
        if (typeof globalThis === "undefined" || !("sessionStorage" in globalThis)) {
          throw new Error("sessionStorage unavailable");
        }
        return globalThis.sessionStorage;
      }),
      partialize: (state) => ({
        token: state.token,
        stay: state.stay,
        hotel: state.hotel,
        // blob: preview URLs are page-session-scoped (URL.createObjectURL) and
        // are invalid after a reload — never persist them.
        guests: state.guests.map((guest) => ({
          ...guest,
          document: {
            ...guest.document,
            preview_url: guest.document.preview_url?.startsWith("blob:")
              ? null
              : guest.document.preview_url,
          },
        })),
        currentStep: state.currentStep,
        upsellSelections: state.upsellSelections,
        consentGranted: state.consentGranted,
        consentTextShown: state.consentTextShown,
        status: state.status,
        errorCode: state.errorCode,
      }),
    },
  ),
);
