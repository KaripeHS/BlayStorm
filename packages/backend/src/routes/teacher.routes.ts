import express from 'express';
import * as teacherController from '../controllers/teacher.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require teacher role
router.use(authenticate, requireRole('TEACHER', 'ADMIN'));

// Classroom routes
router.post('/classrooms', teacherController.createClassroom);
router.get('/classrooms', teacherController.listClassrooms);
router.get('/classrooms/:classroomId', teacherController.getClassroom);
router.put('/classrooms/:classroomId', teacherController.updateClassroom);
router.delete('/classrooms/:classroomId', teacherController.deleteClassroom);

// Student management
router.post('/classrooms/:classroomId/students', teacherController.addStudent);
router.delete('/classrooms/:classroomId/students/:studentId', teacherController.removeStudent);

// Analytics
router.get('/classrooms/:classroomId/analytics', teacherController.getClassroomAnalytics);

// Assignment routes
router.post('/classrooms/:classroomId/assignments', teacherController.createAssignment);
router.get('/assignments', teacherController.listAssignments);
router.get('/assignments/:assignmentId', teacherController.getAssignment);
router.put('/assignments/:assignmentId', teacherController.updateAssignment);
router.post('/assignments/:assignmentId/publish', teacherController.publishAssignment);
router.delete('/assignments/:assignmentId', teacherController.deleteAssignment);

// Grading
router.post('/submissions/:submissionId/grade', teacherController.gradeSubmission);
router.get('/assignments/:assignmentId/stats', teacherController.getAssignmentStats);

export default router;