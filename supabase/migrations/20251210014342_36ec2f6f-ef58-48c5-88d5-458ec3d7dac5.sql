-- Create enum for organization roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create organization invitations table for email invites
CREATE TABLE public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id UUID, _org_id UUID)
RETURNS public.org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id AND organization_id = _org_id AND status = 'active'
$$;

-- Check if user is org admin or owner
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
      AND organization_id = _org_id 
      AND role IN ('owner', 'admin')
      AND status = 'active'
  )
$$;

-- Check if user is org owner
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
      AND organization_id = _org_id 
      AND role = 'owner'
      AND status = 'active'
  )
$$;

-- Get user's current organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members
  WHERE user_id = _user_id AND status = 'active'
  LIMIT 1
$$;

-- RLS Policies for organizations
CREATE POLICY "Members can view their organization"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
  )
);

CREATE POLICY "Owners can update their organization"
ON public.organizations FOR UPDATE
USING (public.is_org_owner(auth.uid(), id));

-- RLS Policies for organization_members
CREATE POLICY "Members can view org members"
ON public.organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
  )
);

CREATE POLICY "Admins can insert org members"
ON public.organization_members FOR INSERT
WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can update org members"
ON public.organization_members FOR UPDATE
USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Owners can delete org members"
ON public.organization_members FOR DELETE
USING (public.is_org_owner(auth.uid(), organization_id));

-- RLS Policies for organization_invitations
CREATE POLICY "Admins can view org invitations"
ON public.organization_invitations FOR SELECT
USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can create invitations"
ON public.organization_invitations FOR INSERT
WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete invitations"
ON public.organization_invitations FOR DELETE
USING (public.is_org_admin(auth.uid(), organization_id));

-- Allow users to view invitations sent to their email (for accepting)
CREATE POLICY "Users can view their own invitations"
ON public.organization_invitations FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add organization_id to existing tables that need tenant isolation
ALTER TABLE public.vendors ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.assessments ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.documents ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.tasks ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.alerts ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.activities ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.issues ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.vendor_assessments ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create updated_at triggers
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();