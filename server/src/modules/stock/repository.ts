import { prisma } from '../../config/database';
import { movement_type, Prisma } from '@prisma/client';

export class StockRepository {
  async findByBranch(branchId: string | null) {
    return prisma.ingredient.findMany({
      where: { 
        ...(branchId && { branchId }), 
        is_active: true 
      },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.ingredient.findFirst({ 
      where: { id, is_active: true } 
    });
  }

  async create(data: {
    name: string;
    unit: string;
    stock: number;
    minStock: number;
    branchId: string | null;
    categoryId?: string;
  }) {
    return prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        stock: data.stock,
        minStock: data.minStock,
        branchId: data.branchId,
        categoryId: data.categoryId || null
      } as any
    });
  }

  async delete(id: string, userId?: string) {
    const ingredient = await this.findById(id);
    if (!ingredient) throw new Error('Ingredient not found');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ingredient.update({
        where: { id },
        data: { is_active: false }
      });

      await tx.stockMovement.create({
        data: {
          ingredientId: id,
          userId: userId || null,
          type: 'ADJUST',
          quantity: 0,
          stockBefore: ingredient.stock,
          stockAfter: 0,
          reason: 'Ingrediente eliminado'
        } as any
      });

      return updated;
    });
  }

  async updateStock(
    id: string, 
    newStock: number, 
    stockBefore: number, 
    userId?: string, 
    type: movement_type = 'ADJUST', 
    reason?: string
  ) {
    const quantity = Math.abs(newStock - stockBefore);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.ingredient.update({
        where: { id },
        data: { stock: newStock }
      });

      await tx.stockMovement.create({
        data: {
          ingredientId: id,
          userId: userId || null,
          type,
          quantity,
          stockBefore,
          stockAfter: newStock,
          reason: reason || null
        } as any
      });

      return updated;
    });
  }

  async getCategories() {
    return prisma.ingredientCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(name: string) {
    return prisma.ingredientCategory.create({
      data: { 
        name: name.trim().toUpperCase() 
      } as any
    });
  }

  async getStockMovements(branchId: string | null, startDate?: Date, endDate?: Date) {
    const where: any = {
      ...(branchId && { ingredient: { branchId } })
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return prisma.stockMovement.findMany({
      where,
      include: {
        ingredient: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async getStockReport(branchId: string | null) {
    const ingredients = await this.findByBranch(branchId);

    const total = ingredients.length;
    const okCount = ingredients.filter(i => Number(i.stock) > Number(i.minStock)).length;
    const lowCount = ingredients.filter(i => Number(i.stock) > 0 && Number(i.stock) <= Number(i.minStock)).length;
    const outCount = ingredients.filter(i => Number(i.stock) === 0).length;

    const lowStockItems = ingredients
      .filter(i => Number(i.stock) <= Number(i.minStock))
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 10)
      .map(i => ({
        name: i.name,
        stock: i.stock,
        minStock: i.minStock,
        deficit: Math.max(0, Number(i.minStock) - Number(i.stock)),
        unit: i.unit,
        status: Number(i.stock) === 0 ? 'out' : 'low'
      }));

    return {
      summary: { total, okCount, lowCount, outCount },
      lowStockItems
    };
  }
}