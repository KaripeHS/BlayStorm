import { PrismaClient, AvatarCategory, ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

export const avatarItems = [
  // === HEAD Items ===
  // Common
  { name: 'Baseball Cap', category: 'HEAD' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/head/baseball-cap.png' },
  { name: 'Beanie', category: 'HEAD' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/head/beanie.png' },
  { name: 'Sun Visor', category: 'HEAD' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 150, requiredLevel: 2, imageUrl: '/assets/avatars/head/sun-visor.png' },

  // Uncommon
  { name: 'Math Wizard Hat', category: 'HEAD' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 500, gemsCost: 5, requiredLevel: 5, imageUrl: '/assets/avatars/head/wizard-hat.png' },
  { name: 'Crown of Numbers', category: 'HEAD' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 600, gemsCost: 10, requiredLevel: 7, imageUrl: '/assets/avatars/head/number-crown.png' },
  { name: 'Thinking Cap', category: 'HEAD' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 550, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/head/thinking-cap.png' },

  // Rare
  { name: 'Phoenix Plume', category: 'HEAD' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 50, requiredLevel: 10, imageUrl: '/assets/avatars/head/phoenix-plume.png' },
  { name: 'Halo of Pi', category: 'HEAD' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 75, requiredLevel: 12, imageUrl: '/assets/avatars/head/pi-halo.png' },

  // Epic
  { name: 'Infinity Horns', category: 'HEAD' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 150, requiredLevel: 20, imageUrl: '/assets/avatars/head/infinity-horns.png' },
  { name: 'Stellar Diadem', category: 'HEAD' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 200, requiredLevel: 25, imageUrl: '/assets/avatars/head/stellar-diadem.png' },

  // Legendary
  { name: 'Euler\'s Crown', category: 'HEAD' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 500, requiredLevel: 30, imageUrl: '/assets/avatars/head/eulers-crown.png', isLimitedEdition: true },

  // === BODY Items ===
  // Common
  { name: 'Casual T-Shirt', category: 'BODY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 150, requiredLevel: 1, imageUrl: '/assets/avatars/body/tshirt.png' },
  { name: 'Hoodie', category: 'BODY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 200, requiredLevel: 2, imageUrl: '/assets/avatars/body/hoodie.png' },
  { name: 'Sports Jersey', category: 'BODY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 250, requiredLevel: 3, imageUrl: '/assets/avatars/body/jersey.png' },

  // Uncommon
  { name: 'Scholar Robe', category: 'BODY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 700, gemsCost: 10, requiredLevel: 5, imageUrl: '/assets/avatars/body/scholar-robe.png' },
  { name: 'Calculator Vest', category: 'BODY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 650, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/body/calculator-vest.png' },
  { name: 'Equation Jacket', category: 'BODY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 750, gemsCost: 12, requiredLevel: 7, imageUrl: '/assets/avatars/body/equation-jacket.png' },

  // Rare
  { name: 'Wizard Robes', category: 'BODY' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 60, requiredLevel: 10, imageUrl: '/assets/avatars/body/wizard-robes.png' },
  { name: 'Knight Armor', category: 'BODY' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 80, requiredLevel: 15, imageUrl: '/assets/avatars/body/knight-armor.png' },

  // Epic
  { name: 'Cosmic Suit', category: 'BODY' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 175, requiredLevel: 20, imageUrl: '/assets/avatars/body/cosmic-suit.png' },
  { name: 'Dragon Scale Armor', category: 'BODY' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 225, requiredLevel: 25, imageUrl: '/assets/avatars/body/dragon-armor.png' },

  // Legendary
  { name: 'Archimedes Toga', category: 'BODY' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 600, requiredLevel: 35, imageUrl: '/assets/avatars/body/archimedes-toga.png', isLimitedEdition: true },

  // === FACE Items ===
  // Common
  { name: 'Cool Sunglasses', category: 'FACE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/face/sunglasses.png' },
  { name: 'Reading Glasses', category: 'FACE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 150, requiredLevel: 2, imageUrl: '/assets/avatars/face/glasses.png' },
  { name: 'Safety Goggles', category: 'FACE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 120, requiredLevel: 1, imageUrl: '/assets/avatars/face/goggles.png' },

  // Uncommon
  { name: 'Smart Glasses', category: 'FACE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 500, gemsCost: 5, requiredLevel: 5, imageUrl: '/assets/avatars/face/smart-glasses.png' },
  { name: 'Neon Visor', category: 'FACE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 550, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/face/neon-visor.png' },

  // Rare
  { name: 'Laser Eyes', category: 'FACE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 50, requiredLevel: 10, imageUrl: '/assets/avatars/face/laser-eyes.png' },
  { name: 'Third Eye', category: 'FACE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 75, requiredLevel: 12, imageUrl: '/assets/avatars/face/third-eye.png' },

  // Epic
  { name: 'Cosmic Vision', category: 'FACE' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 150, requiredLevel: 20, imageUrl: '/assets/avatars/face/cosmic-vision.png' },

  // Legendary
  { name: 'All-Seeing Eye', category: 'FACE' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 500, requiredLevel: 30, imageUrl: '/assets/avatars/face/all-seeing-eye.png', isLimitedEdition: true },

  // === ACCESSORY Items ===
  // Common
  { name: 'Backpack', category: 'ACCESSORY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 200, requiredLevel: 1, imageUrl: '/assets/avatars/accessory/backpack.png' },
  { name: 'Calculator', category: 'ACCESSORY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 150, requiredLevel: 1, imageUrl: '/assets/avatars/accessory/calculator.png' },
  { name: 'Pencil Behind Ear', category: 'ACCESSORY' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/accessory/pencil.png' },

  // Uncommon
  { name: 'Magic Wand', category: 'ACCESSORY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 600, gemsCost: 10, requiredLevel: 5, imageUrl: '/assets/avatars/accessory/magic-wand.png' },
  { name: 'Floating Numbers', category: 'ACCESSORY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 650, gemsCost: 12, requiredLevel: 7, imageUrl: '/assets/avatars/accessory/floating-numbers.png' },
  { name: 'Compass', category: 'ACCESSORY' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 550, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/accessory/compass.png' },

  // Rare
  { name: 'Protractor Wings', category: 'ACCESSORY' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 80, requiredLevel: 10, imageUrl: '/assets/avatars/accessory/protractor-wings.png' },
  { name: 'Fibonacci Spiral', category: 'ACCESSORY' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 100, requiredLevel: 15, imageUrl: '/assets/avatars/accessory/fibonacci-spiral.png' },

  // Epic
  { name: 'Phoenix Wings', category: 'ACCESSORY' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 200, requiredLevel: 20, imageUrl: '/assets/avatars/accessory/phoenix-wings.png' },
  { name: 'Dragon Wings', category: 'ACCESSORY' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 250, requiredLevel: 25, imageUrl: '/assets/avatars/accessory/dragon-wings.png' },

  // Legendary
  { name: 'Celestial Aura', category: 'ACCESSORY' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 750, requiredLevel: 35, imageUrl: '/assets/avatars/accessory/celestial-aura.png', isLimitedEdition: true },

  // === BACKGROUND Items ===
  // Common
  { name: 'Classroom', category: 'BACKGROUND' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/bg/classroom.png' },
  { name: 'Library', category: 'BACKGROUND' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 150, requiredLevel: 2, imageUrl: '/assets/avatars/bg/library.png' },
  { name: 'Park', category: 'BACKGROUND' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 120, requiredLevel: 1, imageUrl: '/assets/avatars/bg/park.png' },

  // Uncommon
  { name: 'Math Lab', category: 'BACKGROUND' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 500, gemsCost: 5, requiredLevel: 5, imageUrl: '/assets/avatars/bg/math-lab.png' },
  { name: 'City Skyline', category: 'BACKGROUND' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 550, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/bg/city.png' },
  { name: 'Beach', category: 'BACKGROUND' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 600, gemsCost: 10, requiredLevel: 7, imageUrl: '/assets/avatars/bg/beach.png' },

  // Rare
  { name: 'Ancient Temple', category: 'BACKGROUND' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 60, requiredLevel: 10, imageUrl: '/assets/avatars/bg/temple.png' },
  { name: 'Crystal Cave', category: 'BACKGROUND' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 75, requiredLevel: 12, imageUrl: '/assets/avatars/bg/crystal-cave.png' },
  { name: 'Floating Islands', category: 'BACKGROUND' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 90, requiredLevel: 15, imageUrl: '/assets/avatars/bg/floating-islands.png' },

  // Epic
  { name: 'Space Station', category: 'BACKGROUND' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 175, requiredLevel: 20, imageUrl: '/assets/avatars/bg/space-station.png' },
  { name: 'Dragon Lair', category: 'BACKGROUND' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 200, requiredLevel: 22, imageUrl: '/assets/avatars/bg/dragon-lair.png' },

  // Legendary
  { name: 'Cosmic Nebula', category: 'BACKGROUND' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 500, requiredLevel: 30, imageUrl: '/assets/avatars/bg/nebula.png', isLimitedEdition: true },
  { name: 'Mathematical Universe', category: 'BACKGROUND' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 600, requiredLevel: 35, imageUrl: '/assets/avatars/bg/math-universe.png', isLimitedEdition: true },

  // === EMOTE Items ===
  // Common
  { name: 'Thumbs Up', category: 'EMOTE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 50, requiredLevel: 1, imageUrl: '/assets/avatars/emote/thumbs-up.png' },
  { name: 'Victory Dance', category: 'EMOTE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, imageUrl: '/assets/avatars/emote/victory-dance.png' },
  { name: 'Thinking Pose', category: 'EMOTE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 75, requiredLevel: 1, imageUrl: '/assets/avatars/emote/thinking.png' },

  // Uncommon
  { name: 'Magic Sparkles', category: 'EMOTE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 300, gemsCost: 5, requiredLevel: 5, imageUrl: '/assets/avatars/emote/sparkles.png' },
  { name: 'Backflip', category: 'EMOTE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 350, gemsCost: 8, requiredLevel: 6, imageUrl: '/assets/avatars/emote/backflip.png' },
  { name: 'Fireworks', category: 'EMOTE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 400, gemsCost: 10, requiredLevel: 7, imageUrl: '/assets/avatars/emote/fireworks.png' },

  // Rare
  { name: 'Phoenix Rising', category: 'EMOTE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 50, requiredLevel: 10, imageUrl: '/assets/avatars/emote/phoenix-rising.png' },
  { name: 'Number Rain', category: 'EMOTE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 75, requiredLevel: 12, imageUrl: '/assets/avatars/emote/number-rain.png' },

  // Epic
  { name: 'Cosmic Explosion', category: 'EMOTE' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 150, requiredLevel: 20, imageUrl: '/assets/avatars/emote/cosmic-explosion.png' },
  { name: 'Dragon Roar', category: 'EMOTE' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 175, requiredLevel: 22, imageUrl: '/assets/avatars/emote/dragon-roar.png' },

  // === TITLE Items ===
  // Common
  { name: 'Math Learner', category: 'TITLE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 100, requiredLevel: 1, displayText: '📚 Math Learner' },
  { name: 'Problem Solver', category: 'TITLE' as AvatarCategory, rarity: 'COMMON' as ItemRarity, coinsCost: 200, requiredLevel: 3, displayText: '🧩 Problem Solver' },

  // Uncommon
  { name: 'Math Enthusiast', category: 'TITLE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 500, gemsCost: 5, requiredLevel: 5, displayText: '⭐ Math Enthusiast' },
  { name: 'Number Wizard', category: 'TITLE' as AvatarCategory, rarity: 'UNCOMMON' as ItemRarity, coinsCost: 600, gemsCost: 10, requiredLevel: 7, displayText: '🧙 Number Wizard' },

  // Rare
  { name: 'Math Master', category: 'TITLE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 50, requiredLevel: 10, displayText: '👑 Math Master' },
  { name: 'Equation Expert', category: 'TITLE' as AvatarCategory, rarity: 'RARE' as ItemRarity, gemsCost: 75, requiredLevel: 12, displayText: '💎 Equation Expert' },

  // Epic
  { name: 'Mathematical Genius', category: 'TITLE' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 150, requiredLevel: 20, displayText: '🌟 Mathematical Genius' },
  { name: 'Boss Slayer', category: 'TITLE' as AvatarCategory, rarity: 'EPIC' as ItemRarity, gemsCost: 175, requiredLevel: 22, displayText: '⚔️ Boss Slayer' },

  // Legendary
  { name: 'Legend of Math', category: 'TITLE' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 500, requiredLevel: 30, displayText: '🏆 Legend of Math', isLimitedEdition: true },
  { name: 'Supreme Mathematician', category: 'TITLE' as AvatarCategory, rarity: 'LEGENDARY' as ItemRarity, gemsCost: 750, requiredLevel: 40, displayText: '👑 Supreme Mathematician', isLimitedEdition: true },
];

export async function seedAvatarItems() {
  console.log('👤 Seeding avatar items...');

  for (const item of avatarItems) {
    await prisma.avatarItem.upsert({
      where: { name: item.name },
      create: item,
      update: item,
    });
  }

  console.log(`✅ Seeded ${avatarItems.length} avatar items`);
}

export default seedAvatarItems;