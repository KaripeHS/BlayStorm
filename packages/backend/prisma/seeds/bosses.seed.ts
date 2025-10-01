import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const bosses = [
  // Grade 4 Bosses
  {
    name: 'The Fraction Dragon',
    description: 'A fierce dragon that breathes fractions! Master fractions to defeat it.',
    difficulty: 4,
    requiredLevel: 1,
    requiredGrade: 4,
    maxHealth: 500,
    imageUrl: '/assets/bosses/fraction-dragon.png',
    topics: ['fractions', 'basic_operations'],
    rewardCoins: 500,
    rewardXp: 300,
    rewardGems: 25,
    specialRewards: { pets: ['Decimal Dragon'], avatarItems: ['Dragon Scale Armor'] },
  },
  {
    name: 'Decimal Demon',
    description: 'A tricky demon that loves decimal puzzles. Can you outsmart it?',
    difficulty: 5,
    requiredLevel: 5,
    requiredGrade: 4,
    maxHealth: 750,
    imageUrl: '/assets/bosses/decimal-demon.png',
    topics: ['decimals', 'place_value'],
    rewardCoins: 750,
    rewardXp: 450,
    rewardGems: 35,
    specialRewards: { pets: ['Number Newt'], avatarItems: ['Neon Visor'] },
  },

  // Grade 5 Bosses
  {
    name: 'Sir Percentage',
    description: 'A noble knight who challenges you with percentage problems.',
    difficulty: 6,
    requiredLevel: 10,
    requiredGrade: 5,
    maxHealth: 1000,
    imageUrl: '/assets/bosses/sir-percentage.png',
    topics: ['percentages', 'ratios'],
    rewardCoins: 1000,
    rewardXp: 600,
    rewardGems: 50,
    specialRewards: { pets: ['Geometry Cat'], avatarItems: ['Knight Armor'] },
  },
  {
    name: 'The Geometry Golem',
    description: 'A massive golem made of geometric shapes. Defeat it with shape knowledge!',
    difficulty: 6,
    requiredLevel: 12,
    requiredGrade: 5,
    maxHealth: 1200,
    imageUrl: '/assets/bosses/geometry-golem.png',
    topics: ['geometry', 'area', 'perimeter'],
    rewardCoins: 1200,
    rewardXp: 750,
    rewardGems: 60,
    specialRewards: { pets: ['Fractal Fox'], avatarItems: ['Protractor Wings'] },
  },

  // Grade 6 Bosses
  {
    name: 'Algebra Assassin',
    description: 'A mysterious assassin who strikes with algebraic equations.',
    difficulty: 7,
    requiredLevel: 15,
    requiredGrade: 6,
    maxHealth: 1500,
    imageUrl: '/assets/bosses/algebra-assassin.png',
    topics: ['algebra', 'equations', 'variables'],
    rewardCoins: 1500,
    rewardXp: 900,
    rewardGems: 75,
    specialRewards: { pets: ['Algebra Owl'], avatarItems: ['Equation Jacket'] },
  },
  {
    name: 'The Ratio Reaper',
    description: 'Death itself, wielding the power of ratios and proportions.',
    difficulty: 8,
    requiredLevel: 18,
    requiredGrade: 6,
    maxHealth: 1800,
    imageUrl: '/assets/bosses/ratio-reaper.png',
    topics: ['ratios', 'proportions', 'unit_rates'],
    rewardCoins: 2000,
    rewardXp: 1200,
    rewardGems: 100,
    specialRewards: { pets: ['Phoenix Pi'], avatarItems: ['Phoenix Wings'] },
  },

  // Grade 7 Bosses
  {
    name: 'The Negative Number Necromancer',
    description: 'A dark sorcerer who commands negative numbers and integers.',
    difficulty: 8,
    requiredLevel: 20,
    requiredGrade: 7,
    maxHealth: 2000,
    imageUrl: '/assets/bosses/necromancer.png',
    topics: ['integers', 'negative_numbers', 'absolute_value'],
    rewardCoins: 2500,
    rewardXp: 1500,
    rewardGems: 125,
    specialRewards: { pets: ['Quantum Koala'], avatarItems: ['Wizard Robes'] },
  },
  {
    name: 'Exponent Emperor',
    description: 'An emperor whose power grows exponentially. Match his might!',
    difficulty: 9,
    requiredLevel: 22,
    requiredGrade: 7,
    maxHealth: 2500,
    imageUrl: '/assets/bosses/exponent-emperor.png',
    topics: ['exponents', 'powers', 'scientific_notation'],
    rewardCoins: 3000,
    rewardXp: 1800,
    rewardGems: 150,
    specialRewards: { pets: ['Infinity Wolf'], avatarItems: ['Stellar Diadem'] },
  },

  // Grade 8 Bosses
  {
    name: 'The Pythagorean Phantom',
    description: 'A ghostly figure that haunts right triangles. Prove the theorem!',
    difficulty: 9,
    requiredLevel: 25,
    requiredGrade: 8,
    maxHealth: 3000,
    imageUrl: '/assets/bosses/pythagorean-phantom.png',
    topics: ['pythagorean_theorem', 'geometry', 'right_triangles'],
    rewardCoins: 3500,
    rewardXp: 2100,
    rewardGems: 175,
    specialRewards: { pets: ['Theorem Thunderbird'], avatarItems: ['Cosmic Suit'] },
  },
  {
    name: 'The Function Fiend',
    description: 'A demonic entity that corrupts functions. Restore mathematical order!',
    difficulty: 10,
    requiredLevel: 28,
    requiredGrade: 8,
    maxHealth: 3500,
    imageUrl: '/assets/bosses/function-fiend.png',
    topics: ['functions', 'linear_equations', 'graphing'],
    rewardCoins: 4000,
    rewardXp: 2500,
    rewardGems: 200,
    specialRewards: { pets: ['Fractal Phoenix'], avatarItems: ['Dragon Wings'] },
  },

  // Ultimate Bosses (All Grades)
  {
    name: 'The Infinity Titan',
    description: 'An ancient titan that embodies infinite mathematical concepts. The ultimate challenge!',
    difficulty: 10,
    requiredLevel: 30,
    requiredGrade: 4,
    maxHealth: 5000,
    imageUrl: '/assets/bosses/infinity-titan.png',
    topics: ['all_topics'],
    rewardCoins: 5000,
    rewardXp: 3000,
    rewardGems: 250,
    specialRewards: {
      pets: ['Euler\'s Eagle', 'Gauss\'s Griffin'],
      avatarItems: ['Euler\'s Crown', 'Celestial Aura', 'Infinity Horns']
    },
  },
  {
    name: 'The Grand Mathematician',
    description: 'The legendary master of all mathematics. Only the greatest can defeat this foe!',
    difficulty: 10,
    requiredLevel: 40,
    requiredGrade: 4,
    maxHealth: 10000,
    imageUrl: '/assets/bosses/grand-mathematician.png',
    topics: ['all_topics'],
    rewardCoins: 10000,
    rewardXp: 5000,
    rewardGems: 500,
    specialRewards: {
      pets: ['Infinity Serpent', 'Archimedes Avatar'],
      avatarItems: ['Archimedes Toga', 'All-Seeing Eye', 'Mathematical Universe']
    },
  },

  // Seasonal Event Bosses
  {
    name: 'The Holiday Havoc',
    description: 'A festive foe that appears during winter events!',
    difficulty: 7,
    requiredLevel: 10,
    requiredGrade: 4,
    maxHealth: 2000,
    imageUrl: '/assets/bosses/holiday-havoc.png',
    topics: ['all_topics'],
    rewardCoins: 2000,
    rewardXp: 1200,
    rewardGems: 100,
    specialRewards: { pets: ['Holiday Helper'], avatarItems: [] },
    isLimitedTime: true,
  },
  {
    name: 'The Summer Surge',
    description: 'A cool boss that rides the summer waves!',
    difficulty: 7,
    requiredLevel: 10,
    requiredGrade: 4,
    maxHealth: 2000,
    imageUrl: '/assets/bosses/summer-surge.png',
    topics: ['all_topics'],
    rewardCoins: 2000,
    rewardXp: 1200,
    rewardGems: 100,
    specialRewards: { pets: ['Summer Surfer'], avatarItems: [] },
    isLimitedTime: true,
  },
];

// Boss Problems - Sample problems for each boss
export const bossProblems = [
  // Fraction Dragon problems
  {
    bossName: 'The Fraction Dragon',
    problemText: 'What is 3/4 + 1/4?',
    correctAnswer: '1',
    difficulty: 4,
    topic: 'fractions',
    damage: 50,
  },
  {
    bossName: 'The Fraction Dragon',
    problemText: 'Simplify 6/8',
    correctAnswer: '3/4',
    difficulty: 4,
    topic: 'fractions',
    damage: 50,
  },
  {
    bossName: 'The Fraction Dragon',
    problemText: 'What is 2/3 × 3/4?',
    correctAnswer: '1/2',
    difficulty: 5,
    topic: 'fractions',
    damage: 60,
  },

  // Decimal Demon problems
  {
    bossName: 'Decimal Demon',
    problemText: 'What is 3.5 + 2.75?',
    correctAnswer: '6.25',
    difficulty: 5,
    topic: 'decimals',
    damage: 60,
  },
  {
    bossName: 'Decimal Demon',
    problemText: 'Round 7.456 to the nearest tenth',
    correctAnswer: '7.5',
    difficulty: 5,
    topic: 'decimals',
    damage: 55,
  },

  // Sir Percentage problems
  {
    bossName: 'Sir Percentage',
    problemText: 'What is 25% of 80?',
    correctAnswer: '20',
    difficulty: 6,
    topic: 'percentages',
    damage: 70,
  },
  {
    bossName: 'Sir Percentage',
    problemText: 'Convert 0.75 to a percentage',
    correctAnswer: '75%',
    difficulty: 6,
    topic: 'percentages',
    damage: 65,
  },

  // Geometry Golem problems
  {
    bossName: 'The Geometry Golem',
    problemText: 'What is the area of a rectangle with length 8 and width 5?',
    correctAnswer: '40',
    difficulty: 6,
    topic: 'geometry',
    damage: 75,
  },
  {
    bossName: 'The Geometry Golem',
    problemText: 'What is the perimeter of a square with side length 7?',
    correctAnswer: '28',
    difficulty: 6,
    topic: 'geometry',
    damage: 70,
  },

  // Algebra Assassin problems
  {
    bossName: 'Algebra Assassin',
    problemText: 'Solve for x: x + 5 = 12',
    correctAnswer: '7',
    difficulty: 7,
    topic: 'algebra',
    damage: 80,
  },
  {
    bossName: 'Algebra Assassin',
    problemText: 'Solve for x: 2x = 18',
    correctAnswer: '9',
    difficulty: 7,
    topic: 'algebra',
    damage: 85,
  },

  // Infinity Titan problems (mixed topics)
  {
    bossName: 'The Infinity Titan',
    problemText: 'What is 1/2 + 0.25 + 25%?',
    correctAnswer: '1',
    difficulty: 9,
    topic: 'all_topics',
    damage: 100,
  },
  {
    bossName: 'The Infinity Titan',
    problemText: 'If x + 3 = 10 and y = 2x, what is y?',
    correctAnswer: '14',
    difficulty: 10,
    topic: 'algebra',
    damage: 120,
  },
];

export async function seedBosses() {
  console.log('👹 Seeding bosses...');

  for (const boss of bosses) {
    const created = await prisma.bossProblem.upsert({
      where: { name: boss.name },
      create: boss,
      update: boss,
    });

    // Add boss problems
    const bossProblemsForBoss = bossProblems.filter(p => p.bossName === boss.name);
    for (const problem of bossProblemsForBoss) {
      await prisma.problem.create({
        data: {
          question: problem.problemText,
          correctAnswer: problem.correctAnswer,
          difficulty: problem.difficulty,
          topic: problem.topic,
          grade: boss.requiredGrade,
          pointValue: problem.damage,
          estimatedTime: 60,
        },
      }).catch(() => {}); // Ignore duplicates
    }
  }

  console.log(`✅ Seeded ${bosses.length} bosses with ${bossProblems.length} boss problems`);
}

export default seedBosses;