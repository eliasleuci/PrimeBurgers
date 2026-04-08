import { OrderRepository } from './repository';
import { ProductRepository } from '../products/repository';
import { AppError } from '../../common/exceptions/AppError';
import { logger } from '../../common/utils/logger';
import { OrderStatus } from '@prisma/client';

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();

export class OrderService {
  async create(branchId: string | null, userId: string, items: { productId: string; quantity: number }[]) {
    logger.info(`[OrderService] Processing new order | branch=${branchId} user=${userId} items=${items.length}`);

    let total = 0;
    const orderItems: any[] = [];
    const recipeChanges: any[] = [];

    for (const item of items) {
      const product = await productRepository.findByIdWithRecipe(item.productId);

      if (!product) {
        logger.warn(`[OrderService] Product not found or unauthorized: ${item.productId}`);
        throw new AppError(`Product not found or unauthorized`, 404);
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price)
      });

      if (product.recipe) {
        for (const recipeItem of product.recipe) {
          const needed = Number(recipeItem.quantity) * item.quantity;
          recipeChanges.push({
            ingredientId: recipeItem.ingredientId,
            ingredientName: recipeItem.ingredient?.name,
            quantity: needed
          });
        }
      }
    }

    try {
      
      const order = await orderRepository.createOrderWithTransaction(
        {
          branch: branchId ? { connect: { id: branchId } } : undefined,
          user: { connect: { id: userId } },
          total: total
        } as any,
        orderItems,
        recipeChanges
      );

      return order;
    } catch (error: any) {
      logger.error(`[OrderService] ❌ Order creation FAILED: ${error.message}`);
      throw new AppError(error.message, 400);
    }
  }

  async getBranchOrders(branchId?: string | null) {
    return orderRepository.findByBranch(branchId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return orderRepository.updateStatus(orderId, status);
  }
}