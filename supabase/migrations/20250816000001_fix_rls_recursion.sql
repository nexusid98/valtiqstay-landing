-- ============================================================================
-- ValtiqStay — M4-4: fix RLS infinite recursion (42P17) for staff policies
-- ----------------------------------------------------------------------------
-- Root cause: every staff policy in migration 01 §5 is written as
--     ... hotel_id IN (SELECT hotel_id FROM profiles WHERE id = auth.uid())
-- and profiles' own policies (profiles_staff_select etc.) use the SAME
-- subquery on profiles → the policy on profiles references profiles while it
-- is being evaluated → PostgreSQL throws 42P17 "infinite recursion detected
-- in policy for relation profiles" on EVERY authenticated staff query
-- (checkin_sessions, profiles, ...). The guest flow never noticed because it
-- writes via SECURITY DEFINER RPCs and service-role signed URLs; the M4
-- dashboard was the first code path to exercise staff-scoped RLS directly.
--
-- Fix (canonical Supabase non-recursive pattern): two SECURITY DEFINER helper
-- functions run as the table owner (who bypasses RLS), so their inner SELECT
-- against public.profiles is NEVER evaluated under RLS and cannot recurse.
-- Every staff policy is rewritten to call the helpers instead of subquerying
-- profiles.
--
-- Semantics preserved exactly: same tables, same commands (SELECT/INSERT/
-- UPDATE/DELETE/ALL), same data visibility (staff see only their hotel's rows;
-- only hotel_admin can INSERT/UPDATE profiles), audit append-only, storage
-- path-scoped to {hotel_id}/... bucket folders. Guest-flow RPCs
-- (get_stay_by_session_token, start_checkin_session, get_hotel_upsells,
-- submit_checkin_session) and the staff RPC create_checkin_session are NOT
-- touched — they are SECURITY DEFINER and unaffected.
--
-- RE-RUNNABLE: CREATE OR REPLACE FUNCTION + DROP POLICY IF EXISTS / CREATE
-- POLICY ⇒ applying this file a second time is a clean no-op. Functions are
-- created BEFORE the policies that call them.
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS — non-recursive staff-identity lookup
-- ============================================================================

-- Returns the caller's hotel_id (from public.profiles), evaluated as the
-- table owner so RLS is bypassed for the inner SELECT. search_path is pinned
-- to '' (like migration 04's create_checkin_session): every identifier must
-- be schema-qualified, which also blocks search_path hijacking.
CREATE OR REPLACE FUNCTION public.current_hotel_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT hotel_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_hotel_id() IS
  'Non-recursive hotel scoping for RLS policies: returns the caller''s hotel_id from public.profiles, run as SECURITY DEFINER (owner) so the lookup bypasses RLS and cannot recurse. NULL for anon/unregistered users.';

-- Returns the caller's role ('hotel_admin' | 'hotel_staff') from
-- public.profiles, same SECURITY DEFINER pattern as current_hotel_id().
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_profile_role() IS
  'Non-recursive role lookup for RLS policies: returns the caller''s profile role from public.profiles, read as SECURITY DEFINER (table owner) so the inline SELECT cannot recurse. NULL for callers without a profile.';

-- Staff-only helpers: anon must NOT be able to invoke them (they expose which
-- hotel/role a UUID maps to). Revoke the default PUBLIC execute (which covers
-- anon) and grant execution to authenticated only.
REVOKE ALL ON FUNCTION public.current_hotel_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_hotel_id() FROM anon;
GRANT  EXECUTE ON FUNCTION public.current_hotel_id() TO authenticated;

REVOKE ALL ON FUNCTION public.current_profile_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_profile_role() FROM anon;
GRANT  EXECUTE ON FUNCTION public.current_profile_role() TO authenticated;

-- ============================================================================
-- 2. REWRITE EVERY RECURSIVE POLICY — migration 01 §5 (a–j + storage)
--    Old: ... IN (SELECT hotel_id FROM profiles WHERE id = auth.uid())
--    New: ... = public.current_hotel_id()
--    No policy keeps a direct subquery on profiles.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2a. §5a hotels — staff see/edit only their own hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS hotels_staff_select ON hotels;
CREATE POLICY hotels_staff_select ON hotels FOR SELECT
  USING (id = public.current_hotel_id());

DROP POLICY IF EXISTS hotels_staff_update ON hotels;
CREATE POLICY hotels_staff_update ON hotels FOR UPDATE
  USING (id = public.current_hotel_id())
  WITH CHECK (id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2b. §5b profiles — staff see their hotel's profiles; admin manages them.
--     profiles_self_delete (USING id = auth.uid()) is already non-recursive
--     and is intentionally left untouched.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_staff_select ON profiles;
CREATE POLICY profiles_staff_select ON profiles FOR SELECT
  USING (hotel_id = public.current_hotel_id());

DROP POLICY IF EXISTS profiles_admin_insert ON profiles;
CREATE POLICY profiles_admin_insert ON profiles FOR INSERT
  WITH CHECK (
    hotel_id = public.current_hotel_id()
    AND public.current_profile_role() = 'hotel_admin'
  );

DROP POLICY IF EXISTS profiles_admin_update ON profiles;
CREATE POLICY profiles_admin_update ON profiles FOR UPDATE
  USING (
    hotel_id = public.current_hotel_id()
    AND public.current_profile_role() = 'hotel_admin'
  )
  WITH CHECK (
    hotel_id = public.current_hotel_id()
    AND public.current_profile_role() = 'hotel_admin'
  );

-- ----------------------------------------------------------------------------
-- 2c. §5c stays — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS stays_staff_all ON stays;
CREATE POLICY stays_staff_all ON stays FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2d. §5d guests — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS guests_staff_all ON guests;
CREATE POLICY guests_staff_all ON guests FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2e. §5e documents — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_staff_all ON documents;
CREATE POLICY documents_staff_all ON documents FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2f. §5f checkin_sessions — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS checkin_sessions_staff_all ON checkin_sessions;
CREATE POLICY checkin_sessions_staff_all ON checkin_sessions FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2g. §5g upsell_items — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS upsell_items_staff_all ON upsell_items;
CREATE POLICY upsell_items_staff_all ON upsell_items FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2h. §5h upsell_requests — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS upsell_requests_staff_all ON upsell_requests;
CREATE POLICY upsell_requests_staff_all ON upsell_requests FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2i. §5i consents — full CRUD scoped by hotel
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS consents_staff_all ON consents;
CREATE POLICY consents_staff_all ON consents FOR ALL
  USING (hotel_id = public.current_hotel_id())
  WITH CHECK (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 2j. §5j audit_logs — SELECT scoped by hotel (append-only INSERT policy
--     audit_logs_staff_insert uses only auth.uid() IS NOT NULL, is
--     non-recursive and is left untouched).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS audit_logs_staff_select ON audit_logs;
CREATE POLICY audit_logs_staff_select ON audit_logs FOR SELECT
  USING (hotel_id = public.current_hotel_id());

-- ----------------------------------------------------------------------------
-- 3. STORAGE POLICY — documents bucket, path-scoped to the hotel folder.
--    Path convention {hotel_id}/{guest_id}/{filename}; the bucket policy on
--    storage.objects is in the storage schema (not the public DO-block), so
--    it must be dropped explicitly first — which also makes it re-runnable.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "staff_access_documents" ON storage.objects;
CREATE POLICY "staff_access_documents" ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = public.current_hotel_id()::text
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = public.current_hotel_id()::text
  );

-- ============================================================================
-- 4. CONFIRMATION — echo the two helpers + the rewrite count so SQL Editor /
--    psql output clearly shows the migration applied. (RAISE NOTICE)
-- ============================================================================
DO $$
DECLARE
  v_hotel_policies INT;
  v_role_policies  INT;
BEGIN
  SELECT count(*) INTO v_hotel_policies
  FROM pg_policies
  WHERE qual LIKE '%current_hotel_id%' OR with_check LIKE '%current_hotel_id%';

  SELECT count(*) INTO v_role_policies
  FROM pg_policies
  WHERE qual LIKE '%current_profile_role%' OR with_check LIKE '%current_profile_role%';

  RAISE NOTICE 'RLS recursion fix (migration 05) applied: public.current_hotel_id() and public.current_profile_role() are live — % policy expressions reference current_hotel_id, % reference current_profile_role. No policy subqueries profiles anymore.', v_hotel_policies, v_role_policies;
END $$;