/**
 * Shared types for the M2 guest check-in flow.
 * Mirrors the M1 Supabase schema (see supabase/migrations/20250728000001_initial_schema.sql)
 * and the JSONB payloads of the security-definer RPCs.
 */

export type DocType = "id_card" | "passport" | "drivers_license";

export interface StayData {
  id: string;
  hotel_id: string;
  arrival_date: string;
  departure_date: string;
  room_label: string | null;
  booking_ref: string | null;
  status: string;
  created_at: string;
}

export interface HotelData {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  hero_url: string | null;
  accent_navy: string | null;
  accent_gold: string | null;
  accent_champagne: string | null;
  locale: string | null;
  doc_retention_days: number | null;
  created_at: string;
  updated_at: string;
}

/** A guest row as returned by get_stay_by_session_token. */
export interface GuestRecord {
  id: string;
  stay_id: string;
  hotel_id: string;
  is_lead: boolean;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  doc_type: string | null;
  doc_number: string | null;
  doc_issuing_country: string | null;
  doc_expiry_date: string | null;
  created_at: string;
}

/** Successful payload of get_stay_by_session_token. */
export interface CheckinSessionData {
  stay: StayData;
  hotel: HotelData;
  guests: GuestRecord[] | null;
}

export type DocumentUploadState = "idle" | "uploading" | "done" | "error";

export interface DocumentFormState {
  /** Storage path of the uploaded file inside the private "documents" bucket. */
  storage_path: string;
  /** Object URL used for the preview thumbnail (never persisted). */
  preview_url: string | null;
  file_name: string | null;
  upload_state: DocumentUploadState;
}

/** Editable guest form state. Dates are ISO strings (yyyy-mm-dd), "" = empty. */
export interface GuestFormData {
  id: string | null;
  is_lead: boolean;
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  nationality: string;
  doc_type: DocType | "";
  doc_number: string;
  doc_issuing_country: string;
  doc_expiry_date: string;
  document: DocumentFormState;
}

export interface UpsellSelection {
  item_id: string;
  quantity: number;
}

/** Upsell item row as returned by get_hotel_upsells. */
export interface UpsellItemData {
  id: string;
  hotel_id: string;
  key: string;
  label_it: string | null;
  label_en: string | null;
  description_it: string | null;
  description_en: string | null;
  price: number | string | null;
  active: boolean;
  display_order: number | null;
  created_at: string;
}

export type CheckinErrorCode =
  | "invalid_token"
  | "expired_token"
  | "already_submitted"
  | "no_guests"
  | "invalid_data"
  | "unknown";

/** Payload sent to submit_checkin_session. */
export interface SubmitPayload {
  token: string;
  guests: GuestFormData[];
  documents: {
    guest_index: number;
    storage_path: string;
    doc_type: string;
    issuing_country: string;
    doc_number: string;
    expiry_date: string;
  }[];
  upsells: UpsellSelection[];
  consent: {
    granted: boolean;
    purpose: string;
    text_shown: string;
    ip_address: string | null;
    user_agent: string;
  };
}

/** Response shapes of the security-definer RPCs. */
export type RpcResponse<T> = T & { error?: never } | { error: string; message?: string };

export interface SubmitResult {
  ok: boolean;
  error?: CheckinErrorCode;
}
