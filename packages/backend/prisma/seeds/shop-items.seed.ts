import { PrismaClient, ShopItemType, ItemRarity, PowerUpType } from '@prisma/client';

const prisma = new PrismaClient();

export const shopItems = [
  // POWER-UPS - Common
  {
    name: 'Hint Revealer',
    description: 'Reveals a helpful hint for the current problem',
    type: 'POWER_UP' as ShopItemType,
    rarity: 'COMMON' as ItemRarity,
    powerUpType: 'HINT_REVEAL' as PowerUpType,
    coinsCost: 50,
    gemsCost: 0,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Time Freeze',
    description: 'Freezes the timer for 30 seconds',
    type: 'POWER_UP' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    powerUpType: 'TIME_FREEZE' as PowerUpType,
    coinsCost: 100,
    gemsCost: 0,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Fifty-Fifty',
    description: 'Eliminates two wrong answers',
    type: 'POWER_UP' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    powerUpType: 'FIFTY_FIFTY' as PowerUpType,
    coinsCost: 150,
    gemsCost: 0,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Skip Problem',
    description: 'Skip the current problem without losing your combo',
    type: 'POWER_UP' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    powerUpType: 'SKIP_PROBLEM' as PowerUpType,
    coinsCost: 0,
    gemsCost: 10,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },

  // CONSUMABLES - Boosts
  {
    name: 'Double XP Boost (1 Hour)',
    description: 'Earn 2x XP for 1 hour',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    powerUpType: 'DOUBLE_XP' as PowerUpType,
    coinsCost: 0,
    gemsCost: 25,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
    effects: { multiplier: 2, duration: 3600 },
  },
  {
    name: 'Double Coins Boost (1 Hour)',
    description: 'Earn 2x coins for 1 hour',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    powerUpType: 'DOUBLE_COINS' as PowerUpType,
    coinsCost: 0,
    gemsCost: 25,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
    effects: { multiplier: 2, duration: 3600 },
  },
  {
    name: 'Mega Boost Bundle (2 Hours)',
    description: 'Double XP AND coins for 2 hours!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'EPIC' as ItemRarity,
    powerUpType: 'DOUBLE_XP' as PowerUpType,
    coinsCost: 0,
    gemsCost: 75,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
    effects: { xpMultiplier: 2, coinMultiplier: 2, duration: 7200 },
  },

  // TREASURE CHESTS
  {
    name: 'Bronze Treasure Chest',
    description: 'Contains random rewards!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'COMMON' as ItemRarity,
    coinsCost: 500,
    gemsCost: 0,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Silver Treasure Chest',
    description: 'Contains better random rewards!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    coinsCost: 1000,
    gemsCost: 10,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Gold Treasure Chest',
    description: 'Contains great random rewards!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    coinsCost: 0,
    gemsCost: 50,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Diamond Treasure Chest',
    description: 'Contains amazing random rewards!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'EPIC' as ItemRarity,
    coinsCost: 0,
    gemsCost: 150,
    stockLimit: null,
    purchaseLimitPerPlayer: null,
  },

  // STARTER PACKS
  {
    name: 'Beginner Bundle',
    description: 'Perfect for starting your journey! Includes pet, coins, and power-ups.',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'COMMON' as ItemRarity,
    coinsCost: 1000,
    gemsCost: 0,
    stockLimit: null,
    purchaseLimitPerPlayer: 1,
    effects: {
      rewards: {
        coins: 500,
        xp: 200,
        items: ['Hint Revealer', 'Time Freeze'],
      },
    },
  },
  {
    name: 'Explorer Pack',
    description: 'Boost your adventure! Includes avatar items and boosts.',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    coinsCost: 0,
    gemsCost: 50,
    stockLimit: null,
    purchaseLimitPerPlayer: 1,
    effects: {
      rewards: {
        coins: 1000,
        xp: 500,
        gems: 25,
        items: ['Double XP Boost (1 Hour)', 'Silver Treasure Chest'],
      },
    },
  },
  {
    name: 'Champion Pack',
    description: 'For serious mathematicians! Epic rewards inside.',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'EPIC' as ItemRarity,
    coinsCost: 0,
    gemsCost: 200,
    stockLimit: null,
    purchaseLimitPerPlayer: 1,
    effects: {
      rewards: {
        coins: 5000,
        xp: 2000,
        gems: 100,
        items: ['Mega Boost Bundle (2 Hours)', 'Gold Treasure Chest', 'Diamond Treasure Chest'],
      },
    },
  },

  // LIMITED TIME OFFERS
  {
    name: 'Weekend Warrior Pack',
    description: 'Special weekend offer! Double boosts and exclusive items.',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    coinsCost: 0,
    gemsCost: 100,
    stockLimit: 1000,
    purchaseLimitPerPlayer: 1,
    isFeatured: true,
    isLimitedTime: true,
    effects: {
      rewards: {
        coins: 2000,
        xp: 1000,
        items: ['Double XP Boost (1 Hour)', 'Double Coins Boost (1 Hour)', 'Gold Treasure Chest'],
      },
    },
  },
  {
    name: 'Legendary Hero Bundle',
    description: 'LIMITED! Includes legendary pet and avatar items!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'LEGENDARY' as ItemRarity,
    coinsCost: 0,
    gemsCost: 500,
    stockLimit: 100,
    purchaseLimitPerPlayer: 1,
    isFeatured: true,
    isLimitedTime: true,
    effects: {
      rewards: {
        gems: 200,
        pets: ['Euler\'s Eagle'],
        avatarItems: ['Euler\'s Crown', 'Phoenix Wings'],
        items: ['Diamond Treasure Chest'],
      },
    },
  },

  // CURRENCY PACKS
  {
    name: 'Small Coin Pack',
    description: '1,000 coins',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'COMMON' as ItemRarity,
    coinsCost: 0,
    gemsCost: 10,
    effects: { coins: 1000 },
  },
  {
    name: 'Medium Coin Pack',
    description: '5,000 coins',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    coinsCost: 0,
    gemsCost: 40,
    effects: { coins: 5000 },
  },
  {
    name: 'Large Coin Pack',
    description: '15,000 coins',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    coinsCost: 0,
    gemsCost: 100,
    effects: { coins: 15000 },
  },
  {
    name: 'Mega Coin Pack',
    description: '50,000 coins',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'EPIC' as ItemRarity,
    coinsCost: 0,
    gemsCost: 300,
    effects: { coins: 50000 },
  },

  // SPECIAL ITEMS
  {
    name: 'Pet Food Pack',
    description: 'Feed your pet 10 times! Keep them happy.',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'COMMON' as ItemRarity,
    coinsCost: 80,
    gemsCost: 0,
    effects: { petFoodCount: 10 },
  },
  {
    name: 'Name Change Token',
    description: 'Change your display name',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    coinsCost: 0,
    gemsCost: 50,
    purchaseLimitPerPlayer: null,
  },
  {
    name: 'Guild Creation Scroll',
    description: 'Create your own guild!',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'RARE' as ItemRarity,
    coinsCost: 0,
    gemsCost: 100,
    purchaseLimitPerPlayer: 1,
  },
  {
    name: 'Boss Battle Retry',
    description: 'Retry a boss battle immediately',
    type: 'CONSUMABLE' as ShopItemType,
    rarity: 'UNCOMMON' as ItemRarity,
    coinsCost: 0,
    gemsCost: 20,
    purchaseLimitPerPlayer: null,
  },
];

export async function seedShopItems() {
  console.log('🛒 Seeding shop items...');

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { name: item.name },
      create: item,
      update: item,
    });
  }

  console.log(`✅ Seeded ${shopItems.length} shop items`);
}

export default seedShopItems;