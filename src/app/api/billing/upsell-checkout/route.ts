import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isBillingConfigured } from "@/lib/billing/config";
import { createUpsellCheckoutSession } from "@/lib/billing/stripe";
import { BillingError } from "@/lib/billing/errors";
import { buildUpsellCheckoutLine, upsellLabel } from "@/lib/billing/upsell";
import type { CheckinSessionData } from "@/lib/checkin/types";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Service-role Supabase client. The guest is anon (token-based auth), so it
 * cannot read upsell_requests / upsell_items through RLS — the route reads them
 * with the service role AFTER validating the token via the security-definer
 * RPC, exactly like /api/checkin/[token]/upload-url.
 */
function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * POST /api/billing/upsell-checkout
 * Body: { token: string, stayId: string, itemKey: string }
 *
 * Creates a one-time Stripe Checkout Session for ONE requested extra of a
 * guest's stay.
 *
 * SECURITY — the browser is never trusted for money:
 *   1. The guest token is validated with the SECURITY DEFINER RPC
 *      get_stay_by_session_token (anon/token auth, NOT staff auth). An
 *      invalid or expired token → 401 invalid_token.
 *   2. The token's stay must match the stayId in the body (→ 400 invalid_stay),
 *      so a guest can never pay for another hotel's stay.
 *   3. The amount is recomputed from upsell_items.price (DB) × the quantity on
 *      the stay's `requested` upsell_request. Any client-supplied amount is
 *      ignored — the body carries no amount at all.
 *   4. hotel_id / stay_id / item_key travel as Stripe metadata; the webhook
 *      uses session.amount_total (Stripe) as the source of truth.
 *
 * One session per item: the M5-1 webhook confirms the single upsell_request
 * matched by (stay_id, item_key) and writes one upsell_ledger row, so the
 * checkout is item-scoped by design.
 */
export async function POST(request: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 });
  }

  let body: { token?: unknown; stayId?: unknown; itemKey?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; stayId?: unknown; itemKey?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const stayId = typeof body.stayId === "string" ? body.stayId.trim() : "";
  const itemKey = typeof body.itemKey === "string" ? body.itemKey.trim() : "";

  if (!token || !UUID_RE.test(stayId) || !itemKey || itemKey.length > 64) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const service = serviceClient();

  // 1. Token validation (guest/token auth — never staff auth).
  // Note: `rpc`'s type parameter is the function name, not the result type.
  const { data: session, error: rpcError } = (await service.rpc(
    "get_stay_by_session_token",
    { p_token: token },
  )) as {
    data: CheckinSessionData | { error: string } | null;
    error: { message: string } | null;
  };
  if (rpcError || !session || "error" in session || !session.stay) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // 2. The token must map to the stay the client claims.
  if (session.stay.id !== stayId) {
    return NextResponse.json({ error: "invalid_stay" }, { status: 400 });
  }
  const hotelId = session.stay.hotel_id;

  // 3. Recompute the amount from the DB: item row + its requested quantity.
  const { data: item } = await service
    .from("upsell_items")
    .select("id, key, label_it, label_en, price")
    .eq("hotel_id", hotelId)
    .eq("key", itemKey)
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: "no_items" }, { status: 400 });
  }

  const { data: requestRow } = await service
    .from("upsell_requests")
    .select("id, quantity")
    .eq("stay_id", stayId)
    .eq("item_id", item.id)
    .eq("status", "requested")
    .maybeSingle();

  if (!requestRow) {
    return NextResponse.json({ error: "no_items" }, { status: 400 });
  }

  const locale = session.hotel?.locale ?? "it";
  const line = buildUpsellCheckoutLine(
    {
      itemKey: item.key,
      labelIt: item.label_it,
      labelEn: item.label_en,
      priceEuros: item.price,
      quantity: Number(requestRow.quantity ?? 1),
    },
    locale,
  );
  if (!line) {
    // Price missing/unparsable/zero in the DB — never invent an amount.
    return NextResponse.json({ error: "invalid_price" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const back = `${origin}/${locale === "en" ? "en" : "it"}/c/${encodeURIComponent(token)}`;

  try {
    const checkout = await createUpsellCheckoutSession({
      hotelId,
      stayId,
      lineItem: {
        itemKey: line.itemKey,
        label: line.label || upsellLabel(item.label_it, item.label_en, locale),
        // Natural values: the real quantity and the PER-UNIT price. Stripe
        // multiplies them (see createUpsellCheckoutSession), so quantity × unit
        // = line.totalCents exactly once.
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      },
      successUrl: `${back}?payment=success`,
      cancelUrl: `${back}?payment=canceled`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    if (error instanceof BillingError && error.code === "not_configured") {
      return NextResponse.json({ error: "billing_not_configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "billing_error" }, { status: 500 });
  }
}
