import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type UpsellOrder = { upsell_id: string; quantity: number };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, hotel_id, status")
    .eq("check_in_token", token)
    .single();

  if (!reservation) return Response.json({ error: "not_found" }, { status: 404 });
  if (reservation.status === "checked_in") return Response.json({ error: "already_completed" }, { status: 409 });

  const body = await req.json();
  if (!Array.isArray(body)) return Response.json({ error: "invalid_payload" }, { status: 400 });

  const orders = body as UpsellOrder[];
  if (orders.length === 0) {
    return Response.json({ success: true });
  }

  const upsellIds = orders.map((o) => o.upsell_id);
  const { data: valid } = await admin
    .from("upsells")
    .select("id, price")
    .eq("hotel_id", reservation.hotel_id)
    .eq("active", true)
    .in("id", upsellIds);

  if (!valid || valid.length !== upsellIds.length) {
    return Response.json({ error: "invalid_upsell" }, { status: 400 });
  }

  const priceMap = Object.fromEntries(valid.map((u) => [u.id, u.price]));

  await admin.from("upsell_orders").delete().eq("reservation_id", reservation.id);

  const rows = orders.map((o) => ({
    reservation_id: reservation.id,
    upsell_id: o.upsell_id,
    quantity: Math.max(1, o.quantity),
    unit_price: priceMap[o.upsell_id],
  }));

  const { error } = await admin.from("upsell_orders").insert(rows);
  if (error) return Response.json({ error: "db_error" }, { status: 500 });

  return Response.json({ success: true });
}
