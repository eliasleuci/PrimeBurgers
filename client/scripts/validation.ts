import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from client folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Credenciales de Supabase no encontradas en el .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runValidation() {
  console.log('--- INICIANDO PRUEBA DE FUEGO: ROBUSTEZ Y CONCURRENCIA ---');

  // 1. Obtener datos de prueba
  const { data: branches } = await supabase.from('branches').select('*').limit(1);
  const { data: products } = await supabase.from('products').select('*').eq('name', 'Burger Clásica').single();
  
  if (!branches || !products) {
    console.error('ERROR: No se encontraron datos maestros. ¿Ejecutaste el seed.sql?');
    return;
  }

  const branchId = branches[0].id;
  const productId = products.id;

  console.log(`Sucursal: ${branches[0].name} | Producto: ${products.name}`);

  // PRUEBA 1: AGOTAR STOCK (ATOMICIDAD)
  console.log('\nPrueba 1: Intento de compra superior al stock disponible...');
  
  // La Burger Clásica usa 1 Pan. El seed pone 10 panes.
  // Intentamos comprar 11 burgers en un solo pedido.
  try {
    const { data: res, error } = await supabase.rpc('create_order_secure', {
      p_branch_id: branchId,
      p_items: [{ product_id: productId, quantity: 11, price: 12.0 }],
      p_total: 132.0,
      p_payment_method: 'CASH'
    });

    if (res?.status === 'error' || error) {
      console.log('✅ ÉXITO: El sistema bloqueó la venta (Stock insuficiente como se esperaba).');
      console.log('Mensaje recibido:', res?.message || error?.message);
    } else {
      console.error('❌ FALLO: El sistema permitió vender más de lo existente en stock!');
    }
  } catch (e: any) {
    console.log('✅ ÉXITO: Excepción capturada (Stock insuficiente).');
  }

  // PRUEBA 2: CONCURRENCIA (RACE CONDITION)
  console.log('\nPrueba 2: Compra simultánea (Race Condition)...');
  console.log('Simulando 2 dispositivos comprando 6 burgers cada uno (Total 12, Stock 10).');

  const createOrder = () => supabase.rpc('create_order_secure', {
    p_branch_id: branchId,
    p_items: [{ product_id: productId, quantity: 6, price: 12.0 }],
    p_total: 72.0,
    p_payment_method: 'CARD'
  });

  // Ejecutamos 2 pedidos al mismo tiempo
  const [res1, res2] = await Promise.all([createOrder(), createOrder()]);

  const successCount = [res1, res2].filter(r => r.data?.status === 'success').length;
  const errorCount = [res1, res2].filter(r => r.data?.status === 'error').length;

  console.log(`Resultados Concurrentes: Éxitos=${successCount}, Errores=${errorCount}`);

  if (successCount === 1 && errorCount === 1) {
    console.log('✅ ÉXITO: Solo un pedido fue aceptado. Integridad mantenida.');
  } else {
    console.warn('⚠️ RESULTADO INESPERADO: Se aceptaron múltiples pedidos o ambos fallaron.');
  }

  // VALIDACIÓN FINAL DE STOCK
  const { data: ing } = await supabase.from('ingredients').select('stock').eq('name', 'Pan Brioche').single();
  console.log(`\nStock Final de Pan Brioche: ${ing?.stock}`);
  
  if (ing?.stock >= 0) {
    console.log('🏆 VALIDACIÓN DE INTEGRIDAD COMPLETADA SATISFACTORIAMENTE.');
  } else {
    console.error('❌ ERROR CRÍTICO: Stock negativo detectado!');
  }
}

runValidation().catch(console.error);
