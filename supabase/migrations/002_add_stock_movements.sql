-- ==========================================
-- 🍔 PRIME BURGERS: MIGRATION 002
-- Agrega tabla de movimientos de stock y categorías de ingredientes
-- YA INCLUYE tenant_id en tablas nuevas
-- ==========================================
-- Ejecuta este SQL en tu base de datos después de setup.sql

-- 1. Crear enum para tipos de movimiento
DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('ADD', 'REMOVE', 'ADJUST', 'INITIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabla de categorías de ingredientes
CREATE TABLE IF NOT EXISTS ingredient_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  -- ✅ Agregado
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agregar columna category_id a ingredients
DO $$ BEGIN
    ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES ingredient_categories(id);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 4. Crear índice para category_id
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category_id);

-- 5. Tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,  -- ✅ Agregado
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type movement_type NOT NULL DEFAULT 'ADJUST',
    quantity DECIMAL(10, 3) NOT NULL,
    stock_before DECIMAL(10, 3) NOT NULL,
    stock_after DECIMAL(10, 3) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user ON stock_movements(user_id);

-- 7. Políticas RLS para nuevas tablas
ALTER TABLE ingredient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver categorias" ON ingredient_categories FOR SELECT USING (true);
CREATE POLICY "Insertar categorias (admin)" ON ingredient_categories FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
);

CREATE POLICY "Ver movimientos sucursal" ON stock_movements FOR SELECT USING (
    ingredient_id IN (SELECT id FROM ingredients WHERE branch_id = get_my_branch_id())
);

CREATE POLICY "Insertar movimientos (admin)" ON stock_movements FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
);

-- 8. Agregar columnas faltantes a orders si no existen
DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket_number SERIAL UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'TAKEAWAY';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 9. Agregar columnas faltantes a ingredients
DO $$ BEGIN
    ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 10. Agregar columnas faltantes a products
DO $$ BEGIN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 11. Actualizar function create_order para soporta nuevas columnas
-- (La función completa está en migration 011)