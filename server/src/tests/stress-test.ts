import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function setupTestData() {
  console.log('--- Configurando Datos de Prueba ---');
  
  // 1. Crear Sucursal
  const branch = await prisma.branch.create({
    data: { name: 'Sucursal de Pruebas Stress' }
  });

  // 2. Crear Ingredientes Críticos (ej. Pan y Carne)
  const pan = await prisma.ingredient.create({
    data: { name: 'Pan de Papa', unit: 'unidad', stock: 10, branchId: branch.id }
  });

  const carne = await prisma.ingredient.create({
    data: { name: 'Carne Angus', unit: 'gr', stock: 1000, branchId: branch.id } // 1000gr = 10 carnes de 100gr
  });

  // 3. Crear Productos que comparten ingredientes
  const cat = await prisma.category.create({ data: { name: 'Hamburguesas' } });

  const hburguer = await prisma.product.create({
    data: {
      name: 'Burger Clásica',
      price: 10.0,
      categoryId: cat.id,
      branchId: branch.id,
      recipe: {
        create: [
          { ingredientId: pan.id, quantity: 1 },
          { ingredientId: carne.id, quantity: 100 }
        ]
      }
    }
  });

  const doubleBurger = await prisma.product.create({
    data: {
      name: 'Doble Burger',
      price: 15.0,
      categoryId: cat.id,
      branchId: branch.id,
      recipe: {
        create: [
          { ingredientId: pan.id, quantity: 1 },
          { ingredientId: carne.id, quantity: 200 }
        ]
      }
    }
  });

  // 4. Crear Usuario Cajero
  const user = await prisma.user.create({
    data: {
      name: 'Cajero Stress',
      email: `stress-${randomUUID()}@test.com`,
      password: 'hash',
      branchId: branch.id
    }
  });

  return { branch, hburguer, doubleBurger, user, pan, carne };
}

async function runStressTest() {
  const { branch, hburguer, doubleBurger, user, pan, carne } = await setupTestData();

  console.log('\n--- Iniciando Escenario de Stress ---');
  console.log(`Stock Inicial: Pan=${pan.stock}, Carne=${carne.stock}`);

  // ESCENARIO 1: Ráfaga de pedidos simultáneos (Spike)
  // Intentamos crear 15 pedidos de 1 Burger Clásica (Solo hay 10 panes)
  console.log('Escenario 1: Ráfaga (15 pedidos de Burger Clásica simultáneos)');
  
  const requests = Array.from({ length: 15 }).map(async (_, i) => {
    try {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: branch.id,
          userId: user.id,
          items: [{ productId: hburguer.id, quantity: 1 }]
        })
      });
      return { status: resp.status, ok: resp.ok };
    } catch (e: any) {
      return { status: 'ERROR', ok: false, msg: e.message };
    }
  });

  const results = await Promise.all(requests);
  const successCount = results.filter(r => r.ok).length;
  const failureCount = results.filter(r => !r.ok).length;

  console.log(`Resultados Ráfaga: Éxitos=${successCount}, Fallos=${failureCount}`);

  // ESCENARIO 2: Contención (Pedidos compartiendo ingredientes)
  // Hacemos pedidos de Doble Burger mientras hay stock limitado de Carne
  // A este punto quedan 1000 - (successCount * 100) de carne
  console.log('\nEscenario 2: Contención (Pedidos de Doble Burger compartiendo Carne)');
  
  const contencionRequests = Array.from({ length: 5 }).map(async () => {
    try {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: branch.id,
          userId: user.id,
          items: [{ productId: doubleBurger.id, quantity: 1 }]
        })
      });
      return { status: resp.status, ok: resp.ok };
    } catch (e) {
      return { status: 'ERROR', ok: false };
    }
  });

  const contResults = await Promise.all(contencionRequests);
  console.log(`Resultados Contención: Éxitos=${contResults.filter(r => r.ok).length}`);

  // VALIDACIÓN FINAL
  const finalPan = await prisma.ingredient.findUnique({ where: { id: pan.id } });
  const finalCarne = await prisma.ingredient.findUnique({ where: { id: carne.id } });

  console.log('\n--- Validación Final de Integridad ---');
  console.log(`Stock Final Pan: ${finalPan?.stock} (Debería ser >= 0)`);
  console.log(`Stock Final Carne: ${finalCarne?.stock} (Debería ser >= 0)`);

  if (Number(finalPan?.stock) < 0 || Number(finalCarne?.stock) < 0) {
    console.error('❌ ERROR CRÍTICO: Stock negativo detectado!');
  } else {
    console.log('✅ ÉXITO: El sistema mantuvo la integridad bajo stress.');
  }

  process.exit();
}

runStressTest().catch(console.error);
