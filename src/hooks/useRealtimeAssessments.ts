import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useRealtimeAssessments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('assessments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_assessments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['vendor_assessments'] });
          queryClient.invalidateQueries({ queryKey: ['pending-analysis'] });
          
          const assessment = payload.new as { title: string; status: string };
          toast({
            title: 'Assessment Created',
            description: `${assessment.title} has been created`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_assessments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['vendor_assessments'] });
          queryClient.invalidateQueries({ queryKey: ['pending-analysis'] });
          queryClient.invalidateQueries({ queryKey: ['ai-analysis'] });
          
          const assessment = payload.new as { title: string; status: string };
          const oldAssessment = payload.old as { status: string };
          
          // Notify on status changes
          if (assessment.status !== oldAssessment.status) {
            if (assessment.status === 'submitted') {
              toast({
                title: 'Assessment Submitted',
                description: `${assessment.title} has been submitted by the vendor`,
              });
            } else if (assessment.status === 'completed') {
              toast({
                title: 'Assessment Completed',
                description: `${assessment.title} review is complete`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);
}
