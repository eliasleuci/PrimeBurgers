import { prisma } from '../../config/database';

export class StockRepository {
  async findByBranch(branchId: string) {
    return prisma.ingredient.findMany({
      where: { branchId, deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async updateStock(id: string, newStock: number) {
    return prisma.ingredient.update({
      where: { id },
      data: { stock: newStock }
    });
  }
}
