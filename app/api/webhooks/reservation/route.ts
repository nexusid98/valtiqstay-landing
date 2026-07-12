import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type WebhookPayload = {
  guest_name: string;
  arrival: string;       // YYYY-MM-DD
  departure: string;     // YYYY-MM-DD
  room_label?: string;
  party_size?: number;
  source?: string;       // "booking_com" | "expedia" | "airbnb" | ...
  guest_email?: string;
  guest_phone?: string;
  external_id?: string;  // ID prenotazione OTA — usato per idempotenza
};

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-valtiqstay-key");
  if (!apiKey) return Response.json({ error: "missing_api_key" }, { status: 401 });

  const admin = createAdminClient();

  const { data: hotel } = await admin
    .from("hotels")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (!hotel) return Response.json({ error: "invalid_api_key" }, { status: 401 });

  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.guest_name?.trim() || !body.arrival || !body.departure) {
    return Response.json({ error: "missing_required_fields: guest_name, arrival, departure" }, { status: 400 });
  }

  if (new Date(body.arrival) >= new Date(body.departure)) {
    return Response.json({ error: "invalid_dates: departure must be after arrival" }, { status: 400 });
  }

  // Idempotenza: se external_id già esiste per questo hotel, restituisce la prenotazione esistente
  if (body.external_id) {
    const { data: existing } = await admin
      .from("reservations")
      .select("id, check_in_token")
      .eq("hotel_id", hotel.id)
      .eq("external_id", body.external_id)
      .single();

    if (existing) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.valtiqstay.com";
      return Response.json({
        reservation_id: existing.id,
        check_in_url: `${base}/s/${existing.check_in_token}`,
        duplicate: true,
      });
    }
  }

  const token = "vltq-" + randomBytes(16).toString("hex");

  const { data: reservation, error } = await admin
    .from("reservations")
    .insert({
      hotel_id: hotel.id,
      guest_name: body.guest_name.trim(),
      arrival: body.arrival,
      departure: body.departure,
      room_label: body.room_label ?? null,
      party_size: Math.max(1, parseInt(String(body.party_size ?? 1), 10)),
      source: body.source ?? "ota",
      guest_email: body.guest_email ?? null,
      guest_phone: body.guest_phone ?? null,
      external_id: body.external_id ?? null,
      status: "pending",
      check_in_token: token,
    })
    .select("id, check_in_token")
    .single();

  if (error || !reservation) {
    return Response.json({ error: "db_error" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.valtiqstay.com";
  return Response.json(
    { reservation_id: reservation.id, check_in_url: `${base}/s/${reservation.check_in_token}` },
    { status: 201 }
  );
}
