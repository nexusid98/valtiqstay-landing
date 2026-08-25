-- ============================================================================
-- MIGRATION 07 — BILLING FOUNDATION
-- Adds the Stripe subscription + upsell revenue-share ledger tables and the
-- webhook idempotency ledger. This is the M5-1 revenue plumbing foundation:
-- schema only — no live Stripe calls yet.
--
-- THROWAWAY (M5) DESIGN NOTES
--   * All three tables are tenant-scoped: hotel_billing and upsell_ledger use
--     the existing SECURITY DEFINER helper public.current_hotel_id() from
--     migration 05 for their RLS policies — NO subqueries on public.profiles
--     (that pattern caused the 42P17 recursion bug fixed in migration 05).
--   * webhook_events is NOT readable by staff (and has NO public policy →
--     default deny). It is a service-role-only idempotency ledger keyed on the
--     Stripe event id (PRIMARY KEY), so a repeated webhook delivery is a
--     silent no-op (INSERT ... ON CONFLICT DO NOTHING).
--   * Client writes are deliberately disabled: staff get SELECT only on
--     hotel_billing / upsell_ledger; everything else (webhook writes) runs via
--     the service-role client which bypasses RLS. See REVOKE/GRANT below.
--
-- RE-RUNNABLE + NON-DESTRUCTIVE: CREATE TABLE IF NOT EXISTS, DROP POLICY IF
-- EXISTS / CREATE POLICY, CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS /
-- CREATE TRIGGER, idempotent REVOKE/GRANT ⇒ applying this file a second time
-- is a clean no-op that preserves existing rows.
-- ============================================================================
-- ============================================================================
-- 1. HOTEL_BILLING — one row per hotel mirroring its Stripe subscription state
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hotel_billing (
  hotel_id              UUID PRIMARY KEY REFERENCES public.hotels(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id       TEXT,
  status                TEXT NOT NULL DEFAULT 'none'
                          CHECK (status IN ('none', 'trialing', 'active', 'past_due', 'canceled')),
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hotel_billing IS
  'One row per hotel mirroring its Stripe subscription (customer/subscription ids, status, current period end). Written only via the service-role webhook/API routes; staff read via RLS.';

-- Keep updated_at fresh on every UPDATE.
CREATE OR REPLACE FUNCTION public.set_hotel_billing_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.set_hotel_billing_updated_at() IS
  'BEFORE UPDATE trigger that stamps NEW.updated_at = now() for hotel_billing.';

DROP TRIGGER IF EXISTS hotel_billing_set_updated_at ON public.hotel_billing;
CREATE TRIGGER hotel_billing_set_updated_at
  BEFORE UPDATE ON public.hotel_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.set_hotel_billing_updated_at();

-- ============================================================================
-- 2. UPSELL_LEDGER — the 80/20 revenue-share ledger for one-time upsell
--    payments. One row per upsell checkout; gross + split cents recorded from
--    what Stripe actually collected (webhook), never from client input.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.upsell_ledger (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id             UUID NOT NULL REFERENCES public.hotels(id),
  stay_id              UUID NOT NULL REFERENCES public.stays(id),
  guest_id             UUID REFERENCES public.guests(id),
  upsell_request_id    UUID REFERENCES public.upsell_requests(id),
  item_key             TEXT NOT NULL,
  quantity             INT NOT NULL DEFAULT 1,
  gross_cents          INT NOT NULL,
  hotel_share_cents    INT NOT NULL,
  platform_share_cents INT NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'eur',
  checkout_session_id  TEXT,
  payment_intent_id    TEXT,
  status               TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  created_at           TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.upsell_ledger IS
  'Revenue-share ledger for one-time guest upsell payments. gross_cents comes from Stripe amount_total; the 80/20 split is computed by the API (splitCents) and stored. status flows pending → paid/failed/refunded from webhook events.';

CREATE INDEX IF NOT EXISTS idx_upsell_ledger_hotel_id   ON public.upsell_ledger(hotel_id);
CREATE INDEX IF NOT EXISTS idx_upsell_ledger_stay_id    ON public.upsell_ledger(stay_id);
CREATE INDEX IF NOT EXISTS idx_upsell_ledger_status     ON public.upsell_ledger(status);

-- ============================================================================
-- 3. WEBHOOK_EVENTS — idempotency ledger for the webhook handler
--    (service-role only; intentionally NOT staff-readable).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id            TEXT PRIMARY KEY,          -- the Stripe event id
  type          TEXT NOT NULL,
  received_at   TIMESTAMPTZ DEFAULT now(),
  processed_at  TIMESTAMPTZ
);

COMMENT ON TABLE public.webhook_events IS
  'Idempotency ledger for Stripe webhook deliveries. Keyed on the Stripe event id (PRIMARY KEY); re-deliveries are INSERT ON CONFLICT DO NOTHING (silent no-op). Service-role only — no RLS policy (default deny) so it is not staff-readable.';

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events(type);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.hotel_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES — staff read scoped by their own hotel via current_hotel_id()
--    (migration 05 helper; never subquery public.profiles directly).
--    hotel_billing / upsell_ledger are SELECT-only for staff: writes happen
--    exclusively via the service-role API routes.
-- ============================================================================
DROP POLICY IF EXISTS hotel_billing_staff_select ON public.hotel_billing;
CREATE POLICY hotel_billing_staff_select ON public.hotel_billing FOR SELECT
  USING (hotel_id = public.current_hotel_id());

DROP POLICY IF EXISTS upsell_ledger_staff_select ON public.upsell_ledger;
CREATE POLICY upsell_ledger_staff_select ON public.upsell_ledger FOR SELECT
  USING (hotel_id = public.current_hotel_id());

-- webhook_events intentionally has NO policy → RLS default deny for everyone.
-- Only the service-role client (which bypasses RLS) reads/writes it.

-- ============================================================================
-- 6. GRANTS — keep table grants minimal. Staff (authenticated) get SELECT on
--    hotel_billing/upsell_ledger and NOTHING on webhook_events. No INSERT/
--    UPDATE from any client role; writes are service-role only (service_role
--    bypasses RLS and privileges, so these REVOKEs do not affect it).
-- ============================================================================
REVOKE ALL ON TABLE public.hotel_billing FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON TABLE public.hotel_billing TO authenticated;

REVOKE ALL ON TABLE public.upsell_ledger FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON TABLE public.upsell_ledger TO authenticated;

REVOKE ALL ON TABLE public.webhook_events FROM PUBLIC, anon, authenticated;
-- (no grant — webhook_events is service-role only)

-- Sequences (none of the new tables use SERIAL; all UUID/INT literals) — no
-- sequence grants needed.

-- ============================================================================
-- 7. CONFIRMATION NOTICE
-- ============================================================================
DO $$
DECLARE
  v_tables INT;
  v_policies INT;
BEGIN
  SELECT count(*) INTO v_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('hotel_billing', 'upsell_ledger', 'webhook_events');
  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('hotel_billing', 'upsell_ledger');
  RAISE NOTICE 'Migration 07 (billing foundation) applied: % billing tables exist, % staff policies active (webhook_events denied by default).', v_tables, v_policies;
END $$;
