// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Record a player session
   */
  async recordSession(
    studentId: string,
    data: {
      problemsSolved: number;
      correctAnswers: number;
      timeSpent: number;
      topicsStudied: string[];
      coinsEarned: number;
      xpEarned: number;
    }
  ) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const analytics = await prisma.playerAnalytics.upsert({
      where: {
        studentId_date: {
          studentId,
          date,
        },
      },
      create: {
        studentId,
        date,
        sessionsPlayed: 1,
        problemsSolved: data.problemsSolved,
        correctAnswers: data.correctAnswers,
        timeSpent: data.timeSpent,
        topicsStudied: data.topicsStudied,
        coinsEarned: data.coinsEarned,
        xpEarned: data.xpEarned,
      },
      update: {
        sessionsPlayed: { increment: 1 },
        problemsSolved: { increment: data.problemsSolved },
        correctAnswers: { increment: data.correctAnswers },
        timeSpent: { increment: data.timeSpent },
        topicsStudied: {
          set: Array.from(
            new Set([
              ...(await this.getExistingTopics(studentId, date)),
              ...data.topicsStudied,
            ])
          ),
        },
        coinsEarned: { increment: data.coinsEarned },
        xpEarned: { increment: data.xpEarned },
      },
    });

    return analytics;
  }

  /**
   * Get existing topics for a date
   */
  private async getExistingTopics(studentId: string, date: Date): Promise<string[]> {
    const existing = await prisma.playerAnalytics.findUnique({
      where: {
        studentId_date: {
          studentId,
          date,
        },
      },
      select: {
        topicsStudied: true,
      },
    });

    return existing?.topicsStudied || [];
  }

  /**
   * Calculate Daily Active Users (DAU)
   */
  async calculateDAU(date?: Date): Promise<number> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = await prisma.playerAnalytics.count({
      where: {
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    return count;
  }

  /**
   * Calculate Monthly Active Users (MAU)
   */
  async calculateMAU(date?: Date): Promise<number> {
    const targetDate = date || new Date();
    const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const firstDayOfNextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

    const uniqueStudents = await prisma.playerAnalytics.findMany({
      where: {
        date: {
          gte: firstDayOfMonth,
          lt: firstDayOfNextMonth,
        },
      },
      distinct: ['studentId'],
      select: {
        studentId: true,
      },
    });

    return uniqueStudents.length;
  }

  /**
   * Calculate retention rate for a cohort
   */
  async getRetentionRate(cohortDate: Date, daysAfter: number): Promise<number> {
    // Get students who joined on cohortDate
    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);
    const cohortEnd = new Date(cohortStart);
    cohortEnd.setDate(cohortEnd.getDate() + 1);

    const cohortStudents = await prisma.studentProfile.findMany({
      where: {
        createdAt: {
          gte: cohortStart,
          lt: cohortEnd,
        },
      },
      select: {
        id: true,
      },
    });

    if (cohortStudents.length === 0) {
      return 0;
    }

    // Check how many were active daysAfter later
    const checkDate = new Date(cohortStart);
    checkDate.setDate(checkDate.getDate() + daysAfter);
    const checkDateEnd = new Date(checkDate);
    checkDateEnd.setDate(checkDateEnd.getDate() + 1);

    const activeStudents = await prisma.playerAnalytics.count({
      where: {
        studentId: {
          in: cohortStudents.map((s) => s.id),
        },
        date: {
          gte: checkDate,
          lt: checkDateEnd,
        },
      },
    });

    return (activeStudents / cohortStudents.length) * 100;
  }

  /**
   * Get student analytics for a date range
   */
  async getStudentAnalytics(
    studentId: string,
    startDate: Date,
    endDate: Date
  ) {
    const analytics = await prisma.playerAnalytics.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const totals = analytics.reduce(
      (acc, day) => ({
        sessionsPlayed: acc.sessionsPlayed + day.sessionsPlayed,
        problemsSolved: acc.problemsSolved + day.problemsSolved,
        correctAnswers: acc.correctAnswers + day.correctAnswers,
        timeSpent: acc.timeSpent + day.timeSpent,
        coinsEarned: acc.coinsEarned + day.coinsEarned,
        xpEarned: acc.xpEarned + day.xpEarned,
      }),
      {
        sessionsPlayed: 0,
        problemsSolved: 0,
        correctAnswers: 0,
        timeSpent: 0,
        coinsEarned: 0,
        xpEarned: 0,
      }
    );

    const averageAccuracy =
      totals.problemsSolved > 0
        ? (totals.correctAnswers / totals.problemsSolved) * 100
        : 0;

    return {
      daily: analytics,
      totals,
      averageAccuracy: Math.round(averageAccuracy),
      averageSessionLength: analytics.length > 0 ? totals.timeSpent / analytics.length : 0,
    };
  }

  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(startDate: Date, endDate: Date) {
    const analytics = await prisma.playerAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totals = analytics.reduce(
      (acc, record) => ({
        sessionsPlayed: acc.sessionsPlayed + record.sessionsPlayed,
        problemsSolved: acc.problemsSolved + record.problemsSolved,
        correctAnswers: acc.correctAnswers + record.correctAnswers,
        timeSpent: acc.timeSpent + record.timeSpent,
        coinsEarned: acc.coinsEarned + record.coinsEarned,
        xpEarned: acc.xpEarned + record.xpEarned,
      }),
      {
        sessionsPlayed: 0,
        problemsSolved: 0,
        correctAnswers: 0,
        timeSpent: 0,
        coinsEarned: 0,
        xpEarned: 0,
      }
    );

    // Get unique students
    const uniqueStudents = await prisma.playerAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      distinct: ['studentId'],
      select: {
        studentId: true,
      },
    });

    const averageAccuracy =
      totals.problemsSolved > 0
        ? (totals.correctAnswers / totals.problemsSolved) * 100
        : 0;

    return {
      uniqueStudents: uniqueStudents.length,
      totals,
      averages: {
        sessionsPerStudent: uniqueStudents.length > 0 ? totals.sessionsPlayed / uniqueStudents.length : 0,
        problemsPerStudent: uniqueStudents.length > 0 ? totals.problemsSolved / uniqueStudents.length : 0,
        accuracy: Math.round(averageAccuracy),
        timePerSession: totals.sessionsPlayed > 0 ? totals.timeSpent / totals.sessionsPlayed : 0,
      },
    };
  }

  /**
   * Track engagement metric
   */
  async trackEngagementMetric(
    metricType: string,
    data: {
      studentId?: string;
      value: number;
      metadata?: any;
    }
  ) {
    const metric = await prisma.engagementMetric.create({
      data: {
        metricType,
        studentId: data.studentId,
        value: data.value,
        metadata: data.metadata || {},
      },
    });

    return metric;
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(
    metricType: string,
    startDate: Date,
    endDate: Date,
    studentId?: string
  ) {
    const where: any = {
      metricType,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const metrics = await prisma.engagementMetric.findMany({
      where,
      orderBy: {
        timestamp: 'asc',
      },
    });

    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    const average = metrics.length > 0 ? total / metrics.length : 0;

    return {
      metrics,
      total,
      average,
      count: metrics.length,
    };
  }

  /**
   * Get top performing students
   */
  async getTopPerformers(startDate: Date, endDate: Date, limit: number = 10) {
    const analytics = await prisma.playerAnalytics.groupBy({
      by: ['studentId'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        problemsSolved: true,
        correctAnswers: true,
        xpEarned: true,
      },
      orderBy: {
        _sum: {
          xpEarned: 'desc',
        },
      },
      take: limit,
    });

    const topPerformers = await Promise.all(
      analytics.map(async (record) => {
        const student = await prisma.studentProfile.findUnique({
          where: { id: record.studentId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        });

        const accuracy =
          record._sum.problemsSolved! > 0
            ? (record._sum.correctAnswers! / record._sum.problemsSolved!) * 100
            : 0;

        return {
          studentId: record.studentId,
          displayName: student?.user.profile?.displayName,
          problemsSolved: record._sum.problemsSolved,
          correctAnswers: record._sum.correctAnswers,
          xpEarned: record._sum.xpEarned,
          accuracy: Math.round(accuracy),
        };
      })
    );

    return topPerformers;
  }

  /**
   * Generate daily report (cron job)
   */
  async generateDailyReport() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    const [dau, platformAnalytics, topPerformers] = await Promise.all([
      this.calculateDAU(yesterday),
      this.getPlatformAnalytics(yesterday, yesterday),
      this.getTopPerformers(yesterday, yesterday, 5),
    ]);

    console.log('=== Daily Report ===');
    console.log(`Date: ${yesterday.toDateString()}`);
    console.log(`DAU: ${dau}`);
    console.log(`Total Sessions: ${platformAnalytics.totals.sessionsPlayed}`);
    console.log(`Total Problems Solved: ${platformAnalytics.totals.problemsSolved}`);
    console.log(`Average Accuracy: ${platformAnalytics.averages.accuracy}%`);
    console.log(`Top 5 Performers:`, topPerformers);

    return {
      date: yesterday,
      dau,
      platformAnalytics,
      topPerformers,
    };
  }

  /**
   * Clean old analytics data (cron job - keep 90 days)
   */
  async cleanOldAnalytics() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const deleted = await prisma.playerAnalytics.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned ${deleted.count} old analytics records`);
    return deleted.count;
  }
}

export default new AnalyticsService();