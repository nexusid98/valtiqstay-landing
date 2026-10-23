-- ============================================================================
-- MIGRATION 07 — BILLING FOUNDATION (bonifico model)
--
-- ValtiqStay bills hotels with a monthly bank transfer (bonifico) and an
-- invoice: NO card, NO payment provider, NO Stripe. The platform never
-- processes a payment. Guest extras are collected by the hotel itself — they
-- live in upsell_requests (migration 01) and need no billing table here.
--
-- This migration creates the two tables the invoicing module (next phase) will
-- read and write:
--
--   1. public.hotel_billing — one row per hotel mirroring the state of its
--      bank-transfer subscription (status, amount, current period).
--   2. public.invoices      — the monthly invoice records (number, period,
--      amount, status, payment declaration fields).
--
-- RLS NOTES
--   * Both tables are tenant-scoped through the existing SECURITY DEFINER
--     helper public.current_hotel_id() from migration 05 — NO subqueries on
--     public.profiles (that pattern caused the 42P17 recursion bug).
--   * Staff (authenticated) get SELECT only. Writes are deliberately not
--     exposed to any client role: invoices are issued and confirmed by the
--     service-role tooling / a SECURITY DEFINER RPC added with the invoicing
--     UI phase, so a hotel can never mint or mark-paid its own invoice from
--     the browser.
--
-- RE-RUNNABLE + NON-DESTRUCTIVE: CREATE TABLE IF NOT EXISTS, DROP POLICY IF
-- EXISTS / CREATE POLICY, CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS /
-- CREATE TRIGGER, CREATE INDEX IF NOT EXISTS, idempotent REVOKE/GRANT ⇒
-- applying this file a second time is a clean no-op that preserves existing
-- rows. Nothing is dropped or truncated here.
-- ============================================================================
-- ============================================================================
-- 1. HOTEL_BILLING — one row per hotel mirroring its bank-transfer
--    subscription. amount_cents is the flat monthly fee (€49 = 4900) and is
--    stored per row so a future price change never rewrites history.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hotel_billing (
  hotel_id              UUID PRIMARY KEY REFERENCES public.hotels(id) ON DELETE CASCADE,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'overdue', 'suspended')),
  plan_name             TEXT NOT NULL DEFAULT 'valtiqstay_hotel',
  amount_cents          INTEGER NOT NULL DEFAULT 4900 CHECK (amount_cents >= 0),
  currency              TEXT NOT NULL DEFAULT 'eur',
  billing_cycle         TEXT NOT NULL DEFAULT 'monthly'
                          CHECK (billing_cycle IN ('monthly')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  activated_at          TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hotel_billing_period_valid
    CHECK (current_period_end IS NULL OR current_period_start IS NULL
           OR current_period_end >= current_period_start)
);

COMMENT ON TABLE public.hotel_billing IS
  'One row per hotel mirroring its bank-transfer (bonifico) subscription: status (active/overdue/suspended), flat monthly amount and current period. No payment provider ids — ValtiqStay invoices by bonifico. Staff read via RLS; writes are service-role only.';
COMMENT ON COLUMN public.hotel_billing.amount_cents IS
  'Flat monthly subscription fee in cents (4900 = €49/month at activation).';
COMMENT ON COLUMN public.hotel_billing.status IS
  'active = paid up to current_period_end; overdue = an invoice is past due; suspended = service withheld until payment.';

-- ============================================================================
-- 2. INVOICES — the monthly invoice records for the bonifico subscription.
--    invoice_number is unique per hotel (numbering restarts per tenant).
--    declared_at / declared_by / payment_reference record the hotel's payment
--    declaration; paid_at is stamped when the payment is confirmed.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id          UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  invoice_number    TEXT NOT NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  currency          TEXT NOT NULL DEFAULT 'eur',
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'paid', 'overdue', 'cancelled')),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at            DATE,
  paid_at           TIMESTAMPTZ,
  payment_reference TEXT,
  declared_at       TIMESTAMPTZ,
  declared_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoices_hotel_number_unique UNIQUE (hotel_id, invoice_number),
  CONSTRAINT invoices_period_valid CHECK (period_end >= period_start)
);

COMMENT ON TABLE public.invoices IS
  'Monthly bonifico invoices, one row per hotel per billing period. amount_cents is the invoice total; status open → paid (payment confirmed) or overdue; cancelled for voided invoices. declared_at/by and payment_reference capture the hotel''s payment declaration, paid_at the confirmation. Staff read via RLS; writes are service-role / SECURITY DEFINER only.';
COMMENT ON COLUMN public.invoices.invoice_number IS
  'Human invoice number, unique within the hotel (e.g. 2026-0001).';
COMMENT ON COLUMN public.invoices.payment_reference IS
  'CRO / bank transfer reference the hotel enters when declaring the bonifico.';

CREATE INDEX IF NOT EXISTS idx_invoices_hotel_id     ON public.invoices(hotel_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status       ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_period_start ON public.invoices(period_start DESC);

-- ============================================================================
-- 3. updated_at triggers (one shared function for both tables)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.billing_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION public.billing_touch_updated_at() IS
  'BEFORE UPDATE trigger that stamps NEW.updated_at = now() for hotel_billing and invoices.';

DROP TRIGGER IF EXISTS hotel_billing_set_updated_at ON public.hotel_billing;
CREATE TRIGGER hotel_billing_set_updated_at
  BEFORE UPDATE ON public.hotel_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.billing_touch_updated_at();

DROP TRIGGER IF EXISTS invoices_set_updated_at ON public.invoices;
CREATE TRIGGER invoices_set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.billing_touch_updated_at();

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.hotel_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices      ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES — staff read scoped by their own hotel via current_hotel_id()
--    (migration 05 helper; never subquery public.profiles directly).
--    SELECT only: no client role can insert or update billing rows.
-- ============================================================================
DROP POLICY IF EXISTS hotel_billing_staff_select ON public.hotel_billing;
CREATE POLICY hotel_billing_staff_select ON public.hotel_billing FOR SELECT
  USING (hotel_id = public.current_hotel_id());

DROP POLICY IF EXISTS invoices_staff_select ON public.invoices;
CREATE POLICY invoices_staff_select ON public.invoices FOR SELECT
  USING (hotel_id = public.current_hotel_id());

-- ============================================================================
-- 6. GRANTS — minimal. Staff (authenticated) get SELECT on both tables and
--    nothing else; anon gets nothing. Writes run through the service role
--    (which bypasses RLS) or a future SECURITY DEFINER RPC.
-- ============================================================================
REVOKE ALL ON TABLE public.hotel_billing FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON TABLE public.hotel_billing TO authenticated;

REVOKE ALL ON TABLE public.invoices FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON TABLE public.invoices TO authenticated;

-- Neither table uses a sequence (UUID / integer literals) — no sequence grants.

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
    AND tablename IN ('hotel_billing', 'invoices');
  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('hotel_billing', 'invoices');
  RAISE NOTICE 'Migration 07 (bonifico billing foundation) applied: % billing tables exist, % staff SELECT policies active.', v_tables, v_policies;
END $$;
