import { PrismaClient, QuestType, QuestDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

export class QuestService {
  /**
   * Assign 3 daily quests to a student
   */
  async assignDailyQuests(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { currentLevel: true, gradeLevel: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Check if student already has active quests for today
    const existingQuests = await prisma.dailyQuest.findMany({
      where: {
        studentId,
        expiresAt: { gt: new Date() },
        isClaimed: false,
      },
    });

    if (existingQuests.length >= 3) {
      return existingQuests; // Already has quests
    }

    // Get available quest templates
    const templates = await prisma.questTemplate.findMany({
      where: {
        isActive: true,
        questType: 'DAILY',
        minLevel: { lte: student.currentLevel },
        OR: [{ maxLevel: null }, { maxLevel: { gte: student.currentLevel } }],
      },
    });

    if (templates.length === 0) {
      throw new Error('No quest templates available');
    }

    // Select 3 quests with varied difficulty
    const selectedTemplates = this.selectQuestTemplates(templates, 3);

    // Create quest instances
    const quests = [];
    for (const template of selectedTemplates) {
      const requirement = template.requirement as any;

      const quest = await prisma.dailyQuest.create({
        data: {
          studentId,
          templateId: template.id,
          targetProgress: requirement.target || 10,
          expiresAt: this.getQuestExpiration('DAILY'),
        },
        include: {
          template: true,
        },
      });

      quests.push(quest);
    }

    return quests;
  }

  /**
   * Get active quests for a student
   */
  async getActiveQuests(studentId: string) {
    const quests = await prisma.dailyQuest.findMany({
      where: {
        studentId,
        expiresAt: { gt: new Date() },
      },
      include: {
        template: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return quests;
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    studentId: string,
    questType: string,
    increment: number = 1
  ) {
    const quests = await prisma.dailyQuest.findMany({
      where: {
        studentId,
        isCompleted: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        template: true,
      },
    });

    const updatedQuests = [];

    for (const quest of quests) {
      const requirement = quest.template.requirement as any;

      // Check if this quest matches the event type
      if (requirement.type === questType) {
        const newProgress = quest.progress + increment;
        const isCompleted = newProgress >= quest.targetProgress;

        const updated = await prisma.dailyQuest.update({
          where: { id: quest.id },
          data: {
            progress: newProgress,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined,
          },
          include: {
            template: true,
          },
        });

        updatedQuests.push(updated);

        // Create notification on completion
        if (isCompleted) {
          await prisma.notification.create({
            data: {
              userId: studentId,
              type: 'QUEST_COMPLETE',
              title: 'Quest Complete!',
              message: `You've completed "${quest.template.name}"! Claim your rewards!`,
            },
          });
        }
      }
    }

    return updatedQuests;
  }

  /**
   * Complete a quest and award rewards
   */
  async completeQuest(studentId: string, questId: string) {
    const quest = await prisma.dailyQuest.findUnique({
      where: { id: questId },
      include: {
        template: true,
      },
    });

    if (!quest) {
      throw new Error('Quest not found');
    }

    if (quest.studentId !== studentId) {
      throw new Error('Quest does not belong to this student');
    }

    if (!quest.isCompleted) {
      throw new Error('Quest not completed');
    }

    if (quest.isClaimed) {
      throw new Error('Rewards already claimed');
    }

    // Award rewards
    const result = await prisma.$transaction(async (tx) => {
      // Update quest
      const updatedQuest = await tx.dailyQuest.update({
        where: { id: questId },
        data: {
          isClaimed: true,
          claimedAt: new Date(),
        },
        include: {
          template: true,
        },
      });

      // Award coins, XP, gems
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: { increment: quest.template.coinReward },
          totalXp: { increment: quest.template.xpReward },
          gems: quest.template.gemReward
            ? { increment: quest.template.gemReward }
            : undefined,
        },
      });

      // Award any item rewards
      if (quest.template.itemRewards) {
        const itemRewards = quest.template.itemRewards as any;
        if (itemRewards.avatarItems) {
          for (const itemId of itemRewards.avatarItems) {
            await tx.studentAvatar.upsert({
              where: {
                studentId_avatarItemId: {
                  studentId,
                  avatarItemId: itemId,
                },
              },
              create: {
                studentId,
                avatarItemId: itemId,
                isPurchased: false,
              },
              update: {},
            });
          }
        }
      }

      return updatedQuest;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Quest Rewards Claimed!',
        message: `You received ${quest.template.coinReward} coins and ${quest.template.xpReward} XP!`,
      },
    });

    return result;
  }

  /**
   * Claim rewards for a completed quest
   */
  async claimRewards(studentId: string, questId: string) {
    return this.completeQuest(studentId, questId);
  }

  /**
   * Reset and assign new daily quests (cron job - runs at midnight)
   */
  async resetDailyQuests() {
    // Expire old uncompleted quests
    await prisma.dailyQuest.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isClaimed: false,
      },
      data: {
        isCompleted: false,
      },
    });

    // Get all active students (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeStudents = await prisma.studentProfile.findMany({
      where: {
        lastActiveDate: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
      },
    });

    // Assign new quests to each active student
    for (const student of activeStudents) {
      try {
        await this.assignDailyQuests(student.id);
      } catch (error) {
        console.error(
          `Failed to assign quests to student ${student.id}:`,
          error
        );
      }
    }

    console.log(`Assigned daily quests to ${activeStudents.length} students`);
  }

  /**
   * Get quest completion stats for a student
   */
  async getQuestStats(studentId: string) {
    const [completed, total] = await Promise.all([
      prisma.dailyQuest.count({
        where: {
          studentId,
          isCompleted: true,
        },
      }),
      prisma.dailyQuest.count({
        where: {
          studentId,
        },
      }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      totalQuests: total,
      completedQuests: completed,
      completionRate: Math.round(completionRate),
    };
  }

  /**
   * Helper: Select quest templates with varied difficulty
   */
  private selectQuestTemplates(
    templates: any[],
    count: number
  ): any[] {
    // Group by difficulty
    const easy = templates.filter((t) => t.difficulty === 'EASY');
    const medium = templates.filter((t) => t.difficulty === 'MEDIUM');
    const hard = templates.filter((t) => t.difficulty === 'HARD');

    const selected = [];

    // Try to get 1 easy, 1 medium, 1 hard
    if (easy.length > 0) {
      selected.push(easy[Math.floor(Math.random() * easy.length)]);
    }

    if (medium.length > 0 && selected.length < count) {
      selected.push(medium[Math.floor(Math.random() * medium.length)]);
    }

    if (hard.length > 0 && selected.length < count) {
      selected.push(hard[Math.floor(Math.random() * hard.length)]);
    }

    // Fill remaining slots randomly
    while (selected.length < count && templates.length > 0) {
      const remaining = templates.filter((t) => !selected.includes(t));
      if (remaining.length === 0) break;

      selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }

    return selected;
  }

  /**
   * Helper: Get quest expiration time based on type
   */
  private getQuestExpiration(type: QuestType): Date {
    const now = new Date();

    switch (type) {
      case 'DAILY':
        // Expires at midnight next day
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return tomorrow;

      case 'WEEKLY':
        // Expires in 7 days
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;

      case 'SPECIAL_EVENT':
        // Expires in 3 days
        const eventEnd = new Date(now);
        eventEnd.setDate(eventEnd.getDate() + 3);
        return eventEnd;

      default:
        // Default to 24 hours
        const defaultExpiry = new Date(now);
        defaultExpiry.setHours(defaultExpiry.getHours() + 24);
        return defaultExpiry;
    }
  }

  /**
   * Create custom quest template (admin)
   */
  async createQuestTemplate(data: {
    key: string;
    name: string;
    description: string;
    questType: QuestType;
    category: string;
    difficulty: QuestDifficulty;
    requirement: any;
    coinReward: number;
    xpReward: number;
    gemReward?: number;
    itemRewards?: any;
    minLevel?: number;
    maxLevel?: number;
  }) {
    const template = await prisma.questTemplate.create({
      data: {
        ...data,
        isActive: true,
        isRepeatable: true,
        cooldownHours: data.questType === 'DAILY' ? 24 : 168, // 24h or 7 days
      },
    });

    return template;
  }
}

export default new QuestService();