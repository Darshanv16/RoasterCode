import { Router } from 'express';
import { authenticateToken, optionalAuthenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  listProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem,
  togglePublish,
  CreateProblemSchema,
  UpdateProblemSchema,
} from '../controllers/problems.controller';

const router = Router();

router.get('/', optionalAuthenticate, listProblems);
router.post('/', authenticateToken, requireAdmin, validateBody(CreateProblemSchema), createProblem);
router.put('/:id', authenticateToken, requireAdmin, validateBody(UpdateProblemSchema), updateProblem);
router.delete('/:id', authenticateToken, requireAdmin, deleteProblem);
router.post('/:id/publish', authenticateToken, requireAdmin, togglePublish);
router.get('/:slug', getProblemBySlug);

export default router;
