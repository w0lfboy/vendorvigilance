import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationBranding {
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  company_name?: string;
  support_email?: string;
  welcome_message?: string;
}

export interface SubdomainOrganization {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo_url: string | null;
  branding: OrganizationBranding;
}

export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Handle localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain in query param for testing
    const params = new URLSearchParams(window.location.search);
    return params.get('subdomain');
  }
  
  // Handle production subdomains (e.g., chase.vendorvigilance.io)
  const parts = hostname.split('.');
  
  // If we have a subdomain (more than 2 parts for domain.io or 3 for domain.co.uk)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Exclude common non-tenant subdomains
    if (!['www', 'app', 'api', 'admin'].includes(subdomain)) {
      return subdomain;
    }
  }
  
  return null;
}

export function useSubdomainBranding() {
  const [organization, setOrganization] = useState<SubdomainOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const detectedSubdomain = getSubdomain();
    setSubdomain(detectedSubdomain);

    if (!detectedSubdomain) {
      setIsLoading(false);
      return;
    }

    async function fetchOrganization() {
      try {
        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('id, name, slug, subdomain, logo_url, branding')
          .eq('subdomain', detectedSubdomain)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Organization not found');
          } else {
            setError(fetchError.message);
          }
          return;
        }

        setOrganization({
          ...data,
          branding: (data.branding as OrganizationBranding) || {}
        });
      } catch (err) {
        setError('Failed to load organization');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganization();
  }, []);

  // Apply branding CSS variables when organization loads
  useEffect(() => {
    if (!organization?.branding) return;

    const { primary_color, accent_color } = organization.branding;
    const root = document.documentElement;

    if (primary_color) {
      root.style.setProperty('--primary', primary_color);
    }
    if (accent_color) {
      root.style.setProperty('--accent', accent_color);
    }

    // Cleanup on unmount
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
    };
  }, [organization]);

  return {
    organization,
    branding: organization?.branding || {},
    isLoading,
    error,
    subdomain,
    isSubdomainMode: !!subdomain
  };
}
