import { beforeEach, describe, expect, it } from "vitest";
import {
  blankGuest,
  CHECKIN_STORAGE_KEY,
  guestToForm,
  useCheckInStore,
} from "@/lib/checkin-store";
import type { CheckinSessionData, GuestRecord } from "@/lib/checkin/types";

function makeSessionData(overrides?: Partial<CheckinSessionData>): CheckinSessionData {
  return {
    stay: {
      id: "c1000000-0000-0000-0000-000000000001",
      hotel_id: "b1000000-0000-0000-0000-000000000001",
      arrival_date: "2026-08-01",
      departure_date: "2026-08-05",
      room_label: "Suite Panorama",
      booking_ref: "BV-2026-0417",
      status: "pending",
      created_at: "2026-07-28T00:00:00Z",
    },
    hotel: {
      id: "b1000000-0000-0000-0000-000000000001",
      slug: "bella-vista",
      name: "Hotel Bella Vista",
      logo_url: null,
      hero_url: null,
      accent_navy: null,
      accent_gold: null,
      accent_champagne: null,
      locale: "it",
      doc_retention_days: 30,
      created_at: "2026-07-28T00:00:00Z",
      updated_at: "2026-07-28T00:00:00Z",
    },
    guests: [
      {
        id: "e1000000-0000-0000-0000-000000000001",
        stay_id: "c1000000-0000-0000-0000-000000000001",
        hotel_id: "b1000000-0000-0000-0000-000000000001",
        is_lead: true,
        first_name: "Giulia",
        last_name: "Rossi",
        birth_date: null,
        birth_place: null,
        nationality: "ITA",
        doc_type: null,
        doc_number: null,
        doc_issuing_country: null,
        doc_expiry_date: null,
        created_at: "2026-07-28T00:00:00Z",
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  useCheckInStore.getState().reset();
  globalThis.sessionStorage.clear();
});

describe("check-in store", () => {
  it("starts idle with an empty token", () => {
    const state = useCheckInStore.getState();
    expect(state.token).toBe("");
    expect(state.currentStep).toBe(0);
    expect(state.guests).toHaveLength(0);
    expect(state.status).toBe("idle");
  });

  it("hydrates guests from the RPC payload", () => {
    useCheckInStore.getState().setSession("tok-1", makeSessionData());
    const { guests, stay, hotel, status } = useCheckInStore.getState();
    expect(status).toBe("loaded");
    expect(stay?.booking_ref).toBe("BV-2026-0417");
    expect(hotel?.name).toBe("Hotel Bella Vista");
    expect(guests).toHaveLength(1);
    expect(guests[0].is_lead).toBe(true);
    expect(guests[0].first_name).toBe("Giulia");
    expect(guests[0].nationality).toBe("ITA");
  });

  it("creates one blank lead guest when the RPC returns no guests", () => {
    useCheckInStore.getState().setSession("tok-1", makeSessionData({ guests: [] }));
    const { guests } = useCheckInStore.getState();
    expect(guests).toHaveLength(1);
    expect(guests[0].is_lead).toBe(true);
    expect(guests[0].first_name).toBe("");
  });

  it("updates and adds/removes guests", () => {
    useCheckInStore.getState().setSession("tok-1", makeSessionData());
    const store = useCheckInStore.getState();
    store.updateGuest(0, { birth_place: "Roma", birth_date: "1990-05-17" });
    store.addGuest();
    expect(useCheckInStore.getState().guests).toHaveLength(2);
    expect(useCheckInStore.getState().guests[1].is_lead).toBe(false);

    useCheckInStore.getState().removeGuest(1);
    expect(useCheckInStore.getState().guests).toHaveLength(1);
    expect(useCheckInStore.getState().guests[0].birth_place).toBe("Roma");
  });

  it("tracks upsell selections with quantity", () => {
    useCheckInStore.getState().setUpsell("u1", 1);
    useCheckInStore.getState().setUpsell("u1", 2);
    useCheckInStore.getState().setUpsell("u2", 3);
    const selections = useCheckInStore.getState().upsellSelections;
    expect(selections).toHaveLength(2);
    expect(selections.find((s) => s.item_id === "u1")?.quantity).toBe(2);
    useCheckInStore.getState().removeUpsell("u1");
    expect(useCheckInStore.getState().upsellSelections).toHaveLength(1);
  });

  it("marks consent, in_progress and submitted", () => {
    const store = useCheckInStore.getState();
    store.setConsent(true, "text");
    store.markInProgress();
    expect(useCheckInStore.getState().consentGranted).toBe(true);
    expect(useCheckInStore.getState().status).toBe("in_progress");
    store.markSubmitted();
    expect(useCheckInStore.getState().status).toBe("submitted");
  });

  it("persists resumable state to sessionStorage", () => {
    useCheckInStore.getState().setSession("tok-1", makeSessionData());
    useCheckInStore.getState().setStep(3);

    const raw = globalThis.sessionStorage.getItem(CHECKIN_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw as string) as {
      state: { token: string; currentStep: number; status: string };
      version: number;
    };
    expect(persisted.version).toBe(1);
    expect(persisted.state.token).toBe("tok-1");
    expect(persisted.state.currentStep).toBe(3);
  });

  it("excludes file preview URLs from persistence", () => {
    useCheckInStore.getState().setSession("tok-1", makeSessionData());
    const store = useCheckInStore.getState();
    store.updateGuest(0, {
      document: {
        storage_path: "b1000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000001/1-foto.jpg",
        preview_url: "blob:http://localhost/uuid",
        file_name: "foto.jpg",
        upload_state: "done",
      },
    });
    const raw = globalThis.sessionStorage.getItem(CHECKIN_STORAGE_KEY);
    const persisted = JSON.parse(raw as string) as {
      state: { guests: { document: { preview_url: string | null } }[] };
    };
    expect(persisted.state.guests[0].document.preview_url).toBeNull();
  });
});

describe("guestToForm", () => {
  it("maps DB rows to editable form state", () => {
    const record: GuestRecord = {
      id: "g1",
      stay_id: "s1",
      hotel_id: "h1",
      is_lead: true,
      first_name: "Marco",
      last_name: "Bianchi",
      birth_date: "1988-03-02",
      birth_place: "Torino",
      nationality: "ITA",
      doc_type: "passport",
      doc_number: "AB1234567",
      doc_issuing_country: "ITA",
      doc_expiry_date: "2030-01-01",
      created_at: "2026-07-28T00:00:00Z",
    };
    const form = guestToForm(record);
    expect(form.first_name).toBe("Marco");
    expect(form.doc_type).toBe("passport");
    expect(form.document.upload_state).toBe("idle");
  });

  it("treats unknown doc types as empty", () => {
    const record = makeSessionData().guests![0];
    const form = guestToForm({ ...record, doc_type: "bad_type" });
    expect(form.doc_type).toBe("");
  });

  it("blankGuest produces a pristine companion row", () => {
    const guest = blankGuest(false);
    expect(guest.is_lead).toBe(false);
    expect(guest.first_name).toBe("");
    expect(guest.document).toEqual({
      storage_path: "",
      preview_url: null,
      file_name: null,
      upload_state: "idle",
    });
  });
});
