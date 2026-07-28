import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_GUEST_INDEX = 19;

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function validateMagicBytes(buf: ArrayBuffer, mimeType: string): boolean {
  const b = new Uint8Array(buf.slice(0, 12));
  switch (mimeType) {
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/png":
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    case "image/webp":
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      );
    case "image/heic":
    case "image/heif":
      // MP4/ISOBMFF container: box type "ftyp" starts at byte 4
      return b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
    default:
      return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, status")
    .eq("check_in_token", token)
    .single();

  if (!reservation) return Response.json({ error: "not_found" }, { status: 404 });
  if (reservation.status === "checked_in") return Response.json({ error: "already_completed" }, { status: 409 });
  if (reservation.status === "cancelled") return Response.json({ error: "reservation_cancelled" }, { status: 410 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const guestIndexRaw = formData.get("guest_index");
  const guestIndex = guestIndexRaw ? parseInt(guestIndexRaw as string, 10) : 0;

  if (!file) return Response.json({ error: "no_file" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return Response.json({ error: "invalid_file_type" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "file_too_large" }, { status: 400 });
  if (!Number.isInteger(guestIndex) || guestIndex < 0 || guestIndex > MAX_GUEST_INDEX) {
    return Response.json({ error: "invalid_guest_index" }, { status: 400 });
  }

  const buf = await file.arrayBuffer();
  if (!validateMagicBytes(buf, file.type)) {
    return Response.json({ error: "invalid_file_content" }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
  const path = `${reservation.id}/${guestIndex}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("guest-documents")
    .upload(path, buf, { contentType: file.type, upsert: true });

  if (uploadError) return Response.json({ error: "upload_failed", detail: uploadError.message }, { status: 500 });

  const { data: guestList } = await admin
    .from("guests")
    .select("id")
    .eq("reservation_id", reservation.id)
    .order("created_at", { ascending: true });

  if (guestList?.[guestIndex]) {
    await admin
      .from("guests")
      .update({ document_image_path: path })
      .eq("id", guestList[guestIndex].id);
  }

  return Response.json({ success: true, path });
}
