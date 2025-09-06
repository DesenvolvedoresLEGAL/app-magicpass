-- Phase 1: Critical Data Protection Security Fixes

-- 1. Remove existing broad public access to events table
DROP POLICY IF EXISTS "Public can view active events for registration" ON public.events;

-- 2. Create restricted public access policy for events (only essential registration data)
CREATE POLICY "Public can view limited event data for registration" 
ON public.events 
FOR SELECT 
USING (
  status = 'active' AND
  start_date > now() -- Only show future events
);

-- 3. Create a public view with only safe event data for registration
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
  allow_reentry
FROM public.events 
WHERE status = 'active' AND start_date > now();

-- 4. Enable RLS on the public view (inherits from base table)
ALTER VIEW public.public_events SET (security_invoker = on);

-- 5. Create rate limiting for participant registrations
CREATE TABLE IF NOT EXISTS public.registration_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  event_id uuid NOT NULL,
  registration_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;

-- System can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.registration_rate_limits 
FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Create function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_registration_rate_limit(
  p_ip_address inet,
  p_event_id uuid,
  p_max_registrations integer DEFAULT 5,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Calculate window start time
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM registration_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Get current count for this IP and event in the time window
  SELECT COALESCE(SUM(registration_count), 0)
  INTO current_count
  FROM registration_rate_limits
  WHERE ip_address = p_ip_address 
    AND event_id = p_event_id
    AND window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= p_max_registrations THEN
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO registration_rate_limits (ip_address, event_id, registration_count, window_start)
  VALUES (p_ip_address, p_event_id, 1, now())
  ON CONFLICT (ip_address, event_id) 
  DO UPDATE SET 
    registration_count = registration_rate_limits.registration_count + 1,
    window_start = CASE 
      WHEN registration_rate_limits.window_start < window_start_time 
      THEN now() 
      ELSE registration_rate_limits.window_start 
    END;
  
  RETURN true;
END;
$$;

-- 7. Create validation function for participant data
CREATE OR REPLACE FUNCTION public.validate_participant_data(
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_document text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Basic validation checks
  
  -- Name validation (2-100 chars, no special chars except spaces, hyphens, apostrophes)
  IF p_name IS NULL OR 
     length(trim(p_name)) < 2 OR 
     length(trim(p_name)) > 100 OR
     p_name !~ '^[a-zA-ZÀ-ÿ\s\-''\.]+$' THEN
    RETURN false;
  END IF;
  
  -- Email validation (basic format check)
  IF p_email IS NULL OR 
     p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR
     length(p_email) > 255 THEN
    RETURN false;
  END IF;
  
  -- Phone validation (if provided)
  IF p_phone IS NOT NULL AND (
     length(p_phone) < 10 OR 
     length(p_phone) > 20 OR
     p_phone !~ '^[0-9+\-\s\(\)]+$'
  ) THEN
    RETURN false;
  END IF;
  
  -- Document validation (if provided) - basic length check
  IF p_document IS NOT NULL AND (
     length(p_document) < 8 OR 
     length(p_document) > 20
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 8. Create trigger to validate participant registrations
CREATE OR REPLACE FUNCTION public.validate_participant_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate participant data
  IF NOT validate_participant_data(NEW.name, NEW.email, NEW.phone, NEW.document) THEN
    RAISE EXCEPTION 'Invalid participant data provided';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_participant_trigger ON public.participants;
CREATE TRIGGER validate_participant_trigger
  BEFORE INSERT ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION validate_participant_registration();

-- 9. Update participants table RLS policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;

-- New policy that allows public inserts but with validation
CREATE POLICY "Validated public participant registration" 
ON public.participants 
FOR INSERT 
WITH CHECK (
  -- Event must be active and in the future
  event_id IN (
    SELECT id FROM public.events 
    WHERE status = 'active' AND start_date > now()
  )
);