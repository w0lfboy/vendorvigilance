import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Document {
  id: string;
  vendor_id: string;
  name: string;
  type: 'soc2_report' | 'iso_certificate' | 'policy' | 'contract';
  upload_date: string;
  expiration_date: string | null;
  size: number;
  status: 'active' | 'expired' | 'expiring_soon';
  file_path: string | null;
  user_id: string;
  created_at: string;
}

export function useDocuments(vendorId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents', vendorId],
    queryFn: async () => {
      let query = supabase.from('documents').select('*');
      
      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      file,
      vendorId,
      name,
      type,
      expirationDate,
    }: {
      file: File;
      vendorId: string;
      name: string;
      type: Document['type'];
      expirationDate?: string;
    }) => {
      // Upload file to storage
      const filePath = `${user?.id}/${vendorId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          vendor_id: vendorId,
          name,
          type,
          file_path: filePath,
          size: file.size,
          expiration_date: expirationDate || null,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Document uploaded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: Document) => {
      if (doc.file_path) {
        await supabase.storage.from('vendor-documents').remove([doc.file_path]);
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Document deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const getDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('vendor-documents')
      .createSignedUrl(filePath, 3600);
    return data?.signedUrl;
  };

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    uploadDocument,
    deleteDocument,
    getDownloadUrl,
  };
}
