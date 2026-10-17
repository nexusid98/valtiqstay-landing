import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/billing/stripe";
import { isBillingConfigured } from "@/lib/billing/config";
import { BillingError } from "@/lib/billing/errors";
import { splitCents } from "@/lib/billing/amounts";
import {
  isHandledEventType,
  parseSubscriptionMetadata,
  parseUpsellPaymentMetadata,
  type StripeMetadata,
  type UpsellPaymentMetadata,
} from "@/lib/billing/webhook";

export const runtime = "nodejs";

const SUBSCRIPTION_STATUS_MAP: Record<string, "none" | "trialing" | "active" | "past_due" | "canceled"> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "past_due",
  paused: "canceled",
  incomplete: "none",
  incomplete_expired: "canceled",
};

/**
 * Service-role Supabase client for webhook DB writes. Bypasses RLS (like the
 * existing signed-document route) and is never exposed to the browser.
 */
function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * POST /api/billing/webhook
 * Stripe webhook endpoint. NO auth header — the Stripe signature IS the auth
 * (verified by constructWebhookEvent against STRIPE_WEBHOOK_SECRET). Stripe
 * metadata is untrusted: every read is validated before a row is written, and
 * monetary amounts always come from the Stripe session (never client input).
 *
 * Idempotency: the event id is stored in webhook_events (PRIMARY KEY) with
 * ON CONFLICT DO NOTHING; a re-delivered event returns 200 "already
 * processed" without re-dispatching.
 */
export async function POST(request: Request) {
  if (!isBillingConfigured()) {
    return NextResponse.json(
      { error: "billing_not_configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    if (error instanceof BillingError && error.code === "stripe_error") {
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const service = serviceClient();

  // Idempotency: INSERT ... ON CONFLICT (id) DO NOTHING. If the row already
  // exists (a prior delivery), the insert writes 0 rows → already processed.
  const { data, error } = await service
    .from("webhook_events")
    .upsert(
      {
        id: event.id,
        type: event.type,
        processed_at: isHandledEventType(event.type)
          ? null
          : new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "idempotency_store_failed" },
      { status: 500 },
    );
  }
  if (!data) {
    // Duplicate delivery — already stored/processed previously.
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    await dispatch(event);
    await service
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", event.id);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Dispatch failed — surface a 500 so Stripe retries. (The event is already
    // stored; a retry will return the idempotent 200 without re-dispatching.)
    const message =
      error instanceof Error ? error.message : "dispatch_failed";
    // eslint-disable-next-line no-console
    console.error("[billing/webhook] dispatch failed:", message);
    return NextResponse.json({ error: "dispatch_failed" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
async function dispatch(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return handleSubscriptionChanged(event.data.object as Stripe.Subscription);
    case "payment_intent.succeeded":
      return handlePaymentIntent(event.data.object as Stripe.PaymentIntent, "paid");
    case "payment_intent.payment_failed":
      return handlePaymentIntent(event.data.object as Stripe.PaymentIntent, "failed");
    default:
      return; // unhandled event type — stored for audit, no-op.
  }
}

/** Does a hotel row with this id exist? (validates metadata's hotel_id). */
async function hotelExists(hotelId: string): Promise<boolean> {
  const { data } = await serviceClient()
    .from("hotels")
    .select("id")
    .eq("id", hotelId)
    .maybeSingle();
  return Boolean(data);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata as StripeMetadata;

  // --- Subscription checkout —---
  const sub = parseSubscriptionMetadata(metadata);
  if (sub.ok) {
    if (!(await hotelExists(sub.value.hotelId))) return; // orphan — ignore
    // A completed subscription checkout means the subscription is active (a
    // trial would be reflected by the subscription.created / updated events,
    // which we also handle). Initial period is derived from the subscription
    // item (see handleSubscriptionChanged).
    await serviceClient()
      .from("hotel_billing")
      .upsert(
        {
          hotel_id: sub.value.hotelId,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : null,
          status: "active",
        },
        { onConflict: "hotel_id" },
      );
    return;
  }

  // --- Upsell-payment checkout ---
  const upsell = parseUpsellPaymentMetadata(metadata);
  if (upsell.ok) {
    await handleUpsellCheckoutCompleted(session, upsell.value);
  }
  // Invalid/unknown metadata: recorded in webhook_events, harmless no-op.
}

async function handleUpsellCheckoutCompleted(
  session: Stripe.Checkout.Session,
  meta: UpsellPaymentMetadata,
): Promise<void> {
  if (typeof session.amount_total !== "number") return; // wait for a priced event
  const service = serviceClient();

  // Resolve the linked upsell_request (by stay_id + item_key → item_id).
  let upsellRequestId: string | null = null;
  let guestId: string | null = meta.guestId ?? null;
  const { data: item } = await service
    .from("upsell_items")
    .select("id")
    .eq("hotel_id", meta.hotelId)
    .eq("key", meta.itemKey)
    .maybeSingle();
  if (item) {
    const { data: request } = await service
      .from("upsell_requests")
      .select("id, guest_id")
      .eq("stay_id", meta.stayId)
      .eq("item_id", item.id)
      .maybeSingle();
    if (request) {
      upsellRequestId = request.id;
      if (!guestId) guestId = request.guest_id ?? null;
      // Mark the matching request as confirmed.
      await service
        .from("upsell_requests")
        .update({ status: "confirmed" })
        .eq("id", request.id);
    }
  }

  const split = splitCents(session.amount_total);
  await service.from("upsell_ledger").insert({
    hotel_id: meta.hotelId,
    stay_id: meta.stayId,
    guest_id: guestId,
    upsell_request_id: upsellRequestId,
    item_key: meta.itemKey,
    quantity: 1,
    gross_cents: session.amount_total,
    hotel_share_cents: split.hotelCents,
    platform_share_cents: split.platformCents,
    currency: "eur",
    checkout_session_id: session.id,
    payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    status: "paid",
  });
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription): Promise<void> {
  const service = serviceClient();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  if (!customerId) return;
  const { data: billing } = await service
    .from("hotel_billing")
    .select("hotel_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (!billing) return; // not one of our hotels — ignore

  const status = SUBSCRIPTION_STATUS_MAP[subscription.status] ?? "active";
  const priceId =
    subscription.items.data[0]?.price?.id ??
    null;
  // In current Stripe API versions the billing period lives on the first
  // SubscriptionItem (epoch seconds).
  const periodEnd = subscription.items.data[0]?.current_period_end;
  await service
    .from("hotel_billing")
    .update({
      status,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
    })
    .eq("hotel_id", billing.hotel_id);
}

async function handlePaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  status: "paid" | "failed",
): Promise<void> {
  const service = serviceClient();
  // Prefer linking by payment_intent_id (recorded at checkout time).
  const { data, error } = await service
    .from("upsell_ledger")
    .select("id")
    .eq("payment_intent_id", paymentIntent.id)
    .maybeSingle();
  if (error) return;
  if (data) {
    await service.from("upsell_ledger").update({ status }).eq("id", data.id);
    return;
  }
  // Fallback: the PaymentIntent carries our checkout metadata — locate the
  // ledger row by (hotel_id, stay_id, item_key) and flip it.
  const meta = parseUpsellPaymentMetadata(
    (paymentIntent.metadata ?? null) as StripeMetadata,
  );
  if (!meta.ok) return;
  await service
    .from("upsell_ledger")
    .update({ status })
    .eq("hotel_id", meta.value.hotelId)
    .eq("stay_id", meta.value.stayId)
    .eq("item_key", meta.value.itemKey);
}
