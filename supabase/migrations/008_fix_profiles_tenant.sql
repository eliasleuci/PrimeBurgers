-- Fix: Asignar tenant_id a profiles de forma segura
-- Ejecutar este script paso a paso en el SQL Editor de Supabase

-- Paso 1: Verificar si existe algún tenant
SELECT * FROM tenants LIMIT 1;

-- Paso 2: Si no existe ningún tenant, crear uno
INSERT INTO tenants (id, name, slug) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Tenant', 'demo')
ON CONFLICT DO NOTHING;

-- Paso 3: Ver branches actuales
SELECT id, name, tenant_id FROM branches;

-- Paso 4: Si branches no tienen tenant_id, asignarles el tenant por defecto
UPDATE branches 
SET tenant_id = '11111111-1111-1111-1111-111111111111'
WHERE tenant_id IS NULL;

-- Paso 5: Ahora sí, actualizar profiles con el tenant de su branch
UPDATE profiles 
SET tenant_id = (
    SELECT b.tenant_id 
    FROM branches b 
    WHERE b.id = profiles.branch_id
)
WHERE profiles.branch_id IS NOT NULL;

-- Paso 6: Verificar el resultado
SELECT id, email, role, branch_id, tenant_id FROM profiles;

-- Si aún hay profiles sin tenant_id (porque branch_id es null), puedes asignar uno por defecto:
UPDATE profiles 
SET tenant_id = '11111111-1111-1111-1111-111111111111'
WHERE tenant_id IS NULL;