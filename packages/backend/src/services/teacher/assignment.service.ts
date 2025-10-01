import { prisma } from '../../server';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';

export class AssignmentService {
  async createAssignment(teacherId: string, classroomId: string, data: {
    title: string;
    description: string;
    instructions?: string;
    problemIds: string[];
    dueDate?: Date;
    passingScore?: number;
    allowLateSubmit?: boolean;
    maxAttempts?: number;
    timeLimit?: number;
    pointsWorth?: number;
  }) {
    // Verify teacher owns classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    // Verify problems exist
    const problems = await prisma.problem.findMany({
      where: {
        id: { in: data.problemIds },
      },
    });

    if (problems.length !== data.problemIds.length) {
      throw new ValidationError('Some problems do not exist');
    }

    const assignment = await prisma.assignment.create({
      data: {
        classroomId,
        teacherId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        problemIds: data.problemIds,
        totalProblems: data.problemIds.length,
        dueDate: data.dueDate,
        passingScore: data.passingScore || 70,
        allowLateSubmit: data.allowLateSubmit !== false,
        maxAttempts: data.maxAttempts,
        timeLimit: data.timeLimit,
        pointsWorth: data.pointsWorth || 100,
      },
    });

    return assignment;
  }

  async getAssignment(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: true,
        submissions: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    profile: {
                      select: {
                        displayName: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this assignment');
    }

    return assignment;
  }

  async listAssignments(teacherId: string, classroomId?: string) {
    const where: any = { teacherId };
    if (classroomId) {
      where.classroomId = classroomId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        classroom: true,
        submissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments;
  }

  async updateAssignment(assignmentId: string, teacherId: string, data: any) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this assignment');
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data,
    });

    return updated;
  }

  async publishAssignment(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this assignment');
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { isPublished: true },
    });

    // Create submission records for all students
    const students = await prisma.classroomStudent.findMany({
      where: {
        classroomId: assignment.classroomId,
        status: 'ACTIVE',
      },
    });

    for (const student of students) {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId: student.studentId,
          classroomStudentId: student.id,
          status: 'NOT_STARTED',
        },
      });
    }

    return updated;
  }

  async deleteAssignment(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this assignment');
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return { message: 'Assignment deleted successfully' };
  }

  async gradeSubmission(submissionId: string, teacherId: string, data: {
    score?: number;
    passed?: boolean;
    teacherComments?: string;
  }) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    if (submission.assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this submission');
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        ...data,
        status: 'GRADED',
        gradedAt: new Date(),
      },
    });

    return updated;
  }

  async getAssignmentStats(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    if (assignment.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this assignment');
    }

    const submissions = assignment.submissions;

    const stats = {
      totalStudents: submissions.length,
      notStarted: submissions.filter((s) => s.status === 'NOT_STARTED').length,
      inProgress: submissions.filter((s) => s.status === 'IN_PROGRESS').length,
      submitted: submissions.filter((s) => s.status === 'SUBMITTED').length,
      graded: submissions.filter((s) => s.status === 'GRADED').length,
      late: submissions.filter((s) => s.status === 'LATE').length,
      averageScore: 0,
      passRate: 0,
    };

    const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED' && s.score !== null);

    if (gradedSubmissions.length > 0) {
      stats.averageScore = Math.round(
        gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      );

      const passed = gradedSubmissions.filter((s) => s.passed).length;
      stats.passRate = Math.round((passed / gradedSubmissions.length) * 100);
    }

    return stats;
  }

  // Student methods
  async getStudentAssignments(studentId: string, classroomId?: string) {
    const where: any = {
      studentId,
    };

    if (classroomId) {
      where.classroomStudent = {
        classroomId,
      };
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        assignment: {
          include: {
            classroom: true,
          },
        },
      },
      orderBy: { assignment: { dueDate: 'asc' } },
    });

    return submissions;
  }

  async startAssignment(studentId: string, assignmentId: string) {
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId,
        status: 'NOT_STARTED',
      },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      throw new NotFoundError('Assignment submission not found or already started');
    }

    // Check if past due and late submissions not allowed
    if (submission.assignment.dueDate && submission.assignment.dueDate < new Date()) {
      if (!submission.assignment.allowLateSubmit) {
        throw new ValidationError('This assignment is past due and no longer accepts submissions');
      }
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    return updated;
  }

  async submitAssignment(studentId: string, submissionId: string, results: {
    problemsAttempted: number;
    problemsCorrect: number;
    timeSpent: number;
  }) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenError('You do not have access to this submission');
    }

    if (submission.status !== 'IN_PROGRESS') {
      throw new ValidationError('This assignment is not in progress');
    }

    // Calculate score
    const score = Math.round((results.problemsCorrect / results.problemsAttempted) * 100);
    const passed = score >= submission.assignment.passingScore;

    // Check if late
    const isLate = submission.assignment.dueDate && submission.assignment.dueDate < new Date();

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        problemsAttempted: results.problemsAttempted,
        problemsCorrect: results.problemsCorrect,
        timeSpent: results.timeSpent,
        score,
        passed,
        status: isLate ? 'LATE' : 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return updated;
  }
}

export default new AssignmentService();