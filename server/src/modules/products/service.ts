import { ProductRepository } from './repository';
import { AppError } from '../../common/exceptions/AppError';
import { Prisma } from '@prisma/client';

const productRepository = new ProductRepository();

export class ProductService {
  async getAll(branchId?: string | null) {
    if (!branchId) {
      return productRepository.findByBranch(""); 
    }
    return productRepository.findByBranch(branchId);
  }

    async create(data: Prisma.ProductCreateInput) {
    return productRepository.create(data);
  }

  async getOne(id: string) {
    const product = await productRepository.findByIdWithRecipe(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async remove(id: string) {
    const product = await productRepository.findByIdWithRecipe(id);
    if (!product) throw new AppError('Product not found', 404);    
    return productRepository.softDelete(id);
  }
}
