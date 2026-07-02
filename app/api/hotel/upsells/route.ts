import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function resolveHotelId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, hotelId: null };
  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  return { user, hotelId: hu?.hotel_id ?? null };
}

export async function GET() {
  const supabase = await createClient();
  const { user } = await resolveHotelId(supabase);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("upsells")
    .select("id, name, category, description, price, active")
    .order("category")
    .order("name");

  if (error) return Response.json({ error: "db_error" }, { status: 500 });
  return Response.json({ upsells: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { user, hotelId } = await resolveHotelId(supabase);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!hotelId) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const body = await req.json();
  const { name, category, description, price } = body;

  if (!name?.trim() || !category?.trim() || price == null || isNaN(Number(price))) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("upsells")
    .insert({
      hotel_id: hotelId,
      name: name.trim(),
      category: category.trim(),
      description: description?.trim() || null,
      price: Number(price),
      active: true,
    })
    .select("id, name, category, description, price, active")
    .single();

  if (error) return Response.json({ error: "db_error" }, { status: 500 });
  return Response.json({ upsell: data }, { status: 201 });
}
