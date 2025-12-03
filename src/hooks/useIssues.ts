import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Issue {
  id: string;
  vendor_id: string;
  assessment_id: string | null;
  title: string;
  description: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution_notes: string | null;
  due_date: string | null;
  resolved_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useIssues(vendorId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const issuesQuery = useQuery({
    queryKey: ['issues', vendorId],
    queryFn: async () => {
      let query = supabase.from('issues').select('*');
      
      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Issue[];
    },
    enabled: !!user,
  });

  const createIssue = useMutation({
    mutationFn: async (issue: Omit<Partial<Issue>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('issues')
        .insert({
          vendor_id: issue.vendor_id!,
          title: issue.title!,
          description: issue.description,
          severity: issue.severity ?? 'medium',
          status: issue.status ?? 'open',
          due_date: issue.due_date,
          assigned_to: issue.assigned_to,
          assessment_id: issue.assessment_id,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Success', description: 'Issue created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateIssue = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Issue> & { id: string }) => {
      const { data, error } = await supabase
        .from('issues')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Success', description: 'Issue updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteIssue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('issues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Success', description: 'Issue deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    issues: issuesQuery.data || [],
    isLoading: issuesQuery.isLoading,
    error: issuesQuery.error,
    createIssue,
    updateIssue,
    deleteIssue,
  };
}
