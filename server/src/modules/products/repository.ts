import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { getTenantId } from '../../common/utils/context';

export class ProductRepository {
  async findByIdWithRecipe(id: string) {
    return prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        recipe: {
          include: { ingredient: true }
        }
      }
    });
  }

  async create(data: any) {
    const tenantId = getTenantId();
    
    return prisma.product.create({ 
      data: {
        ...data,
        tenantId: tenantId!
      } 
    });
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
    data: { isActive: false }
  });
}
}