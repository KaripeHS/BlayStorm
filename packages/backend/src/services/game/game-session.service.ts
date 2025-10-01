import { prisma } from '../../server';
import { GameMode } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';
import { calculateLevel, calculateXpForLevel } from '../../utils/helpers';
import { XP_REWARDS, COIN_REWARDS } from '../../config/constants';

// Phase 3 - Engagement services
import questService from '../engagement/quest.service';
import comboService from '../engagement/combo.service';
import bossService from '../engagement/boss.service';
import treasureService from '../engagement/treasure.service';
import petService from '../engagement/pet.service';
import battlePassService from '../engagement/battlepass.service';
import analyticsService from '../engagement/analytics.service';
import notificationService from '../engagement/notification.service';
import guildService from '../engagement/guild.service';

export class GameSessionService {
  async startSession(studentId: string, mode: GameMode, deviceType?: string) {
    // Get student profile
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    // Create game session
    const session = await prisma.gameSession.create({
      data: {
        studentId,
        mode,
        deviceType: deviceType || 'web',
      },
    });

    // Update last active date and check streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = student.lastActiveDate ? new Date(student.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    let currentStreak = student.currentStreak;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
      // Streak broken
      currentStreak = 1;
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // Continues streak
      currentStreak += 1;
    }

    const bestStreak = Math.max(currentStreak, student.bestStreak);

    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        lastActiveDate: new Date(),
        currentStreak,
        bestStreak,
      },
    });

    // Create daily streak entry
    await prisma.dailyStreak.upsert({
      where: {
        studentId_date: {
          studentId,
          date: today,
        },
      },
      create: {
        studentId,
        date: today,
        problemsSolved: 0,
        timeSpent: 0,
        xpEarned: 0,
      },
      update: {},
    });

    return {
      session,
      currentStreak,
    };
  }

  async endSession(sessionId: string) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        attempts: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.endedAt) {
      return session; // Already ended
    }

    // Calculate session metrics
    const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    const accuracy = session.problemsAttempted > 0
      ? (session.problemsCorrect / session.problemsAttempted) * 100
      : 0;

    const averageTime = session.problemsAttempted > 0
      ? session.attempts.reduce((sum, a) => sum + a.timeSpent, 0) / session.problemsAttempted
      : 0;

    // Update session
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        duration,
        accuracy,
        averageTime,
      },
    });

    // Update daily streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyStreak.update({
      where: {
        studentId_date: {
          studentId: session.studentId,
          date: today,
        },
      },
      data: {
        problemsSolved: { increment: session.problemsCorrect },
        timeSpent: { increment: Math.floor(duration / 60) },
        xpEarned: { increment: session.xpEarned },
      },
    });

    // Phase 3 - Record analytics
    const topics = Array.from(new Set(session.attempts.map((a) => a.problem?.topic).filter(Boolean))) as string[];
    await analyticsService.recordSession(session.studentId, {
      problemsSolved: session.problemsCorrect,
      correctAnswers: session.problemsCorrect,
      timeSpent: Math.floor(duration / 60),
      topicsStudied: topics,
      coinsEarned: session.coinsEarned,
      xpEarned: session.xpEarned,
    });

    return updatedSession;
  }

  async recordAttempt(
    sessionId: string,
    studentId: string,
    problemId: string,
    userAnswer: string,
    isCorrect: boolean,
    timeSpent: number,
    hintsUsed: number = 0
  ) {
    // Get problem and session
    const [problem, session, student] = await Promise.all([
      prisma.problem.findUnique({ where: { id: problemId } }),
      prisma.gameSession.findUnique({ where: { id: sessionId } }),
      prisma.studentProfile.findUnique({ where: { id: studentId } }),
    ]);

    if (!problem || !session || !student) {
      throw new NotFoundError('Resource not found');
    }

    // Count attempt number for this problem
    const attemptCount = await prisma.problemAttempt.count({
      where: { studentId, problemId },
    });

    // Calculate rewards
    let xpEarned = 0;
    let coinsEarned = 0;

    if (isCorrect) {
      xpEarned = problem.pointValue;

      // Bonus for first try
      if (attemptCount === 0) {
        xpEarned += XP_REWARDS.FIRST_TRY;
      }

      // Speed bonus (if under estimated time)
      if (timeSpent < problem.estimatedTime) {
        xpEarned += XP_REWARDS.SPEED_BONUS;
      }

      // Streak multiplier
      if (student.currentStreak > 2) {
        xpEarned = Math.floor(xpEarned * XP_REWARDS.STREAK_MULTIPLIER);
      }

      coinsEarned = COIN_REWARDS.CORRECT_ANSWER;
    }

    // Record attempt
    const attempt = await prisma.problemAttempt.create({
      data: {
        studentId,
        problemId,
        sessionId,
        userAnswer,
        isCorrect,
        attemptNumber: attemptCount + 1,
        timeSpent,
        hintsUsed,
        difficulty: problem.difficulty,
        xpEarned,
        coinsEarned,
      },
    });

    // Update session stats
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        problemsAttempted: { increment: 1 },
        ...(isCorrect && { problemsCorrect: { increment: 1 } }),
        ...(!isCorrect && { problemsIncorrect: { increment: 1 } }),
        xpEarned: { increment: xpEarned },
        coinsEarned: { increment: coinsEarned },
      },
    });

    // Update student stats
    const newTotalXp = student.totalXp + xpEarned;
    const levelData = calculateLevel(newTotalXp);

    const updates: any = {
      totalProblems: { increment: 1 },
      totalXp: newTotalXp,
      currentLevel: levelData.level,
      xpToNextLevel: levelData.xpForNext,
      coins: { increment: coinsEarned },
      totalTimeSpent: { increment: Math.floor(timeSpent / 60) },
    };

    if (isCorrect) {
      updates.totalCorrect = { increment: 1 };
    } else {
      updates.totalIncorrect = { increment: 1 };
    }

    // Recalculate accuracy
    const newAccuracy =
      ((student.totalCorrect + (isCorrect ? 1 : 0)) / (student.totalProblems + 1)) * 100;
    updates.averageAccuracy = newAccuracy;

    await prisma.studentProfile.update({
      where: { id: studentId },
      data: updates,
    });

    // Update problem statistics
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        timesAttempted: { increment: 1 },
        ...(isCorrect && { timesCorrect: { increment: 1 } }),
      },
    });

    // Update topic progress
    await this.updateTopicProgress(studentId, problem.topic, isCorrect);

    // Check for achievements
    await this.checkAchievements(studentId, student, attempt);

    // Check for level up
    const didLevelUp = levelData.level > student.currentLevel;
    if (didLevelUp) {
      await notificationService.notifyLevelUp(studentId, levelData.level);
    }

    // ===== Phase 3 Engagement Systems =====

    // 1. Update quest progress
    await questService.updateQuestProgress(studentId, 'SOLVE_PROBLEMS', 1);
    if (isCorrect) {
      await questService.updateQuestProgress(studentId, 'PERFECT_ACCURACY', 1);
    }
    if (problem.difficulty >= 8) {
      await questService.updateQuestProgress(studentId, 'HARD_PROBLEMS', 1);
    }

    // 2. Update combo system
    let comboData;
    if (isCorrect) {
      comboData = await comboService.incrementCombo(studentId, sessionId);
    } else {
      comboData = await comboService.breakCombo(studentId, sessionId);
    }

    // 3. Update battle pass
    await battlePassService.awardBattlePassXp(studentId, Math.floor(xpEarned * 0.5));

    // 4. Award pet XP
    await petService.awardPetXp(studentId, Math.floor(xpEarned * 0.3));

    // 5. Contribute XP to guild
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { guildId: true },
    });
    if (studentProfile?.guildId) {
      await guildService.contributeXp(studentId, xpEarned);
    }

    // 6. Boss battle damage (if in boss session)
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: { mode: true },
    });
    let bossDamage;
    if (session?.mode === 'BOSS_BATTLE' && isCorrect) {
      bossDamage = await bossService.dealDamage(studentId, problemId, problem.difficulty * 10);
    }

    // 7. Random treasure chest drop (5% chance on correct answer)
    let randomChest;
    if (isCorrect) {
      randomChest = await treasureService.maybeAwardRandomChest(
        studentId,
        `Problem: ${problem.topic} (Difficulty ${problem.difficulty})`
      );
    }

    return {
      attempt,
      xpEarned,
      coinsEarned,
      didLevelUp,
      newLevel: levelData.level,
      newTotalXp,
      // Phase 3 data
      comboData,
      bossDamage,
      randomChest,
    };
  }

  private async updateTopicProgress(studentId: string, topic: string, isCorrect: boolean) {
    const progress = await prisma.topicProgress.upsert({
      where: {
        studentId_topic: {
          studentId,
          topic,
        },
      },
      create: {
        studentId,
        topic,
        problemsAttempted: 1,
        problemsCorrect: isCorrect ? 1 : 0,
        currentMastery: isCorrect ? 0.1 : 0,
      },
      update: {
        problemsAttempted: { increment: 1 },
        ...(isCorrect && { problemsCorrect: { increment: 1 } }),
        lastPracticedAt: new Date(),
      },
    });

    // Recalculate mastery (simple formula)
    const mastery = progress.problemsCorrect / progress.problemsAttempted;

    await prisma.topicProgress.update({
      where: { id: progress.id },
      data: {
        currentMastery: mastery,
      },
    });
  }

  private async checkAchievements(studentId: string, student: any, attempt: any) {
    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    // Get student's current achievements
    const studentAchievements = await prisma.studentAchievement.findMany({
      where: { studentId },
      select: { achievementId: true },
    });

    const unlockedIds = studentAchievements.map((sa) => sa.achievementId);

    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirementType) {
        case 'problems_solved':
          shouldUnlock = student.totalProblems >= achievement.requirementValue;
          break;
        case 'streak':
          shouldUnlock = student.currentStreak >= achievement.requirementValue;
          break;
        case 'level':
          shouldUnlock = student.currentLevel >= achievement.requirementValue;
          break;
        case 'correct_streak':
          // Check recent attempts
          const recentAttempts = await prisma.problemAttempt.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: achievement.requirementValue,
          });
          shouldUnlock =
            recentAttempts.length === achievement.requirementValue &&
            recentAttempts.every((a) => a.isCorrect);
          break;
      }

      if (shouldUnlock) {
        await prisma.studentAchievement.create({
          data: {
            studentId,
            achievementId: achievement.id,
          },
        });

        // Award XP and coins
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            totalXp: { increment: achievement.xpReward },
            coins: { increment: achievement.coinReward },
            gems: { increment: achievement.gemReward },
          },
        });
      }
    }
  }
}

export default new GameSessionService();