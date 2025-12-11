-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_active_org_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = _user_id
      AND status = 'active'
  )
$$;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Members can view org members" ON public.organization_members;

-- Recreate policy without self-reference - users can see members of orgs they belong to
CREATE POLICY "Members can view org members" ON public.organization_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  is_org_admin(organization_id, auth.uid()) OR
  is_org_owner(organization_id, auth.uid())
);