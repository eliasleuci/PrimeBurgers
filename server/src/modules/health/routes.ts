import { Router } from 'express';
import { HealthController } from './controller';

const router = Router();
const controller = new HealthController();

router.get('/', controller.getStatus);
router.get('/db', controller.getDbStatus);

export default router;
