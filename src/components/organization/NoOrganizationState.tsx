import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Clock, Plus, ArrowRight } from 'lucide-react';
import { usePendingInvitations, useAcceptInvitation } from '@/hooks/useOrganization';
import { useCreateOrganization } from '@/hooks/useCreateOrganization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function NoOrganizationState() {
  const { data: invitations, isLoading } = usePendingInvitations();
  const acceptInvitation = useAcceptInvitation();
  const createOrganization = useCreateOrganization();
  
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [subdomainEdited, setSubdomainEdited] = useState(false);

  const handleNameChange = (value: string) => {
    setCompanyName(value);
    const generated = generateSlug(value);
    if (!slugEdited) {
      setSlug(generated);
    }
    if (!subdomainEdited) {
      setSubdomain(generated);
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(generateSlug(value));
    setSlugEdited(true);
  };

  const handleSubdomainChange = (value: string) => {
    setSubdomain(generateSlug(value));
    setSubdomainEdited(true);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !slug.trim()) return;
    
    await createOrganization.mutateAsync({ 
      name: companyName.trim(), 
      slug: slug.trim(),
      subdomain: subdomain.trim() || undefined
    });
  };

  const hasInvitations = invitations && invitations.length > 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl">Welcome to VendorVigilance</CardTitle>
          <CardDescription className="text-base">
            Get started by creating your organization or joining an existing one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={hasInvitations ? "join" : "create"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Join Existing
                {hasInvitations && (
                  <span className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {invitations.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">vendorvigilance.app/</span>
                    <Input
                      id="slug"
                      placeholder="acme-corp"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="flex-1"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your unique organization identifier
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Custom Subdomain (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      placeholder="acme"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">.vendorvigilance.io</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your vendors will access assessments via this custom URL
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  disabled={createOrganization.isPending || !companyName.trim() || !slug.trim()}
                >
                  {createOrganization.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Organization
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Checking for invitations...
                </div>
              ) : hasInvitations ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    You have pending invitations to join:
                  </p>
                  {invitations.map((inv) => {
                    const org = inv.organizations as { name: string } | null;
                    return (
                      <div 
                        key={inv.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium">{org?.name || 'Organization'}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {format(new Date(inv.expires_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          onClick={() => acceptInvitation.mutate(inv.id)}
                          disabled={acceptInvitation.isPending}
                        >
                          {acceptInvitation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Join'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No pending invitations</p>
                  <p className="text-sm mt-1">
                    Create a new organization or ask an administrator to invite you.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
