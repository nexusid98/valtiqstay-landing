import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import CheckInClient from "./CheckInClient";

export const metadata: Metadata = {
  title: "Check-in",
  robots: "noindex, nofollow",
};

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, guest_name, arrival, departure, room_label, party_size, status, hotel_id")
    .eq("check_in_token", token)
    .single();

  if (!reservation) notFound();

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

  return (
    <CheckInClient
      token={token}
      reservation={{
        id: reservation.id,
        guest_name: reservation.guest_name,
        arrival: reservation.arrival,
        departure: reservation.departure,
        room_label: reservation.room_label,
        party_size: reservation.party_size,
        status: reservation.status,
      }}
      hotel={hotel}
      upsells={upsells ?? []}
    />
  );
}
