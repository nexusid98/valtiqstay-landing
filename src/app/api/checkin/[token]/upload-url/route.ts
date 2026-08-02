import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { CheckinSessionData } from "@/lib/checkin/types";

export const runtime = "nodejs";

/** Guest reference for the storage path: a UUID or a "pending-..." placeholder. */
function isValidGuestRef(value: string): boolean {
  return /^[a-zA-Z0-9-]{1,64}$/.test(value) && value !== "." && value !== "..";
}

/** Strips path separators and control characters from a file name. */
function sanitizeFileName(value: string): string {
  const cleaned = value.replace(/[/\\\x00-\x1f]/g, "").replace(/^\.+/, "").slice(0, 120);
  return cleaned;
}

/**
 * POST /api/checkin/[token]/upload-url
 * Server-side signed upload URL for the private "documents" bucket.
 * The service role validates the token via get_stay_by_session_token, then
 * issues a signed upload URL scoped to {hotel_id}/{guest_ref}/{timestamp}-{file}.
 * The guest uploads directly to that URL with the anon client — no anon
 * storage RLS grant is needed.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  let body: { guestRef?: unknown; fileName?: unknown };
  try {
    body = (await request.json()) as { guestRef?: unknown; fileName?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const guestRef = typeof body.guestRef === "string" ? body.guestRef : "";
  const fileName = typeof body.fileName === "string" ? body.fileName : "";

  if (!isValidGuestRef(guestRef)) {
    return NextResponse.json({ error: "invalid_guest_ref" }, { status: 400 });
  }
  const safeFileName = sanitizeFileName(fileName);
  if (!safeFileName) {
    return NextResponse.json({ error: "invalid_file_name" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.rpc<CheckinSessionData | { error: string }>(
    "get_stay_by_session_token",
    { p_token: token },
  );
  if (error || !data || "error" in data) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const path = `${data.hotel.id}/${guestRef}/${Date.now()}-${safeFileName}`;
  const { data: signed, error: signedError } = await supabase.storage
    .from("documents")
    .createSignedUploadUrl(path, 3600);

  if (signedError || !signed) {
    return NextResponse.json(
      { error: "upload_url_failed", message: signedError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ path: signed.path, token: signed.token });
}
