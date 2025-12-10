import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string | null;
  vendor_id: string | null;
  dismissed: boolean;
  created_at: string;
  vendor?: {
    name: string;
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          type,
          title,
          description,
          vendor_id,
          dismissed,
          created_at,
          vendors (name)
        `)
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        vendor: item.vendors ? { name: (item.vendors as { name: string }).name } : undefined,
      })) as Notification[];
    },
    enabled: !!user?.id,
  });

  const dismissNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ dismissed: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const dismissAll = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('alerts')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('dismissed', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount: notifications.length,
    dismissNotification: dismissNotification.mutate,
    dismissAll: dismissAll.mutate,
  };
}
