import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { submissionLimiter } from '../middleware/rateLimit.middleware';
import {
  createSubmission,
  getSubmission,
  getSubmissionsByProblem,
  getMySubmissions,
  runCode,
  CreateSubmissionSchema,
  RunCodeSchema,
} from '../controllers/submissions.controller';

const router = Router();

router.post(
  '/',
  authenticateToken,
  submissionLimiter,
  validateBody(CreateSubmissionSchema),
  createSubmission
);
router.post(
  '/run',
  authenticateToken,
  submissionLimiter,
  validateBody(RunCodeSchema),
  runCode
);
router.get('/user/me', authenticateToken, getMySubmissions);
router.get('/problem/:problemId', authenticateToken, getSubmissionsByProblem);
router.get('/:id', authenticateToken, getSubmission);

export default router;
