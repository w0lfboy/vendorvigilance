import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type OrgRole = Database['public']['Enums']['org_role'];

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  status: 'pending' | 'active' | 'inactive';
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useOrganization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's current organization membership
  const membershipQuery = useQuery({
    queryKey: ['organization-membership', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get current organization details
  const organization = membershipQuery.data?.organizations as Organization | undefined;
  const currentRole = membershipQuery.data?.role as OrgRole | undefined;
  const isOwner = currentRole === 'owner';
  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  // Get all members of the organization
  const membersQuery = useQuery({
    queryKey: ['organization-members', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrganizationMember[];
    },
    enabled: !!organization?.id,
  });

  // Get pending invitations
  const invitationsQuery = useQuery({
    queryKey: ['organization-invitations', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organization!.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrganizationInvitation[];
    },
    enabled: !!organization?.id && isAdmin,
  });

  // Invite a user to the organization
  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: OrgRole }) => {
      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organization!.id,
          email,
          role,
          invited_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      toast({ title: 'Invitation sent', description: 'The user has been invited to join the organization.' });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast({ title: 'Already invited', description: 'This email has already been invited.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    },
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: OrgRole }) => {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast({ title: 'Role updated', description: 'The member\'s role has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update member status (activate/deactivate)
  const updateMemberStatus = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ status })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast({ 
        title: variables.status === 'active' ? 'User activated' : 'User deactivated',
        description: `The user has been ${variables.status === 'active' ? 'activated' : 'deactivated'}.`
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Remove member from organization
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      toast({ title: 'Member removed', description: 'The member has been removed from the organization.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Cancel invitation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-invitations'] });
      toast({ title: 'Invitation cancelled', description: 'The invitation has been cancelled.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update organization details
  const updateOrganization = useMutation({
    mutationFn: async (updates: Partial<Pick<Organization, 'name' | 'slug' | 'logo_url'>>) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-membership'] });
      toast({ title: 'Organization updated', description: 'Organization details have been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    organization,
    membership: membershipQuery.data,
    members: membersQuery.data || [],
    invitations: invitationsQuery.data || [],
    currentRole,
    isOwner,
    isAdmin,
    isLoading: membershipQuery.isLoading,
    membersLoading: membersQuery.isLoading,
    inviteUser,
    updateMemberRole,
    updateMemberStatus,
    removeMember,
    cancelInvitation,
    updateOrganization,
  };
}

// Hook for checking pending invitations for the current user
export function usePendingInvitations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-invitations', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*, organizations(*)')
        .eq('email', user!.email!)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });
}

// Hook for accepting an invitation
export function useAcceptInvitation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Get the invitation
      const { data: invitation, error: invError } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invError) throw invError;

      // Create the membership
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: user!.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('organization_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-membership'] });
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast({ title: 'Welcome!', description: 'You have joined the organization.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
