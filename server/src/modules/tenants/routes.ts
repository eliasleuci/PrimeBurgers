import { Router } from 'express';
import { TenantsController } from './tenants.controller';
import { authMiddleware } from '../../common/middlewares/authMiddleware';
import { roleMiddleware } from '../../common/middlewares/roleMiddleware';

const router = Router();
const tenantsController = new TenantsController();

// Only SUPERADMIN can access these routes
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

router.get('/', tenantsController.getAllTenants);
router.post('/', tenantsController.createTenant);
router.patch('/:id/status', tenantsController.toggleTenantStatus);
router.post('/:id/reset-password', tenantsController.resetTenantPassword);

export default router;
