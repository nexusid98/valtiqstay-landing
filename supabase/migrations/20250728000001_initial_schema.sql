-- M1: Schema + RLS — Full schema replacement for ValtiqStay
-- Drops old M0-only tables and creates the canonical multi-tenant schema.
-- Idempotent: safe to run multiple times.
-- Safe to re-run: existing tables and their data are preserved (CREATE TABLE
-- IF NOT EXISTS); policies are dropped and recreated; the storage policy is
-- dropped first; the RPC is CREATE OR REPLACE.
--   * CREATE INDEX IF NOT EXISTS for all indexes
--   * DO block drops all public-schema policies before recreation
--   * bucket INSERT ... ON CONFLICT is inherently idempotent.

-- ============================================================================
-- 1. DROP OLD M0 OBJECTS (if they exist)
-- ============================================================================

-- Drop old policies (all from previous schema)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Drop old M0-only tables (CASCADE removes dependencies).
-- NOTE: 'guests' and 'hotels' are REUSED canonical M1 names and are never
-- dropped here — DROP TABLE IF EXISTS would wipe real data on re-run.
DROP TABLE IF EXISTS upsell_orders CASCADE;
DROP TABLE IF EXISTS upsells CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS hotel_users CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS generate_hotel_api_key() CASCADE;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- 2a. hotels
CREATE TABLE IF NOT EXISTS hotels (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  logo_url              TEXT,
  hero_url              TEXT,
  accent_navy           TEXT,
  accent_gold           TEXT,
  accent_champagne      TEXT,
  locale                TEXT DEFAULT 'it',
  alloggiati_credentials JSONB,
  doc_retention_days    INT DEFAULT 30,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 2b. profiles (maps auth.users → hotel + role)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id  UUID NOT NULL REFERENCES hotels(id),
  role      TEXT NOT NULL CHECK (role IN ('hotel_admin', 'hotel_staff')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2c. stays (replaces old reservations)
CREATE TABLE IF NOT EXISTS stays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id),
  arrival_date    DATE NOT NULL,
  departure_date  DATE NOT NULL,
  room_label      TEXT,
  booking_ref     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'checked_out', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2d. guests (linked to stays, with hotel_id for direct RLS)
CREATE TABLE IF NOT EXISTS guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id             UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
  hotel_id            UUID NOT NULL REFERENCES hotels(id),
  is_lead             BOOLEAN DEFAULT false,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  birth_date          DATE,
  birth_place         TEXT,
  nationality         TEXT,
  doc_type            TEXT,
  doc_number          TEXT,
  doc_issuing_country TEXT,
  doc_expiry_date     DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 2e. documents (uploaded ID documents)
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id        UUID REFERENCES guests(id),
  hotel_id        UUID NOT NULL REFERENCES hotels(id),
  storage_path    TEXT NOT NULL,
  doc_type        TEXT,
  issuing_country TEXT,
  doc_number      TEXT,
  expiry_date     DATE,
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2f. checkin_sessions (anon guest check-in flow)
CREATE TABLE IF NOT EXISTS checkin_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id       UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
  hotel_id      UUID NOT NULL REFERENCES hotels(id),
  token         TEXT UNIQUE NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'verified', 'expired')),
  expires_at    TIMESTAMPTZ NOT NULL,
  submitted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2g. upsell_items
CREATE TABLE IF NOT EXISTS upsell_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id      UUID NOT NULL REFERENCES hotels(id),
  key           TEXT NOT NULL,
  label_it      TEXT NOT NULL,
  label_en      TEXT,
  description_it TEXT,
  description_en TEXT,
  price         DECIMAL(10,2),
  active        BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2h. upsell_requests
CREATE TABLE IF NOT EXISTS upsell_requests (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id   UUID NOT NULL REFERENCES stays(id),
  hotel_id  UUID NOT NULL REFERENCES hotels(id),
  item_id   UUID NOT NULL REFERENCES upsell_items(id),
  quantity  INT DEFAULT 1,
  status    TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'declined')),
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2i. consents
CREATE TABLE IF NOT EXISTS consents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id    UUID REFERENCES guests(id),
  hotel_id    UUID NOT NULL REFERENCES hotels(id),
  purpose     TEXT NOT NULL,
  granted     BOOLEAN NOT NULL,
  text_shown  TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2j. audit_logs (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id),
  actor_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id      ON profiles(hotel_id);
CREATE INDEX IF NOT EXISTS idx_stays_hotel_id          ON stays(hotel_id);
CREATE INDEX IF NOT EXISTS idx_stays_arrival_date      ON stays(arrival_date);
CREATE INDEX IF NOT EXISTS idx_stays_status            ON stays(status);
CREATE INDEX IF NOT EXISTS idx_guests_stay_id          ON guests(stay_id);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id         ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_documents_guest_id      ON documents(guest_id);
CREATE INDEX IF NOT EXISTS idx_documents_hotel_id      ON documents(hotel_id);
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_token  ON checkin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_stay_id ON checkin_sessions(stay_id);
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_expires ON checkin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_upsell_items_hotel_id   ON upsell_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_stay_id ON upsell_requests(stay_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_hotel_id ON upsell_requests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_consents_guest_id       ON consents(guest_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hotel_id     ON audit_logs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs(created_at);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE hotels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays            ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES — AUTHENTICATED STAFF
-- ============================================================================

-- Helper: all staff access is scoped to their hotel_id from profiles.
-- Every policy below uses: hotel_id = (SELECT hotel_id FROM profiles WHERE id = auth.uid())

-- 5a. hotels: staff can see and edit their own hotel
CREATE POLICY hotels_staff_select ON hotels FOR SELECT
  USING (id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY hotels_staff_update ON hotels FOR UPDATE
  USING (id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5b. profiles: staff can see their hotel's profiles; only hotel_admin can INSERT/UPDATE
CREATE POLICY profiles_staff_select ON profiles FOR SELECT
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY profiles_admin_insert ON profiles FOR INSERT
  WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'hotel_admin'
  );

CREATE POLICY profiles_admin_update ON profiles FOR UPDATE
  USING (
    hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'hotel_admin'
  )
  WITH CHECK (
    hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'hotel_admin'
  );

CREATE POLICY profiles_self_delete ON profiles FOR DELETE
  USING (id = auth.uid());

-- 5c. stays: full CRUD for authenticated staff within their hotel
CREATE POLICY stays_staff_all ON stays FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5d. guests: full CRUD scoped by hotel
CREATE POLICY guests_staff_all ON guests FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5e. documents: full CRUD scoped by hotel
CREATE POLICY documents_staff_all ON documents FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5f. checkin_sessions: full CRUD scoped by hotel
CREATE POLICY checkin_sessions_staff_all ON checkin_sessions FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5g. upsell_items: full CRUD scoped by hotel
CREATE POLICY upsell_items_staff_all ON upsell_items FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5h. upsell_requests: full CRUD scoped by hotel
CREATE POLICY upsell_requests_staff_all ON upsell_requests FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5i. consents: full CRUD scoped by hotel
CREATE POLICY consents_staff_all ON consents FOR ALL
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

-- 5j. audit_logs: SELECT only, INSERT for any authenticated user (append-only)
CREATE POLICY audit_logs_staff_select ON audit_logs FOR SELECT
  USING (hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY audit_logs_staff_insert ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 6. RLS POLICIES — ANON (UNAUTHENTICATED)
-- ============================================================================

-- All data tables DENY anon by default — no policies grant anon access.
-- The single entry point for guests is the security-definer RPC below.

-- ============================================================================
-- 7. SECURITY-DEFINER RPC — get_stay_by_session_token
-- ============================================================================

CREATE OR REPLACE FUNCTION get_stay_by_session_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay_id UUID;
  v_hotel_id UUID;
  v_status TEXT;
  v_expires_at TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Look up the session
  SELECT stay_id, hotel_id, status, expires_at
  INTO v_stay_id, v_hotel_id, v_status, v_expires_at
  FROM public.checkin_sessions
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_token');
  END IF;

  IF v_status = 'expired' OR v_expires_at < now() THEN
    RETURN jsonb_build_object('error', 'expired_token');
  END IF;

  -- Return stay + hotel + guests data
  SELECT jsonb_build_object(
    'stay', row_to_json(s.*),
    'hotel', row_to_json(h.*),
    'guests', (SELECT jsonb_agg(row_to_json(g.*)) FROM public.guests g WHERE g.stay_id = v_stay_id)
  )
  INTO v_result
  FROM public.stays s
  JOIN public.hotels h ON h.id = s.hotel_id
  WHERE s.id = v_stay_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 8. STORAGE BUCKET — documents
-- ============================================================================

-- NOTE: Old 'guest-documents' bucket (if it exists) must be removed via
-- Supabase Dashboard → Storage or the Storage API. Direct DELETE from
-- storage.objects and storage.buckets is blocked by Supabase.
-- The new 'documents' bucket has a different name — no conflict.

-- Create new private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: authenticated users can upload/read from their hotel's path
-- Path convention: {hotel_id}/{guest_id}/{filename}
-- Make re-runnable: storage policies are NOT dropped by the DO block above
-- (that only covers the public schema), so drop this policy explicitly first.
DROP POLICY IF EXISTS "staff_access_documents" ON storage.objects;
CREATE POLICY "staff_access_documents" ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT hotel_id::text FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT hotel_id::text FROM profiles WHERE id = auth.uid()
    )
  );
