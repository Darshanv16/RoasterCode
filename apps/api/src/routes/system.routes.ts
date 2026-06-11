import { Router } from 'express';
import { getLanguages } from '../controllers/system.controller';

const router = Router();

router.get('/languages', getLanguages);

export default router;
