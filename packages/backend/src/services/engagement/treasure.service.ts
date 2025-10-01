import { PrismaClient, ChestType, ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class TreasureService {
  /**
   * Award treasure chest to student
   */
  async awardChest(
    studentId: string,
    chestType: ChestType,
    rarity: ItemRarity,
    source: string
  ) {
    const chest = await prisma.treasureChest.create({
      data: {
        studentId,
        chestType,
        rarity,
        earnedFrom: source,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Treasure Chest Earned!',
        message: `You earned a ${rarity} ${chestType} chest! Tap to open it!`,
        actionUrl: `/treasures/${chest.id}`,
      },
    });

    return chest;
  }

  /**
   * Get unopened chests for a student
   */
  async getUnopenedChests(studentId: string) {
    const chests = await prisma.treasureChest.findMany({
      where: {
        studentId,
        isOpened: false,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return chests;
  }

  /**
   * Get all chests (opened and unopened)
   */
  async getAllChests(studentId: string) {
    const chests = await prisma.treasureChest.findMany({
      where: { studentId },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return chests;
  }

  /**
   * Open a treasure chest and generate rewards
   */
  async openChest(studentId: string, chestId: string) {
    const chest = await prisma.treasureChest.findUnique({
      where: { id: chestId },
    });

    if (!chest) {
      throw new Error('Chest not found');
    }

    if (chest.studentId !== studentId) {
      throw new Error('Chest does not belong to this student');
    }

    if (chest.isOpened) {
      throw new Error('Chest already opened');
    }

    // Generate rewards based on rarity
    const rewards = await this.generateRewards(chest.chestType, chest.rarity);

    // Award rewards
    await this.awardRewards(studentId, rewards);

    // Mark chest as opened
    const openedChest = await prisma.treasureChest.update({
      where: { id: chestId },
      data: {
        isOpened: true,
        openedAt: new Date(),
        rewards: rewards as any,
      },
    });

    return {
      chest: openedChest,
      rewards,
    };
  }

  /**
   * Generate random rewards based on chest type and rarity
   */
  async generateRewards(chestType: ChestType, rarity: ItemRarity) {
    const rewards: any = {
      coins: 0,
      xp: 0,
      gems: 0,
      items: [],
    };

    // Base rewards scale with rarity
    const rarityMultiplier = this.getRarityMultiplier(rarity);

    // Coins (always awarded)
    rewards.coins = Math.floor((50 + Math.random() * 50) * rarityMultiplier);

    // XP (always awarded)
    rewards.xp = Math.floor((25 + Math.random() * 25) * rarityMultiplier);

    // Gems (higher rarity = higher chance)
    const gemChance = this.getGemChance(rarity);
    if (Math.random() < gemChance) {
      rewards.gems = Math.floor((5 + Math.random() * 10) * rarityMultiplier);
    }

    // Special items based on chest type
    const itemPool = await this.getItemPool(chestType, rarity);

    // Award 1-3 items based on rarity
    const itemCount = rarity === 'LEGENDARY' || rarity === 'MYTHIC' ? 3 : rarity === 'EPIC' || rarity === 'RARE' ? 2 : 1;

    for (let i = 0; i < itemCount; i++) {
      if (itemPool.length > 0) {
        const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
        rewards.items.push({
          type: randomItem.type,
          id: randomItem.id,
          name: randomItem.name,
          rarity: randomItem.rarity,
          imageUrl: randomItem.imageUrl,
        });
      }
    }

    return rewards;
  }

  /**
   * Award rewards to student
   */
  private async awardRewards(studentId: string, rewards: any) {
    await prisma.$transaction(async (tx) => {
      // Award currency
      if (rewards.coins > 0 || rewards.xp > 0 || rewards.gems > 0) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: {
            coins: rewards.coins > 0 ? { increment: rewards.coins } : undefined,
            totalXp: rewards.xp > 0 ? { increment: rewards.xp } : undefined,
            gems: rewards.gems > 0 ? { increment: rewards.gems } : undefined,
          },
        });
      }

      // Award items
      for (const item of rewards.items) {
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
        } else if (item.type === 'consumable' || item.type === 'powerup') {
          await tx.inventoryItem.upsert({
            where: {
              studentId_shopItemId: {
                studentId,
                shopItemId: item.id,
              },
            },
            create: {
              studentId,
              shopItemId: item.id,
              quantity: 1,
            },
            update: {
              quantity: { increment: 1 },
            },
          });
        }
      }
    });

    // Create notification
    const rewardSummary = [];
    if (rewards.coins > 0) rewardSummary.push(`${rewards.coins} coins`);
    if (rewards.xp > 0) rewardSummary.push(`${rewards.xp} XP`);
    if (rewards.gems > 0) rewardSummary.push(`${rewards.gems} gems`);
    if (rewards.items.length > 0) rewardSummary.push(`${rewards.items.length} items`);

    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Chest Opened!',
        message: `You received: ${rewardSummary.join(', ')}!`,
      },
    });
  }

  /**
   * Get rarity multiplier for rewards
   */
  private getRarityMultiplier(rarity: ItemRarity): number {
    switch (rarity) {
      case 'COMMON':
        return 1.0;
      case 'UNCOMMON':
        return 1.5;
      case 'RARE':
        return 2.0;
      case 'EPIC':
        return 3.0;
      case 'LEGENDARY':
        return 5.0;
      case 'MYTHIC':
        return 10.0;
      default:
        return 1.0;
    }
  }

  /**
   * Get gem chance based on rarity
   */
  private getGemChance(rarity: ItemRarity): number {
    switch (rarity) {
      case 'COMMON':
        return 0.1; // 10%
      case 'UNCOMMON':
        return 0.25; // 25%
      case 'RARE':
        return 0.5; // 50%
      case 'EPIC':
        return 0.75; // 75%
      case 'LEGENDARY':
        return 1.0; // 100%
      case 'MYTHIC':
        return 1.0; // 100%
      default:
        return 0.1;
    }
  }

  /**
   * Get item pool for chest type and rarity
   */
  private async getItemPool(chestType: ChestType, rarity: ItemRarity) {
    const pool: any[] = [];

    // Get avatar items
    const avatarItems = await prisma.avatarItem.findMany({
      where: { rarity },
      take: 10,
    });
    pool.push(
      ...avatarItems.map((item) => ({
        type: 'avatar',
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        imageUrl: item.imageUrl,
      }))
    );

    // Get pets (only for rare+ chests)
    if (['RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].includes(rarity)) {
      const pets = await prisma.pet.findMany({
        where: { rarity },
        take: 5,
      });
      pool.push(
        ...pets.map((pet) => ({
          type: 'pet',
          id: pet.id,
          name: pet.name,
          rarity: pet.rarity,
          imageUrl: pet.imageUrl,
        }))
      );
    }

    // Get shop items (consumables, power-ups)
    const shopItems = await prisma.shopItem.findMany({
      where: {
        OR: [{ type: 'CONSUMABLE' }, { type: 'POWER_UP' }],
        rarity,
      },
      take: 10,
    });
    pool.push(
      ...shopItems.map((item) => ({
        type: 'consumable',
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        imageUrl: item.imageUrl,
      }))
    );

    return pool;
  }

  /**
   * Award random chest on milestone (5% chance)
   */
  async maybeAwardRandomChest(studentId: string, source: string) {
    const CHEST_CHANCE = 0.05; // 5%

    if (Math.random() < CHEST_CHANCE) {
      // Random rarity with weighted distribution
      const rarity = this.getRandomRarity();
      const chest = await this.awardChest(studentId, 'RANDOM_DROP', rarity, source);
      return chest;
    }

    return null;
  }

  /**
   * Get random rarity with weighted distribution
   */
  private getRandomRarity(): ItemRarity {
    const rand = Math.random();

    if (rand < 0.50) return 'COMMON'; // 50%
    if (rand < 0.75) return 'UNCOMMON'; // 25%
    if (rand < 0.90) return 'RARE'; // 15%
    if (rand < 0.97) return 'EPIC'; // 7%
    if (rand < 0.99) return 'LEGENDARY'; // 2%
    return 'MYTHIC'; // 1%
  }

  /**
   * Get chest statistics for student
   */
  async getChestStats(studentId: string) {
    const [total, opened, unopened, byType] = await Promise.all([
      prisma.treasureChest.count({
        where: { studentId },
      }),
      prisma.treasureChest.count({
        where: { studentId, isOpened: true },
      }),
      prisma.treasureChest.count({
        where: { studentId, isOpened: false },
      }),
      prisma.treasureChest.groupBy({
        by: ['chestType'],
        where: { studentId, isOpened: true },
        _count: true,
      }),
    ]);

    return {
      totalChests: total,
      chestsOpened: opened,
      chestsUnopened: unopened,
      byType: byType.reduce((acc: any, item) => {
        acc[item.chestType] = item._count;
        return acc;
      }, {}),
    };
  }
}

export default new TreasureService();