import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  getUserByUsername,
  updateProfile,
  getMyAchievements,
  getMyStats,
  UpdateProfileSchema,
} from '../controllers/users.controller';

const router = Router();

router.put('/me', authenticateToken, validateBody(UpdateProfileSchema), updateProfile);
router.get('/me/achievements', authenticateToken, getMyAchievements);
router.get('/me/stats', authenticateToken, getMyStats);
router.get('/:username', getUserByUsername);

export default router;
