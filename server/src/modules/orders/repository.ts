import { prisma } from '../../config/database';
import { OrderStatus, Prisma } from '@prisma/client';
import { logger } from '../../common/utils/logger';

export class OrderRepository {
  async createOrderWithTransaction(
    data: Prisma.OrderCreateInput,
    items: { productId: string; quantity: number; price: number }[],
    recipeChanges: { ingredientId: string; ingredientName: string; quantity: number }[]
  ) {
    const startTime = Date.now();
    logger.info(`[OrderRepository] Starting critical transaction | items=${items.length}`);

    try {
      const result = await prisma.$transaction(async (tx) => {
        
        for (const change of recipeChanges) {
          const updated = await tx.ingredient.updateMany({
            where: {
              id: change.ingredientId,
              stock: { gte: change.quantity }
            },
            data: {
              stock: { decrement: change.quantity }
            }
          });

          if (updated.count === 0) {
            throw new Error(`Insufficient stock for ingredient: ${change.ingredientName}`);
          }
        }

        const order = await tx.order.create({
          data: {
            ...data,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              } as any))
            }
          },
          include: { items: true }
        });

        return order;
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      });

      const durationMs = Date.now() - startTime;
      logger.info(`[OrderRepository] ✅ Transaction COMMITTED | orderId=${result.id}`);

      return result;
    } catch (error: any) {
      logger.error(`[OrderRepository] ❌ Transaction FAILED | reason=${error.message}`);
      throw error;
    }
  }

  async findByBranch(branchId?: string | null) {
    return prisma.order.findMany({
      where: { 
        ...(branchId && { branchId }) 
      },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
  }

  async findById(id: string) {
    return prisma.order.findFirst({
      where: { id },
      include: { items: { include: { product: true } } }
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}