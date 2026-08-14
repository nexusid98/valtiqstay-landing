-- ============================================================================
-- ValtiqStay — M4: staff session management
-- ----------------------------------------------------------------------------
-- Adds the first staff-only database object: create_checkin_session.
--
--   • create_checkin_session(...) — SECURITY DEFINER RPC that atomically
--     creates a stay (status 'pending') + a check-in session with a URL-safe
--     unique token ({hotel-slug}-arrivo-{8 hex chars}, matching the existing
--     'bella-vista-arrivo-2' style) and appends an audit_logs row
--     (action 'session_created').
--
-- Unlike the guest-flow RPCs (callable by anon via default PUBLIC EXECUTE),
-- this function is EXECUTE-granted ONLY to authenticated staff: EXECUTE is
-- revoked from PUBLIC and anon. The caller's hotel is derived from profiles
-- (auth.uid()) — never from a parameter — so the RPC is tenant-scoped by
-- construction. Error codes are RAISEd as exception messages (staff_only,
-- invalid_data, duplicate_booking, token_collision).
--
-- Also adds a partial UNIQUE index on stays(hotel_id, booking_ref) so the
-- same booking can never receive a second stay/session pair.
--
-- Idempotent (CREATE OR REPLACE FUNCTION / CREATE UNIQUE INDEX IF NOT EXISTS /
-- re-runnable REVOKE/GRANT) and non-destructive (adds objects only; touches
-- no data, drops nothing). Safe to re-run; double-run verification against a
-- local Postgres 16 is recommended before applying to a remote.
-- ============================================================================

-- ============================================================================
-- 1. create_checkin_session — staff-only session creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_checkin_session(
  p_arrival_date   DATE,
  p_departure_date DATE,
  p_room_label     TEXT DEFAULT NULL,
  p_booking_ref    TEXT DEFAULT NULL,
  p_expires_hours  INT DEFAULT 48
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hotel_id      UUID;
  v_hotel_slug    TEXT;
  v_hotel_locale  TEXT;
  v_stay_id       UUID;
  v_session_id    UUID;
  v_token         TEXT;
  v_expires_at    TIMESTAMPTZ;
  v_attempts      INT := 0;
  v_max_attempts  CONSTANT INT := 10;
BEGIN
  -- Tenant is derived from the caller's profile — never from a parameter.
  SELECT pr.hotel_id, h.slug, h.locale
  INTO v_hotel_id, v_hotel_slug, v_hotel_locale
  FROM public.profiles pr
  JOIN public.hotels h ON h.id = pr.hotel_id
  WHERE pr.id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'staff_only';
  END IF;

  IF p_arrival_date IS NULL OR p_departure_date IS NULL
     OR p_arrival_date >= p_departure_date THEN
    RAISE EXCEPTION 'invalid_data';
  END IF;

  IF p_expires_hours IS NULL OR p_expires_hours < 1 OR p_expires_hours > 720 THEN
    RAISE EXCEPTION 'invalid_data';
  END IF;

  -- One stay per hotel+booking (partial unique index below) — surface a
  -- duplicate booking as a readable error instead of a raw unique_violation.
  BEGIN
    INSERT INTO public.stays (
      hotel_id, arrival_date, departure_date, room_label, booking_ref, status
    ) VALUES (
      v_hotel_id,
      p_arrival_date,
      p_departure_date,
      NULLIF(p_room_label, ''),
      NULLIF(p_booking_ref, ''),
      'pending'
    )
    RETURNING id INTO v_stay_id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'duplicate_booking';
  END;

  v_expires_at := now() + make_interval(hours => p_expires_hours);

  -- URL-safe token: {hotel-slug}-arrivo-{8 hex chars}, e.g.
  -- bella-vista-arrivo-3fa91c20. Regenerate on unique_violation (token column
  -- is UNIQUE) until a free token is found, then give up loudly.
  LOOP
    v_attempts := v_attempts + 1;
    v_token := v_hotel_slug || '-arrivo-'
               || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

    BEGIN
      INSERT INTO public.checkin_sessions (
        stay_id, hotel_id, token, status, expires_at
      ) VALUES (
        v_stay_id, v_hotel_id, v_token, 'pending', v_expires_at
      )
      RETURNING id INTO v_session_id;
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        IF v_attempts >= v_max_attempts THEN
          RAISE EXCEPTION 'token_collision';
        END IF;
    END;
  END LOOP;

  INSERT INTO public.audit_logs (
    hotel_id, actor_id, action, entity_type, entity_id, metadata
  ) VALUES (
    v_hotel_id,
    auth.uid(),
    'session_created',
    'checkin_sessions',
    v_session_id,
    jsonb_build_object(
      'booking_ref',   NULLIF(p_booking_ref, ''),
      'room_label',    NULLIF(p_room_label, ''),
      'expires_hours', p_expires_hours
    )
  );

  RETURN jsonb_build_object(
    'ok',         true,
    'stay_id',    v_stay_id,
    'session_id', v_session_id,
    'token',      v_token,
    'expires_at', v_expires_at,
    -- Path convention of the app: /{locale}/c/{token}; the hotel's default
    -- locale is the best available signal here (guest links open there).
    'link_path',  '/' || COALESCE(v_hotel_locale, 'it') || '/c/' || v_token
  );
END;
$$;

-- Staff-only: the guest RPCs rely on default PUBLIC EXECUTE; this one must
-- NOT be callable by anon. Revoke from PUBLIC (which covers anon) and then
-- explicitly from anon, before granting to authenticated only.
REVOKE EXECUTE ON FUNCTION public.create_checkin_session(DATE, DATE, TEXT, TEXT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_checkin_session(DATE, DATE, TEXT, TEXT, INT) FROM anon;
GRANT  EXECUTE ON FUNCTION public.create_checkin_session(DATE, DATE, TEXT, TEXT, INT) TO authenticated;

-- ============================================================================
-- 2. Partial UNIQUE index — one stay per booking per hotel
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS stays_hotel_booking_ref_unique
  ON stays (hotel_id, booking_ref)
  WHERE booking_ref IS NOT NULL;
