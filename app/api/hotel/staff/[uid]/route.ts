import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** DELETE — remove a staff member from the hotel (does not delete auth user) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // Cannot remove yourself
  if (uid === user.id) {
    return Response.json({ error: "cannot_remove_self" }, { status: 400 });
  }

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) return Response.json({ error: "hotel_not_found" }, { status: 403 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("hotel_users")
    .delete()
    .eq("user_id", uid)
    .eq("hotel_id", hu.hotel_id);

  if (error) return Response.json({ error: "db_error" }, { status: 500 });
  return Response.json({ success: true });
}
