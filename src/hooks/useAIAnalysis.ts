import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysis {
  id: string;
  assessment_id: string;
  overall_score: number | null;
  risk_level: string | null;
  confidence_score: number | null;
  executive_summary: string | null;
  key_strengths: string[] | null;
  key_concerns: string[] | null;
  recommended_actions: Array<{
    action: string;
    priority: string;
    rationale: string;
  }> | null;
  compliance_scores: {
    SOC2?: number;
    ISO27001?: number;
    GDPR?: number;
  } | null;
  findings: Array<{
    question_id: string;
    finding_type: string;
    summary: string;
    detail: string;
    compliance_impact?: string[];
    recommended_action?: string;
  }> | null;
  model_used: string | null;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
}

export function useAIAnalysis(assessmentId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['ai-analysis', assessmentId],
    queryFn: async () => {
      if (!assessmentId) return null;

      const { data, error } = await supabase
        .from('assessment_ai_analysis')
        .select('*')
        .eq('assessment_id', assessmentId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as AIAnalysis | null;
    },
    enabled: !!assessmentId,
  });

  const analyzeAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-assessment', {
        body: { assessment_id: assessmentId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-analysis', data.assessment_id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast({
        title: 'Analysis Complete',
        description: `Risk Level: ${data.analysis.risk_level?.toUpperCase()} | Score: ${data.analysis.overall_score}/100`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    analysis,
    isLoading,
    analyzeAssessment: analyzeAssessmentMutation.mutate,
    isAnalyzing: analyzeAssessmentMutation.isPending,
  };
}