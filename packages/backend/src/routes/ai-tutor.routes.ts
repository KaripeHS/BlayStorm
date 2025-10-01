import express from 'express';
import * as aiTutorController from '../controllers/ai-tutor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkAITutorAccess } from '../middleware/subscription.middleware';
import { aiTutorLimiter } from '../middleware/rate-limit.middleware';

const router = express.Router();

router.post('/hint', authenticate, checkAITutorAccess, aiTutorLimiter, aiTutorController.getHint);
router.post('/explain', authenticate, checkAITutorAccess, aiTutorLimiter, aiTutorController.explainMistake);
router.post('/encourage', authenticate, checkAITutorAccess, aiTutorController.getEncouragement);

export default router;