import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Seconds the signed GET URL stays valid (matches the upload-URL pattern). */
const SIGNED_URL_TTL = 60;

/**
 * GET /api/dashboard/documents/[documentId]/signed-url
 * Returns a short-lived signed GET URL for a document in the private
 * "documents" bucket, for hotel staff only.
 *
 * Security model: the staff session is verified through the cookie-based
 * server client, and the document row itself is read through that same
 * client — RLS (documents_staff_all) scopes the lookup to the caller's own
 * hotel, so a row from another tenant simply resolves to null (404). Only
 * AFTER that staff-scoped verification does the service-role client sign the
 * storage path; a path the staff member could not read is never signed.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Staff-scoped lookup: RLS resolves this to null for other hotels.
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .maybeSingle();
  if (docError || !document) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Verification passed — sign the path with the service role, exactly like
  // the guest upload route does (persistSession off, never exposed to
  // browsers via the anon client).
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: signed, error: signedError } = await service.storage
    .from("documents")
    .createSignedUrl(document.storage_path, SIGNED_URL_TTL);
  if (signedError) {
    // A missing object surfaces as a storage error — map it to 404 so the
    // UI can treat it like an expired/deleted document; anything else is 500.
    const isMissing = /not found|does not exist|not_found/i.test(
      signedError.message,
    );
    return NextResponse.json(
      {
        error: isMissing ? "not_found" : "storage_error",
        message: signedError.message,
      },
      { status: isMissing ? 404 : 500 },
    );
  }
  if (!signed?.signedUrl) {
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }
  return NextResponse.json({ url: signed.signedUrl, expiresIn: SIGNED_URL_TTL });
}
