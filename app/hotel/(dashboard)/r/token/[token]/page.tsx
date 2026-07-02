import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function TokenRedirectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/hotel/login");

  const { data: hu } = await supabase
    .from("hotel_users")
    .select("hotel_id")
    .eq("user_id", user.id)
    .single();
  if (!hu) redirect("/hotel");

  const admin = createAdminClient();
  const { data: reservation } = await admin
    .from("reservations")
    .select("id, hotel_id")
    .eq("check_in_token", token)
    .single();

  if (!reservation || reservation.hotel_id !== hu.hotel_id) notFound();

  redirect(`/hotel/r/${reservation.id}`);
}
