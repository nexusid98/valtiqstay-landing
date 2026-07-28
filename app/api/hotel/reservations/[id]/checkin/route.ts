import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "checked_in" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");

  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  if (!data || data.length === 0) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ success: true });
}
