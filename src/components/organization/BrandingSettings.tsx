import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Palette, Globe, Mail, Image, MessageSquare, ExternalLink } from 'lucide-react';
import type { OrganizationBranding } from '@/hooks/useSubdomainBranding';
import type { Json } from '@/integrations/supabase/types';

export function BrandingSettings() {
  const { organization, membership, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [branding, setBranding] = useState<OrganizationBranding>({
    logo_url: '',
    primary_color: '',
    accent_color: '',
    company_name: '',
    support_email: '',
    welcome_message: ''
  });

  const isOwner = membership?.role === 'owner';

  useEffect(() => {
    if (organization) {
      setSubdomain((organization as any).subdomain || '');
      const orgBranding = (organization as any).branding as OrganizationBranding;
      if (orgBranding) {
        setBranding({
          logo_url: orgBranding.logo_url || '',
          primary_color: orgBranding.primary_color || '',
          accent_color: orgBranding.accent_color || '',
          company_name: orgBranding.company_name || organization.name,
          support_email: orgBranding.support_email || '',
          welcome_message: orgBranding.welcome_message || ''
        });
      } else {
        setBranding(prev => ({
          ...prev,
          company_name: organization.name
        }));
      }
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization || !isOwner) return;

    setIsLoading(true);
    try {
      // Validate subdomain format
      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      if (subdomain && cleanSubdomain !== subdomain) {
        toast({
          title: 'Invalid subdomain',
          description: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          subdomain: cleanSubdomain || null,
          branding: branding as unknown as Json
        })
        .eq('id', organization.id);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Subdomain taken',
            description: 'This subdomain is already in use by another organization',
            variant: 'destructive'
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Branding updated',
        description: 'Your organization branding has been saved'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update branding',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No organization found
        </CardContent>
      </Card>
    );
  }

  const subdomainUrl = subdomain ? `https://${subdomain}.vendorvigilance.io` : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding & White-Label Settings
        </CardTitle>
        <CardDescription>
          Customize how your vendor portal appears to third parties. Vendors will see your branding when completing assessments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subdomain */}
        <div className="space-y-2">
          <Label htmlFor="subdomain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Custom Subdomain
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              placeholder="yourcompany"
              disabled={!isOwner || isLoading}
              className="max-w-xs"
            />
            <span className="text-muted-foreground">.vendorvigilance.io</span>
          </div>
          {subdomainUrl && (
            <a 
              href={subdomainUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {subdomainUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <p className="text-sm text-muted-foreground">
            Your vendors will access assessments via this URL
          </p>
        </div>

        {/* Company Display Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Display Name</Label>
          <Input
            id="company_name"
            value={branding.company_name || ''}
            onChange={(e) => setBranding(prev => ({ ...prev, company_name: e.target.value }))}
            placeholder="Your Company Name"
            disabled={!isOwner || isLoading}
          />
          <p className="text-sm text-muted-foreground">
            The name shown to vendors on your portal
          </p>
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label htmlFor="logo_url" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo URL
          </Label>
          <Input
            id="logo_url"
            value={branding.logo_url || ''}
            onChange={(e) => setBranding(prev => ({ ...prev, logo_url: e.target.value }))}
            placeholder="https://yourcompany.com/logo.png"
            disabled={!isOwner || isLoading}
          />
          {branding.logo_url && (
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img 
                src={branding.logo_url} 
                alt="Logo preview" 
                className="max-h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color (HSL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary_color"
                value={branding.primary_color || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                placeholder="222 47% 11%"
                disabled={!isOwner || isLoading}
              />
              {branding.primary_color && (
                <div 
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: `hsl(${branding.primary_color})` }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Format: hue saturation% lightness% (e.g., 222 47% 11%)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accent_color">Accent Color (HSL)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent_color"
                value={branding.accent_color || ''}
                onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                placeholder="210 40% 98%"
                disabled={!isOwner || isLoading}
              />
              {branding.accent_color && (
                <div 
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: `hsl(${branding.accent_color})` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Support Email */}
        <div className="space-y-2">
          <Label htmlFor="support_email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Support Email
          </Label>
          <Input
            id="support_email"
            type="email"
            value={branding.support_email || ''}
            onChange={(e) => setBranding(prev => ({ ...prev, support_email: e.target.value }))}
            placeholder="support@yourcompany.com"
            disabled={!isOwner || isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Displayed to vendors if they need help
          </p>
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <Label htmlFor="welcome_message" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Welcome Message
          </Label>
          <Textarea
            id="welcome_message"
            value={branding.welcome_message || ''}
            onChange={(e) => setBranding(prev => ({ ...prev, welcome_message: e.target.value }))}
            placeholder="Welcome to our vendor security assessment portal. Please complete the following questionnaire..."
            disabled={!isOwner || isLoading}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Custom message shown to vendors when they access your portal
          </p>
        </div>

        {/* Save Button */}
        {isOwner && (
          <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Branding Settings
          </Button>
        )}

        {!isOwner && (
          <p className="text-sm text-muted-foreground italic">
            Only organization owners can modify branding settings
          </p>
        )}
      </CardContent>
    </Card>
  );
}
