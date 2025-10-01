import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import classroomService from '../services/teacher/classroom.service';
import assignmentService from '../services/teacher/assignment.service';
import { prisma } from '../server';

// Classroom Controllers
export const createClassroom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const classroom = await classroomService.createClassroom(teacher.id, req.body);

    res.status(201).json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassroom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const classroom = await classroomService.getClassroom(classroomId, teacher.id);

    res.json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    next(error);
  }
};

export const listClassrooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const classrooms = await classroomService.listClassrooms(teacher.id);

    res.json({
      success: true,
      data: classrooms,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClassroom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const classroom = await classroomService.updateClassroom(classroomId, teacher.id, req.body);

    res.json({
      success: true,
      data: classroom,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClassroom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const result = await classroomService.deleteClassroom(classroomId, teacher.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;
    const { studentUsername } = req.body;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const enrollment = await classroomService.addStudent(classroomId, teacher.id, studentUsername);

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const removeStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId, studentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const result = await classroomService.removeStudent(classroomId, teacher.id, studentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassroomAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const analytics = await classroomService.getClassroomAnalytics(classroomId, teacher.id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Assignment Controllers
export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const assignment = await assignmentService.createAssignment(teacher.id, classroomId, req.body);

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const assignment = await assignmentService.getAssignment(assignmentId, teacher.id);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const listAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { classroomId } = req.query;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const assignments = await assignmentService.listAssignments(teacher.id, classroomId as string);

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const assignment = await assignmentService.updateAssignment(assignmentId, teacher.id, req.body);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const publishAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const assignment = await assignmentService.publishAssignment(assignmentId, teacher.id);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const result = await assignmentService.deleteAssignment(assignmentId, teacher.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { submissionId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const submission = await assignmentService.gradeSubmission(submissionId, teacher.id, req.body);

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { assignmentId } = req.params;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found',
      });
    }

    const stats = await assignmentService.getAssignmentStats(assignmentId, teacher.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};