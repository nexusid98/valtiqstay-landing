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
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.category !== undefined) updates.category = String(body.category).trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.price !== undefined) updates.price = Number(body.price);
  if (body.active !== undefined) updates.active = Boolean(body.active);

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "no_fields" }, { status: 400 });
  }

  const { error } = await supabase.from("upsells").update(updates).eq("id", id);
  if (error) return Response.json({ error: "update_failed" }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // If orders exist, deactivate instead of delete
  const { count } = await supabase
    .from("upsell_orders")
    .select("id", { count: "exact", head: true })
    .eq("upsell_id", id);

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("upsells")
      .update({ active: false })
      .eq("id", id);
    if (error) return Response.json({ error: "update_failed" }, { status: 500 });
    return Response.json({ deactivated: true });
  }

  const { error } = await supabase.from("upsells").delete().eq("id", id);
  if (error) return Response.json({ error: "delete_failed" }, { status: 500 });
  return Response.json({ deleted: true });
}
