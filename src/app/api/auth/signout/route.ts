import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/signout — signs the staff member out by clearing the
 * Supabase auth cookies (signOut() triggers setAll with cleared cookies).
 * Deliberately under /api so the next-intl middleware matcher skips it.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
