import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getLearningPath,
  getChapter,
  startChapter,
} from '../controllers/learning.controller';

const router = Router();

router.get('/path', authenticateToken, getLearningPath);
router.get('/chapter/:id', authenticateToken, getChapter);
router.post('/chapter/:id/start', authenticateToken, startChapter);

export default router;
