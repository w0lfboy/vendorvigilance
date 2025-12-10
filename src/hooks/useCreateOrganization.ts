import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useCreateOrganization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create the owner membership
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        // Rollback org creation if membership fails
        await supabase.from('organizations').delete().eq('id', org.id);
        throw memberError;
      }

      // Send welcome email (non-blocking)
      supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user.email,
          organizationName: name,
          userName: user.user_metadata?.full_name || user.email?.split('@')[0],
        },
      }).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });

      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-membership'] });
      toast({ 
        title: 'Organization created!', 
        description: 'Your organization is ready. Check your email for setup tips!' 
      });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        toast({ 
          title: 'Name already taken', 
          description: 'Please choose a different organization name or URL slug.', 
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    },
  });
}
