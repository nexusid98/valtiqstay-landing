import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation, error } = await admin
    .from("reservations")
    .select("id, guest_name, arrival, departure, room_label, party_size, status, hotel_id")
    .eq("check_in_token", token)
    .single();

  if (error || !reservation) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const [{ data: hotel }, { data: upsells }] = await Promise.all([
    admin
      .from("hotels")
      .select("id, name, logo_url, checkin_time, checkout_time, tourist_tax_per_person_night, tourist_tax_max_nights, welcome_info")
      .eq("id", reservation.hotel_id)
      .single(),
    admin
      .from("upsells")
      .select("id, category, name, description, price, image_url")
      .eq("hotel_id", reservation.hotel_id)
      .eq("active", true),
  ]);

  return Response.json({ reservation, hotel, upsells: upsells ?? [] });
}
