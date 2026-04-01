import { supabase } from '../lib/supabase';
import { IOrderService, CreateOrderParams } from '../types/services';
import { ServiceResponse, Order, OrderStatus } from '../types/domain';

class OrderService implements IOrderService {
  async createOrder(params: CreateOrderParams): Promise<ServiceResponse<any>> {
    const fullCustomerDetail = [params.customerName, params.customerAddress].filter(Boolean).join(' - ');
    
    const { data, error } = await supabase.rpc('create_order_secure', {
      p_branch_id: params.branchId,
      p_user_id: params.userId,
      p_customer_name: fullCustomerDetail || null,
      p_items: params.items,
      p_total: params.total,
      p_payment_method: params.paymentMethod,
    });

    return { 
      data: data ? { order_id: data.order_id, status: data.status, message: data.message } : null, 
      error: error?.message || null 
    };
  }

  async getBranchOrders(branchId: string, limit?: number, startDate?: string): Promise<ServiceResponse<Order[]>> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    return { data, error: error?.message || null };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ServiceResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*, order_items(*, products(*))')
      .single();

    return { data, error: error?.message || null };
  }

  async deleteOrder(orderId: string): Promise<ServiceResponse<boolean>> {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    return { data: !error, error: error?.message || null };
  }

  async deleteOrdersByDateRange(branchId: string, startDate: string, endDate: string): Promise<ServiceResponse<boolean>> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('branch_id', branchId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return { data: !error, error: error?.message || null };
  }
}

export const orderService = new OrderService();
