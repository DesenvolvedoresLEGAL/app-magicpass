-- Phase 2: Create example organization and admin user for testing
-- This will help break the authentication loop by providing a proper user profile

-- Create an example organization
INSERT INTO public.organizations (id, name, slug, primary_color, secondary_color, logo_url)
VALUES (
  'a0b1c2d3-e4f5-6789-abcd-123456789012',
  'Organização de Exemplo',
  'exemplo',
  '#3b82f6',
  '#1e40af',
  null
)
ON CONFLICT (id) DO NOTHING;

-- Get the current authenticated user's ID (this will be replaced by the actual auth user)
-- We'll create a user record for the currently authenticated user

-- First, let's create a function to help with user setup during onboarding
CREATE OR REPLACE FUNCTION public.setup_user_profile(
  user_email text,
  user_name text,
  user_role text DEFAULT 'client_admin',
  org_id uuid DEFAULT 'a0b1c2d3-e4f5-6789-abcd-123456789012'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_auth_user_id uuid;
  new_user_id uuid;
BEGIN
  -- Find the auth user by email
  SELECT id INTO target_auth_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  IF target_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found with email: %', user_email;
  END IF;
  
  -- Insert or update user profile
  INSERT INTO public.users (auth_user_id, email, name, role, organization_id, active)
  VALUES (target_auth_user_id, user_email, user_name, user_role, org_id, true)
  ON CONFLICT (auth_user_id) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id,
    active = EXCLUDED.active,
    updated_at = now()
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;