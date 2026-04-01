import { prisma } from '../../config/database';

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, isActive: true },
      include: { branch: true }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, isActive: true }
    });
  }
}
