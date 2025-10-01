import { PrismaClient, ShopItemType, ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class ShopService {
  /**
   * Get all shop items with filters
   */
  async getShopItems(filters?: {
    type?: ShopItemType;
    category?: string;
    rarity?: ItemRarity;
    featured?: boolean;
    limitedTime?: boolean;
  }) {
    const where: any = {
      isActive: true,
      OR: [
        { isLimitedTime: false },
        {
          AND: [
            { isLimitedTime: true },
            { availableUntil: { gte: new Date() } },
          ],
        },
      ],
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.rarity) {
      where.rarity = filters.rarity;
    }

    if (filters?.featured !== undefined) {
      where.isFeatured = filters.featured;
    }

    if (filters?.limitedTime) {
      where.isLimitedTime = true;
      where.availableUntil = { gte: new Date() };
    }

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { isLimitedTime: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return items;
  }

  /**
   * Get featured items for shop homepage
   */
  async getFeaturedItems(limit: number = 6) {
    const items = await prisma.shopItem.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        OR: [
          { isLimitedTime: false },
          {
            AND: [
              { isLimitedTime: true },
              { availableUntil: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    });

    return items;
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(category: string) {
    const items = await prisma.shopItem.findMany({
      where: {
        category,
        isActive: true,
        OR: [
          { isLimitedTime: false },
          {
            AND: [
              { isLimitedTime: true },
              { availableUntil: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: [{ isFeatured: 'desc' }, { rarity: 'desc' }],
    });

    return items;
  }

  /**
   * Get limited-time items
   */
  async getLimitedTimeItems() {
    const items = await prisma.shopItem.findMany({
      where: {
        isActive: true,
        isLimitedTime: true,
        availableUntil: { gte: new Date() },
      },
      orderBy: [{ availableUntil: 'asc' }],
    });

    return items;
  }

  /**
   * Purchase a shop item
   */
  async purchaseItem(
    studentId: string,
    itemId: string,
    currency: 'coins' | 'gems'
  ) {
    const [student, item] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { coins: true, gems: true, currentLevel: true },
      }),
      prisma.shopItem.findUnique({
        where: { id: itemId },
      }),
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (!item) {
      throw new Error('Shop item not found');
    }

    if (!item.isActive) {
      throw new Error('Item is no longer available');
    }

    // Check if limited-time item is still available
    if (item.isLimitedTime && item.availableUntil) {
      if (new Date() > item.availableUntil) {
        throw new Error('Item is no longer available');
      }
    }

    // Check currency
    const cost = currency === 'coins' ? item.coinCost : item.gemCost;
    if (!cost) {
      throw new Error(`Item cannot be purchased with ${currency}`);
    }

    const balance = currency === 'coins' ? student.coins : student.gems;
    if (balance < cost) {
      throw new Error(
        `Not enough ${currency} (need ${cost}, have ${balance})`
      );
    }

    // Check if already owned (for non-consumables)
    if (item.type !== 'CONSUMABLE') {
      const existing = await prisma.inventoryItem.findUnique({
        where: {
          studentId_shopItemId: {
            studentId,
            shopItemId: itemId,
          },
        },
      });

      if (existing) {
        throw new Error('Item already owned');
      }
    }

    // Check purchase limit
    if (item.purchaseLimit) {
      const purchaseCount = await prisma.inventoryItem.count({
        where: {
          studentId,
          shopItemId: itemId,
        },
      });

      if (purchaseCount >= item.purchaseLimit) {
        throw new Error(
          `Purchase limit reached (max ${item.purchaseLimit})`
        );
      }
    }

    // Check stock limit
    if (item.stockLimit) {
      const soldCount = await prisma.inventoryItem.count({
        where: { shopItemId: itemId },
      });

      if (soldCount >= item.stockLimit) {
        throw new Error('Item is out of stock');
      }
    }

    // Execute purchase
    const result = await prisma.$transaction(async (tx) => {
      // Deduct currency
      await tx.studentProfile.update({
        where: { id: studentId },
        data: {
          [currency]: { decrement: cost },
        },
      });

      // Add to inventory
      const inventoryItem = await tx.inventoryItem.upsert({
        where: {
          studentId_shopItemId: {
            studentId,
            shopItemId: itemId,
          },
        },
        create: {
          studentId,
          shopItemId: itemId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
        include: {
          shopItem: true,
        },
      });

      // Auto-activate certain item types
      if (item.type === 'AVATAR') {
        const itemData = item.itemData as any;
        if (itemData?.avatarItemId) {
          await tx.studentAvatar.upsert({
            where: {
              studentId_avatarItemId: {
                studentId,
                avatarItemId: itemData.avatarItemId,
              },
            },
            create: {
              studentId,
              avatarItemId: itemData.avatarItemId,
              isPurchased: true,
            },
            update: {},
          });
        }
      }

      if (item.type === 'PET') {
        const itemData = item.itemData as any;
        if (itemData?.petId) {
          await tx.studentPet.upsert({
            where: {
              studentId_petId: {
                studentId,
                petId: itemData.petId,
              },
            },
            create: {
              studentId,
              petId: itemData.petId,
              happiness: 100,
            },
            update: {},
          });
        }
      }

      return inventoryItem;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Purchase Complete!',
        message: `You purchased ${item.name}!`,
        imageUrl: item.imageUrl,
      },
    });

    return result;
  }

  /**
   * Validate if student can purchase item
   */
  async validatePurchase(
    studentId: string,
    itemId: string,
    currency: 'coins' | 'gems'
  ): Promise<{ canPurchase: boolean; reason?: string }> {
    const [student, item] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { coins: true, gems: true },
      }),
      prisma.shopItem.findUnique({
        where: { id: itemId },
      }),
    ]);

    if (!student) {
      return { canPurchase: false, reason: 'Student not found' };
    }

    if (!item || !item.isActive) {
      return { canPurchase: false, reason: 'Item not available' };
    }

    if (item.isLimitedTime && item.availableUntil) {
      if (new Date() > item.availableUntil) {
        return { canPurchase: false, reason: 'Item expired' };
      }
    }

    const cost = currency === 'coins' ? item.coinCost : item.gemCost;
    if (!cost) {
      return {
        canPurchase: false,
        reason: `Cannot purchase with ${currency}`,
      };
    }

    const balance = currency === 'coins' ? student.coins : student.gems;
    if (balance < cost) {
      return {
        canPurchase: false,
        reason: `Insufficient ${currency} (need ${cost}, have ${balance})`,
      };
    }

    // Check ownership for non-consumables
    if (item.type !== 'CONSUMABLE') {
      const existing = await prisma.inventoryItem.findUnique({
        where: {
          studentId_shopItemId: {
            studentId,
            shopItemId: itemId,
          },
        },
      });

      if (existing) {
        return { canPurchase: false, reason: 'Already owned' };
      }
    }

    // Check purchase limit
    if (item.purchaseLimit) {
      const purchaseCount = await prisma.inventoryItem.count({
        where: { studentId, shopItemId: itemId },
      });

      if (purchaseCount >= item.purchaseLimit) {
        return { canPurchase: false, reason: 'Purchase limit reached' };
      }
    }

    // Check stock
    if (item.stockLimit) {
      const soldCount = await prisma.inventoryItem.count({
        where: { shopItemId: itemId },
      });

      if (soldCount >= item.stockLimit) {
        return { canPurchase: false, reason: 'Out of stock' };
      }
    }

    return { canPurchase: true };
  }

  /**
   * Create shop item (admin)
   */
  async createShopItem(data: {
    type: ShopItemType;
    name: string;
    description: string;
    imageUrl: string;
    rarity: ItemRarity;
    coinCost?: number;
    gemCost?: number;
    premiumOnly?: boolean;
    stockLimit?: number;
    purchaseLimit?: number;
    category: string;
    tags?: string[];
    itemData: any;
    isFeatured?: boolean;
    isLimitedTime?: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
  }) {
    const item = await prisma.shopItem.create({
      data: {
        ...data,
        isActive: true,
      },
    });

    return item;
  }

  /**
   * Update shop item (admin)
   */
  async updateShopItem(itemId: string, data: Partial<any>) {
    const item = await prisma.shopItem.update({
      where: { id: itemId },
      data,
    });

    return item;
  }

  /**
   * Rotate featured items (cron job - weekly)
   */
  async rotateFeaturedItems() {
    // Unfeatured all current featured items
    await prisma.shopItem.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });

    // Get random items to feature (2 per category)
    const categories = ['AVATAR', 'PET', 'POWER_UP', 'COSMETIC'];
    const newFeatured = [];

    for (const category of categories) {
      const items = await prisma.shopItem.findMany({
        where: {
          type: category as ShopItemType,
          isActive: true,
        },
        take: 50,
      });

      // Select 2 random items
      const shuffled = items.sort(() => 0.5 - Math.random());
      newFeatured.push(...shuffled.slice(0, 2));
    }

    // Set as featured
    for (const item of newFeatured) {
      await prisma.shopItem.update({
        where: { id: item.id },
        data: { isFeatured: true },
      });
    }

    console.log(`Rotated ${newFeatured.length} featured items`);
  }
}

export default new ShopService();