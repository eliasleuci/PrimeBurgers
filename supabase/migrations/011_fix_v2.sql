-- ==========================================
-- CORRECCIÓN COMPLETA v2 - Maneja casos donde no existe branch_id
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- 1. ASEGURAR TENANT EXISTA
INSERT INTO tenants (id, name, slug) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Tenant', 'demo')
ON CONFLICT DO NOTHING;

-- 2. CORREGIR BRANCHES
UPDATE branches SET tenant_id = '11111111-1111-1111-1111-111111111111' 
WHERE tenant_id IS NULL;

-- 3. CORREGIR PROFILES  
-- Primero desde branch
UPDATE profiles SET tenant_id = (
    SELECT b.tenant_id FROM branches b WHERE b.id = profiles.branch_id
) WHERE profiles.branch_id IS NOT NULL AND profiles.tenant_id IS NULL;

-- Luego los que quedaron sin tenant
UPDATE profiles SET tenant_id = '11111111-1111-1111-1111-111111111111' 
WHERE profiles.tenant_id IS NULL;

-- 4. CORREGIR CATEGORIES (tiene tenant_id directamente, no branch_id)
UPDATE categories SET tenant_id = (
    SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid()
) WHERE tenant_id IS NULL;

-- Si no hay usuario logueado, asignar tenant por defecto
UPDATE categories SET tenant_id = '11111111-1111-1111-1111-111111111111' 
WHERE tenant_id IS NULL;

-- 5. CORREGIR PRODUCTS
UPDATE products SET tenant_id = (
    SELECT b.tenant_id FROM branches b WHERE b.id = products.branch_id
) WHERE tenant_id IS NULL AND branch_id IS NOT NULL;

UPDATE products SET tenant_id = '11111111-1111-1111-1111-111111111111' 
WHERE tenant_id IS NULL;

-- 6. CORREGIR ORDERS
UPDATE orders SET tenant_id = (
    SELECT b.tenant_id FROM branches b WHERE b.id = orders.branch_id
) WHERE tenant_id IS NULL AND branch_id IS NOT NULL;

UPDATE orders SET tenant_id = '11111111-1111-1111-1111-111111111111' 
WHERE tenant_id IS NULL;

-- 7. LIMPIAR FUNCIONES DUPLICADAS
DROP FUNCTION IF EXISTS create_order_secure(UUID, UUID, UUID, TEXT, TEXT, JSONB, DECIMAL, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS create_order_secure(UUID, UUID, UUID, TEXT, JSONB, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS create_order_secure(UUID, UUID, UUID, TEXT, TEXT, JSONB, DECIMAL, TEXT, TEXT, UUID, TEXT);

-- 8. CREAR FUNCIÓN CORRECTA (10 parámetros)
CREATE OR REPLACE FUNCTION create_order_secure(
    p_tenant_id UUID,
    p_branch_id UUID,
    p_user_id UUID,
    p_customer_name TEXT,
    p_items JSONB,
    p_total DECIMAL,
    p_payment_method TEXT,
    p_order_type TEXT DEFAULT 'TAKEAWAY',
    p_table_id UUID DEFAULT NULL,
    p_customer_address TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_ticket_number INTEGER;
    v_item RECORD;
    v_recipe RECORD;
    v_stock_actual DECIMAL;
BEGIN
    INSERT INTO orders (tenant_id, branch_id, user_id, customer_name, customer_address, total, status, payment_method, order_type, table_id)
    VALUES (p_tenant_id, p_branch_id, p_user_id, p_customer_name, p_customer_address, p_total, 'PENDING', p_payment_method, p_order_type, p_table_id)
    RETURNING id, ticket_number INTO v_order_id, v_ticket_number;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, price DECIMAL)
    LOOP
        INSERT INTO order_items (tenant_id, order_id, product_id, quantity, unit_price)
        VALUES (p_tenant_id, v_order_id, v_item.product_id, v_item.quantity, v_item.price);

        FOR v_recipe IN SELECT ingredient_id, quantity FROM recipes WHERE product_id = v_item.product_id
        LOOP
            SELECT stock INTO v_stock_actual FROM ingredients WHERE id = v_recipe.ingredient_id FOR UPDATE;
            IF v_stock_actual < (v_recipe.quantity * v_item.quantity) THEN
                RAISE EXCEPTION 'Stock insuficiente para el producto %', v_item.product_id;
            END IF;
            UPDATE ingredients SET stock = stock - (v_recipe.quantity * v_item.quantity) 
            WHERE id = v_recipe.ingredient_id;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('status', 'success', 'order_id', v_order_id, 'ticket_number', v_ticket_number);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. REFRESCAR CACHE
NOTIFY pgrst, 'reload schema';

-- 10. VERIFICAR
SELECT proname, pronargs FROM pg_proc WHERE proname = 'create_order_secure';

-- 11. Verificar datos finales
SELECT 'tenants' as table_name, COUNT(*) as total FROM tenants
UNION ALL
SELECT 'branches', COUNT(*) FROM branches WHERE tenant_id IS NOT NULL
UNION ALL  
SELECT 'profiles', COUNT(*) FROM profiles WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 'orders', COUNT(*) FROM orders WHERE tenant_id IS NOT NULL;