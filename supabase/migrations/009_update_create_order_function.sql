-- Actualizar la función create_order_secure para incluir tenant_id
-- Ejecutar en SQL Editor de Supabase

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
  -- 1. Crear el pedido
  INSERT INTO orders (tenant_id, branch_id, user_id, customer_name, customer_address, total, status, payment_method, order_type, table_id)
  VALUES (p_tenant_id, p_branch_id, p_user_id, p_customer_name, p_customer_address, p_total, 'PENDING', p_payment_method, p_order_type, p_table_id)
  RETURNING id, ticket_number INTO v_order_id, v_ticket_number;

  -- 2. Recorrer los ítems recibidos
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, price DECIMAL)
  LOOP
    -- Insertar el ítem en la orden
    INSERT INTO order_items (tenant_id, order_id, product_id, quantity, unit_price)
    VALUES (p_tenant_id, v_order_id, v_item.product_id, v_item.quantity, v_item.price);

    -- 3. Descontar Stock basado en la Receta
    FOR v_recipe IN SELECT ingredient_id, quantity FROM recipes WHERE product_id = v_item.product_id
    LOOP
      SELECT stock INTO v_stock_actual FROM ingredients WHERE id = v_recipe.ingredient_id FOR UPDATE;

      IF v_stock_actual < (v_recipe.quantity * v_item.quantity) THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto % (Ingrediente %)', v_item.product_id, v_recipe.ingredient_id;
      END IF;

      UPDATE ingredients 
      SET stock = stock - (v_recipe.quantity * v_item.quantity)
      WHERE id = v_recipe.ingredient_id;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('status', 'success', 'order_id', v_order_id, 'ticket_number', v_ticket_number);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que se creó correctamente
SELECT proname, pronargs FROM pg_proc WHERE proname = 'create_order_secure';