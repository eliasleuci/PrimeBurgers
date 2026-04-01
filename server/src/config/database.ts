import { PrismaClient } from '@prisma/client';
import { logger } from '../common/utils/logger';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

prisma.$connect()
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection error:', err));
