import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function sendCheckInNotification(guestName: string, hotelName: string, arrival: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.HOTEL_NOTIFICATION_EMAIL;
  if (!apiKey || !toEmail) return;

  const arrivalFmt = new Date(arrival + "T12:00:00").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const safeGuest = escHtml(guestName);
  const safeHotel = escHtml(hotelName);

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ValtiqStay <noreply@valtiqstay.com>",
      to: [toEmail],
      subject: `✓ Check-in completato — ${safeGuest}`,
      html: `<p>L'ospite <strong>${safeGuest}</strong> ha completato il check-in online per il soggiorno del ${arrivalFmt}.</p><p>Accedi alla dashboard per visualizzare i dati: <a href="https://www.valtiqstay.com/hotel">valtiqstay.com/hotel</a></p><p style="color:#999;font-size:12px">${safeHotel} · ValtiqStay</p>`,
    }),
  }).catch(() => {});
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, status, guest_name, arrival, hotel_id")
    .eq("check_in_token", token)
    .single();

  if (!reservation) return Response.json({ error: "not_found" }, { status: 404 });
  if (reservation.status === "checked_in") return Response.json({ success: true, already_done: true });
  if (reservation.status === "cancelled") return Response.json({ error: "reservation_cancelled" }, { status: 410 });

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

  const { data: hotel } = await admin
    .from("hotels")
    .select("name")
    .eq("id", reservation.hotel_id)
    .single();

  sendCheckInNotification(reservation.guest_name, hotel?.name ?? "Hotel", reservation.arrival);

  return Response.json({ success: true });
}
