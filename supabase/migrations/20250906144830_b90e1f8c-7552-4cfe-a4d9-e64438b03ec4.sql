-- Follow-up fixes: unique index, view update, and email rate limiting

-- 1) Fix missing unique index for registration_rate_limits upsert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'uniq_registration_rate_limits_ip_event') THEN
    CREATE UNIQUE INDEX uniq_registration_rate_limits_ip_event
      ON public.registration_rate_limits (ip_address, event_id);
  END IF;
END $$;

-- 2) Strengthen participant validation with email-based rate limiting (5 per hour per event)
CREATE OR REPLACE FUNCTION public.validate_participant_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Validate participant data
  IF NOT validate_participant_data(NEW.name, NEW.email, NEW.phone, NEW.document) THEN
    RAISE EXCEPTION 'Invalid participant data provided';
  END IF;

  -- Email-based rate limit: max 5 registrations per email per event per hour
  SELECT COUNT(*) INTO recent_count
  FROM public.participants p
  WHERE p.event_id = NEW.event_id
    AND p.email = NEW.email
    AND p.registered_at >= now() - interval '60 minutes';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many registrations for this email in the last hour';
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Update the public view to include qr_prefix used by the public registration page
CREATE OR REPLACE VIEW public.public_events AS
SELECT 
  id,
  name,
  description,
  location,
  start_date,
  end_date,
  status,
  lgpd_text,
  registration_fields,
  ticket_categories,
  capacity,
  allow_reentry,
  qr_prefix
FROM public.events 
WHERE status = 'active' AND start_date > now();

ALTER VIEW public.public_events SET (security_invoker = on);
