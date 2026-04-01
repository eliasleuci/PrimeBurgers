import { Router } from 'express';
import { ReportController } from './controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';
import { roleMiddleware } from '../../common/middlewares/roleMiddleware';

const router = Router();
const reportController = new ReportController();

router.use(authMiddleware);

router.get(
  '/daily',
  roleMiddleware(['ADMIN']),
  reportController.getDaily
);

export default router;
