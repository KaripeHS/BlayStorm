import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import classroomService from '../services/teacher/classroom.service';
import assignmentService from '../services/teacher/assignment.service';
import { prisma } from '../server';

export const joinClassroom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classCode } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const result = await classroomService.joinClassroomByCode(student.id, classCode);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClassrooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const enrollments = await prisma.classroomStudent.findMany({
      where: {
        studentId: student.id,
        status: 'ACTIVE',
      },
      include: {
        classroom: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        displayName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.query;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const assignments = await assignmentService.getStudentAssignments(
      student.id,
      classroomId as string
    );

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

export const startAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const submission = await assignmentService.startAssignment(student.id, assignmentId);

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { submissionId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const submission = await assignmentService.submitAssignment(student.id, submissionId, req.body);

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};