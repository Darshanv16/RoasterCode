import { Router } from 'express';
import { optionalAuthenticate } from '../middleware/auth.middleware';
import { getLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', optionalAuthenticate, getLeaderboard);

export default router;
