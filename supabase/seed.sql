-- Hamburguesería OS - Script de Semilla (Seed) para Validación
-- Este script carga datos maestros para probar el flujo completo POS -> Cocina -> Stock.

-- 1. LIMPIEZA PREVIA (Opcional, usar con cuidado)
-- TRUNCATE public.branches, public.categories, public.products, public.ingredients, public.recipe_items, public.orders, public.order_items CASCADE;

-- 2. SUCURSAL
INSERT INTO public.branches (name, address)
VALUES ('Hamburguesería Central (Test)', 'Av. Principal 123')
ON CONFLICT DO NOTHING;

-- Obtener ID de la sucursal (asumimos la primera para el test)
DO $$
DECLARE
    v_branch_id UUID;
    v_cat_burgers UUID;
    v_cat_drinks UUID;
    v_ing_pan UUID;
    v_ing_carne UUID;
    v_ing_queso UUID;
    v_prod_burger UUID;
BEGIN
    SELECT id INTO v_branch_id FROM public.branches LIMIT 1;

    -- 3. CATEGORÍAS
    INSERT INTO public.categories (name) VALUES ('Hamburguesas') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_burgers;
    INSERT INTO public.categories (name) VALUES ('Bebidas') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cat_drinks;

    -- 4. INGREDIENTES (Con stock limitado para pruebas)
    INSERT INTO public.ingredients (branch_id, name, unit, stock, min_stock)
    VALUES (v_branch_id, 'Pan Brioche', 'unidad', 10, 2)
    RETURNING id INTO v_ing_pan;

    INSERT INTO public.ingredients (branch_id, name, unit, stock, min_stock)
    VALUES (v_branch_id, 'Carne Angus 150g', 'unidad', 10, 2)
    RETURNING id INTO v_ing_carne;

    INSERT INTO public.ingredients (branch_id, name, unit, stock, min_stock)
    VALUES (v_branch_id, 'Fetas de Cheddar', 'unidad', 20, 5)
    RETURNING id INTO v_ing_queso;

    -- 5. PRODUCTOS
    INSERT INTO public.products (branch_id, category_id, name, description, price)
    VALUES (v_branch_id, v_cat_burgers, 'Burger Clásica', 'Pan, carne de 150g y cheddar', 12.00)
    RETURNING id INTO v_prod_burger;

    INSERT INTO public.products (branch_id, category_id, name, description, price)
    VALUES (v_branch_id, v_cat_drinks, 'Coca-Cola 500ml', 'Bebida gaseosa refrescante', 3.50);

    -- 6. RECETA (Burger Clásica usa 1 pan, 1 carne, 2 quesos)
    INSERT INTO public.recipe_items (product_id, ingredient_id, quantity) VALUES (v_prod_burger, v_ing_pan, 1);
    INSERT INTO public.recipe_items (product_id, ingredient_id, quantity) VALUES (v_prod_burger, v_ing_carne, 1);
    INSERT INTO public.recipe_items (product_id, ingredient_id, quantity) VALUES (v_prod_burger, v_ing_queso, 2);

END $$;
