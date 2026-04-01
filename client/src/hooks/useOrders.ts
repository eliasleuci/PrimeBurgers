import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';
import { Order } from '../types/domain';

export const useOrders = (
  branchId: string | null, 
  options: { limit?: number; startDate?: string } = {},
  onNewOrder?: (order: Order) => void
) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchId) return;

    // Load initial orders with filters
    const loadOrders = async () => {
      setLoading(true);
      try {
        const { data } = await orderService.getBranchOrders(branchId, options.limit, options.startDate);
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Subscribe to Realtime changes (Filtered by branch)
    const channel = supabase
      .channel(`branch-orders-${branchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `branch_id=eq.${branchId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full order including items
            const { data } = await supabase
              .from('orders')
              .select('*, order_items(*, products(*))')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setOrders((prev) => [data as any, ...prev]);
              if (onNewOrder) onNewOrder(data as any);
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, onNewOrder]);

  return { orders, loading };
};
