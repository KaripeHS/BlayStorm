import express from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require student role
router.use(authenticate, requireRole('STUDENT'));

// Classroom routes
router.post('/classrooms/join', studentController.joinClassroom);
router.get('/classrooms', studentController.getMyClassrooms);

// Assignment routes
router.get('/assignments', studentController.getMyAssignments);
router.post('/assignments/:assignmentId/start', studentController.startAssignment);
router.post('/submissions/:submissionId/submit', studentController.submitAssignment);

export default router;