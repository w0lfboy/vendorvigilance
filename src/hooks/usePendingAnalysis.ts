import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PendingAssessment {
  id: string;
  title: string;
  vendor_id: string;
  status: string;
  submitted_date: string | null;
  vendor: {
    name: string;
  };
  response_count: number;
}

export function usePendingAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingAssessments = [], isLoading } = useQuery({
    queryKey: ['pending-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get submitted assessments without AI analysis
      const { data: assessments, error } = await supabase
        .from('vendor_assessments')
        .select(`
          id,
          title,
          vendor_id,
          status,
          submitted_date,
          ai_analyzed_at,
          vendors (name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .is('ai_analyzed_at', null)
        .order('submitted_date', { ascending: false });

      if (error) throw error;

      // Get response counts for each assessment
      const assessmentsWithCounts = await Promise.all(
        (assessments || []).map(async (assessment) => {
          const { count } = await supabase
            .from('assessment_responses')
            .select('*', { count: 'exact', head: true })
            .eq('assessment_id', assessment.id);

          return {
            id: assessment.id,
            title: assessment.title,
            vendor_id: assessment.vendor_id,
            status: assessment.status,
            submitted_date: assessment.submitted_date,
            vendor: { name: (assessment.vendors as { name: string })?.name || 'Unknown' },
            response_count: count || 0,
          };
        })
      );

      return assessmentsWithCounts as PendingAssessment[];
    },
    enabled: !!user?.id,
  });

  const analyzeAssessment = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-assessment', {
        body: { assessment_id: assessmentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['ai-analysis'] });
    },
  });

  const bulkAnalyze = useMutation({
    mutationFn: async (assessmentIds: string[]) => {
      const results = await Promise.allSettled(
        assessmentIds.map(id => 
          supabase.functions.invoke('analyze-assessment', {
            body: { assessment_id: id },
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['ai-analysis'] });
      
      toast({
        title: 'Bulk Analysis Complete',
        description: `Successfully analyzed ${data.successful} assessment(s)${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze assessments. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    pendingAssessments,
    isLoading,
    analyzeAssessment: analyzeAssessment.mutateAsync,
    isAnalyzing: analyzeAssessment.isPending,
    bulkAnalyze: bulkAnalyze.mutate,
    isBulkAnalyzing: bulkAnalyze.isPending,
  };
}
