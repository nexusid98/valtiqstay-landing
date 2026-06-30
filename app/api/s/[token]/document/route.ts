import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_BYTES = 10 * 1024 * 1024;

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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const guestIndexRaw = formData.get("guest_index");
  const guestIndex = guestIndexRaw ? parseInt(guestIndexRaw as string, 10) : 0;

  if (!file) return Response.json({ error: "no_file" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return Response.json({ error: "invalid_file_type" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "file_too_large" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${reservation.id}/${guestIndex}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("guest-documents")
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });

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
