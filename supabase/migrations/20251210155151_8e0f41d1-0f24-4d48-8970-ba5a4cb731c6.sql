-- Allow authenticated users to create their own organization (for self-service onboarding)
CREATE POLICY "Users can create their own organization"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to create their own initial membership when creating an org
CREATE POLICY "Users can create their own membership"
ON public.organization_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own membership (needed to check if they have an org)
CREATE POLICY "Users can view their own membership"
ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id);