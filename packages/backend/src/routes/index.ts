import express from 'express';
import authRoutes from './auth.routes';
import gameRoutes from './game.routes';
import aiTutorRoutes from './ai-tutor.routes';
import subscriptionRoutes from './subscription.routes';
import teacherRoutes from './teacher.routes';
import studentRoutes from './student.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/ai-tutor', aiTutorRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

export default router;