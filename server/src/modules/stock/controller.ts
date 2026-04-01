import { Request, Response, NextFunction } from 'express';
import { StockService } from './service';

const stockService = new StockService();

export class StockController {
  async getStock(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      const stock = await stockService.getBranchStock(branchId);
      res.status(200).json({ status: 'success', data: { stock } });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { stock } = req.body;
      const ingredient = await stockService.setStock(id, stock);
      res.status(200).json({ status: 'success', data: { ingredient } });
    } catch (error) {
      next(error);
    }
  }
}
