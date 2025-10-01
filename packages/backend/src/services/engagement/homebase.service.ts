import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HomeBaseService {
  /**
   * Get or create home base for student
   */
  async getHomeBase(studentId: string) {
    let homeBase = await prisma.homeBase.findUnique({
      where: { studentId },
    });

    if (!homeBase) {
      // Create default home base
      homeBase = await prisma.homeBase.create({
        data: {
          studentId,
          theme: 'DEFAULT',
          backgroundUrl: '/assets/homebase/default-bg.png',
          furnitureLayout: [],
        },
      });
    }

    return homeBase;
  }

  /**
   * Update home base layout
   */
  async updateLayout(studentId: string, layout: any[]) {
    const homeBase = await prisma.homeBase.upsert({
      where: { studentId },
      create: {
        studentId,
        theme: 'DEFAULT',
        backgroundUrl: '/assets/homebase/default-bg.png',
        furnitureLayout: layout,
      },
      update: {
        furnitureLayout: layout,
      },
    });

    return homeBase;
  }

  /**
   * Update home base theme
   */
  async updateTheme(studentId: string, theme: string, backgroundUrl: string) {
    const homeBase = await prisma.homeBase.update({
      where: { studentId },
      data: {
        theme,
        backgroundUrl,
      },
    });

    return homeBase;
  }

  /**
   * Purchase furniture
   */
  async purchaseFurniture(studentId: string, furnitureId: string) {
    const [student, furniture] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { coins: true, gems: true },
      }),
      prisma.furniture.findUnique({
        where: { id: furnitureId },
      }),
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (!furniture || !furniture.isActive) {
      throw new Error('Furniture not available');
    }

    // Check currency
    if (furniture.coinCost && student.coins < furniture.coinCost) {
      throw new Error(`Not enough coins (need ${furniture.coinCost}, have ${student.coins})`);
    }

    if (furniture.gemCost && student.gems < furniture.gemCost) {
      throw new Error(`Not enough gems (need ${furniture.gemCost}, have ${student.gems})`);
    }

    // Deduct currency and add to inventory
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        coins: furniture.coinCost ? { decrement: furniture.coinCost } : undefined,
        gems: furniture.gemCost ? { decrement: furniture.gemCost } : undefined,
      },
    });

    return furniture;
  }

  /**
   * Get available furniture for student
   */
  async getAvailableFurniture(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { currentLevel: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const furniture = await prisma.furniture.findMany({
      where: {
        isActive: true,
        unlockLevel: { lte: student.currentLevel },
      },
      orderBy: [{ rarity: 'desc' }, { unlockLevel: 'asc' }],
    });

    return furniture;
  }

  /**
   * Visit another player's home base
   */
  async visitHomeBase(visitorId: string, ownerId: string) {
    const homeBase = await prisma.homeBase.findUnique({
      where: { studentId: ownerId },
    });

    if (!homeBase) {
      throw new Error('Home base not found');
    }

    if (!homeBase.isPublic && visitorId !== ownerId) {
      throw new Error('Home base is private');
    }

    // Increment visit count
    await prisma.homeBase.update({
      where: { studentId: ownerId },
      data: {
        visits: { increment: 1 },
      },
    });

    return homeBase;
  }

  /**
   * Like a home base
   */
  async likeHomeBase(studentId: string, ownerId: string) {
    const homeBase = await prisma.homeBase.findUnique({
      where: { studentId: ownerId },
    });

    if (!homeBase) {
      throw new Error('Home base not found');
    }

    // TODO: Track who liked to prevent duplicates

    await prisma.homeBase.update({
      where: { studentId: ownerId },
      data: {
        likes: { increment: 1 },
      },
    });

    // Notify owner
    if (ownerId !== studentId) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          type: 'SYSTEM',
          title: 'Home Base Liked!',
          message: 'Someone liked your home base!',
        },
      });
    }

    return { success: true };
  }

  /**
   * Toggle public/private
   */
  async togglePublic(studentId: string) {
    const homeBase = await this.getHomeBase(studentId);

    const updated = await prisma.homeBase.update({
      where: { studentId },
      data: {
        isPublic: !homeBase.isPublic,
      },
    });

    return updated;
  }

  /**
   * Get popular home bases (most likes/visits)
   */
  async getPopularHomeBases(limit: number = 10) {
    const homeBases = await prisma.homeBase.findMany({
      where: { isPublic: true },
      orderBy: [
        { likes: 'desc' },
        { visits: 'desc' },
      ],
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

    return homeBases.map((hb) => ({
      ...hb,
      ownerName: hb.student.user.profile?.displayName || 'Unknown',
    }));
  }
}

export default new HomeBaseService();