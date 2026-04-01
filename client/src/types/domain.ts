// Definitions for the Hamburguer Management System Domain

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  branch_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  categories?: Category; // Nested from Supabase
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  price_at_sale: number;
  modifiers?: string[];
  notes?: string;
  products?: Product; // Nested from Supabase
}

export interface Order {
  id: string;
  branch_id: string;
  user_id?: string;
  customer_name?: string;
  status: OrderStatus;
  total: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}
