import { supabase } from '../lib/supabase';
import type { Branch, ServiceResponse, UserProfile, Tenant } from '../types/domain';

class AdminService {
  async getTenants(): Promise<ServiceResponse<Tenant[]>> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error: error?.message || null };
  }

  async getBranches(tenantId?: string): Promise<ServiceResponse<Branch[]>> {
    let query = supabase.from('branches').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    
    const { data, error } = await query.order('name', { ascending: true });
    return { data, error: error?.message || null };
  }

  async createTenant(tenant: Partial<Tenant>): Promise<ServiceResponse<Tenant>> {
    const { data, error } = await supabase
      .from('tenants')
      .insert([tenant])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }

  async createBranch(branch: Partial<Branch>): Promise<ServiceResponse<Branch>> {
    const { data, error } = await supabase
      .from('branches')
      .insert([branch])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }

  async updateBranch(id: string, updates: Partial<Branch>): Promise<ServiceResponse<Branch>> {
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<ServiceResponse<Tenant>> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }

  async deleteBranch(id: string): Promise<ServiceResponse<boolean>> {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);
    
    return { data: !error, error: error?.message || null };
  }

  async createProfile(profile: Partial<UserProfile>): Promise<ServiceResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    return { data, error: error?.message || null };
  }
}

export const adminService = new AdminService();
