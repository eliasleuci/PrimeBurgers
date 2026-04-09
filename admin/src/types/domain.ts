export interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  subscription_status: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT';
  subscription_expires_at?: string;
  created_at?: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  location?: string;
  email?: string;
  phone?: string;
  subscription_status: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT';
  subscription_expires_at?: string;
  last_payment_at?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' | 'KITCHEN';
  branch_id: string | null;
  created_at?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}
