import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  email?: string | null;
  phone?: string | null;
  marketing_consent: boolean;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: reservation } = await admin
    .from("reservations")
    .select("id, status")
    .eq("check_in_token", token)
    .single();

  if (!reservation) return Response.json({ error: "not_found" }, { status: 404 });
  if (reservation.status === "checked_in") return Response.json({ error: "already_completed" }, { status: 409 });

  const body = (await req.json()) as ContactPayload;

  if (body.email && !emailRe.test(body.email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await admin.from("contacts").delete().eq("reservation_id", reservation.id);
  const { error } = await admin.from("contacts").insert({
    reservation_id: reservation.id,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    marketing_consent: !!body.marketing_consent,
    consent_timestamp: new Date().toISOString(),
    consent_ip: ip,
  });

  if (error) return Response.json({ error: "db_error" }, { status: 500 });
  return Response.json({ success: true });
}
