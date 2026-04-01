import { Router } from 'express';
import { AuthController } from './controller';
import { validate } from '../../common/middlewares/validationMiddleware';
import { z } from 'zod';

const router = Router();
const authController = new AuthController();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

router.post('/login', validate(loginSchema), authController.login);

export default router;
