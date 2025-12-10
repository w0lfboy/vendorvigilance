import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Loader2, Upload, X } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function OrganizationSettings() {
  const { organization, isOwner, updateOrganization } = useOrganization();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSlug(organization.slug);
      setLogoUrl(organization.logo_url);
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization.mutateAsync({ name, slug });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${organization.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      // Add cache buster to URL
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update organization with logo URL
      await updateOrganization.mutateAsync({ logo_url: urlWithCacheBuster });
      setLogoUrl(urlWithCacheBuster);
      
      toast({ title: 'Logo uploaded', description: 'Your organization logo has been updated.' });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!organization) return;

    setIsUploading(true);
    try {
      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('organization-logos')
        .remove([`${organization.id}/logo.png`, `${organization.id}/logo.jpg`, `${organization.id}/logo.jpeg`, `${organization.id}/logo.webp`]);

      if (deleteError) console.warn('Could not delete logo files:', deleteError);

      // Update organization
      await updateOrganization.mutateAsync({ logo_url: null });
      setLogoUrl(null);
      
      toast({ title: 'Logo removed', description: 'Your organization logo has been removed.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No organization found. Please contact support.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Details
        </CardTitle>
        <CardDescription>
          {isOwner 
            ? 'Update your organization information'
            : 'View your organization information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload Section */}
        <div className="space-y-3">
          <Label>Organization Logo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={logoUrl || undefined} alt={organization.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {organization.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isOwner && (
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Logo
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    disabled={isUploading}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or WebP. Max 2MB.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Organization Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              placeholder="Your Company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Organization Slug</Label>
            <Input
              id="org-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              disabled={!isOwner}
              placeholder="your-company"
            />
            <p className="text-xs text-muted-foreground">
              Used for unique identification. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>
          {isOwner && (
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              disabled={updateOrganization.isPending}
            >
              {updateOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
