import express from 'express';
import * as gameController from '../controllers/game.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkDailyLimit } from '../middleware/subscription.middleware';

const router = express.Router();

router.post('/session/start', authenticate, checkDailyLimit, gameController.startSession);
router.post('/session/:sessionId/end', authenticate, gameController.endSession);
router.get('/problem/next', authenticate, checkDailyLimit, gameController.getNextProblem);
router.post('/problem/submit', authenticate, gameController.submitAnswer);
router.get('/problem/hint', authenticate, gameController.getHint);
router.get('/progress', authenticate, gameController.getProgress);
router.get('/leaderboard', authenticate, gameController.getLeaderboard);

export default router;