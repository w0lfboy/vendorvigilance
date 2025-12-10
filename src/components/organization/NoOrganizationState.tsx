import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Clock } from 'lucide-react';
import { usePendingInvitations, useAcceptInvitation } from '@/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function NoOrganizationState() {
  const { data: invitations, isLoading } = usePendingInvitations();
  const acceptInvitation = useAcceptInvitation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle>No Organization</CardTitle>
          <CardDescription>
            You're not part of any organization yet. 
            An administrator needs to invite you to join their organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Checking for invitations...
            </div>
          ) : invitations && invitations.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">Pending Invitations</p>
              {invitations.map((inv) => {
                const org = inv.organizations as { name: string } | null;
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
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
            <div className="text-center text-muted-foreground text-sm">
              <p>No pending invitations found.</p>
              <p>Please contact your organization administrator to request an invitation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
