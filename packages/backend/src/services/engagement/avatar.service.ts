import { PrismaClient, AvatarCategory, ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class AvatarService {
  /**
   * Get available avatar items filtered by category, rarity, and level
   */
  async getAvailableItems(
    studentId: string,
    filters?: {
      category?: AvatarCategory;
      rarity?: ItemRarity;
      minLevel?: number;
    }
  ) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { currentLevel: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const where: any = {
      unlockLevel: { lte: student.currentLevel },
      OR: [
        { isLimitedEdition: false },
        {
          AND: [
            { isLimitedEdition: true },
            { availableUntil: { gte: new Date() } },
          ],
        },
      ],
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.rarity) {
      where.rarity = filters.rarity;
    }

    if (filters?.minLevel) {
      where.unlockLevel = { gte: filters.minLevel };
    }

    const items = await prisma.avatarItem.findMany({
      where,
      orderBy: [
        { rarity: 'asc' },
        { unlockLevel: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Check which items the student owns
    const ownedItems = await prisma.studentAvatar.findMany({
      where: { studentId },
      select: { avatarItemId: true, isEquipped: true },
    });

    const ownedMap = new Map(
      ownedItems.map((item) => [
        item.avatarItemId,
        { owned: true, equipped: item.isEquipped },
      ])
    );

    return items.map((item) => ({
      ...item,
      owned: ownedMap.has(item.id),
      equipped: ownedMap.get(item.id)?.equipped || false,
    }));
  }

  /**
   * Purchase an avatar item with coins or gems
   */
  async purchaseItem(studentId: string, itemId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        coins: true,
        gems: true,
        currentLevel: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const item = await prisma.avatarItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Avatar item not found');
    }

    // Check if already owned
    const existing = await prisma.studentAvatar.findUnique({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
    });

    if (existing) {
      throw new Error('Avatar item already owned');
    }

    // Check level requirement
    if (student.currentLevel < item.unlockLevel) {
      throw new Error(
        `Level ${item.unlockLevel} required (current: ${student.currentLevel})`
      );
    }

    // Check if item is available
    if (item.isLimitedEdition && item.availableUntil) {
      if (new Date() > item.availableUntil) {
        throw new Error('Item is no longer available');
      }
    }

    // Validate currency
    if (item.coinCost && student.coins < item.coinCost) {
      throw new Error(
        `Not enough coins (need ${item.coinCost}, have ${student.coins})`
      );
    }

    if (item.gemCost && student.gems < item.gemCost) {
      throw new Error(
        `Not enough gems (need ${item.gemCost}, have ${student.gems})`
      );
    }

    // Execute purchase
    const result = await prisma.$transaction(async (tx) => {
      // Deduct currency
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: item.coinCost ? { decrement: item.coinCost } : undefined,
          gems: item.gemCost ? { decrement: item.gemCost } : undefined,
        },
      });

      // Add item to inventory
      const studentAvatar = await tx.studentAvatar.create({
        data: {
          studentId,
          avatarItemId: itemId,
          isPurchased: true,
        },
        include: {
          avatarItem: true,
        },
      });

      return studentAvatar;
    });

    return result;
  }

  /**
   * Equip an avatar item (only one per category)
   */
  async equipItem(studentId: string, itemId: string) {
    const studentAvatar = await prisma.studentAvatar.findUnique({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
      include: {
        avatarItem: true,
      },
    });

    if (!studentAvatar) {
      throw new Error('Avatar item not owned');
    }

    if (studentAvatar.isEquipped) {
      throw new Error('Item already equipped');
    }

    // Unequip any other item in the same category
    await prisma.studentAvatar.updateMany({
      where: {
        studentId,
        avatarItem: {
          category: studentAvatar.avatarItem.category,
        },
        isEquipped: true,
      },
      data: {
        isEquipped: false,
      },
    });

    // Equip the new item
    await prisma.studentAvatar.update({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
      data: {
        isEquipped: true,
      },
    });

    // Update student profile
    if (studentAvatar.avatarItem.category === 'BODY') {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          selectedAvatarId: itemId,
        },
      });
    }

    return { success: true };
  }

  /**
   * Unequip an avatar item
   */
  async unequipItem(studentId: string, itemId: string) {
    const studentAvatar = await prisma.studentAvatar.findUnique({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
    });

    if (!studentAvatar) {
      throw new Error('Avatar item not owned');
    }

    if (!studentAvatar.isEquipped) {
      throw new Error('Item not equipped');
    }

    await prisma.studentAvatar.update({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
      data: {
        isEquipped: false,
      },
    });

    return { success: true };
  }

  /**
   * Get currently equipped avatar for a student
   */
  async getCurrentAvatar(studentId: string) {
    const equipped = await prisma.studentAvatar.findMany({
      where: {
        studentId,
        isEquipped: true,
      },
      include: {
        avatarItem: true,
      },
      orderBy: {
        avatarItem: {
          category: 'asc',
        },
      },
    });

    const avatar: Record<string, any> = {};

    for (const item of equipped) {
      avatar[item.avatarItem.category] = {
        id: item.avatarItem.id,
        name: item.avatarItem.name,
        imageUrl: item.avatarItem.imageUrl,
        animationData: item.avatarItem.animationData,
      };
    }

    return avatar;
  }

  /**
   * Get all owned avatar items for a student
   */
  async getOwnedItems(studentId: string) {
    const items = await prisma.studentAvatar.findMany({
      where: { studentId },
      include: {
        avatarItem: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    return items;
  }

  /**
   * Unlock free/default avatar items for new students
   */
  async unlockDefaultItems(studentId: string) {
    const defaultItems = await prisma.avatarItem.findMany({
      where: { isDefault: true },
    });

    const unlocked = [];

    for (const item of defaultItems) {
      const studentAvatar = await prisma.studentAvatar.upsert({
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

      unlocked.push(studentAvatar);
    }

    return unlocked;
  }

  /**
   * Award avatar item as reward (from quests, achievements, etc.)
   */
  async awardItem(studentId: string, itemId: string) {
    const existing = await prisma.studentAvatar.findUnique({
      where: {
        studentId_avatarItemId: {
          studentId,
          avatarItemId: itemId,
        },
      },
    });

    if (existing) {
      return existing; // Already owned
    }

    const studentAvatar = await prisma.studentAvatar.create({
      data: {
        studentId,
        avatarItemId: itemId,
        isPurchased: false,
      },
      include: {
        avatarItem: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'New Avatar Item Unlocked!',
        message: `You've unlocked ${studentAvatar.avatarItem.name}!`,
        imageUrl: studentAvatar.avatarItem.imageUrl,
      },
    });

    return studentAvatar;
  }
}

export default new AvatarService();