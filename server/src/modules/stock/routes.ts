import { Router } from 'express';
import { StockController } from './controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';
import { roleMiddleware } from '../../common/middlewares/roleMiddleware';
import { validate } from '../../common/middlewares/validationMiddleware';
import { z } from 'zod';

const router = Router();
const stockController = new StockController();

const updateStockSchema = z.object({
  body: z.object({
    stock: z.number().min(0)
  })
});

router.use(authMiddleware);

router.get('/', stockController.getStock);
router.patch(
  '/:id',
  roleMiddleware(['ADMIN']),
  validate(updateStockSchema),
  stockController.update
);

export default router;
