import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: NextRequest,
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
  if (reservation.status === "checked_in") return Response.json({ success: true, already_done: true });

  const { count } = await admin
    .from("guests")
    .select("id", { count: "exact", head: true })
    .eq("reservation_id", reservation.id)
    .eq("is_lead", true);

  if (!count) return Response.json({ error: "guests_required" }, { status: 400 });

  const { error } = await admin
    .from("reservations")
    .update({ status: "checked_in" })
    .eq("id", reservation.id);

  if (error) return Response.json({ error: "db_error" }, { status: 500 });
  return Response.json({ success: true });
}
