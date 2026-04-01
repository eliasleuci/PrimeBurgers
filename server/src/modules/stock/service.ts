import { StockRepository } from './repository';
import { AppError } from '../../common/exceptions/AppError';

const stockRepository = new StockRepository();

export class StockService {
  async getBranchStock(branchId: string) {
    return stockRepository.findByBranch(branchId);
  }

  async setStock(id: string, newStock: number) {
    if (newStock < 0) throw new AppError('Stock cannot be negative', 400);
    return stockRepository.updateStock(id, newStock);
  }
}
