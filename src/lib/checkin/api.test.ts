import { describe, expect, it } from "vitest";
import { buildSubmitPayload } from "@/lib/checkin/api";
import { blankGuest } from "@/lib/checkin-store";
import type { GuestFormData } from "@/lib/checkin/types";

function filledGuest(overrides?: Partial<GuestFormData>): GuestFormData {
  return {
    ...blankGuest(true),
    id: "e1000000-0000-0000-0000-000000000001",
    first_name: "Giulia",
    last_name: "Rossi",
    birth_date: "1990-05-17",
    birth_place: "Roma",
    nationality: "ITA",
    doc_type: "id_card",
    doc_number: "AB12345",
    doc_issuing_country: "ITA",
    doc_expiry_date: "2030-01-01",
    ...overrides,
  };
}

describe("buildSubmitPayload", () => {
  it("collects documents only for guests with an uploaded file", () => {
    const withUpload = filledGuest({
      document: {
        storage_path:
          "b1000000-0000-0000-0000-000000000001/e1000000-0000-0000-0000-000000000001/1-foto.jpg",
        preview_url: null,
        file_name: "foto.jpg",
        upload_state: "done",
      },
    });
    const withoutUpload = filledGuest({
      id: null,
      is_lead: false,
      first_name: "Marco",
      document: {
        storage_path: "",
        preview_url: null,
        file_name: null,
        upload_state: "idle",
      },
    });

    const payload = buildSubmitPayload({
      token: "bella-vista-arrivo",
      guests: [withUpload, withoutUpload],
      upsellSelections: [{ item_id: "u1", quantity: 2 }],
      consentGranted: true,
      consentTextShown: "Marketing consent",
      ipAddress: "192.168.1.1",
      userAgent: "vitest",
    });

    expect(payload.guests).toHaveLength(2);
    expect(payload.documents).toHaveLength(1);
    expect(payload.documents[0].guest_index).toBe(0);
    expect(payload.documents[0].storage_path).toContain("foto.jpg");
    expect(payload.upsells).toEqual([{ item_id: "u1", quantity: 2 }]);
    expect(payload.consent).toMatchObject({
      granted: true,
      purpose: "marketing",
      text_shown: "Marketing consent",
      ip_address: "192.168.1.1",
      user_agent: "vitest",
    });
  });

  it("passes an empty documents array when nothing was uploaded", () => {
    const payload = buildSubmitPayload({
      token: "t",
      guests: [filledGuest()],
      upsellSelections: [],
      consentGranted: false,
      consentTextShown: "",
      ipAddress: null,
      userAgent: "",
    });
    expect(payload.documents).toEqual([]);
  });
});
