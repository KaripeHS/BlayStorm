import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InventoryService {
  /**
   * Get student's full inventory
   */
  async getInventory(studentId: string, filters?: { type?: string; equipped?: boolean }) {
    const where: any = { studentId };

    if (filters?.equipped !== undefined) {
      where.isEquipped = filters.equipped;
    }

    if (filters?.type) {
      where.shopItem = { type: filters.type };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        shopItem: true,
      },
      orderBy: [
        { isEquipped: 'desc' },
        { isPinned: 'desc' },
        { acquiredAt: 'desc' },
      ],
    });

    return items;
  }

  /**
   * Get equipped items
   */
  async getEquippedItems(studentId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: {
        studentId,
        isEquipped: true,
      },
      include: {
        shopItem: true,
      },
    });

    return items;
  }

  /**
   * Use a consumable item
   */
  async useItem(studentId: string, itemId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
      include: {
        shopItem: true,
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not in inventory');
    }

    if (inventoryItem.quantity <= 0) {
      throw new Error('No items remaining');
    }

    if (inventoryItem.shopItem.type !== 'CONSUMABLE' && inventoryItem.shopItem.type !== 'POWER_UP') {
      throw new Error('Item is not consumable');
    }

    // Apply item effects
    const itemData = inventoryItem.shopItem.itemData as any;
    const effects = await this.applyItemEffects(studentId, itemData);

    // Decrement quantity
    const updatedItem = await prisma.inventoryItem.update({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
      data: {
        quantity: { decrement: 1 },
        lastUsedAt: new Date(),
      },
      include: {
        shopItem: true,
      },
    });

    // Delete if quantity reaches 0
    if (updatedItem.quantity === 0) {
      await prisma.inventoryItem.delete({
        where: { id: updatedItem.id },
      });
    }

    return { item: updatedItem, effects };
  }

  /**
   * Equip an item
   */
  async equipItem(studentId: string, itemId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
      include: {
        shopItem: true,
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not in inventory');
    }

    if (inventoryItem.shopItem.type === 'CONSUMABLE') {
      throw new Error('Cannot equip consumable items');
    }

    // Unequip other items of same type
    await prisma.inventoryItem.updateMany({
      where: {
        studentId,
        shopItem: {
          type: inventoryItem.shopItem.type,
        },
        isEquipped: true,
      },
      data: {
        isEquipped: false,
      },
    });

    // Equip the item
    const updated = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        isEquipped: true,
      },
      include: {
        shopItem: true,
      },
    });

    return updated;
  }

  /**
   * Unequip an item
   */
  async unequipItem(studentId: string, itemId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not in inventory');
    }

    if (!inventoryItem.isEquipped) {
      throw new Error('Item not equipped');
    }

    const updated = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        isEquipped: false,
      },
      include: {
        shopItem: true,
      },
    });

    return updated;
  }

  /**
   * Pin/unpin an item (for quick access)
   */
  async togglePin(studentId: string, itemId: string) {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not in inventory');
    }

    const updated = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        isPinned: !inventoryItem.isPinned,
      },
      include: {
        shopItem: true,
      },
    });

    return updated;
  }

  /**
   * Remove expired items (cron job)
   */
  async removeExpiredItems() {
    const expired = await prisma.inventoryItem.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Removed ${expired.count} expired items`);
    return expired.count;
  }

  /**
   * Get inventory summary (counts by type)
   */
  async getInventorySummary(studentId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: { studentId },
      include: {
        shopItem: true,
      },
    });

    const summary = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      byType: {} as Record<string, number>,
      equipped: items.filter((i) => i.isEquipped).length,
      consumables: items.filter((i) => i.shopItem.type === 'CONSUMABLE').reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    };

    // Count by type
    items.forEach((item) => {
      const type = item.shopItem.type;
      summary.byType[type] = (summary.byType[type] || 0) + item.quantity;
    });

    return summary;
  }

  /**
   * Check if student has item
   */
  async hasItem(studentId: string, itemId: string): Promise<boolean> {
    const item = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
    });

    return item !== null && item.quantity > 0;
  }

  /**
   * Get item quantity
   */
  async getItemQuantity(studentId: string, itemId: string): Promise<number> {
    const item = await prisma.inventoryItem.findUnique({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId: itemId,
        },
      },
    });

    return item?.quantity || 0;
  }

  /**
   * Apply item effects (power-ups, consumables)
   */
  private async applyItemEffects(studentId: string, itemData: any) {
    const effects: any = {};

    // XP Boost
    if (itemData.xpBoost) {
      effects.xpBoost = itemData.xpBoost;
      effects.duration = itemData.duration || 3600; // 1 hour default
    }

    // Coin Boost
    if (itemData.coinBoost) {
      effects.coinBoost = itemData.coinBoost;
      effects.duration = itemData.duration || 3600;
    }

    // Instant Rewards
    if (itemData.instantCoins) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          coins: { increment: itemData.instantCoins },
        },
      });
      effects.coinsAwarded = itemData.instantCoins;
    }

    if (itemData.instantXp) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          totalXp: { increment: itemData.instantXp },
        },
      });
      effects.xpAwarded = itemData.instantXp;
    }

    if (itemData.instantGems) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: {
          gems: { increment: itemData.instantGems },
        },
      });
      effects.gemsAwarded = itemData.instantGems;
    }

    // Hint Discount
    if (itemData.hintDiscount) {
      effects.hintDiscount = itemData.hintDiscount;
      effects.duration = itemData.duration || 3600;
    }

    // Time Freeze
    if (itemData.timeFreezeSeconds) {
      effects.timeFreezeSeconds = itemData.timeFreezeSeconds;
    }

    // Skip Problem
    if (itemData.skipProblem) {
      effects.skipProblem = true;
    }

    return effects;
  }

  /**
   * Award item to student (from quests, achievements, etc.)
   */
  async awardItem(studentId: string, shopItemId: string, quantity: number = 1) {
    const item = await prisma.inventoryItem.upsert({
      where: {
        studentId_shopItemId: {
          studentId,
          shopItemId,
        },
      },
      create: {
        studentId,
        shopItemId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
      include: {
        shopItem: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Item Received!',
        message: `You received ${quantity}x ${item.shopItem.name}!`,
        imageUrl: item.shopItem.imageUrl,
      },
    });

    return item;
  }
}

export default new InventoryService();