import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("reservations")
    .update({ status: "checked_in" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}
