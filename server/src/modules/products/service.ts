import { ProductRepository } from './repository';
import { AppError } from '../../common/exceptions/AppError';
import { Prisma } from '@prisma/client';

const productRepository = new ProductRepository();

export class ProductService {
  async getAllByBranch(branchId: string) {
    return productRepository.findByBranch(branchId);
  }

  async getOne(id: string) {
    const product = await productRepository.findByIdWithRecipe(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async create(data: Prisma.ProductCreateInput) {
    return productRepository.create(data);
  }

  async remove(id: string) {
    const product = await productRepository.findByIdWithRecipe(id);
    if (!product) throw new AppError('Product not found', 404);
    return productRepository.softDelete(id);
  }
}
