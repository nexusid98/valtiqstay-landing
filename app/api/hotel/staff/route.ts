import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCallerHotelId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, hotelId: null };
  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  return { user, hotelId: hu?.hotel_id ?? null };
}

/** GET — list staff members for the caller's hotel */
export async function GET() {
  const supabase = await createClient();
  const { user, hotelId } = await getCallerHotelId(supabase);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!hotelId) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const admin = createAdminClient();

  const [{ data: staffRows, error }, { data: listData }] = await Promise.all([
    admin.from("hotel_users").select("user_id").eq("hotel_id", hotelId),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (error) return Response.json({ error: "db_error" }, { status: 500 });

  const userMap = new Map((listData?.users ?? []).map((u) => [u.id, u]));

  const staff = (staffRows ?? []).map((row) => {
    const u = userMap.get(row.user_id);
    return {
      user_id: row.user_id,
      email: u?.email ?? null,
      last_sign_in: u?.last_sign_in_at ?? null,
      invited_at: u?.invited_at ?? null,
      confirmed: !!u?.confirmed_at,
    };
  });

  return Response.json({ staff });
}

/** POST — invite a new staff member by email */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { user, hotelId } = await getCallerHotelId(supabase);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!hotelId) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const body = await req.json();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    const isAlreadyExists =
      inviteError.code === "email_exists" ||
      inviteError.code === "user_already_exists" ||
      inviteError.message?.toLowerCase().includes("already");

    if (!isAlreadyExists) {
      return Response.json({ error: inviteError.message }, { status: 400 });
    }

    // User already registered — find by email from full list
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = listData?.users?.find((u) => u.email === email);
    if (!existing) return Response.json({ error: "user_lookup_failed" }, { status: 500 });

    const { data: already } = await admin
      .from("hotel_users")
      .select("user_id")
      .eq("user_id", existing.id)
      .eq("hotel_id", hotelId)
      .single();

    if (already) return Response.json({ error: "already_staff" }, { status: 409 });

    await admin.from("hotel_users").insert({ user_id: existing.id, hotel_id: hotelId });
    return Response.json({ success: true, user_id: existing.id, invited: false });
  }

  await admin.from("hotel_users").insert({ user_id: invited.user.id, hotel_id: hotelId });
  return Response.json({ success: true, user_id: invited.user.id, invited: true });
}
