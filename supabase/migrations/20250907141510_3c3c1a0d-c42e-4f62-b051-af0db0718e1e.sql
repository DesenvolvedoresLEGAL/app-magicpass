-- Harden access to user data: ensure only authenticated org members can read

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Revoke direct table reads from anon role as a defense-in-depth measure
REVOKE SELECT ON TABLE public.users FROM anon;
REVOKE SELECT ON TABLE public.user_roles FROM anon;

-- USERS table: restrict SELECT to authenticated users within same org
DROP POLICY IF EXISTS "Users can view users from their organization" ON public.users;
CREATE POLICY "Users can view users from their organization"
ON public.users
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization(auth.uid()));

-- USER_ROLES table: restrict SELECT to authenticated users within same org
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization(auth.uid()));

-- USER_ROLES table: restrict ALL mutations to org admins only (explicit WITH CHECK)
DROP POLICY IF EXISTS "Admins can manage roles in their organization" ON public.user_roles;
CREATE POLICY "Admins can manage roles in their organization"
ON public.user_roles
FOR ALL
TO authenticated
USING ((organization_id = get_user_organization(auth.uid())) AND has_role(auth.uid(), 'legal_admin'))
WITH CHECK ((organization_id = get_user_organization(auth.uid())) AND has_role(auth.uid(), 'legal_admin'));
