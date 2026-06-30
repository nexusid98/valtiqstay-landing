import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  guest_name: string;
  arrival: string;
  departure: string;
  room_label?: string;
  party_size?: number;
  source?: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // Get hotel_id for this staff member (RLS-filtered)
  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) return Response.json({ error: "no_hotel" }, { status: 403 });

  const body = (await req.json()) as Body;
  const { guest_name, arrival, departure, room_label, party_size, source } = body;

  if (!guest_name?.trim() || !arrival || !departure) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  if (new Date(arrival) >= new Date(departure)) {
    return Response.json({ error: "invalid_dates" }, { status: 400 });
  }

  const token = "vltq-" + randomBytes(16).toString("hex");

  // Use admin client for insert (bypasses RLS) — hotel_id already validated above
  const admin = createAdminClient();
  const { data: reservation, error } = await admin
    .from("reservations")
    .insert({
      hotel_id: hu.hotel_id,
      guest_name: guest_name.trim(),
      arrival,
      departure,
      room_label: room_label?.trim() || null,
      party_size: Math.max(1, parseInt(String(party_size ?? 1), 10)),
      source: source || "direct",
      status: "pending",
      check_in_token: token,
    })
    .select("id, check_in_token")
    .single();

  if (error) return Response.json({ error: "db_error", detail: error.message }, { status: 500 });

  return Response.json({ success: true, id: reservation.id, token: reservation.check_in_token });
}
