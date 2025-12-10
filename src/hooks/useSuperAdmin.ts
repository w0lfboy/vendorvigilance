import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  member_count?: number;
}

interface CreateOrganizationData {
  name: string;
  slug: string;
  ownerEmail: string;
}

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsSuperAdmin(!!data && !error);
      setIsLoading(false);
    };

    checkSuperAdmin();
  }, []);

  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['super-admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts for each organization
      const orgsWithCounts = await Promise.all(
        (data || []).map(async (org) => {
          const { count } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('status', 'active');
          
          return { ...org, member_count: count || 0 };
        })
      );

      return orgsWithCounts as Organization[];
    },
    enabled: isSuperAdmin,
  });

  const createOrganizationMutation = useMutation({
    mutationFn: async ({ name, slug, ownerEmail }: CreateOrganizationData) => {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // Look up user by email
      const { data: users } = await supabase.auth.admin?.listUsers?.() || { data: null };
      
      // Since we can't use admin API from client, we'll create an invitation
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) throw new Error('Not authenticated');

      // Create invitation for the owner
      const { error: inviteError } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: org.id,
          email: ownerEmail,
          role: 'owner',
          invited_by: currentUser.id,
        });

      if (inviteError) throw inviteError;

      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      toast({
        title: 'Organization created',
        description: 'An invitation has been sent to the owner.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create organization',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      toast({
        title: 'Organization deleted',
        description: 'The organization has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete organization',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    isSuperAdmin,
    isLoading,
    organizations,
    orgsLoading,
    createOrganization: createOrganizationMutation.mutate,
    isCreating: createOrganizationMutation.isPending,
    deleteOrganization: deleteOrganizationMutation.mutate,
    isDeleting: deleteOrganizationMutation.isPending,
  };
}