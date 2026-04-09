-- Migration: Add tenant_id to all tables for multi-tenant support
-- Run this script in Supabase SQL Editor
-- ⚠️ NOTA: La tabla tenants NO debe tener tenant_id (líneas eliminadas)

-- 1. NO agregar tenant_id a tenants table (eliminado - causaba error)

-- 2. Add tenant_id column to branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 3. Add tenant_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 4. Add tenant_id column to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 5. Add tenant_id column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 6. Add tenant_id column to ingredients
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 7. Add tenant_id column to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 8. Add tenant_id column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 9. Add tenant_id column to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 10. Add tenant_id column to tables (if exists)
ALTER TABLE tables ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 11. Add tenant_id column to ingredient_categories (if exists)
ALTER TABLE ingredient_categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 12. Add tenant_id column to stock_movements (if exists)
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- 13. Update RLS policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 14. Create helper functions
CREATE OR REPLACE FUNCTION get_my_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_branch_id() RETURNS UUID AS $$
  SELECT branch_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 15. Create RLS policies
DROP POLICY IF EXISTS "Ver mi tenant" ON tenants;
CREATE POLICY "Ver mi tenant" ON tenants FOR SELECT USING (id = get_my_tenant_id());

DROP POLICY IF EXISTS "Ver mi sucursal" ON branches;
CREATE POLICY "Ver mi sucursal" ON branches FOR SELECT USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "Ver perfiles sucursal" ON profiles;
CREATE POLICY "Ver perfiles sucursal" ON profiles FOR SELECT USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "Ver categorias tenant" ON categories;
CREATE POLICY "Ver categorias tenant" ON categories FOR SELECT USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "Ver productos sucursal" ON products;
CREATE POLICY "Ver productos sucursal" ON products FOR SELECT USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "Ver ingredientes sucursal" ON ingredients;
CREATE POLICY "Ver ingredientes sucursal" ON ingredients FOR SELECT USING (tenant_id = get_my_tenant_id() OR branch_id = get_my_branch_id());

DROP POLICY IF EXISTS "Orders Tenant Isolation" ON orders;
CREATE POLICY "Orders Tenant Isolation" ON orders FOR ALL USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "Order Items Tenant Isolation" ON order_items;
CREATE POLICY "Order Items Tenant Isolation" ON order_items FOR ALL USING (tenant_id = get_my_tenant_id());

-- 16. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Migration completed successfully