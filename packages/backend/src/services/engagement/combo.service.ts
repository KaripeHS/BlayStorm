import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ComboService {
  /**
   * Increment combo on correct answer
   */
  async incrementCombo(studentId: string, sessionId?: string) {
    // Get or create current combo record
    let comboRecord = await prisma.comboRecord.findFirst({
      where: {
        studentId,
        sessionId: sessionId || null,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!comboRecord) {
      // Start new combo
      comboRecord = await prisma.comboRecord.create({
        data: {
          studentId,
          sessionId,
          comboCount: 1,
          maxCombo: 1,
          comboMultiplier: this.calculateMultiplier(1),
        },
      });
    } else {
      // Increment existing combo
      const newCount = comboRecord.comboCount + 1;
      const newMultiplier = this.calculateMultiplier(newCount);

      comboRecord = await prisma.comboRecord.update({
        where: { id: comboRecord.id },
        data: {
          comboCount: newCount,
          maxCombo: Math.max(comboRecord.maxCombo, newCount),
          comboMultiplier: newMultiplier,
        },
      });

      // Check for combo milestones and award bonuses
      if (newCount % 5 === 0) {
        // Award bonus every 5 combo
        await this.awardComboBonus(studentId, newCount);
      }

      // Check for achievements
      await this.checkComboAchievements(studentId, newCount);
    }

    return comboRecord;
  }

  /**
   * Break combo on wrong answer
   */
  async breakCombo(studentId: string, sessionId?: string) {
    const comboRecord = await prisma.comboRecord.findFirst({
      where: {
        studentId,
        sessionId: sessionId || null,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!comboRecord) {
      return null; // No active combo
    }

    // End the combo
    const endedCombo = await prisma.comboRecord.update({
      where: { id: comboRecord.id },
      data: {
        endedAt: new Date(),
      },
    });

    // Create notification if combo was significant (5+)
    if (comboRecord.maxCombo >= 5) {
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'SYSTEM',
          title: 'Combo Ended',
          message: `Your ${comboRecord.maxCombo}x combo has ended. Keep practicing!`,
        },
      });
    }

    return endedCombo;
  }

  /**
   * Get current combo for a student
   */
  async getCurrentCombo(studentId: string, sessionId?: string) {
    const comboRecord = await prisma.comboRecord.findFirst({
      where: {
        studentId,
        sessionId: sessionId || null,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return comboRecord;
  }

  /**
   * Get max combo ever achieved by student
   */
  async getMaxCombo(studentId: string) {
    const maxCombo = await prisma.comboRecord.findFirst({
      where: { studentId },
      orderBy: { maxCombo: 'desc' },
      select: { maxCombo: true },
    });

    return maxCombo?.maxCombo || 0;
  }

  /**
   * Get combo multiplier based on count
   */
  calculateMultiplier(comboCount: number): number {
    if (comboCount < 3) return 1.0;
    if (comboCount < 5) return 1.25;
    if (comboCount < 10) return 1.5;
    if (comboCount < 20) return 2.0;
    if (comboCount < 50) return 2.5;
    return 3.0; // Max 3x multiplier
  }

  /**
   * Award bonus rewards for combo milestones
   */
  private async awardComboBonus(studentId: string, comboCount: number) {
    const baseBonus = 10;
    const bonusCoins = baseBonus * Math.floor(comboCount / 5);
    const bonusXp = bonusCoins * 2;

    // Award bonus
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        coins: { increment: bonusCoins },
        totalXp: { increment: bonusXp },
      },
    });

    // Update combo record with bonus
    const comboRecord = await prisma.comboRecord.findFirst({
      where: {
        studentId,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (comboRecord) {
      await prisma.comboRecord.update({
        where: { id: comboRecord.id },
        data: {
          bonusCoins: { increment: bonusCoins },
          bonusXp: { increment: bonusXp },
        },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        title: `${comboCount}x Combo!`,
        message: `Amazing streak! You earned ${bonusCoins} bonus coins and ${bonusXp} XP!`,
      },
    });
  }

  /**
   * Check and award combo-based achievements
   */
  private async checkComboAchievements(
    studentId: string,
    comboCount: number
  ) {
    const achievementKeys = [];

    if (comboCount >= 5) achievementKeys.push('combo_5');
    if (comboCount >= 10) achievementKeys.push('combo_10');
    if (comboCount >= 25) achievementKeys.push('combo_25');
    if (comboCount >= 50) achievementKeys.push('combo_50');
    if (comboCount >= 100) achievementKeys.push('combo_100');

    for (const key of achievementKeys) {
      const achievement = await prisma.achievement.findUnique({
        where: { key },
      });

      if (achievement) {
        // Check if already unlocked
        const existing = await prisma.studentAchievement.findUnique({
          where: {
            studentId_achievementId: {
              studentId,
              achievementId: achievement.id,
            },
          },
        });

        if (!existing) {
          // Unlock achievement
          await prisma.studentAchievement.create({
            data: {
              studentId,
              achievementId: achievement.id,
            },
          });

          // Award rewards
          await prisma.studentProfile.update({
            where: { id: studentId },
            data: {
              totalXp: { increment: achievement.xpReward },
              coins: { increment: achievement.coinReward },
              gems: achievement.gemReward
                ? { increment: achievement.gemReward }
                : undefined,
            },
          });

          // Notification
          await prisma.notification.create({
            data: {
              userId: studentId,
              type: 'ACHIEVEMENT',
              title: 'Achievement Unlocked!',
              message: `${achievement.name}: ${achievement.description}`,
            },
          });
        }
      }
    }
  }

  /**
   * Get combo stats for a student
   */
  async getComboStats(studentId: string) {
    const [maxComboRecord, totalCombos, currentCombo] = await Promise.all([
      prisma.comboRecord.findFirst({
        where: { studentId },
        orderBy: { maxCombo: 'desc' },
      }),
      prisma.comboRecord.count({
        where: { studentId },
      }),
      this.getCurrentCombo(studentId),
    ]);

    return {
      currentCombo: currentCombo?.comboCount || 0,
      currentMultiplier: currentCombo?.comboMultiplier || 1.0,
      maxCombo: maxComboRecord?.maxCombo || 0,
      totalComboSessions: totalCombos,
    };
  }

  /**
   * Get top combo players (leaderboard)
   */
  async getTopComboPlayers(limit: number = 10) {
    const topPlayers = await prisma.comboRecord.groupBy({
      by: ['studentId'],
      _max: {
        maxCombo: true,
      },
      orderBy: {
        _max: {
          maxCombo: 'desc',
        },
      },
      take: limit,
    });

    const playersWithDetails = await Promise.all(
      topPlayers.map(async (player) => {
        const student = await prisma.studentProfile.findUnique({
          where: { id: player.studentId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        });

        return {
          studentId: player.studentId,
          displayName: student?.user.profile?.displayName || 'Unknown',
          maxCombo: player._max.maxCombo || 0,
        };
      })
    );

    return playersWithDetails;
  }
}

export default new ComboService();