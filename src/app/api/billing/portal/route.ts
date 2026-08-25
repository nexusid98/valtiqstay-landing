import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBillingConfigured } from "@/lib/billing/config";
import { createBillingPortalSession } from "@/lib/billing/stripe";
import { BillingError } from "@/lib/billing/errors";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal
 * Staff-only. Returns a Stripe Billing Portal session URL so the hotel can
 * manage its subscription. Reads the hotel's stripe_customer_id from
 * hotel_billing through the RLS-scoped staff client (only their own hotel's
 * row). 404 { error: "no_customer" } when the hotel has no Stripe customer
 * yet (i.e. has never subscribed).
 */
export async function POST(request: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json(
      { error: "billing_not_configured" },
      { status: 503 },
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, hotel_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // RLS (hotel_billing_staff_select) scopes this to the caller's hotel.
    const { data: billing } = await supabase
      .from("hotel_billing")
      .select("stripe_customer_id")
      .eq("hotel_id", profile.hotel_id)
      .maybeSingle();

    if (!billing?.stripe_customer_id) {
      return NextResponse.json({ error: "no_customer" }, { status: 404 });
    }
    const origin = new URL(request.url).origin;
    const portal = await createBillingPortalSession({
      customerId: billing.stripe_customer_id,
      returnUrl: `${origin}/it/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
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
