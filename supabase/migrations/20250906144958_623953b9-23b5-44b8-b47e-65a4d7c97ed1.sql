-- Phase 1: Critical Data Protection Security Fixes (Clean approach)

-- 1. Just update the events policy to be more restrictive (only show future active events)
DROP POLICY IF EXISTS "Public can view active events for registration" ON public.events;
CREATE POLICY "Public can view active events for registration" 
ON public.events 
FOR SELECT 
USING (status = 'active' AND start_date > now());

-- 2. Create rate limiting table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registration_rate_limits') THEN
    CREATE TABLE public.registration_rate_limits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ip_address inet NOT NULL,
      event_id uuid NOT NULL,
      registration_count integer DEFAULT 1,
      window_start timestamp with time zone DEFAULT now(),
      created_at timestamp with time zone DEFAULT now(),
      UNIQUE(ip_address, event_id)
    );
    
    ALTER TABLE public.registration_rate_limits ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "System can manage rate limits" 
    ON public.registration_rate_limits 
    FOR ALL 
    USING (auth.role() = 'service_role');
  END IF;
END $$;

-- 3. Create validation functions
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
  -- Name validation (2-100 chars, letters, spaces, hyphens, apostrophes, dots)
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
  
  -- Document validation (if provided)
  IF p_document IS NOT NULL AND (
     length(p_document) < 8 OR 
     length(p_document) > 20
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 4. Create validation trigger
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

-- Apply trigger if it doesn't exist
DROP TRIGGER IF EXISTS validate_participant_trigger ON public.participants;
CREATE TRIGGER validate_participant_trigger
  BEFORE INSERT ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION validate_participant_registration();

-- 5. Update participant registration policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;
DROP POLICY IF EXISTS "Validated public participant registration" ON public.participants;

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