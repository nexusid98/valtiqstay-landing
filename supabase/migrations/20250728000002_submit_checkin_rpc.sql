-- ============================================================================
-- ValtiqStay — M2: Guest check-in RPCs
-- ----------------------------------------------------------------------------
-- Adds the security-definer RPCs the anonymous guest flow needs:
--   • get_stay_by_session_token  (FIXED from M1: unqualified table references
--     did not resolve with SET search_path = '' — all relations are now
--     schema-qualified; also returns already_submitted for completed sessions)
--   • start_checkin_session      (anon marks a session in_progress)
--   • get_hotel_upsells          (active upsell items for the stay's hotel)
--   • submit_checkin_session     (atomic full submission)
--
-- All functions are SECURITY DEFINER with SET search_path = '' and fully
-- qualified relation names. EXECUTE is granted to PUBLIC by default, which is
-- what the anon client needs to call them.
-- ============================================================================

-- ============================================================================
-- 1. FIX get_stay_by_session_token (M1) — qualify all relation names
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_stay_by_session_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay_id   UUID;
  v_hotel_id  UUID;
  v_status    TEXT;
  v_expires_at TIMESTAMPTZ;
  v_result    JSONB;
BEGIN
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

  IF v_status = 'submitted' THEN
    RETURN jsonb_build_object('error', 'already_submitted');
  END IF;

  SELECT jsonb_build_object(
    'stay',   row_to_json(s.*),
    'hotel',  row_to_json(h.*),
    'guests', (SELECT jsonb_agg(row_to_json(g.*))
               FROM public.guests g
               WHERE g.stay_id = v_stay_id)
  )
  INTO v_result
  FROM public.stays s
  JOIN public.hotels h ON h.id = s.hotel_id
  WHERE s.id = v_stay_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 2. start_checkin_session — anon marks a session in_progress on stepper entry
-- ============================================================================
CREATE OR REPLACE FUNCTION public.start_checkin_session(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay_id  UUID;
  v_status   TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT stay_id, status, expires_at
  INTO v_stay_id, v_status, v_expires_at
  FROM public.checkin_sessions
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_token');
  END IF;

  IF v_status = 'expired' OR v_expires_at < now() THEN
    RETURN jsonb_build_object('error', 'expired_token');
  END IF;

  IF v_status = 'submitted' THEN
    RETURN jsonb_build_object('error', 'already_submitted');
  END IF;

  IF v_status = 'pending' THEN
    UPDATE public.checkin_sessions
    SET status = 'in_progress'
    WHERE token = p_token;
  END IF;

  RETURN jsonb_build_object('ok', true, 'status', 'in_progress');
END;
$$;

-- ============================================================================
-- 3. get_hotel_upsells — active upsell items for the stay's hotel
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_hotel_upsells(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay_id   UUID;
  v_hotel_id  UUID;
  v_status    TEXT;
  v_expires_at TIMESTAMPTZ;
  v_items     JSONB;
BEGIN
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

  SELECT jsonb_agg(row_to_json(i.*))
  INTO v_items
  FROM public.upsell_items i
  WHERE i.hotel_id = v_hotel_id
    AND i.active = true
  ORDER BY i.display_order ASC, i.created_at ASC;

  RETURN jsonb_build_object(
    'hotel_id', v_hotel_id,
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

-- ============================================================================
-- 4. submit_checkin_session — atomic full submission
-- ----------------------------------------------------------------------------
-- p_guests    JSONB: [{id?, first_name, last_name, birth_date, birth_place,
--                      nationality, is_lead, doc_type, doc_number,
--                      doc_issuing_country, doc_expiry_date}]
--              Existing ids are only honoured if they belong to the stay;
--              otherwise a new guest row is inserted.
-- p_documents JSONB: [{guest_index, storage_path, doc_type, issuing_country,
--                      doc_number, expiry_date}]
--              guest_index refers to the position of the guest inside
--              p_guests (0-based). storage_path must start with
--              '{hotel_id}/' — anything else is dropped.
-- p_upsells   JSONB: [{item_id, quantity}] — items are validated against the
--              stay's hotel (tenant isolation).
-- p_consent   JSONB: {granted, purpose, text_shown, ip_address, user_agent}
--              attached to the lead guest. Optional.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_checkin_session(
  p_token     TEXT,
  p_guests    JSONB,
  p_documents JSONB,
  p_upsells   JSONB,
  p_consent   JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stay_id     UUID;
  v_hotel_id    UUID;
  v_session_id  UUID;
  v_status      TEXT;
  v_expires_at  TIMESTAMPTZ;

  v_guest       JSONB;
  v_guest_id    UUID;
  v_lead_id     UUID;
  v_guest_ids   UUID[] := '{}';
  v_idx         INT := 0;
  v_guest_count INT := 0;

  v_doc         JSONB;
  v_doc_idx     INT;
  v_doc_count   INT := 0;

  v_upsell      JSONB;
  v_upsell_qty  INT;
  v_upsell_count INT := 0;

  v_consent_granted BOOLEAN;
  v_consent_purpose TEXT;
  v_consent_text    TEXT;
  v_ip              TEXT;
  v_ua              TEXT;
BEGIN
  SELECT id, stay_id, hotel_id, status, expires_at
  INTO v_session_id, v_stay_id, v_hotel_id, v_status, v_expires_at
  FROM public.checkin_sessions
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invalid_token');
  END IF;

  IF v_status = 'expired' OR v_expires_at < now() THEN
    RETURN jsonb_build_object('error', 'expired_token');
  END IF;

  IF v_status = 'submitted' THEN
    RETURN jsonb_build_object('error', 'already_submitted');
  END IF;

  IF COALESCE(p_guests, '[]'::jsonb) = '[]'::jsonb THEN
    RETURN jsonb_build_object('error', 'no_guests');
  END IF;

  -- ---------------------------------------------------------------- guests --
  FOR v_guest IN SELECT * FROM jsonb_array_elements(COALESCE(p_guests, '[]'::jsonb)) LOOP
    v_guest_id := NULLIF(v_guest->>'id', '')::uuid;

    IF v_guest_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM public.guests g
                   WHERE g.id = v_guest_id AND g.stay_id = v_stay_id) THEN
      UPDATE public.guests g SET
        first_name          = COALESCE(NULLIF(v_guest->>'first_name', ''), g.first_name),
        last_name           = COALESCE(NULLIF(v_guest->>'last_name', ''), g.last_name),
        birth_date          = COALESCE(NULLIF(v_guest->>'birth_date', '')::date, g.birth_date),
        birth_place         = COALESCE(NULLIF(v_guest->>'birth_place', ''), g.birth_place),
        nationality         = COALESCE(NULLIF(v_guest->>'nationality', ''), g.nationality),
        doc_type            = COALESCE(NULLIF(v_guest->>'doc_type', ''), g.doc_type),
        doc_number          = COALESCE(NULLIF(v_guest->>'doc_number', ''), g.doc_number),
        doc_issuing_country = COALESCE(NULLIF(v_guest->>'doc_issuing_country', ''), g.doc_issuing_country),
        doc_expiry_date     = COALESCE(NULLIF(v_guest->>'doc_expiry_date', '')::date, g.doc_expiry_date)
      WHERE g.id = v_guest_id;
    ELSE
      INSERT INTO public.guests (
        stay_id, hotel_id, is_lead,
        first_name, last_name, birth_date, birth_place, nationality,
        doc_type, doc_number, doc_issuing_country, doc_expiry_date
      ) VALUES (
        v_stay_id, v_hotel_id, COALESCE((v_guest->>'is_lead')::boolean, false),
        NULLIF(v_guest->>'first_name', ''),
        NULLIF(v_guest->>'last_name', ''),
        NULLIF(v_guest->>'birth_date', '')::date,
        NULLIF(v_guest->>'birth_place', ''),
        NULLIF(v_guest->>'nationality', ''),
        NULLIF(v_guest->>'doc_type', ''),
        NULLIF(v_guest->>'doc_number', ''),
        NULLIF(v_guest->>'doc_issuing_country', ''),
        NULLIF(v_guest->>'doc_expiry_date', '')::date
      )
      RETURNING g.id INTO v_guest_id;
    END IF;

    IF COALESCE((v_guest->>'is_lead')::boolean, false) AND v_lead_id IS NULL THEN
      v_lead_id := v_guest_id;
    END IF;

    v_guest_ids := array_append(v_guest_ids, v_guest_id);
    v_guest_count := v_guest_count + 1;
  END LOOP;

  -- ------------------------------------------------------------ documents --
  FOR v_doc IN SELECT * FROM jsonb_array_elements(COALESCE(p_documents, '[]'::jsonb)) LOOP
    -- guest_index must be in range and storage_path must live under the hotel
    v_doc_idx := (v_doc->>'guest_index')::int;
    IF v_doc_idx IS NULL OR v_doc_idx < 0 OR v_doc_idx >= array_length(v_guest_ids, 1) THEN
      CONTINUE;
    END IF;
    IF NULLIF(v_doc->>'storage_path', '') IS NULL
       OR v_doc->>'storage_path' NOT LIKE v_hotel_id::text || '/%' THEN
      CONTINUE;
    END IF;

    INSERT INTO public.documents (
      guest_id, hotel_id, storage_path,
      doc_type, issuing_country, doc_number, expiry_date
    ) VALUES (
      v_guest_ids[v_doc_idx + 1],
      v_hotel_id,
      v_doc->>'storage_path',
      NULLIF(v_doc->>'doc_type', ''),
      NULLIF(v_doc->>'issuing_country', ''),
      NULLIF(v_doc->>'doc_number', ''),
      NULLIF(v_doc->>'expiry_date', '')::date
    );

    v_doc_count := v_doc_count + 1;
  END LOOP;

  -- -------------------------------------------------------------- upsells --
  FOR v_upsell IN SELECT * FROM jsonb_array_elements(COALESCE(p_upsells, '[]'::jsonb)) LOOP
    v_upsell_qty := COALESCE((v_upsell->>'quantity')::int, 1);
    IF v_upsell_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Only insert if the item actually belongs to this hotel (tenant isolation)
    INSERT INTO public.upsell_requests (stay_id, hotel_id, item_id, quantity, status)
    SELECT v_stay_id, v_hotel_id, i.id, v_upsell_qty, 'requested'
    FROM public.upsell_items i
    WHERE i.id = NULLIF(v_upsell->>'item_id', '')::uuid
      AND i.hotel_id = v_hotel_id;

    IF FOUND THEN
      v_upsell_count := v_upsell_count + 1;
    END IF;
  END LOOP;

  -- -------------------------------------------------------------- consent --
  IF v_lead_id IS NOT NULL THEN
    v_consent_granted := COALESCE((p_consent->>'granted')::boolean, false);
    v_consent_purpose := COALESCE(NULLIF(p_consent->>'purpose', ''), 'marketing');
    v_consent_text    := p_consent->>'text_shown';
    v_ip              := NULLIF(p_consent->>'ip_address', '');
    v_ua              := NULLIF(p_consent->>'user_agent', '');

    INSERT INTO public.consents (
      guest_id, hotel_id, purpose, granted, text_shown, ip_address, user_agent
    ) VALUES (
      v_lead_id, v_hotel_id,
      v_consent_purpose, v_consent_granted, v_consent_text, v_ip, v_ua
    );
  END IF;

  -- ----------------------------------------------------------------- audit --
  INSERT INTO public.audit_logs (
    hotel_id, action, entity_type, entity_id, metadata
  ) VALUES (
    v_hotel_id, 'checkin_submitted', 'checkin_session', v_session_id,
    jsonb_build_object(
      'guest_count',   v_guest_count,
      'document_count', v_doc_count,
      'upsell_count',  v_upsell_count,
      'consent_granted', COALESCE((p_consent->>'granted')::boolean, false)
    )
  );

  -- ------------------------------------------------------- finalize session --
  UPDATE public.checkin_sessions
  SET status = 'submitted', submitted_at = now()
  WHERE id = v_session_id;

  RETURN jsonb_build_object(
    'ok', true,
    'stay_id', v_stay_id,
    'guest_count',   v_guest_count,
    'document_count', v_doc_count,
    'upsell_count',  v_upsell_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', 'invalid_data', 'message', SQLERRM);
END;
$$;
