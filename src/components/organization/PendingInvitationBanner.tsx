import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Loader2, X } from 'lucide-react';
import { usePendingInvitations, useAcceptInvitation } from '@/hooks/useOrganization';

export function PendingInvitationBanner() {
  const { data: invitations, isLoading } = usePendingInvitations();
  const acceptInvitation = useAcceptInvitation();

  if (isLoading || !invitations?.length) return null;

  const invitation = invitations[0];
  const org = invitation.organizations as { name: string } | null;

  return (
    <Card className="border-secondary bg-secondary/5 mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/10">
              <Mail className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium">
                You've been invited to join {org?.name || 'an organization'}
              </p>
              <p className="text-sm text-muted-foreground">
                as a {invitation.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Could add decline functionality */}}
            >
              Decline
            </Button>
            <Button
              size="sm"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => acceptInvitation.mutate(invitation.id)}
              disabled={acceptInvitation.isPending}
            >
              {acceptInvitation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
