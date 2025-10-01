import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../server';
import { ForbiddenError } from '../utils/errors';
import { FREE_TIER_DAILY_LIMIT, FREE_TIER_AI_CALLS_DAILY, PREMIUM_AI_CALLS_DAILY } from '../config/constants';

export const checkDailyLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authenticated');
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new ForbiddenError('No active subscription');
    }

    // Premium/Family/School have unlimited problems
    if (['PREMIUM', 'FAMILY', 'SCHOOL'].includes(subscription.tier)) {
      return next();
    }

    // Free tier - check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(subscription.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    // Reset counter if it's a new day
    if (today.getTime() > lastReset.getTime()) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          problemsUsedToday: 0,
          aiCallsUsedToday: 0,
          lastResetDate: new Date(),
        },
      });
      return next();
    }

    // Check if limit exceeded
    if (subscription.problemsUsedToday >= FREE_TIER_DAILY_LIMIT) {
      throw new ForbiddenError('Daily problem limit reached. Upgrade to Premium for unlimited access!');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkAITutorAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authenticated');
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new ForbiddenError('No active subscription');
    }

    // Free tier - no AI tutor access
    if (subscription.tier === 'FREE') {
      throw new ForbiddenError('AI Tutor is a Premium feature. Upgrade to access!');
    }

    // Premium tiers - check daily AI call limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(subscription.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    // Reset counter if it's a new day
    if (today.getTime() > lastReset.getTime()) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          problemsUsedToday: 0,
          aiCallsUsedToday: 0,
          lastResetDate: new Date(),
        },
      });
      return next();
    }

    // Check AI call limit
    if (subscription.aiCallsUsedToday >= PREMIUM_AI_CALLS_DAILY) {
      throw new ForbiddenError('Daily AI tutor limit reached. Try again tomorrow!');
    }

    next();
  } catch (error) {
    next(error);
  }
};