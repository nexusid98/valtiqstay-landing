"use server";

import { createClient } from "@/lib/supabase/server";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import {
  buildCheckinUrl,
  isValidIsoDate,
  mapCreateSessionError,
  type CreateSessionErrorKey,
} from "@/lib/dashboard/sessions";

export interface CreateSessionSuccess {
  ok: true;
  /** Absolute guest link, ready to copy ({origin}/it/c/{token}). */
  url: string;
  /** Path portion of the link, as returned by the RPC. */
  linkPath: string;
  token: string;
  expiresAt: string;
}

export interface CreateSessionFailure {
  ok: false;
  errorKey: CreateSessionErrorKey;
}

export type CreateSessionResult = CreateSessionSuccess | CreateSessionFailure;

/** Shape of the create_checkin_session RPC response (migration 04). */
interface CreateSessionRpcResult {
  ok: boolean;
  stay_id: string;
  session_id: string;
  token: string;
  expires_at: string;
  link_path: string;
}

/**
 * Creates a stay + check-in session for the caller's hotel via the staff-only
 * create_checkin_session RPC (tenant derived from the caller's profile — never
 * from a parameter). Errors raised by the RPC (staff_only, invalid_data,
 * duplicate_booking, token_collision) are surfaced as i18n error keys.
 */
export async function createSessionAction(formData: FormData): Promise<CreateSessionResult> {
  const arrival = String(formData.get("arrival_date") ?? "").trim();
  const departure = String(formData.get("departure_date") ?? "").trim();
  const roomLabel = String(formData.get("room_label") ?? "").trim();
  const bookingRef = String(formData.get("booking_ref") ?? "").trim();
  const expiresHours = Number(formData.get("expires_hours") ?? 48);

  // Defensive re-validation — the RPC validates too, but this keeps malformed
  // payloads away from the database and gives the same Italian error.
  if (!isValidIsoDate(arrival) || !isValidIsoDate(departure) || arrival >= departure) {
    return { ok: false, errorKey: "invalidData" };
  }
  if (!Number.isInteger(expiresHours) || expiresHours < 1 || expiresHours > 720) {
    return { ok: false, errorKey: "invalidData" };
  }

  const supabase = await createClient();
  const { data, error } = (await supabase.rpc("create_checkin_session", {
    p_arrival_date: arrival,
    p_departure_date: departure,
    p_room_label: roomLabel || null,
    p_booking_ref: bookingRef || null,
    p_expires_hours: expiresHours,
  })) as {
    data: CreateSessionRpcResult | null;
    error: { message: string } | null;
  };

  if (error || !data || data.ok !== true) {
    // A RAISE EXCEPTION inside the RPC surfaces in PostgREST's error.message
    // (e.g. "duplicate_booking") — map it to a translation key.
    return { ok: false, errorKey: mapCreateSessionError(error?.message) };
  }

  const origin = await getPublicOrigin();
  return {
    ok: true,
    url: buildCheckinUrl(origin, data.link_path),
    linkPath: data.link_path,
    token: data.token,
    expiresAt: data.expires_at,
  };
}
