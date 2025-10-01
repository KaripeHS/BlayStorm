import { PrismaClient, BossBattleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class BossService {
  /**
   * Get available bosses for a student (by grade and level)
   */
  async getAvailableBosses(gradeLevel: number, studentLevel: number) {
    const bosses = await prisma.bossProblem.findMany({
      where: {
        gradeLevel: { lte: gradeLevel + 1, gte: gradeLevel - 1 }, // ±1 grade
        minLevel: { lte: studentLevel },
        isActive: true,
      },
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'desc' }],
    });

    return bosses;
  }

  /**
   * Get boss details
   */
  async getBoss(bossId: string) {
    const boss = await prisma.bossProblem.findUnique({
      where: { id: bossId },
    });

    if (!boss) {
      throw new Error('Boss not found');
    }

    return boss;
  }

  /**
   * Start a boss battle
   */
  async startBossBattle(studentId: string, bossId: string) {
    const [student, boss] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { currentLevel: true, gradeLevel: true },
      }),
      prisma.bossProblem.findUnique({
        where: { id: bossId },
      }),
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (!boss) {
      throw new Error('Boss not found');
    }

    // Check level requirement
    if (student.currentLevel < boss.minLevel) {
      throw new Error(
        `Level ${boss.minLevel} required (current: ${student.currentLevel})`
      );
    }

    // Check if there's an active battle with this boss
    const activeBattle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        bossId,
        status: 'IN_PROGRESS',
      },
    });

    if (activeBattle) {
      return activeBattle; // Resume existing battle
    }

    // Create new battle
    const battle = await prisma.bossBattle.create({
      data: {
        studentId,
        bossId,
        currentHealth: boss.health,
        status: 'IN_PROGRESS',
      },
      include: {
        boss: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        title: 'Boss Battle Started!',
        message: `You're now battling ${boss.name}! Defeat it to claim epic rewards!`,
        imageUrl: boss.imageUrl,
      },
    });

    return battle;
  }

  /**
   * Deal damage to boss (called on correct answer)
   */
  async dealDamage(studentId: string, bossId: string, damage: number) {
    const battle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        bossId,
        status: 'IN_PROGRESS',
      },
      include: {
        boss: true,
      },
    });

    if (!battle) {
      throw new Error('No active battle found');
    }

    const newHealth = Math.max(0, battle.currentHealth - damage);
    const newDamage = battle.damageDealt + damage;
    const problemsSolved = battle.problemsSolved + 1;

    // Check if boss is defeated
    const isDefeated = newHealth === 0;
    const newStatus: BossBattleStatus = isDefeated ? 'VICTORY' : 'IN_PROGRESS';

    const updatedBattle = await prisma.bossBattle.update({
      where: { id: battle.id },
      data: {
        currentHealth: newHealth,
        damageDealt: newDamage,
        problemsSolved,
        status: newStatus,
        completedAt: isDefeated ? new Date() : undefined,
      },
      include: {
        boss: true,
      },
    });

    // If defeated, award rewards
    if (isDefeated) {
      await this.awardBossRewards(studentId, bossId);
    }

    return updatedBattle;
  }

  /**
   * Take damage (incorrect answer in boss battle)
   */
  async takeDamage(studentId: string, bossId: string) {
    const battle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        bossId,
        status: 'IN_PROGRESS',
      },
    });

    if (!battle) {
      return null;
    }

    // Update attempt count
    await prisma.bossBattle.update({
      where: { id: battle.id },
      data: {
        attempts: { increment: 1 },
      },
    });

    return battle;
  }

  /**
   * Get active boss battle for a student
   */
  async getActiveBattle(studentId: string) {
    const battle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        status: 'IN_PROGRESS',
      },
      include: {
        boss: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return battle;
  }

  /**
   * Abandon boss battle
   */
  async abandonBattle(studentId: string, bossId: string) {
    const battle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        bossId,
        status: 'IN_PROGRESS',
      },
    });

    if (!battle) {
      throw new Error('No active battle found');
    }

    const updatedBattle = await prisma.bossBattle.update({
      where: { id: battle.id },
      data: {
        status: 'ABANDONED',
        completedAt: new Date(),
      },
      include: {
        boss: true,
      },
    });

    return updatedBattle;
  }

  /**
   * Get student's boss battle history
   */
  async getBattleHistory(studentId: string) {
    const battles = await prisma.bossBattle.findMany({
      where: { studentId },
      include: {
        boss: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return battles;
  }

  /**
   * Get boss statistics (for leaderboards)
   */
  async getBossStats(bossId: string) {
    const [totalBattles, victories, avgTime, fastestVictory] = await Promise.all([
      prisma.bossBattle.count({
        where: { bossId },
      }),
      prisma.bossBattle.count({
        where: { bossId, status: 'VICTORY' },
      }),
      prisma.bossBattle.aggregate({
        where: { bossId, status: 'VICTORY' },
        _avg: {
          timeSpent: true,
        },
      }),
      prisma.bossBattle.findFirst({
        where: { bossId, status: 'VICTORY' },
        orderBy: {
          timeSpent: 'asc',
        },
        include: {
          student: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalBattles,
      victories,
      victoryRate: totalBattles > 0 ? (victories / totalBattles) * 100 : 0,
      avgTimeToVictory: avgTime._avg.timeSpent || 0,
      fastestVictory: fastestVictory
        ? {
            studentName:
              fastestVictory.student.user.profile?.displayName || 'Unknown',
            timeSpent: fastestVictory.timeSpent,
          }
        : null,
    };
  }

  /**
   * Award rewards for defeating a boss
   */
  private async awardBossRewards(studentId: string, bossId: string) {
    const boss = await prisma.bossProblem.findUnique({
      where: { id: bossId },
    });

    if (!boss) {
      throw new Error('Boss not found');
    }

    // Check if already claimed
    const battle = await prisma.bossBattle.findFirst({
      where: {
        studentId,
        bossId,
        status: 'VICTORY',
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!battle || battle.rewardsClaimed) {
      return;
    }

    // Award rewards in transaction
    await prisma.$transaction(async (tx) => {
      // Award coins, XP, gems
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: { increment: boss.coinReward },
          totalXp: { increment: boss.xpReward },
          gems: boss.gemReward ? { increment: boss.gemReward } : undefined,
        },
      });

      // Mark rewards as claimed
      await tx.bossBattle.update({
        where: { id: battle.id },
        data: {
          rewardsClaimed: true,
        },
      });

      // Award treasure chest
      await tx.treasureChest.create({
        data: {
          studentId,
          chestType: 'BOSS_VICTORY',
          rarity: boss.difficulty >= 3 ? 'LEGENDARY' : 'EPIC',
          earnedFrom: `Boss: ${boss.name}`,
        },
      });

      // Award special rewards
      if (boss.specialReward) {
        const specialReward = boss.specialReward as any;

        if (specialReward.avatarItem) {
          await tx.studentAvatar.upsert({
            where: {
              studentId_avatarItemId: {
                studentId,
                avatarItemId: specialReward.avatarItem,
              },
            },
            create: {
              studentId,
              avatarItemId: specialReward.avatarItem,
              isPurchased: false,
            },
            update: {},
          });
        }

        if (specialReward.pet) {
          await tx.studentPet.upsert({
            where: {
              studentId_petId: {
                studentId,
                petId: specialReward.pet,
              },
            },
            create: {
              studentId,
              petId: specialReward.pet,
              happiness: 100,
            },
            update: {},
          });
        }
      }
    });

    // Create victory notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: `${boss.name} Defeated!`,
        message: `Victory! You earned ${boss.coinReward} coins, ${boss.xpReward} XP, and a legendary treasure chest!`,
        imageUrl: boss.imageUrl,
      },
    });

    // Update quest progress
    // (This would be handled by quest service listening to events)
  }

  /**
   * Get boss leaderboard (fastest defeats)
   */
  async getBossLeaderboard(bossId: string, limit: number = 10) {
    const topPlayers = await prisma.bossBattle.findMany({
      where: {
        bossId,
        status: 'VICTORY',
      },
      orderBy: {
        timeSpent: 'asc',
      },
      take: limit,
      include: {
        student: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return topPlayers.map((battle, index) => ({
      rank: index + 1,
      studentId: battle.studentId,
      displayName: battle.student.user.profile?.displayName || 'Unknown',
      timeSpent: battle.timeSpent,
      problemsSolved: battle.problemsSolved,
      completedAt: battle.completedAt,
    }));
  }

  /**
   * Create boss problem (admin)
   */
  async createBoss(data: {
    name: string;
    title: string;
    description: string;
    bossType: string;
    difficulty: number;
    gradeLevel: number;
    imageUrl: string;
    animationData?: any;
    health: number;
    problemIds: string[];
    coinReward: number;
    xpReward: number;
    gemReward?: number;
    specialReward?: any;
    minLevel?: number;
  }) {
    const boss = await prisma.bossProblem.create({
      data: {
        ...data,
        problemCount: data.problemIds.length,
        minLevel: data.minLevel || 1,
        isActive: true,
      },
    });

    return boss;
  }

  /**
   * Calculate damage based on problem difficulty
   */
  calculateDamage(problemDifficulty: number, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    // Base damage scales with difficulty
    const baseDamage = 10 + problemDifficulty * 5;

    return baseDamage;
  }
}

export default new BossService();