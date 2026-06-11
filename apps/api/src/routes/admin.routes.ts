import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import {
  getStats,
  getAdminProblems,
  getAdminProblemById,
  togglePublish,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getStats);
router.get('/problems', getAdminProblems);
router.get('/problems/:id', getAdminProblemById);
router.put('/problems/:id/toggle-publish', togglePublish);

export default router;
