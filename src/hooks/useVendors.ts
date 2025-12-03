import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Vendor {
  id: string;
  name: string;
  website: string | null;
  category: string;
  risk_score: number;
  risk_tier: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'offboarded';
  annual_value: number;
  last_assessment: string | null;
  next_assessment: string | null;
  open_issues: number;
  documents_count: number;
  contact_name: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useVendors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: ['vendors', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vendor[];
    },
    enabled: !!user,
  });

  const createVendor = useMutation({
    mutationFn: async (vendor: Omit<Partial<Vendor>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          name: vendor.name!,
          category: vendor.category!,
          website: vendor.website,
          risk_score: vendor.risk_score ?? 0,
          risk_tier: vendor.risk_tier ?? 'low',
          status: vendor.status ?? 'pending',
          annual_value: vendor.annual_value ?? 0,
          contact_name: vendor.contact_name,
          contact_email: vendor.contact_email,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: 'Success', description: 'Vendor created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateVendor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vendor> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: 'Success', description: 'Vendor updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: 'Success', description: 'Vendor deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    vendors: vendorsQuery.data || [],
    isLoading: vendorsQuery.isLoading,
    error: vendorsQuery.error,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}

export function useVendor(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    enabled: !!user && !!id,
  });
}
