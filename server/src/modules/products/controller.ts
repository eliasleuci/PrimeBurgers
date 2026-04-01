import { Request, Response, NextFunction } from 'express';
import { ProductService } from './service';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      const products = await productService.getAllByBranch(branchId);
      res.status(200).json({ status: 'success', data: { products } });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getOne(req.params.id as string);
      res.status(200).json({ status: 'success', data: { product } });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.remove(req.params.id as string);
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }
}
