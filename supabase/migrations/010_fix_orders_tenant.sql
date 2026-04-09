-- Verificar orders sin tenant_id y asignarles
-- Ejecutar en SQL Editor

-- Ver cuántos orders tienen tenant_id nulo
SELECT COUNT(*) as total, SUM(CASE WHEN tenant_id IS NULL THEN 1 ELSE 0 END) as sin_tenant
FROM orders;

-- Asignar tenant_id a orders desde su branch
UPDATE orders 
SET tenant_id = (
    SELECT b.tenant_id 
    FROM branches b 
    WHERE b.id = orders.branch_id
)
WHERE tenant_id IS NULL;

-- Si quedan sin tenant, asignar el tenant por defecto
UPDATE orders 
SET tenant_id = '11111111-1111-1111-1111-111111111111'
WHERE tenant_id IS NULL;

-- Verificar resultado
SELECT id, tenant_id, branch_id, status FROM orders LIMIT 10;