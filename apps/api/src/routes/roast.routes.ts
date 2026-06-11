import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';

const RoastRequestSchema = z.object({
  verdict: z.string(),
  code: z.string().max(50000),
  language: z.string(),
  problem: z.object({
    title: z.string(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    statement: z.string().max(5000),
  }),
  expectedOutput: z.string().nullable().optional(),
  actualOutput: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});
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
