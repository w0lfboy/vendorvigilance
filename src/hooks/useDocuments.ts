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
  user_id: string | null;
  created_at: string;
  ai_summary?: string | null;
  ai_analysis?: unknown;
  analyzed_at?: string | null;
  review_status?: string | null;
  reviewer_notes?: string | null;
  key_findings?: unknown;
  risk_flags?: unknown;
  compliance_mapping?: unknown;
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
          review_status: 'pending',
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

  const analyzeDocument = useMutation({
    mutationFn: async (doc: Document) => {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          documentId: doc.id,
          documentName: doc.name,
          documentType: doc.type,
          // Note: For actual content extraction, you'd need to implement
          // PDF/document parsing. For now, we pass metadata for analysis.
          documentContent: `Document: ${doc.name}\nType: ${doc.type}\nThis is a ${doc.type} document that requires compliance analysis.`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Document analyzed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ docId, status, notes }: { docId: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          review_status: status,
          reviewer_notes: notes || null,
        })
        .eq('id', docId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Review status updated' });
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
    analyzeDocument,
    updateReviewStatus,
    deleteDocument,
    getDownloadUrl,
  };
}
