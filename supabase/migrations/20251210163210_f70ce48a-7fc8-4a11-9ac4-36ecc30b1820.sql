-- Add logo_url column to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their org logos
CREATE POLICY "Users can upload their org logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT o.id::text FROM public.organizations o
    JOIN public.organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.status = 'active'
    LIMIT 1
  )
);

-- Allow authenticated users to update their org logos
CREATE POLICY "Users can update their org logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT o.id::text FROM public.organizations o
    JOIN public.organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.status = 'active'
    LIMIT 1
  )
);

-- Allow authenticated users to delete their org logos
CREATE POLICY "Users can delete their org logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT o.id::text FROM public.organizations o
    JOIN public.organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.status = 'active'
    LIMIT 1
  )
);

-- Allow public read access to org logos
CREATE POLICY "Anyone can view org logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');