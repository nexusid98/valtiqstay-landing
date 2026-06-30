import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type GuestPayload = {
  first_name: string;
  last_name: string;
  dob?: string;
  sex?: string;
  citizenship?: string;
  birth_place?: string;
  document_type?: string;
  document_number?: string;
};

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

  const body = await req.json();
  if (!Array.isArray(body) || body.length === 0) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }
  const guests = body as GuestPayload[];

  const rows = guests.map((g, i) => ({
    reservation_id: reservation.id,
    is_lead: i === 0,
    first_name: g.first_name?.trim() ?? "",
    last_name: g.last_name?.trim() ?? "",
    dob: g.dob || null,
    sex: g.sex || null,
    citizenship: g.citizenship || null,
    birth_place: g.birth_place || null,
    document_type: g.document_type || null,
    document_number: g.document_number || null,
  }));

  if (rows.some((r) => !r.first_name || !r.last_name)) {
    return Response.json({ error: "missing_required_fields" }, { status: 400 });
  }

  await admin.from("guests").delete().eq("reservation_id", reservation.id);
  const { error } = await admin.from("guests").insert(rows);
  if (error) return Response.json({ error: "db_error" }, { status: 500 });

  return Response.json({ success: true });
}
