import { prisma } from '../../server';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';
import { generateRoomCode } from '../../utils/helpers';

export class ClassroomService {
  async createClassroom(teacherId: string, data: {
    name: string;
    description?: string;
    gradeLevel: number;
    subject?: string;
    studentLimit?: number;
  }) {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundError('Teacher profile not found');
    }

    // Generate unique class code
    let classCode = generateRoomCode(6);
    let existing = await prisma.classroom.findUnique({
      where: { classCode },
    });

    while (existing) {
      classCode = generateRoomCode(6);
      existing = await prisma.classroom.findUnique({
        where: { classCode },
      });
    }

    const classroom = await prisma.classroom.create({
      data: {
        teacherId,
        name: data.name,
        description: data.description,
        gradeLevel: data.gradeLevel,
        subject: data.subject || 'Math',
        classCode,
        studentLimit: data.studentLimit,
      },
    });

    // Update teacher stats
    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        totalClassrooms: { increment: 1 },
      },
    });

    return classroom;
  }

  async getClassroom(classroomId: string, teacherId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teacher: {
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
        students: {
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
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    return classroom;
  }

  async listClassrooms(teacherId: string) {
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId },
      include: {
        students: true,
        assignments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms;
  }

  async updateClassroom(classroomId: string, teacherId: string, data: any) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    const updated = await prisma.classroom.update({
      where: { id: classroomId },
      data,
    });

    return updated;
  }

  async deleteClassroom(classroomId: string, teacherId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    await prisma.classroom.delete({
      where: { id: classroomId },
    });

    // Update teacher stats
    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        totalClassrooms: { decrement: 1 },
      },
    });

    return { message: 'Classroom deleted successfully' };
  }

  async addStudent(classroomId: string, teacherId: string, studentUsername: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    // Check student limit
    if (classroom.studentLimit && classroom.currentStudents >= classroom.studentLimit) {
      throw new ValidationError('Classroom is full');
    }

    // Find student by username
    const profile = await prisma.profile.findUnique({
      where: { username: studentUsername },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
      },
    });

    if (!profile || !profile.user.studentProfile) {
      throw new NotFoundError('Student not found');
    }

    const studentId = profile.user.studentProfile.id;

    // Check if already enrolled
    const existing = await prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });

    if (existing) {
      throw new ValidationError('Student is already enrolled in this classroom');
    }

    // Add student
    const enrollment = await prisma.classroomStudent.create({
      data: {
        classroomId,
        studentId,
        status: 'ACTIVE',
      },
    });

    // Update counts
    await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        currentStudents: { increment: 1 },
      },
    });

    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        totalStudents: { increment: 1 },
      },
    });

    return enrollment;
  }

  async removeStudent(classroomId: string, teacherId: string, studentId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    const enrollment = await prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Student not found in this classroom');
    }

    await prisma.classroomStudent.delete({
      where: { id: enrollment.id },
    });

    // Update counts
    await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        currentStudents: { decrement: 1 },
      },
    });

    await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: {
        totalStudents: { decrement: 1 },
      },
    });

    return { message: 'Student removed successfully' };
  }

  async joinClassroomByCode(studentId: string, classCode: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { classCode: classCode.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (!classroom.isActive) {
      throw new ValidationError('This classroom is not accepting new students');
    }

    // Check student limit
    if (classroom.studentLimit && classroom.currentStudents >= classroom.studentLimit) {
      throw new ValidationError('Classroom is full');
    }

    // Check if already enrolled
    const existing = await prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId,
        },
      },
    });

    if (existing) {
      throw new ValidationError('You are already enrolled in this classroom');
    }

    // Enroll student
    const enrollment = await prisma.classroomStudent.create({
      data: {
        classroomId: classroom.id,
        studentId,
        status: 'ACTIVE',
      },
    });

    // Update counts
    await prisma.classroom.update({
      where: { id: classroom.id },
      data: {
        currentStudents: { increment: 1 },
      },
    });

    await prisma.teacherProfile.update({
      where: { id: classroom.teacherId },
      data: {
        totalStudents: { increment: 1 },
      },
    });

    return {
      enrollment,
      classroom,
    };
  }

  async getClassroomAnalytics(classroomId: string, teacherId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundError('Classroom not found');
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenError('You do not have access to this classroom');
    }

    // Get student performance data
    const students = await prisma.classroomStudent.findMany({
      where: { classroomId },
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
        assignmentSubmissions: {
          where: {
            status: 'GRADED',
          },
        },
      },
    });

    // Calculate overall stats
    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === 'ACTIVE').length,
      averageScore: 0,
      completionRate: 0,
      students: students.map((s) => {
        const submissions = s.assignmentSubmissions;
        const avgScore = submissions.length > 0
          ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length
          : 0;

        return {
          id: s.studentId,
          name: s.student.user.profile?.displayName,
          username: s.student.user.profile?.username,
          status: s.status,
          assignmentsCompleted: submissions.length,
          averageScore: Math.round(avgScore),
        };
      }),
    };

    return stats;
  }
}

export default new ClassroomService();