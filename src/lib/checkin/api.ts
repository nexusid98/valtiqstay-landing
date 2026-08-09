import { createClient } from "@/lib/supabase/client";
import type {
  CheckinErrorCode,
  CheckinSessionData,
  GuestFormData,
  SubmitPayload,
  SubmitResult,
  UpsellItemData,
} from "./types";

export class CheckinError extends Error {
  code: CheckinErrorCode;
  constructor(code: CheckinErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CheckinError";
    this.code = code;
  }
}

function normalizeErrorCode(code: string): CheckinErrorCode {
  switch (code) {
    case "invalid_token":
    case "expired_token":
    case "already_submitted":
    case "no_guests":
    case "invalid_data":
      return code;
    default:
      return "unknown";
  }
}

/**
 * Loads stay + hotel + guests for a session token via the security-definer
 * RPC. Throws CheckinError on invalid/expired tokens.
 */
export async function fetchSession(token: string): Promise<CheckinSessionData> {
  const supabase = createClient();
  // Note: `rpc`'s type parameter is the function name (string), not the result
  // type, so the result is cast explicitly to the RPC's shape here.
  const { data, error } = (await supabase.rpc("get_stay_by_session_token", {
    p_token: token,
  })) as {
    data: CheckinSessionData | { error: string } | null;
    error: { message: string } | null;
  };
  if (error) throw new CheckinError("unknown", error.message);
  if (!data || typeof data === "string") throw new CheckinError("unknown");
  if ("error" in data) throw new CheckinError(normalizeErrorCode(data.error));
  return data;
}

/** Marks a session as in_progress when the guest enters the stepper. */
export async function startSession(token: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = (await supabase.rpc("start_checkin_session", {
    p_token: token,
  })) as {
    data: { ok?: boolean; error?: string } | null;
    error: { message: string } | null;
  };
  if (error) throw new CheckinError("unknown", error.message);
  if (data && "error" in data && data.error) {
    throw new CheckinError(normalizeErrorCode(data.error));
  }
}

/** Active upsell items for the stay's hotel. */
export async function fetchUpsells(token: string): Promise<UpsellItemData[]> {
  const supabase = createClient();
  const { data, error } = (await supabase.rpc("get_hotel_upsells", {
    p_token: token,
  })) as {
    data: { items?: UpsellItemData[] | null; error?: string } | null;
    error: { message: string } | null;
  };
  if (error) throw new CheckinError("unknown", error.message);
  if (!data || "error" in data) throw new CheckinError("unknown");
  return data.items ?? [];
}

/**
 * Requests a signed upload URL from the server (service role) and uploads the
 * file with the anon client. Returns the storage path under
 * {hotel_id}/{guest_ref}/{timestamp}-{filename}.
 */
export async function uploadDocumentFile(
  token: string,
  guestRef: string,
  file: File,
): Promise<{ storagePath: string }> {
  const res = await fetch(`/api/checkin/${encodeURIComponent(token)}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestRef, fileName: file.name }),
  });
  if (!res.ok) {
    throw new CheckinError("unknown", `upload-url ${res.status}`);
  }
  const body = (await res.json()) as { path?: string; token?: string; error?: string };
  if (!body.path || !body.token) {
    throw new CheckinError("unknown", body.error ?? "missing signed url");
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from("documents").uploadToSignedUrl(
    body.path,
    body.token,
    file,
    { contentType: file.type || "application/octet-stream" },
  );
  if (error) throw new CheckinError("unknown", error.message);
  return { storagePath: body.path };
}

/** Best-effort public IP of the guest, captured server-side. */
export async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch("/api/checkin/client-ip");
    if (!res.ok) return null;
    const body = (await res.json()) as { ip?: string | null };
    return body.ip ?? null;
  } catch {
    return null;
  }
}

/** Builds the submit_checkin_session payload from the current form state. */
export function buildSubmitPayload(input: {
  token: string;
  guests: GuestFormData[];
  upsellSelections: SubmitPayload["upsells"];
  consentGranted: boolean;
  consentTextShown: string;
  ipAddress: string | null;
  userAgent: string;
}): SubmitPayload {
  const documents = input.guests
    .map((guest, index) => {
      const hasUpload = guest.document.storage_path.length > 0;
      return hasUpload
        ? {
            guest_index: index,
            storage_path: guest.document.storage_path,
            doc_type: guest.doc_type,
            issuing_country: guest.doc_issuing_country,
            doc_number: guest.doc_number,
            expiry_date: guest.doc_expiry_date,
          }
        : null;
    })
    .filter((document): document is NonNullable<typeof document> => document !== null);

  return {
    token: input.token,
    guests: input.guests,
    documents,
    upsells: input.upsellSelections,
    consent: {
      granted: input.consentGranted,
      purpose: "marketing",
      text_shown: input.consentTextShown,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
    },
  };
}

/** Submits the whole check-in atomically via submit_checkin_session. */
export async function submitCheckin(payload: SubmitPayload): Promise<SubmitResult> {
  const supabase = createClient();
  const { data, error } = (await supabase.rpc("submit_checkin_session", {
    p_token: payload.token,
    p_guests: payload.guests,
    p_documents: payload.documents,
    p_upsells: payload.upsells,
    p_consent: payload.consent,
  })) as {
    data: { ok?: boolean; error?: string } | null;
    error: { message: string } | null;
  };
  if (error) return { ok: false, error: "unknown" };
  if (!data) return { ok: false, error: "unknown" };
  if ("error" in data && data.error) {
    return { ok: false, error: normalizeErrorCode(data.error) };
  }
  return { ok: true };
}
