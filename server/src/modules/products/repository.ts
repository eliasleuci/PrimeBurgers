import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  async findByIdWithRecipe(id: string) {
    return prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        recipe: {
          include: { ingredient: true }
        }
      }
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  }

  async findByBranch(branchId: string) {
    return prisma.product.findMany({
      where: { branchId, isActive: true },
      include: { category: true }
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() }
    });
  }
}
