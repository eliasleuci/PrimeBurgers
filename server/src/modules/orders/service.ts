import { OrderRepository } from './repository';
import { ProductRepository } from '../products/repository';
import { AppError } from '../../common/exceptions/AppError';
import { logger } from '../../common/utils/logger';
import { OrderStatus } from '@prisma/client';

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();

export class OrderService {
  async create(branchId: string, userId: string, items: { productId: string; quantity: number }[]) {
    logger.info(`[OrderService] Processing new order | branch=${branchId} user=${userId} items=${items.length}`);

    let total = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    const recipeChanges: { ingredientId: string; ingredientName: string; quantity: number }[] = [];

    // Process each item to calculate total and check stock/recipe
    for (const item of items) {
      const product = await productRepository.findByIdWithRecipe(item.productId);

      if (!product) {
        logger.warn(`[OrderService] Product not found or inactive: ${item.productId}`);
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      if (product.recipe.length === 0) {
        logger.warn(`[OrderService] Product "${product.name}" has no recipe defined`);
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      logger.info(`[OrderService] Item: "${product.name}" x${item.quantity} = $${itemTotal}`);

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price)
      });

      // Calculate total ingredients needed
      for (const recipeItem of product.recipe) {
        const needed = recipeItem.quantity * item.quantity;
        recipeChanges.push({
          ingredientId: recipeItem.ingredientId,
          ingredientName: recipeItem.ingredient.name,
          quantity: needed
        });
        logger.info(`[OrderService] Ingredient needed: "${recipeItem.ingredient.name}" x${needed} ${recipeItem.ingredient.unit}`);
      }
    }

    logger.info(`[OrderService] Order total: $${total} | Ingredients to decrement: ${recipeChanges.length}`);

    // Execute atomic transaction
    try {
      const order = await orderRepository.createOrderWithTransaction(
        {
          branch: { connect: { id: branchId } },
          user: { connect: { id: userId } },
          total: total
        },
        orderItems,
        recipeChanges
      );

      logger.info(`[OrderService] ✅ Order created successfully | orderId=${order.id} total=$${total}`);
      return order;
    } catch (error: any) {
      logger.error(`[OrderService] ❌ Order creation FAILED | reason: ${error.message}`);
      throw new AppError(error.message, 400);
    }
  }

  async getBranchOrders(branchId: string) {
    return orderRepository.findByBranch(branchId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    logger.info(`[OrderService] Updating order status | orderId=${orderId} newStatus=${status}`);
    const order = await orderRepository.updateStatus(orderId, status);
    logger.info(`[OrderService] ✅ Order status updated | orderId=${orderId} status=${status}`);
    return order;
  }
}
