import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import {
  register,
  login,
  logout,
  refresh,
  me,
  RegisterSchema,
  LoginSchema,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, validateBody(RegisterSchema), register);
router.post('/login', authLimiter, validateBody(LoginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticateToken, me);

export default router;
