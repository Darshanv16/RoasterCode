import { Router } from 'express';
import { RoastRequestSchema } from '@roastcoder/shared';
import { authenticateToken } from '../middleware/auth.middleware';
import { roastLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createRoast, getRoastBySubmission } from '../controllers/roast.controller';

const router = Router();

router.post(
  '/',
  authenticateToken,
  roastLimiter,
  validateBody(RoastRequestSchema),
  createRoast
);

router.get('/submission/:submissionId', authenticateToken, getRoastBySubmission);

export default router;
