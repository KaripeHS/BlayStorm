import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import gameSessionService from '../services/game/game-session.service';
import problemService from '../services/game/problem.service';
import { prisma } from '../server';

export const startSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mode, deviceType } = req.body;

    // Get student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const result = await gameSessionService.startSession(student.id, mode, deviceType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const session = await gameSessionService.endSession(sessionId);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getNextProblem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { topic, gradeLevel, difficulty, type } = req.query;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const problem = await problemService.getNextProblem(student.id, {
      topic: topic as string,
      gradeLevel: gradeLevel ? parseInt(gradeLevel as string) : undefined,
      difficulty: difficulty ? parseInt(difficulty as string) : undefined,
      type: type as any,
    });

    res.json({
      success: true,
      data: problem,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sessionId, problemId, answer, timeSpent, hintsUsed } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Check answer
    const isCorrect = await problemService.checkAnswer(problemId, answer);

    // Record attempt
    const result = await gameSessionService.recordAttempt(
      sessionId,
      student.id,
      problemId,
      answer,
      isCorrect,
      timeSpent,
      hintsUsed
    );

    // Get problem explanation
    const problem = await problemService.getProblemById(problemId);

    res.json({
      success: true,
      data: {
        ...result,
        isCorrect,
        explanation: problem.explanation,
        correctAnswer: problem.answer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { problemId, hintIndex } = req.query;

    const hint = await problemService.getHint(
      problemId as string,
      parseInt(hintIndex as string) || 0
    );

    res.json({
      success: true,
      data: hint,
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Get topic progress
    const topicProgress = await prisma.topicProgress.findMany({
      where: { studentId: student.id },
      orderBy: { lastPracticedAt: 'desc' },
    });

    // Get recent sessions
    const recentSessions = await prisma.gameSession.findMany({
      where: { studentId: student.id },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        student,
        topicProgress,
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { scope = 'global', gradeLevel } = req.query;

    const where: any = {};

    if (scope === 'grade' && gradeLevel) {
      where.gradeLevel = parseInt(gradeLevel as string);
    }

    const topStudents = await prisma.studentProfile.findMany({
      where,
      orderBy: { totalXp: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: topStudents,
    });
  } catch (error) {
    next(error);
  }
};