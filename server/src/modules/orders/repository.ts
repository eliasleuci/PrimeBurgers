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
    logger.info(`[OrderRepository] Starting critical transaction | items=${items.length} ingredients=${recipeChanges.length}`);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Final Stock Validation & Atomic Decrement
        // Using updateMany with 'gte' is an atomic Compare-And-Swap (CAS) in the DB
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

        // 2. Persist Order and Items
        const order = await tx.order.create({
          data: {
            ...data,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: { items: true }
        });

        return order;
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      });

      const durationMs = Date.now() - startTime;
      logger.info(`[OrderRepository] ✅ Transaction COMMITTED | orderId=${result.id} durationMs=${durationMs}`, {
        orderId: result.id,
        durationMs,
        status: 'success'
      });

      return result;
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logger.error(`[OrderRepository] ❌ Transaction FAILED | reason=${error.message} durationMs=${durationMs}`, {
        error: error.message,
        durationMs,
        status: 'failure'
      });
      throw error;
    }
  }

  async findByBranch(branchId: string) {
    return prisma.order.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
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
