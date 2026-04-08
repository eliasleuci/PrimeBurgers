import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando Seed... 🌱');

  let tenant = await prisma.tenant.findUnique({ where: { slug: 'primeburgers' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Primeburgers INC', slug: 'primeburgers' }
    });
  }

  let branch = await prisma.branch.findFirst({ 
    where: { name: 'Hamburguesería Central', tenantId: tenant.id } 
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Hamburguesería Central',
        location: 'Av. Siempre Viva 742',
        tenantId: tenant.id
      }
    });
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminEmail = 'admin@hamburgueseria.com';
  
  const existingUser = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin Central',
        role: 'ADMIN',
        branchId: branch.id,
        tenantId: tenant.id
      }
    });
  }

  let catBurgers = await prisma.category.findUnique({ where: { name: 'Hamburguesas' } });
  if (!catBurgers) {
    catBurgers = await prisma.category.create({
      data: { name: 'Hamburguesas', tenantId: tenant.id }
    });
  }

  await prisma.ingredient.deleteMany({ where: { tenantId: tenant.id } });
  
  const ingPan = await prisma.ingredient.create({
    data: { name: 'Pan de Papa', unit: 'unidades', stock: 100, branchId: branch.id, tenantId: tenant.id } as any
  });
  const ingCarne = await prisma.ingredient.create({
    data: { name: 'Carne 150g', unit: 'unidades', stock: 100, branchId: branch.id, tenantId: tenant.id } as any
  });

  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.product.create({
    data: {
      name: 'Hamburguesa Simple',
      price: 850.00,
      branchId: branch.id,
      categoryId: catBurgers.id,
      tenantId: tenant.id,
      recipe: {
        create: [
          { ingredientId: ingPan.id, quantity: 1, tenantId: tenant.id },
          { ingredientId: ingCarne.id, quantity: 1, tenantId: tenant.id },
        ]
      }
    } as any
  });

  console.log('Seed completado con éxito! 🍔');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    if (typeof process !== 'undefined') process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });