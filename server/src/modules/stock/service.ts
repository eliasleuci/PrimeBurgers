import { StockRepository } from './repository';
import { AppError } from '../../common/exceptions/AppError';

import { movement_type } from '@prisma/client';

const stockRepository = new StockRepository();

export class StockService {
  async getBranchStock(branchId: string | null) {
    return stockRepository.findByBranch(branchId);
  }

  async createIngredient(data: {
    name: string;
    unit: string;
    stock: number;
    minStock: number;
    branchId: string | null;
    categoryId?: string;
  }) {
    if (!data.name?.trim()) throw new AppError('El nombre es requerido', 400);
    if (!data.unit?.trim()) throw new AppError('La unidad es requerida', 400);
    if (data.stock < 0) throw new AppError('El stock no puede ser negativo', 400);
    if (data.minStock < 0) throw new AppError('El stock mínimo no puede ser negativo', 400);
    
    return stockRepository.create(data);
  }

  async deleteIngredient(id: string, userId?: string) {
    const exists = await stockRepository.findById(id);
    if (!exists) throw new AppError('Ingrediente no encontrado', 404);
    
    return stockRepository.delete(id, userId);
  }

  async setStock(
    id: string, 
    newStock: number, 
    userId: string, 
    type: movement_type = 'ADJUST', 
    reason?: string
  ) {
    if (newStock < 0) throw new AppError('El stock no puede ser negativo', 400);
    
    const ingredient = await stockRepository.findById(id);
    if (!ingredient) throw new AppError('Ingrediente no encontrado', 404);

    return stockRepository.updateStock(
      id, 
      newStock, 
      Number(ingredient.stock),
      userId, 
      type, 
      reason
    );
  }

  async getCategories() {
    return stockRepository.getCategories();
  }

  async createCategory(name: string) {
    if (!name?.trim()) throw new AppError('El nombre de categoría es requerido', 400);
    return stockRepository.createCategory(name);
  }

  async getStockMovements(branchId: string | null, startDate?: Date, endDate?: Date) {
    return stockRepository.getStockMovements(branchId, startDate, endDate);
  }

  async getStockReport(branchId: string | null) {
    return stockRepository.getStockReport(branchId);
  }
}