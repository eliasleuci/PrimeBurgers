import { Request, Response, NextFunction } from 'express';
import { ReportService } from './service';

const reportService = new ReportService();

export class ReportController {
  async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      const report = await reportService.getDailySales(branchId);
      res.status(200).json({ status: 'success', data: { report } });
    } catch (error) {
      next(error);
    }
  }
}
