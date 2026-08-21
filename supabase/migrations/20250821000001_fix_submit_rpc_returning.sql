-- ============================================================================
-- ValtiqStay — M2 fix (migration 06): submit_checkin_session new-guest INSERT
-- ----------------------------------------------------------------------------
-- BUG: In migration 02 (20250728000002_submit_checkin_rpc.sql) the INSERT branch
-- of submit_checkin_session ended with
--     RETURNING g.id INTO v_guest_id;
-- but the alias `g` is only defined on the UPDATE branch and the EXISTS
-- re-verify subquery, NOT on the INSERT statement. Every submission with a NEW
-- guest (id NULL) made PostgreSQL throw
--     missing FROM-clause entry for table "g"
-- at runtime. The RPC's WHEN OTHERS handler swallowed that into
-- {"error":"invalid_data","message":"missing FROM-clause entry for table \"g\""},
-- so the guest saw "Invio non riuscito. Controlla i dati e riprova." and the
-- session stayed in_progress with no guest/document/upsell/consent rows created.
-- The existing-guest UPDATE path used the same alias correctly and worked.
--
-- FIX: the INSERT's RETURNING must reference the bare inserted column, not an
-- alias. Change ONLY that one line:  `RETURNING g.id INTO v_guest_id;`  ->
--                                     `RETURNING id INTO v_guest_id;`
-- The rest of the function body is copied verbatim from migration 02.
--
-- RE-RUNNABLE: CREATE OR REPLACE FUNCTION is idempotent — applying this file a
-- second time is a clean no-op (double-run verified, see PR).
--
-- SECURITY: EXECUTE stays on PUBLIC (default) exactly as migration 02 left it.
-- Unlike staff-only RPCs (migration 04, which REVOKEs from anon), this guest
-- RPC is invoked by the anonymous guest flow with the anon key (see
-- src/lib/checkin/api.ts submitCheckin -> createBrowserClient + ANON key), so it
-- MUST remain callable by anon. Migration 05 documents the same: the guest-flow
-- RPCs are SECURITY DEFINER and callable by anon. An explicit
-- REVOKE ... FROM anon here would break the guest check-in that this fix
-- restores — deliberately NOT applied.
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
      RETURNING id INTO v_guest_id;
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
