import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const body = await req.json();

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return Response.json({ error: "name_required" }, { status: 400 });
    updates.name = name;
  }
  if (body.checkin_time !== undefined) updates.checkin_time = String(body.checkin_time).trim() || "15:00";
  if (body.checkout_time !== undefined) updates.checkout_time = String(body.checkout_time).trim() || "11:00";
  if (body.tourist_tax_per_person_night !== undefined)
    updates.tourist_tax_per_person_night = Math.max(0, Number(body.tourist_tax_per_person_night) || 0);
  if (body.tourist_tax_max_nights !== undefined)
    updates.tourist_tax_max_nights = Math.max(0, parseInt(String(body.tourist_tax_max_nights), 10) || 0);

  if (body.welcome_info !== undefined) {
    const wi = body.welcome_info;
    updates.welcome_info = {
      inclusi: Array.isArray(wi.inclusi) ? wi.inclusi.filter(Boolean) : [],
      location: String(wi.location ?? "").trim() || undefined,
      wifi: wi.wifi_rete
        ? { rete: String(wi.wifi_rete).trim(), password: String(wi.wifi_password ?? "").trim() }
        : undefined,
      concierge: wi.concierge_tel
        ? { telefono: String(wi.concierge_tel).trim(), orari: String(wi.concierge_orari ?? "").trim() }
        : undefined,
    };
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await supabase.from("hotels").update(updates).eq("id", hu.hotel_id);
  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}
