import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  getBalance,
  petSolve,
  petHint,
  PetSolveSchema,
  PetHintSchema,
} from '../controllers/credits.controller';

const router = Router();

router.get('/balance', authenticateToken, getBalance);
router.post('/pet-solve', authenticateToken, validateBody(PetSolveSchema), petSolve);
router.post('/pet-hint', authenticateToken, validateBody(PetHintSchema), petHint);

export default router;
