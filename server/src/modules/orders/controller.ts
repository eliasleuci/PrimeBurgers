import { Request, Response, NextFunction } from 'express';
import { OrderService } from './service';
import { OrderStatus } from '@prisma/client';
import { AppError } from '../../common/exceptions/AppError';

const orderService = new OrderService();

export class OrderController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;
      const branchId = req.user?.branchId || null;
      const userId = req.user?.id;

      if (!userId) throw new AppError('User not found in request', 401);

      const order = await orderService.create(branchId, userId, items);

      res.status(201).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = req.user?.branchId;
      const orders = await orderService.getBranchOrders(branchId);

      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const validStatuses: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const order = await orderService.updateOrderStatus(id, status);

      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };
}