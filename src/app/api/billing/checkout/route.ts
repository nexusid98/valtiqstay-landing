import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBillingConfigured, SUBSCRIPTION_PRICE_ID } from "@/lib/billing/config";
import { createHotelCheckoutSession } from "@/lib/billing/stripe";
import { BillingError } from "@/lib/billing/errors";

export const runtime = "nodejs";

/**
 * POST /api/billing/checkout
 * Staff-only. Creates a hosted Stripe Checkout Session (subscription mode) for
 * the caller's hotel and returns { url } to redirect the staff member into
 * Stripe's hosted flow. Feature-flagged: without the owner's Stripe keys this
 * returns 503 { error: "billing_not_configured" } — no live call is attempted.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // The staff profile lookup goes through RLS → scoped to the caller's hotel.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, hotel_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let priceId = SUBSCRIPTION_PRICE_ID();
  if (!isBillingConfigured()) {
    return NextResponse.json(
      { error: "billing_not_configured" },
      { status: 503 },
    );
  }
  try {
    const body = (await request.json().catch(() => ({}))) as {
      priceId?: string;
    };
    if (body.priceId) priceId = body.priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "no_price_configured" },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const session = await createHotelCheckoutSession({
      hotelId: profile.hotel_id,
      email: user.email,
      priceId,
      successUrl: `${origin}/it/dashboard?billing=success`,
      cancelUrl: `${origin}/it/dashboard?billing=canceled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof BillingError && error.code === "not_configured") {
      return NextResponse.json(
        { error: "billing_not_configured" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "billing_error" }, { status: 500 });
  }
}
