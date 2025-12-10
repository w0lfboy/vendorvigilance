import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';

export function OrganizationSettings() {
  const { organization, isOwner, updateOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSlug(organization.slug);
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization.mutateAsync({ name, slug });
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
      <CardContent>
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
