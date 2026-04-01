import { Router } from 'express';
import { ProductController } from './controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';
import { roleMiddleware } from '../../common/middlewares/roleMiddleware';

const router = Router();
const productController = new ProductController();

router.use(authMiddleware);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);

router.delete(
  '/:id',
  roleMiddleware(['ADMIN']),
  productController.delete
);

export default router;
