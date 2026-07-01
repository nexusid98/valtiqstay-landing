import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { guest_name, arrival, departure, room_label, party_size } = body;

  if (!guest_name?.trim() || !arrival || !departure) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  if (new Date(arrival) >= new Date(departure)) {
    return Response.json({ error: "invalid_dates" }, { status: 400 });
  }

  const { error } = await supabase
    .from("reservations")
    .update({
      guest_name: guest_name.trim(),
      arrival,
      departure,
      room_label: room_label?.trim() || null,
      party_size: Math.max(1, parseInt(String(party_size ?? 1), 10)),
    })
    .eq("id", id);

  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .neq("status", "cancelled");

  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}
