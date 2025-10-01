import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import aiTutorService from '../services/ai/ai-tutor.service';
import { prisma } from '../server';

export const getHint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { problemId, previousHints } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const hint = await aiTutorService.getHint(
      student.id,
      problemId,
      previousHints || []
    );

    res.json({
      success: true,
      data: { hint },
    });
  } catch (error) {
    next(error);
  }
};

export const explainMistake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { problemId, userAnswer } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const explanation = await aiTutorService.explainMistake(
      student.id,
      problemId,
      userAnswer
    );

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    next(error);
  }
};

export const getEncouragement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { context } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const encouragement = await aiTutorService.provideEncouragement(student.id, context);

    res.json({
      success: true,
      data: { encouragement },
    });
  } catch (error) {
    next(error);
  }
};