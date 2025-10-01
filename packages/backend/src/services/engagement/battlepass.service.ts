import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BattlePassService {
  /**
   * Get current battle pass
   */
  async getCurrentBattlePass() {
    const battlePass = await prisma.battlePass.findFirst({
      where: { isCurrent: true },
      orderBy: { seasonNumber: 'desc' },
    });

    return battlePass;
  }

  /**
   * Get battle pass progress for a student
   */
  async getBattlePassProgress(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        battlePassLevel: true,
        battlePassXp: true,
        isPremiumPass: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const battlePass = await this.getCurrentBattlePass();

    if (!battlePass) {
      return null;
    }

    const rewards = battlePass.rewards as any;
    const unlockedRewards = rewards.filter((r: any) => r.level <= student.battlePassLevel);

    return {
      level: student.battlePassLevel,
      xp: student.battlePassXp,
      xpToNextLevel: battlePass.xpPerLevel,
      isPremium: student.isPremiumPass,
      unlockedRewards,
      battlePass,
    };
  }

  /**
   * Award battle pass XP
   */
  async awardBattlePassXp(studentId: string, xp: number) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        battlePassLevel: true,
        battlePassXp: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const battlePass = await this.getCurrentBattlePass();
    if (!battlePass) {
      return null; // No active battle pass
    }

    const newXp = student.battlePassXp + xp;
    const levelsGained = Math.floor(newXp / battlePass.xpPerLevel);

    if (levelsGained > 0) {
      const newLevel = Math.min(student.battlePassLevel + levelsGained, battlePass.maxLevel);

      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          battlePassLevel: newLevel,
          battlePassXp: newXp % battlePass.xpPerLevel,
        },
      });

      // Create notification for level up
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'SYSTEM',
          title: 'Battle Pass Level Up!',
          message: `You reached Battle Pass level ${newLevel}! Claim your rewards!`,
        },
      });

      return { levelsGained, newLevel };
    }

    // Just add XP
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        battlePassXp: newXp,
      },
    });

    return { levelsGained: 0, newLevel: student.battlePassLevel };
  }

  /**
   * Claim reward from battle pass
   */
  async claimReward(studentId: string, level: number, track: 'free' | 'premium') {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        battlePassLevel: true,
        isPremiumPass: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (level > student.battlePassLevel) {
      throw new Error('Level not unlocked yet');
    }

    if (track === 'premium' && !student.isPremiumPass) {
      throw new Error('Premium pass required');
    }

    const battlePass = await this.getCurrentBattlePass();
    if (!battlePass) {
      throw new Error('No active battle pass');
    }

    const rewards = battlePass.rewards as any;
    const reward = rewards.find((r: any) => r.level === level && r.track === track);

    if (!reward) {
      throw new Error('Reward not found');
    }

    // TODO: Check if already claimed (need ClaimedReward table)

    // Award rewards
    await this.awardRewards(studentId, reward);

    return reward;
  }

  /**
   * Get unclaimed rewards for a student
   */
  async getUnclaimedRewards(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        battlePassLevel: true,
        isPremiumPass: true,
      },
    });

    if (!student) {
      return [];
    }

    const battlePass = await this.getCurrentBattlePass();
    if (!battlePass) {
      return [];
    }

    const rewards = battlePass.rewards as any;

    // Filter rewards that are unlocked but not claimed
    const unclaimed = rewards.filter((r: any) => {
      if (r.level > student.battlePassLevel) return false;
      if (r.track === 'premium' && !student.isPremiumPass) return false;
      // TODO: Check if claimed (need ClaimedReward table)
      return true;
    });

    return unclaimed;
  }

  /**
   * Upgrade to premium pass
   */
  async upgradeToPremium(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { isPremiumPass: true, gems: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.isPremiumPass) {
      throw new Error('Already have premium pass');
    }

    const PREMIUM_COST = 500; // 500 gems

    if (student.gems < PREMIUM_COST) {
      throw new Error(`Not enough gems (need ${PREMIUM_COST}, have ${student.gems})`);
    }

    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        isPremiumPass: true,
        gems: { decrement: PREMIUM_COST },
      },
    });

    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Premium Pass Unlocked!',
        message: 'You now have access to all premium rewards!',
      },
    });

    return { success: true };
  }

  /**
   * Award rewards based on reward data
   */
  private async awardRewards(studentId: string, reward: any) {
    await prisma.$transaction(async (tx) => {
      if (reward.coins) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { coins: { increment: reward.coins } },
        });
      }

      if (reward.gems) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { gems: { increment: reward.gems } },
        });
      }

      if (reward.xp) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { totalXp: { increment: reward.xp } },
        });
      }

      // Award items (avatars, pets, etc.)
      if (reward.items) {
        for (const item of reward.items) {
          if (item.type === 'avatar') {
            await tx.studentAvatar.upsert({
              where: {
                studentId_avatarItemId: {
                  studentId,
                  avatarItemId: item.id,
                },
              },
              create: {
                studentId,
                avatarItemId: item.id,
                isPurchased: false,
              },
              update: {},
            });
          } else if (item.type === 'pet') {
            await tx.studentPet.upsert({
              where: {
                studentId_petId: {
                  studentId,
                  petId: item.id,
                },
              },
              create: {
                studentId,
                petId: item.id,
                happiness: 100,
              },
              update: {},
            });
          }
        }
      }
    });
  }

  /**
   * Create battle pass season (admin)
   */
  async createBattlePass(data: {
    seasonNumber: number;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    maxLevel?: number;
    xpPerLevel?: number;
    rewards: any;
  }) {
    // Mark old passes as not current
    await prisma.battlePass.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    const battlePass = await prisma.battlePass.create({
      data: {
        ...data,
        isCurrent: true,
        maxLevel: data.maxLevel || 100,
        xpPerLevel: data.xpPerLevel || 1000,
      },
    });

    return battlePass;
  }
}

export default new BattlePassService();