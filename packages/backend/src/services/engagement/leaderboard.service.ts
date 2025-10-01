import { PrismaClient, LeaderboardType, LeaderboardScope } from '@prisma/client';

const prisma = new PrismaClient();

export class LeaderboardService {
  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: LeaderboardType,
    scope: LeaderboardScope,
    filters?: {
      gradeLevel?: number;
      guildId?: string;
      period?: 'daily' | 'weekly' | 'monthly' | 'alltime';
    }
  ) {
    // Get or create leaderboard
    const leaderboard = await this.getOrCreateLeaderboard(type, scope, filters);

    const entries = await prisma.leaderboardEntry.findMany({
      where: { leaderboardId: leaderboard.id },
      orderBy: { rank: 'asc' },
      take: 100,
      include: {
        leaderboard: true,
      },
    });

    // Enrich with student data
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const student = await prisma.studentProfile.findUnique({
          where: { id: entry.studentId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        });

        return {
          ...entry,
          displayName: student?.user.profile?.displayName || 'Unknown',
          level: student?.currentLevel || 1,
        };
      })
    );

    return {
      leaderboard,
      entries: enrichedEntries,
    };
  }

  /**
   * Get player rank and nearby players
   */
  async getPlayerRank(
    studentId: string,
    type: LeaderboardType,
    scope: LeaderboardScope,
    range: number = 5
  ) {
    const leaderboard = await this.getOrCreateLeaderboard(type, scope);

    const playerEntry = await prisma.leaderboardEntry.findUnique({
      where: {
        leaderboardId_studentId: {
          leaderboardId: leaderboard.id,
          studentId,
        },
      },
    });

    if (!playerEntry) {
      return {
        rank: null,
        score: 0,
        nearby: [],
      };
    }

    // Get nearby players (range above and below)
    const nearby = await prisma.leaderboardEntry.findMany({
      where: {
        leaderboardId: leaderboard.id,
        rank: {
          gte: Math.max(1, playerEntry.rank - range),
          lte: playerEntry.rank + range,
        },
      },
      orderBy: { rank: 'asc' },
    });

    // Enrich with student data
    const enrichedNearby = await Promise.all(
      nearby.map(async (entry) => {
        const student = await prisma.studentProfile.findUnique({
          where: { id: entry.studentId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        });

        return {
          ...entry,
          displayName: student?.user.profile?.displayName || 'Unknown',
          isCurrentPlayer: entry.studentId === studentId,
        };
      })
    );

    return {
      rank: playerEntry.rank,
      score: playerEntry.score,
      previousRank: playerEntry.previousRank,
      nearby: enrichedNearby,
    };
  }

  /**
   * Update all leaderboards (cron job - runs daily)
   */
  async updateLeaderboards() {
    const types: LeaderboardType[] = ['XP', 'PROBLEMS_SOLVED', 'ACCURACY', 'STREAK', 'GUILD_CONTRIBUTION'];
    const scopes: LeaderboardScope[] = ['GLOBAL', 'GRADE_LEVEL'];

    for (const type of types) {
      for (const scope of scopes) {
        try {
          await this.recalculateLeaderboard(type, scope);
        } catch (error) {
          console.error(`Failed to update leaderboard ${type}/${scope}:`, error);
        }
      }
    }

    console.log('Updated all leaderboards');
  }

  /**
   * Recalculate leaderboard rankings
   */
  private async recalculateLeaderboard(type: LeaderboardType, scope: LeaderboardScope) {
    // Mark current leaderboards as not current
    await prisma.leaderboard.updateMany({
      where: {
        type,
        scope,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    // Create new leaderboard for current period
    const now = new Date();
    const period = 'weekly';
    const startDate = this.getPeriodStart(period);
    const endDate = this.getPeriodEnd(period);

    const leaderboard = await prisma.leaderboard.create({
      data: {
        type,
        scope,
        period,
        startDate,
        endDate,
        isCurrent: true,
      },
    });

    // Get data based on type
    const data = await this.getLeaderboardData(type, scope);

    // Create entries
    const entries = data.map((item, index) => ({
      leaderboardId: leaderboard.id,
      studentId: item.studentId,
      rank: index + 1,
      score: item.score,
      previousRank: item.previousRank,
    }));

    // Batch create entries
    await prisma.leaderboardEntry.createMany({
      data: entries,
    });

    return leaderboard;
  }

  /**
   * Get leaderboard data based on type
   */
  private async getLeaderboardData(type: LeaderboardType, scope: LeaderboardScope) {
    let data: any[] = [];

    switch (type) {
      case 'XP':
        data = await prisma.studentProfile.findMany({
          orderBy: { totalXp: 'desc' },
          take: 1000,
          select: {
            id: true,
            totalXp: true,
            gradeLevel: true,
            guildId: true,
          },
        });
        return data.map((s) => ({
          studentId: s.id,
          score: s.totalXp,
          gradeLevel: s.gradeLevel,
          guildId: s.guildId,
          previousRank: null,
        }));

      case 'PROBLEMS_SOLVED':
        data = await prisma.studentProfile.findMany({
          orderBy: { totalProblems: 'desc' },
          take: 1000,
          select: {
            id: true,
            totalProblems: true,
            gradeLevel: true,
            guildId: true,
          },
        });
        return data.map((s) => ({
          studentId: s.id,
          score: s.totalProblems,
          gradeLevel: s.gradeLevel,
          guildId: s.guildId,
          previousRank: null,
        }));

      case 'ACCURACY':
        data = await prisma.studentProfile.findMany({
          where: {
            totalProblems: { gte: 10 }, // Minimum 10 problems
          },
          orderBy: { averageAccuracy: 'desc' },
          take: 1000,
          select: {
            id: true,
            averageAccuracy: true,
            gradeLevel: true,
            guildId: true,
          },
        });
        return data.map((s) => ({
          studentId: s.id,
          score: Math.round(s.averageAccuracy * 100),
          gradeLevel: s.gradeLevel,
          guildId: s.guildId,
          previousRank: null,
        }));

      case 'STREAK':
        data = await prisma.studentProfile.findMany({
          orderBy: { bestStreak: 'desc' },
          take: 1000,
          select: {
            id: true,
            bestStreak: true,
            gradeLevel: true,
            guildId: true,
          },
        });
        return data.map((s) => ({
          studentId: s.id,
          score: s.bestStreak,
          gradeLevel: s.gradeLevel,
          guildId: s.guildId,
          previousRank: null,
        }));

      case 'GUILD_CONTRIBUTION':
        data = await prisma.guildMember.findMany({
          orderBy: { contributionXp: 'desc' },
          take: 1000,
          select: {
            studentId: true,
            contributionXp: true,
            guildId: true,
            student: {
              select: {
                gradeLevel: true,
              },
            },
          },
        });
        return data.map((m) => ({
          studentId: m.studentId,
          score: m.contributionXp,
          gradeLevel: m.student.gradeLevel,
          guildId: m.guildId,
          previousRank: null,
        }));

      default:
        return [];
    }
  }

  /**
   * Get or create leaderboard
   */
  private async getOrCreateLeaderboard(
    type: LeaderboardType,
    scope: LeaderboardScope,
    filters?: any
  ) {
    let where: any = {
      type,
      scope,
      isCurrent: true,
    };

    if (filters?.gradeLevel) {
      where.gradeLevel = filters.gradeLevel;
    }

    let leaderboard = await prisma.leaderboard.findFirst({
      where,
    });

    if (!leaderboard) {
      // Create new leaderboard
      const period = filters?.period || 'weekly';
      leaderboard = await prisma.leaderboard.create({
        data: {
          type,
          scope,
          gradeLevel: filters?.gradeLevel,
          period,
          startDate: this.getPeriodStart(period),
          endDate: this.getPeriodEnd(period),
          isCurrent: true,
        },
      });

      // Trigger calculation
      await this.recalculateLeaderboard(type, scope);
    }

    return leaderboard;
  }

  /**
   * Get period start date
   */
  private getPeriodStart(period: string): Date {
    const now = new Date();

    switch (period) {
      case 'daily':
        return new Date(now.setHours(0, 0, 0, 0));

      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return new Date(weekStart.setHours(0, 0, 0, 0));

      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);

      default:
        return new Date(2024, 0, 1); // All-time start
    }
  }

  /**
   * Get period end date
   */
  private getPeriodEnd(period: string): Date {
    const now = new Date();

    switch (period) {
      case 'daily':
        return new Date(now.setHours(23, 59, 59, 999));

      case 'weekly':
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (6 - now.getDay()));
        return new Date(weekEnd.setHours(23, 59, 59, 999));

      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      default:
        return new Date(2030, 11, 31); // All-time end
    }
  }

  /**
   * Get multiple leaderboards at once
   */
  async getMultipleLeaderboards(requests: Array<{ type: LeaderboardType; scope: LeaderboardScope }>) {
    const results = await Promise.all(
      requests.map((req) => this.getLeaderboard(req.type, req.scope))
    );

    return results;
  }
}

export default new LeaderboardService();