import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.status !== "requested" && body.status !== "fulfilled") {
    return Response.json({ error: "invalid_status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("upsell_orders")
    .update({ status: body.status })
    .eq("id", id);

  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}
