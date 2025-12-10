import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface VendorAssessment {
  id: string;
  vendor_id: string;
  template_id: string | null;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'under_review' | 'completed';
  due_date: string;
  submitted_date: string | null;
  reviewed_date: string | null;
  score: number | null;
  risk_level: string | null;
  access_token: string;
  is_recurring: boolean;
  recurrence_interval: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  framework: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface QuestionnaireQuestion {
  id: string;
  template_id: string;
  section: string;
  question_text: string;
  question_type: 'text' | 'single_choice' | 'multiple_choice' | 'file_upload';
  options: string[] | null;
  is_required: boolean;
  weight: number;
  order_index: number;
  compliance_mapping: Record<string, string> | null;
  created_at: string;
}

export function useAssessments(vendorId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assessmentsQuery = useQuery({
    queryKey: ['vendor_assessments', vendorId],
    queryFn: async () => {
      let query = supabase.from('vendor_assessments').select('*');
      
      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorAssessment[];
    },
    enabled: !!user,
  });

  const createAssessment = useMutation({
    mutationFn: async (assessment: Omit<Partial<VendorAssessment>, 'user_id' | 'access_token'>) => {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert({
          vendor_id: assessment.vendor_id!,
          title: assessment.title!,
          due_date: assessment.due_date!,
          template_id: assessment.template_id,
          status: assessment.status ?? 'pending',
          is_recurring: assessment.is_recurring ?? false,
          recurrence_interval: assessment.recurrence_interval,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_assessments'] });
      toast({ title: 'Success', description: 'Assessment created and sent to vendor' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateAssessment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VendorAssessment> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_assessments'] });
      toast({ title: 'Success', description: 'Assessment updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAssessment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_assessments'] });
      toast({ title: 'Success', description: 'Assessment deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    assessments: assessmentsQuery.data || [],
    isLoading: assessmentsQuery.isLoading,
    error: assessmentsQuery.error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
  };
}

export function useTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['questionnaire_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as QuestionnaireTemplate[];
    },
    enabled: !!user,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<Partial<QuestionnaireTemplate>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('questionnaire_templates')
        .insert({
          name: template.name!,
          description: template.description,
          category: template.category ?? 'General',
          framework: template.framework,
          is_active: template.is_active ?? true,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire_templates'] });
      toast({ title: 'Success', description: 'Template created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
  };
}
