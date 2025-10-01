import { PrismaClient, ProblemType, AnswerType, AchievementCategory, SubscriptionTier, SubscriptionStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import seedQuestTemplates from './seeds/quest-templates.seed';
import seedPets from './seeds/pets.seed';
import seedAvatarItems from './seeds/avatar-items.seed';
import seedBosses from './seeds/bosses.seed';
import seedStory from './seeds/story.seed';
import seedShopItems from './seeds/shop-items.seed';
import { seedProblems } from './seeds/problems.seed';
import { generateAndSeedProblems } from './seeds/problems-generator.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🔥 Starting BlayStorm database seed...');

  // Create achievements
  console.log('Creating achievements...');
  const achievements = await prisma.achievement.createMany({
    data: [
      {
        key: 'first_problem',
        name: 'First Victory!',
        description: 'Solve your first problem',
        icon: '🎯',
        category: 'FIRST_STEPS',
        requirementType: 'problems_solved',
        requirementValue: 1,
        xpReward: 50,
        coinReward: 10,
        rarity: 'COMMON',
        order: 1,
      },
      {
        key: 'ten_problems',
        name: 'Getting Warmed Up',
        description: 'Solve 10 problems',
        icon: '🔥',
        category: 'FIRST_STEPS',
        requirementType: 'problems_solved',
        requirementValue: 10,
        xpReward: 100,
        coinReward: 25,
        rarity: 'COMMON',
        order: 2,
      },
      {
        key: 'streak_3',
        name: '3-Day Streak',
        description: 'Practice for 3 days in a row',
        icon: '⚡',
        category: 'STREAK',
        requirementType: 'streak',
        requirementValue: 3,
        xpReward: 150,
        coinReward: 30,
        gemReward: 5,
        rarity: 'RARE',
        order: 10,
      },
      {
        key: 'streak_7',
        name: 'Week Warrior',
        description: 'Practice for 7 days straight',
        icon: '🔥',
        category: 'STREAK',
        requirementType: 'streak',
        requirementValue: 7,
        xpReward: 300,
        coinReward: 75,
        gemReward: 15,
        rarity: 'EPIC',
        order: 11,
      },
      {
        key: 'perfect_10',
        name: 'Perfect Storm',
        description: 'Get 10 problems correct in a row',
        icon: '💯',
        category: 'ACCURACY',
        requirementType: 'correct_streak',
        requirementValue: 10,
        xpReward: 200,
        coinReward: 50,
        gemReward: 10,
        rarity: 'RARE',
        order: 20,
      },
      {
        key: 'speed_demon',
        name: 'Speed Demon',
        description: 'Solve 5 problems in under 2 minutes',
        icon: '⚡',
        category: 'SPEED',
        requirementType: 'speed_challenge',
        requirementValue: 5,
        xpReward: 250,
        coinReward: 60,
        gemReward: 12,
        rarity: 'EPIC',
        order: 30,
      },
      {
        key: 'first_friend',
        name: 'Social Butterfly',
        description: 'Add your first friend',
        icon: '👥',
        category: 'SOCIAL',
        requirementType: 'friends',
        requirementValue: 1,
        xpReward: 100,
        coinReward: 20,
        rarity: 'COMMON',
        order: 40,
      },
      {
        key: 'multiplayer_win',
        name: 'Team Player',
        description: 'Win your first multiplayer game',
        icon: '🏆',
        category: 'SOCIAL',
        requirementType: 'multiplayer_wins',
        requirementValue: 1,
        xpReward: 200,
        coinReward: 50,
        gemReward: 10,
        rarity: 'RARE',
        order: 41,
      },
      {
        key: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '⭐',
        category: 'MASTERY',
        requirementType: 'level',
        requirementValue: 10,
        xpReward: 500,
        coinReward: 100,
        gemReward: 25,
        rarity: 'EPIC',
        order: 50,
      },
      {
        key: 'topic_master_fractions',
        name: 'Fraction Master',
        description: 'Achieve 90% mastery in fractions',
        icon: '🎓',
        category: 'MASTERY',
        requirementType: 'topic_mastery_fractions',
        requirementValue: 90,
        xpReward: 400,
        coinReward: 80,
        gemReward: 20,
        rarity: 'EPIC',
        order: 60,
      },
    ],
  });

  console.log(`✅ Created ${achievements.count} achievements`);

  // Create problems
  console.log('Creating math problems...');

  const problems = [
    // GRADE 4 - Addition
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'addition',
      subTopic: 'multi_digit',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 234 + 156?',
      answer: '390',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Try adding the ones place first (4 + 6)',
        'Now add the tens place (30 + 50)',
        'Finally add the hundreds place (200 + 100)',
      ]),
      explanation: 'Step 1: 4 + 6 = 10 (write 0, carry 1)\nStep 2: 3 + 5 + 1 = 9 (write 9)\nStep 3: 2 + 1 = 3 (write 3)\nAnswer: 390',
      tags: ['multi-digit', 'carrying'],
      estimatedTime: 60,
      pointValue: 20,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'addition',
      subTopic: 'multi_digit',
      difficulty: 1,
      gradeLevel: 4,
      question: 'Calculate: 456 + 278',
      answer: '734',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Start with the ones: 6 + 8',
        'Move to tens: 5 + 7 (plus any carried)',
        'Finish with hundreds: 4 + 2 (plus any carried)',
      ]),
      explanation: 'Ones: 6+8=14, write 4 carry 1. Tens: 5+7+1=13, write 3 carry 1. Hundreds: 4+2+1=7. Answer: 734',
      tags: ['multi-digit', 'carrying'],
      estimatedTime: 60,
      pointValue: 20,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'addition',
      subTopic: 'word_problems',
      difficulty: 2,
      gradeLevel: 4,
      question: 'Sarah collected 347 coins in level 1 and 289 coins in level 2. How many coins does she have in total?',
      answer: '636',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'This is an addition problem. What two numbers do you need to add?',
        'You need to add 347 + 289',
        'Remember to line up the place values!',
      ]),
      explanation: 'We need to add the coins from both levels: 347 + 289 = 636 coins total',
      tags: ['word-problem', 'real-world', 'gaming-context'],
      estimatedTime: 90,
      pointValue: 25,
    },
    // GRADE 4 - Subtraction
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'subtraction',
      subTopic: 'multi_digit',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 582 - 237?',
      answer: '345',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Start with the ones place: 2 - 7 (you\'ll need to borrow)',
        'After borrowing: 12 - 7 = 5',
        'Continue with tens and hundreds, borrowing as needed',
      ]),
      explanation: 'Ones: borrow from tens, 12-7=5. Tens: after lending, 7-3=4. Hundreds: 5-2=3. Answer: 345',
      tags: ['multi-digit', 'borrowing'],
      estimatedTime: 75,
      pointValue: 20,
    },
    // GRADE 4 - Multiplication
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'multiplication',
      subTopic: 'basic_facts',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 7 × 8?',
      answer: '56',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Think of this as 7 groups of 8',
        'Or you could count by 8s seven times: 8, 16, 24, 32...',
        'This is a multiplication fact you should memorize!',
      ]),
      explanation: '7 × 8 = 56. This is a basic multiplication fact.',
      tags: ['multiplication-facts', 'times-table'],
      estimatedTime: 30,
      pointValue: 15,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'multiplication',
      subTopic: 'two_digit',
      difficulty: 2,
      gradeLevel: 4,
      question: 'Calculate: 24 × 3',
      answer: '72',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Break it down: (20 × 3) + (4 × 3)',
        'First multiply 20 × 3 = 60',
        'Then multiply 4 × 3 = 12, and add: 60 + 12',
      ]),
      explanation: 'Using the distributive property: 24×3 = (20×3) + (4×3) = 60 + 12 = 72',
      tags: ['multi-digit', 'distributive-property'],
      estimatedTime: 75,
      pointValue: 25,
    },
    // GRADE 4 - Division
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'division',
      subTopic: 'basic',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 48 ÷ 6?',
      answer: '8',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Think: 6 times what number equals 48?',
        'Or: How many groups of 6 are in 48?',
        'Try the 6 times table: 6×1=6, 6×2=12, 6×3=18...',
      ]),
      explanation: '48 ÷ 6 = 8 because 6 × 8 = 48',
      tags: ['basic-division', 'fact-families'],
      estimatedTime: 45,
      pointValue: 20,
    },
    // GRADE 5 - Fractions
    {
      type: 'FRACTION' as ProblemType,
      topic: 'fractions',
      subTopic: 'addition_same_denominator',
      difficulty: 2,
      gradeLevel: 5,
      question: 'What is 1/4 + 1/4?',
      answer: '1/2',
      answerType: 'FRACTION' as AnswerType,
      hints: JSON.stringify([
        'When adding fractions with the same denominator, add the numerators',
        '1 + 1 = 2, and the denominator stays 4',
        'Can you simplify 2/4?',
      ]),
      explanation: '1/4 + 1/4 = 2/4. Simplify by dividing both numerator and denominator by 2: 2/4 = 1/2',
      tags: ['fractions', 'addition', 'simplifying'],
      estimatedTime: 90,
      pointValue: 25,
    },
    {
      type: 'FRACTION' as ProblemType,
      topic: 'fractions',
      subTopic: 'addition_different_denominators',
      difficulty: 3,
      gradeLevel: 5,
      question: 'What is 1/2 + 1/3?',
      answer: '5/6',
      answerType: 'FRACTION' as AnswerType,
      hints: JSON.stringify([
        'First, find a common denominator for 2 and 3',
        'The least common denominator is 6',
        'Convert: 1/2 = 3/6 and 1/3 = 2/6, then add',
      ]),
      explanation: 'Find LCD of 2 and 3, which is 6. Convert: 1/2=3/6, 1/3=2/6. Add: 3/6+2/6=5/6',
      tags: ['fractions', 'addition', 'common-denominator'],
      estimatedTime: 120,
      pointValue: 30,
    },
    // GRADE 5 - Decimals
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'decimals',
      subTopic: 'addition',
      difficulty: 2,
      gradeLevel: 5,
      question: 'What is 3.45 + 2.89?',
      answer: '6.34',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'Line up the decimal points',
        'Add just like whole numbers',
        'Remember to keep the decimal point in your answer',
      ]),
      explanation: 'Line up decimals:\n  3.45\n+ 2.89\n------\n  6.34',
      tags: ['decimals', 'addition'],
      estimatedTime: 75,
      pointValue: 25,
    },
    // GRADE 6 - Percentages
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'percentages',
      subTopic: 'basic',
      difficulty: 2,
      gradeLevel: 6,
      question: 'What is 25% of 80?',
      answer: '20',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        '25% means 25 out of 100, or 1/4',
        'To find 1/4 of 80, divide 80 by 4',
        'What is 80 ÷ 4?',
      ]),
      explanation: '25% = 1/4. So 25% of 80 = 80 ÷ 4 = 20. Or: 25% = 0.25, so 0.25 × 80 = 20',
      tags: ['percentages', 'fractions', 'real-world'],
      estimatedTime: 90,
      pointValue: 25,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'percentages',
      subTopic: 'word_problems',
      difficulty: 3,
      gradeLevel: 6,
      question: 'A game is on sale for 20% off. If the original price is $50, what is the sale price?',
      answer: '40',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'First find 20% of $50',
        '20% of 50 = 0.20 × 50 = $10',
        'Subtract the discount from original price: $50 - $10',
      ]),
      explanation: '20% of $50 = $10. Sale price = $50 - $10 = $40',
      tags: ['percentages', 'word-problem', 'real-world', 'discounts'],
      estimatedTime: 120,
      pointValue: 35,
    },
    // GRADE 6 - Algebra
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'algebra',
      subTopic: 'one_step_equations',
      difficulty: 2,
      gradeLevel: 6,
      question: 'Solve for x: x + 7 = 15',
      answer: '8',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify([
        'To solve for x, get x by itself',
        'Subtract 7 from both sides',
        'x = 15 - 7',
      ]),
      explanation: 'Subtract 7 from both sides: x + 7 - 7 = 15 - 7, so x = 8',
      tags: ['algebra', 'equations', 'solving'],
      estimatedTime: 90,
      pointValue: 25,
    },
    // More problems for variety
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'multiplication',
      subTopic: 'basic_facts',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 6 × 9?',
      answer: '54',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify(['Think 6 groups of 9', 'Or 9 groups of 6', '6 × 9 = 54']),
      explanation: '6 × 9 = 54',
      tags: ['multiplication-facts'],
      estimatedTime: 30,
      pointValue: 15,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'addition',
      subTopic: 'multi_digit',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 123 + 456?',
      answer: '579',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify(['Add ones: 3+6=9', 'Add tens: 2+5=7', 'Add hundreds: 1+4=5']),
      explanation: '123 + 456 = 579',
      tags: ['multi-digit'],
      estimatedTime: 60,
      pointValue: 20,
    },
    {
      type: 'NUMERIC' as ProblemType,
      topic: 'subtraction',
      subTopic: 'multi_digit',
      difficulty: 1,
      gradeLevel: 4,
      question: 'What is 789 - 234?',
      answer: '555',
      answerType: 'NUMBER' as AnswerType,
      hints: JSON.stringify(['Subtract ones: 9-4=5', 'Subtract tens: 8-3=5', 'Subtract hundreds: 7-2=5']),
      explanation: '789 - 234 = 555',
      tags: ['multi-digit'],
      estimatedTime: 60,
      pointValue: 20,
    },
  ];

  for (const problem of problems) {
    await prisma.problem.create({ data: problem });
  }

  console.log(`✅ Created ${problems.length} math problems`);

  // Create demo users
  console.log('Creating demo users...');

  const demoPassword = await bcrypt.hash('Demo123!', 10);

  const demoStudent = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      passwordHash: demoPassword,
      role: 'STUDENT',
      isEmailVerified: true,
      profile: {
        create: {
          username: 'demo_student',
          displayName: 'Demo Student',
          bio: 'I love math storms!',
        },
      },
      studentProfile: {
        create: {
          gradeLevel: 5,
          currentLevel: 3,
          totalXp: 450,
          xpToNextLevel: 550,
          coins: 120,
          gems: 15,
        },
      },
      subscriptions: {
        create: {
          tier: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
  });

  console.log(`✅ Created demo student: student@demo.com / Demo123!`);

  const demoParent = await prisma.user.create({
    data: {
      email: 'parent@demo.com',
      passwordHash: demoPassword,
      role: 'PARENT',
      isEmailVerified: true,
      profile: {
        create: {
          username: 'demo_parent',
          displayName: 'Demo Parent',
        },
      },
      parentProfile: {
        create: {
          phoneNumber: '+1234567890',
        },
      },
    },
  });

  console.log(`✅ Created demo parent: parent@demo.com / Demo123!`);

  const demoTeacher = await prisma.user.create({
    data: {
      email: 'teacher@demo.com',
      passwordHash: demoPassword,
      role: 'TEACHER',
      isEmailVerified: true,
      profile: {
        create: {
          username: 'demo_teacher',
          displayName: 'Ms. Anderson',
        },
      },
      teacherProfile: {
        create: {
          schoolName: 'BlayStorm Elementary',
          gradesTaught: [4, 5, 6],
          subjects: ['Math'],
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });

  console.log(`✅ Created demo teacher: teacher@demo.com / Demo123!`);

  // Phase 3 - Seed engagement content
  console.log('\n🎮 Seeding Phase 3 engagement content...');
  await seedQuestTemplates();
  await seedPets();
  await seedAvatarItems();
  await seedBosses();
  await seedStory();
  await seedShopItems();

  // Seed math problems (hand-crafted + generated)
  console.log('\n📝 Seeding comprehensive math problem set...');
  await seedProblems(); // ~50 hand-crafted story problems
  await generateAndSeedProblems(); // ~500 generated problems

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${achievements.count} achievements created`);
  console.log(`- ${problems.length + 550} math problems created (${problems.length} basic + 550 Phase 3)`);
  console.log('- 3 demo users created');
  console.log('- 36 quest templates');
  console.log('- 20 pets');
  console.log('- 80+ avatar items');
  console.log('- 14 bosses');
  console.log('- 5 worlds with 25 chapters');
  console.log('- 6 NPCs');
  console.log('- 25+ shop items');
  console.log('\n🔐 Login credentials:');
  console.log('Student: student@demo.com / Demo123!');
  console.log('Parent: parent@demo.com / Demo123!');
  console.log('Teacher: teacher@demo.com / Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });