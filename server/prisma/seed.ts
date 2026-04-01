import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Branch
  const branch = await prisma.branch.upsert({
    where: { id: 'default-branch' },
    update: {},
    create: {
      id: 'default-branch',
      name: 'Hamburguesería Central',
      address: 'Av. Siempre Viva 742',
    },
  });

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@hamburgueseria.com' },
    update: {},
    create: {
      email: 'admin@hamburgueseria.com',
      password: hashedPassword,
      name: 'Admin Central',
      role: Role.ADMIN,
      branchId: branch.id,
    },
  });

  // 3. Create Categories
  const catBurgers = await prisma.category.upsert({
    where: { name: 'Hamburguesas' },
    update: {},
    create: { name: 'Hamburguesas' },
  });

  const catSides = await prisma.category.upsert({
    where: { name: 'Acompañamientos' },
    update: {},
    create: { name: 'Acompañamientos' },
  });

  // 4. Create Ingredients
  const ingPan = await prisma.ingredient.create({
    data: { name: 'Pan de Papa', unit: 'unidades', stock: 100, branchId: branch.id }
  });
  const ingCarne = await prisma.ingredient.create({
    data: { name: 'Carne 150g', unit: 'unidades', stock: 100, branchId: branch.id }
  });
  const ingQueso = await prisma.ingredient.create({
    data: { name: 'Queso Cheddar', unit: 'fetas', stock: 200, branchId: branch.id }
  });

  // 5. Create Products with Recipes
  // Simple Burger (1 pan, 1 carne, 1 queso)
  await prisma.product.create({
    data: {
      name: 'Hamburguesa Simple',
      price: 850.00,
      branchId: branch.id,
      categoryId: catBurgers.id,
      recipe: {
        create: [
          { ingredientId: ingPan.id, quantity: 1 },
          { ingredientId: ingCarne.id, quantity: 1 },
          { ingredientId: ingQueso.id, quantity: 1 },
        ]
      }
    }
  });

  // Double Burger (1 pan, 2 carnes, 2 quesos)
  await prisma.product.create({
    data: {
      name: 'Hamburguesa Doble',
      price: 1200.00,
      branchId: branch.id,
      categoryId: catBurgers.id,
      recipe: {
        create: [
          { ingredientId: ingPan.id, quantity: 1 },
          { ingredientId: ingCarne.id, quantity: 2 },
          { ingredientId: ingQueso.id, quantity: 2 },
        ]
      }
    }
  });

  console.log('Seed completed successfully 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
