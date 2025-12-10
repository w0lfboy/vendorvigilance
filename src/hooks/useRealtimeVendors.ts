import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useRealtimeVendors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['vendors'] });
          
          if (payload.eventType === 'INSERT') {
            const vendor = payload.new as { name: string };
            toast({
              title: 'Vendor Added',
              description: `${vendor.name} has been added to your vendor list`,
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: 'Vendor Removed',
              description: 'A vendor has been removed from your list',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);
}
