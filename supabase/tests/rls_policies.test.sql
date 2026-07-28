-- ============================================================================
-- ValtiqStay M1 — RLS Policy Tests
-- ============================================================================
-- These tests verify cross-tenant isolation and anon restrictions.
-- Run against the Supabase SQL editor or via psql.
--
-- PREREQUISITES:
--   1. Migration 20250728000001_initial_schema.sql has been applied.
--   2. Seed data has been applied.
--   3. Two test staff users exist (created via Supabase Auth):
--      - hotel_a_staff  → linked to hotel A via profiles table
--      - hotel_b_staff  → linked to hotel B via profiles table
--   4. Two hotels exist: hotel A (bella-vista) and hotel B (created below).
-- ============================================================================

BEGIN;

-- ============================================================================
-- SETUP: Create second hotel for cross-tenant testing
-- ============================================================================

-- Hotel A = bella-vista (from seed data): id = b1000000-0000-0000-0000-000000000001
-- Hotel B = created here for isolation tests

INSERT INTO hotels (id, name, slug, locale)
VALUES (
  'b2000000-0000-0000-0000-000000000002',
  'Hotel Riviera',
  'riviera',
  'it'
) ON CONFLICT (id) DO NOTHING;

-- Create a stay in hotel B
INSERT INTO stays (id, hotel_id, arrival_date, departure_date, room_label, booking_ref, status)
VALUES (
  'c2000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000002',
  '2026-08-01',
  '2026-08-05',
  'Camera 101',
  'BK-RIV-001',
  'pending'
) ON CONFLICT (id) DO NOTHING;

-- Create a stay in hotel A (bella-vista)
INSERT INTO stays (id, hotel_id, arrival_date, departure_date, room_label, booking_ref, status)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  '2026-08-01',
  '2026-08-03',
  'Camera 204',
  'BK-BV-001',
  'pending'
) ON CONFLICT (id) DO NOTHING;

-- Create a checkin session for the hotel A stay
INSERT INTO checkin_sessions (stay_id, hotel_id, token, status, expires_at)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'test-valid-token-bella-vista',
  'pending',
  now() + interval '7 days'
) ON CONFLICT DO NOTHING;

-- Create an expired session
INSERT INTO checkin_sessions (stay_id, hotel_id, token, status, expires_at)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'test-expired-token',
  'expired',
  now() - interval '1 day'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEST 1: ANON cannot SELECT from guests
-- ============================================================================
-- Expected: 0 rows returned (RLS blocks all anon access)

\echo '=== TEST 1: Anon SELECT from guests ==='

SET LOCAL ROLE anon;

-- This must return 0 rows — anon has no policies on guests
SELECT COUNT(*) AS anon_guest_count FROM guests;

-- Verify: count should be 0
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM guests;
  IF v_count != 0 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: anon saw % guests, expected 0', v_count;
  END IF;
  RAISE NOTICE 'TEST 1 PASSED: anon cannot see guests';
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 2: ANON calling get_stay_by_session_token with a fake token
-- ============================================================================
-- Expected: returns jsonb with error = 'invalid_token'

\echo '=== TEST 2: Anon RPC with fake token ==='

SET LOCAL ROLE anon;

SELECT get_stay_by_session_token('fake-nonexistent-token') AS result;

-- Verify: result must contain error
DO $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT get_stay_by_session_token('fake-nonexistent-token') INTO v_result;
  IF v_result->>'error' != 'invalid_token' THEN
    RAISE EXCEPTION 'TEST 2 FAILED: expected invalid_token error, got %', v_result;
  END IF;
  RAISE NOTICE 'TEST 2 PASSED: fake token returns invalid_token error';
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 2b: ANON with valid token returns data
-- ============================================================================

\echo '=== TEST 2b: Anon RPC with valid token ==='

SET LOCAL ROLE anon;

SELECT get_stay_by_session_token('test-valid-token-bella-vista') AS result;

DO $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT get_stay_by_session_token('test-valid-token-bella-vista') INTO v_result;
  IF v_result ? 'error' THEN
    RAISE EXCEPTION 'TEST 2b FAILED: valid token returned error: %', v_result->>'error';
  END IF;
  IF v_result->'stay' IS NULL THEN
    RAISE EXCEPTION 'TEST 2b FAILED: no stay data returned';
  END IF;
  RAISE NOTICE 'TEST 2b PASSED: valid token returns stay data';
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 2c: ANON with expired token
-- ============================================================================

\echo '=== TEST 2c: Anon RPC with expired token ==='

SET LOCAL ROLE anon;

DO $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT get_stay_by_session_token('test-expired-token') INTO v_result;
  IF v_result->>'error' != 'expired_token' THEN
    RAISE EXCEPTION 'TEST 2c FAILED: expected expired_token error, got %', v_result;
  END IF;
  RAISE NOTICE 'TEST 2c PASSED: expired token returns expired_token error';
END $$;

RESET ROLE;

-- ============================================================================
-- TEST 3: Cross-tenant isolation — staff from hotel A cannot see hotel B's stays
-- ============================================================================
-- NOTE: This test requires actual auth.users with profiles.
-- If those users don't exist yet, this test documents the expected behavior.
-- To run: create two users in Supabase Auth, insert matching profiles,
-- then use SET LOCAL ROLE authenticated; SET LOCAL "request.jwt.claims" ...

\echo '=== TEST 3: Cross-tenant isolation (documentation) ==='
\echo 'This test requires auth.users — see instructions below.'
\echo ''
\echo 'To run manually:'
\echo '  1. Create user_a in Supabase Auth → get user_a_id'
\echo '  2. Create user_b in Supabase Auth → get user_b_id'
\echo '  3. INSERT INTO profiles (id, hotel_id, role, full_name) VALUES'
\echo '     (''user_a_id'', ''b1000000-0000-0000-0000-000000000001'', ''hotel_admin'', ''Staff A''),'
\echo '     (''user_b_id'', ''b2000000-0000-0000-0000-000000000002'', ''hotel_admin'', ''Staff B'');'
\echo '  4. Then test:'
\echo '     -- As staff A, SELECT from stays → should only see hotel A stays'
\echo '     -- As staff B, SELECT from stays → should only see hotel B stays'
\echo ''

-- Documented expected outcome: 
-- When authenticated as staff A (hotel_id = bella-vista):
--   SELECT * FROM stays → returns only stays with hotel_id = b1000000...
--   SELECT * FROM stays WHERE hotel_id = 'b2000000...' → returns 0 rows
-- When authenticated as staff B (hotel_id = riviera):
--   SELECT * FROM stays → returns only stays with hotel_id = b2000000...
--   SELECT * FROM stays WHERE hotel_id = 'b1000000...' → returns 0 rows

-- ============================================================================
-- TEST 4: Verify all tables have RLS enabled
-- ============================================================================

\echo '=== TEST 4: RLS enabled on all tables ==='

DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_table TEXT;
BEGIN
  FOR v_table IN
    SELECT unnest(ARRAY[
      'hotels', 'profiles', 'stays', 'guests', 'documents',
      'checkin_sessions', 'upsell_items', 'upsell_requests',
      'consents', 'audit_logs'
    ])
  LOOP
    SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class
    WHERE relname = v_table AND relnamespace = 'public'::regnamespace;

    IF v_rls_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'TEST 4 FAILED: RLS not enabled on table %', v_table;
    END IF;
    RAISE NOTICE 'TEST 4: RLS enabled on % — OK', v_table;
  END LOOP;
  RAISE NOTICE 'TEST 4 PASSED: RLS enabled on all 10 tables';
END $$;

-- ============================================================================
-- TEST 5: Verify security-definer function exists
-- ============================================================================

\echo '=== TEST 5: RPC function exists ==='

DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_stay_by_session_token'
      AND p.prosecdef = true
  ) INTO v_exists;

  IF NOT v_exists THEN
    RAISE EXCEPTION 'TEST 5 FAILED: security-definer function get_stay_by_session_token not found';
  END IF;
  RAISE NOTICE 'TEST 5 PASSED: get_stay_by_session_token exists with SECURITY DEFINER';
END $$;

-- ============================================================================
-- CLEANUP (optional — comment out ROLLBACK to keep test data)
-- ============================================================================

ROLLBACK;

-- NOTE: The test data above is wrapped in a transaction and rolled back.
-- To persist test data (e.g., the second hotel and test stays), comment out
-- the ROLLBACK above and use COMMIT instead.
