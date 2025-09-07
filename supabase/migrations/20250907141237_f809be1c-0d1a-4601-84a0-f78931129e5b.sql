-- 1) Remove public INSERT policy that allowed anonymous inserts
DROP POLICY IF EXISTS "Validated public participant registration" ON public.participants;

-- 2) Attach server-side validation trigger for all inserts
DROP TRIGGER IF EXISTS validate_participant_before_insert ON public.participants;
CREATE TRIGGER validate_participant_before_insert
BEFORE INSERT ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.validate_participant_registration();

-- 3) Secure RPC to perform validated registration server-side
CREATE OR REPLACE FUNCTION public.register_participant(
  p_event_id uuid,
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_document text DEFAULT NULL,
  p_ticket_category text DEFAULT NULL,
  p_registration_data jsonb DEFAULT '{}'::jsonb,
  p_photo_url text DEFAULT NULL,
  p_lgpd_consent boolean DEFAULT false
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_qr_prefix text;
  v_code text;
  v_qr_code text;
BEGIN
  -- Ensure event is active and not started yet
  SELECT id, qr_prefix INTO v_event
  FROM events
  WHERE id = p_event_id AND status = 'active' AND start_date > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration closed or event not available';
  END IF;

  -- Validate participant data
  IF NOT public.validate_participant_data(p_name, p_email, p_phone, p_document) THEN
    RAISE EXCEPTION 'Invalid participant data provided';
  END IF;

  -- Generate QR code server-side (10 hex chars with optional event prefix)
  v_qr_prefix := COALESCE(v_event.qr_prefix, 'MP');
  v_code := upper(encode(gen_random_bytes(5), 'hex')); -- 10 hex chars
  v_qr_code := v_qr_prefix || '-' || v_code;

  -- Optional: prevent duplicate registration by email for the same event
  IF EXISTS (
    SELECT 1 FROM participants 
    WHERE event_id = p_event_id AND lower(email) = lower(p_email)
  ) THEN
    RAISE EXCEPTION 'A registration with this email already exists for this event';
  END IF;

  INSERT INTO participants (
    event_id, name, email, phone, document, ticket_category,
    registration_data, qr_code, photo_url, lgpd_consent, lgpd_consent_date, status
  ) VALUES (
    p_event_id, trim(p_name), lower(trim(p_email)), NULLIF(trim(p_phone), ''),
    NULLIF(trim(p_document), ''), p_ticket_category, COALESCE(p_registration_data, '{}'::jsonb),
    v_qr_code, p_photo_url, COALESCE(p_lgpd_consent, false), 
    CASE WHEN p_lgpd_consent THEN now() ELSE NULL END, 'registered'
  );

  RETURN v_qr_code;
END;
$$;

-- Tighten function execution permissions
REVOKE ALL ON FUNCTION public.register_participant(uuid, text, text, text, text, text, jsonb, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_participant(uuid, text, text, text, text, text, jsonb, text, boolean) TO anon, authenticated;