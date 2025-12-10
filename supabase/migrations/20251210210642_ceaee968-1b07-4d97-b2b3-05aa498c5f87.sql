-- Add subdomain and branding columns to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON public.organizations(subdomain);

-- Add RLS policy for public subdomain lookup (for vendor portal)
CREATE POLICY "Anyone can lookup organization by subdomain"
ON public.organizations
FOR SELECT
USING (subdomain IS NOT NULL);

-- Comment for documentation
COMMENT ON COLUMN public.organizations.subdomain IS 'Unique subdomain for multi-tenant access (e.g., "chase" for chase.vendorvigilance.io)';
COMMENT ON COLUMN public.organizations.branding IS 'JSON object containing branding: {logo_url, primary_color, accent_color, company_name, support_email, welcome_message}';