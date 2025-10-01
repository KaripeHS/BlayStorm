import { PrismaClient, CompletionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class StoryService {
  /**
   * Get all worlds with unlock status for student
   */
  async getWorlds(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { currentLevel: true, currentWorldId: true, storyProgress: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const worlds = await prisma.world.findMany({
      orderBy: { order: 'asc' },
      include: {
        chapters: {
          select: { id: true },
        },
      },
    });

    const worldsWithStatus = await Promise.all(
      worlds.map(async (world) => {
        const isUnlocked = await this.isWorldUnlocked(studentId, world.id, student.currentLevel);
        const completedChapters = await prisma.chapterCompletion.count({
          where: {
            studentId,
            chapter: { worldId: world.id },
            status: 'COMPLETED',
          },
        });

        return {
          ...world,
          isUnlocked,
          totalChapters: world.chapters.length,
          completedChapters,
          isCurrent: world.id === student.currentWorldId,
        };
      })
    );

    return worldsWithStatus;
  }

  /**
   * Get chapters for a world
   */
  async getChapters(worldId: string, studentId: string) {
    const chapters = await prisma.chapter.findMany({
      where: {
        worldId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    const chaptersWithProgress = await Promise.all(
      chapters.map(async (chapter) => {
        const completion = await prisma.chapterCompletion.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId: chapter.id,
            },
          },
        });

        const isUnlocked = await this.isChapterUnlocked(studentId, chapter.id);

        return {
          ...chapter,
          completion: completion || null,
          isUnlocked,
        };
      })
    );

    return chaptersWithProgress;
  }

  /**
   * Start a chapter
   */
  async startChapter(studentId: string, chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { world: true },
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // Check if unlocked
    const isUnlocked = await this.isChapterUnlocked(studentId, chapterId);
    if (!isUnlocked) {
      throw new Error('Chapter is locked');
    }

    // Create or update completion record
    const completion = await prisma.chapterCompletion.upsert({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId,
        },
      },
      create: {
        studentId,
        chapterId,
        status: 'IN_PROGRESS',
      },
      update: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // Update student's current chapter
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        currentChapterId: chapterId,
        currentWorldId: chapter.worldId,
      },
    });

    return completion;
  }

  /**
   * Update chapter progress
   */
  async updateProgress(
    studentId: string,
    chapterId: string,
    problemsSolved: number,
    timeSpent: number
  ) {
    const completion = await prisma.chapterCompletion.findUnique({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId,
        },
      },
    });

    if (!completion) {
      throw new Error('Chapter not started');
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const progress = Math.min(
      100,
      Math.floor((problemsSolved / chapter.minProblemsToPass) * 100)
    );

    const updated = await prisma.chapterCompletion.update({
      where: { id: completion.id },
      data: {
        problemsSolved: { increment: problemsSolved },
        timeSpent: { increment: timeSpent },
        progress,
      },
    });

    return updated;
  }

  /**
   * Complete a chapter and award rewards
   */
  async completeChapter(
    studentId: string,
    chapterId: string,
    problemsSolved: number,
    problemsCorrect: number,
    timeSpent: number
  ) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { world: true },
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // Calculate stars (1-3 based on performance)
    const accuracy = problemsCorrect / problemsSolved;
    let stars = 1;
    if (accuracy >= 0.9) stars = 3;
    else if (accuracy >= 0.75) stars = 2;

    // Award rewards
    await prisma.$transaction(async (tx) => {
      // Update chapter completion
      await tx.chapterCompletion.upsert({
        where: {
          studentId_chapterId: {
            studentId,
            chapterId,
          },
        },
        create: {
          studentId,
          chapterId,
          status: 'COMPLETED',
          stars,
          problemsSolved,
          timeSpent,
          progress: 100,
          completedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          stars: Math.max(stars, 0), // Keep best stars
          problemsSolved: { increment: problemsSolved },
          timeSpent: { increment: timeSpent },
          progress: 100,
          completedAt: new Date(),
        },
      });

      // Award rewards
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: { increment: chapter.coinReward },
          totalXp: { increment: chapter.xpReward },
          gems: chapter.gemReward ? { increment: chapter.gemReward } : undefined,
        },
      });

      // Update story progress
      const storyProgress = (await tx.studentProfile.findUnique({
        where: { id: studentId },
        select: { storyProgress: true },
      }))?.storyProgress as any || {};

      storyProgress[chapter.worldId] = storyProgress[chapter.worldId] || {};
      storyProgress[chapter.worldId][chapterId] = {
        completed: true,
        stars,
        completedAt: new Date().toISOString(),
      };

      await tx.studentProfile.update({
        where: { id: studentId },
        data: { storyProgress },
      });
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        title: `Chapter Complete! ${stars}⭐`,
        message: `You completed "${chapter.title}" and earned ${chapter.coinReward} coins and ${chapter.xpReward} XP!`,
      },
    });

    // Award treasure chest for 3-star completion
    if (stars === 3) {
      await prisma.treasureChest.create({
        data: {
          studentId,
          chestType: 'QUEST_REWARD',
          rarity: 'RARE',
          earnedFrom: `3⭐ ${chapter.title}`,
        },
      });
    }

    return { stars, rewards: { coins: chapter.coinReward, xp: chapter.xpReward, gems: chapter.gemReward } };
  }

  /**
   * Get unlocked chapters for a student
   */
  async getUnlockedChapters(studentId: string) {
    const chapters = await prisma.chapter.findMany({
      where: { isActive: true },
      include: { world: true },
      orderBy: [{ world: { order: 'asc' } }, { order: 'asc' }],
    });

    const unlocked = [];
    for (const chapter of chapters) {
      if (await this.isChapterUnlocked(studentId, chapter.id)) {
        unlocked.push(chapter);
      }
    }

    return unlocked;
  }

  /**
   * Get NPC dialogue
   */
  async getNPCDialogue(npcId: string, context?: string) {
    const npc = await prisma.nPC.findUnique({
      where: { id: npcId },
    });

    if (!npc) {
      throw new Error('NPC not found');
    }

    const dialogues = npc.dialogues as any;

    if (context && dialogues[context]) {
      return {
        npc: {
          name: npc.name,
          title: npc.title,
          imageUrl: npc.imageUrl,
          personality: npc.personality,
        },
        dialogue: dialogues[context],
      };
    }

    // Return default dialogue
    return {
      npc: {
        name: npc.name,
        title: npc.title,
        imageUrl: npc.imageUrl,
        personality: npc.personality,
      },
      dialogue: dialogues.default || 'Hello, young mathematician!',
    };
  }

  /**
   * Check if world is unlocked for student
   */
  private async isWorldUnlocked(studentId: string, worldId: string, studentLevel: number): Promise<boolean> {
    const world = await prisma.world.findUnique({
      where: { id: worldId },
    });

    if (!world) return false;

    // Check level requirement
    if (studentLevel < world.minLevel) return false;

    // Check if required chapter is completed
    if (world.requiredChapter) {
      const completion = await prisma.chapterCompletion.findUnique({
        where: {
          studentId_chapterId: {
            studentId,
            chapterId: world.requiredChapter,
          },
        },
      });

      if (!completion || completion.status !== 'COMPLETED') {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if chapter is unlocked for student
   */
  private async isChapterUnlocked(studentId: string, chapterId: string): Promise<boolean> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { world: true },
    });

    if (!chapter) return false;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { currentLevel: true },
    });

    if (!student) return false;

    // Check if world is unlocked
    const worldUnlocked = await this.isWorldUnlocked(studentId, chapter.worldId, student.currentLevel);
    if (!worldUnlocked) return false;

    // Check chapter unlock requirements
    if (chapter.unlockRequirement) {
      const requirement = chapter.unlockRequirement as any;

      // Check if previous chapter is completed
      if (requirement.previousChapter) {
        const prevCompletion = await prisma.chapterCompletion.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId: requirement.previousChapter,
            },
          },
        });

        if (!prevCompletion || prevCompletion.status !== 'COMPLETED') {
          return false;
        }
      }

      // Check minimum stars requirement
      if (requirement.minStars && requirement.previousChapter) {
        const prevCompletion = await prisma.chapterCompletion.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId: requirement.previousChapter,
            },
          },
        });

        if (!prevCompletion || prevCompletion.stars < requirement.minStars) {
          return false;
        }
      }
    } else if (chapter.order > 1) {
      // By default, require previous chapter in same world
      const prevChapter = await prisma.chapter.findFirst({
        where: {
          worldId: chapter.worldId,
          order: chapter.order - 1,
        },
      });

      if (prevChapter) {
        const prevCompletion = await prisma.chapterCompletion.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId: prevChapter.id,
            },
          },
        });

        if (!prevCompletion || prevCompletion.status !== 'COMPLETED') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get story progress summary
   */
  async getStoryProgress(studentId: string) {
    const [worlds, completions] = await Promise.all([
      prisma.world.count(),
      prisma.chapterCompletion.count({
        where: {
          studentId,
          status: 'COMPLETED',
        },
      }),
    ]);

    const totalChapters = await prisma.chapter.count({
      where: { isActive: true },
    });

    const totalStars = await prisma.chapterCompletion.aggregate({
      where: { studentId, status: 'COMPLETED' },
      _sum: { stars: true },
    });

    return {
      worldsUnlocked: worlds,
      chaptersCompleted: completions,
      totalChapters,
      totalStars: totalStars._sum.stars || 0,
      completionPercentage: totalChapters > 0 ? Math.floor((completions / totalChapters) * 100) : 0,
    };
  }
}

export default new StoryService();