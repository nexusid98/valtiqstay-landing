import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET — list staff members for the caller's hotel */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const admin = createAdminClient();

  // Get all staff rows for this hotel
  const { data: staffRows, error } = await admin
    .from("hotel_users")
    .select("user_id")
    .eq("hotel_id", hu.hotel_id);

  if (error) return Response.json({ error: "db_error" }, { status: 500 });

  // Look up email for each user_id
  const staffList = await Promise.all(
    (staffRows ?? []).map(async (row) => {
      const { data } = await admin.auth.admin.getUserById(row.user_id);
      return {
        user_id: row.user_id,
        email: data?.user?.email ?? null,
        last_sign_in: data?.user?.last_sign_in_at ?? null,
        invited_at: data?.user?.invited_at ?? null,
        confirmed: !!data?.user?.confirmed_at,
      };
    })
  );

  return Response.json({ staff: staffList });
}

/** POST — invite a new staff member by email */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const body = await req.json();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Invite user (Supabase sends the email with setup link)
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    // If user already exists, look them up
    if (!inviteError.message?.toLowerCase().includes("already")) {
      return Response.json({ error: inviteError.message }, { status: 400 });
    }
    // User already registered — find by email
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = listData?.users?.find((u) => u.email === email);
    if (!existing) return Response.json({ error: "user_lookup_failed" }, { status: 500 });

    // Check if already in hotel_users
    const { data: already } = await admin
      .from("hotel_users")
      .select("user_id")
      .eq("user_id", existing.id)
      .eq("hotel_id", hu.hotel_id)
      .single();

    if (already) return Response.json({ error: "already_staff" }, { status: 409 });

    await admin.from("hotel_users").insert({ user_id: existing.id, hotel_id: hu.hotel_id });
    return Response.json({ success: true, user_id: existing.id, invited: false });
  }

  // Add to hotel_users
  await admin.from("hotel_users").insert({
    user_id: invited.user.id,
    hotel_id: hu.hotel_id,
  });

  return Response.json({ success: true, user_id: invited.user.id, invited: true });
}
