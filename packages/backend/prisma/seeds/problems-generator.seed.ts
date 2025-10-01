import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProblemTemplate {
  generateQuestion: () => string;
  generateAnswer: () => string;
  topic: string;
  difficulty: number;
  gradeLevel: number;
  worldTheme?: string;
  getHints: (q: string, a: string) => [string, string, string];
  getExplanation: (q: string, a: string) => string;
  estimatedTime: number;
  tags?: string[];
}

// Helper function to generate random numbers
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ========================================
// NUMBER KINGDOM GENERATORS
// ========================================

const additionGenerator = (difficulty: 1 | 2 | 3): ProblemTemplate => {
  const ranges = {
    1: { min: 100, max: 999 },
    2: { min: 1000, max: 9999 },
    3: { min: 10000, max: 99999 }
  };
  const range = ranges[difficulty];

  return {
    generateQuestion: () => {
      const a = rand(range.min, range.max);
      const b = rand(range.min, range.max);
      const contexts = [
        `The castle has ${a.toLocaleString()} bricks in the west wing and ${b.toLocaleString()} bricks in the east wing. How many bricks total?`,
        `A merchant has ${a.toLocaleString()} gold coins and earns ${b.toLocaleString()} more. How many coins does he have now?`,
        `${a.toLocaleString()} soldiers march from the north and ${b.toLocaleString()} from the south. How many soldiers in total?`,
        `The royal library adds ${a.toLocaleString()} books in spring and ${b.toLocaleString()} in summer. How many books added?`,
        `A farmer harvests ${a.toLocaleString()} apples and ${b.toLocaleString()} oranges. How many fruits total?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const a = rand(range.min, range.max);
      const b = rand(range.min, range.max);
      return (a + b).toString();
    },
    topic: 'addition',
    difficulty,
    gradeLevel: difficulty === 1 ? 4 : 5,
    worldTheme: 'Number Kingdom',
    getHints: () => [
      'Line up the numbers by place value',
      'Add column by column, starting from the right',
      'Remember to carry over when needed'
    ],
    getExplanation: (q, a) => `Add the two numbers together: ${a}`,
    estimatedTime: 40 + (difficulty * 15),
    tags: ['addition', 'place value']
  };
};

const subtractionGenerator = (difficulty: 1 | 2 | 3): ProblemTemplate => {
  const ranges = {
    1: { min: 500, max: 999 },
    2: { min: 3000, max: 9999 },
    3: { min: 10000, max: 99999 }
  };
  const range = ranges[difficulty];

  return {
    generateQuestion: () => {
      let a = rand(range.min, range.max);
      let b = rand(range.min * 0.4, a - 100); // Ensure positive result
      const contexts = [
        `The kingdom has ${a.toLocaleString()} citizens. After ${b.toLocaleString()} move away, how many remain?`,
        `A dragon hoards ${a.toLocaleString()} gems and gives away ${b.toLocaleString()}. How many gems left?`,
        `The castle has ${a.toLocaleString()} arrows. ${b.toLocaleString()} are used in battle. How many arrows remain?`,
        `A wizard has ${a.toLocaleString()} spell scrolls and uses ${b.toLocaleString()}. How many scrolls left?`,
        `The treasury had ${a.toLocaleString()} coins but spent ${b.toLocaleString()}. How many coins remain?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      let a = rand(range.min, range.max);
      let b = rand(range.min * 0.4, a - 100);
      return (a - b).toString();
    },
    topic: 'subtraction',
    difficulty,
    gradeLevel: difficulty === 1 ? 4 : 5,
    worldTheme: 'Number Kingdom',
    getHints: () => [
      'Subtract place by place from right to left',
      'Borrow from the next column when needed',
      'Be careful with zeros - keep borrowing left'
    ],
    getExplanation: (q, a) => `Subtract to find the difference: ${a}`,
    estimatedTime: 45 + (difficulty * 15),
    tags: ['subtraction', 'borrowing']
  };
};

const multiplicationGenerator = (difficulty: 1 | 2 | 3): ProblemTemplate => {
  const ranges = {
    1: { a: [10, 99], b: [2, 9] },
    2: { a: [10, 99], b: [10, 25] },
    3: { a: [100, 999], b: [10, 99] }
  };
  const range = ranges[difficulty];

  return {
    generateQuestion: () => {
      const a = rand(range.a[0], range.a[1]);
      const b = rand(range.b[0], range.b[1]);
      const contexts = [
        `Each tower needs ${a} stones. There are ${b} towers. How many stones total?`,
        `A merchant sells ${a} items per day. How many items in ${b} days?`,
        `Each knight carries ${a} arrows. ${b} knights have how many arrows total?`,
        `The baker makes ${a} loaves per batch. Making ${b} batches means how many loaves?`,
        `Each chest contains ${a} gems. ${b} chests contain how many gems?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const a = rand(range.a[0], range.a[1]);
      const b = rand(range.b[0], range.b[1]);
      return (a * b).toString();
    },
    topic: 'multiplication',
    difficulty: difficulty + 1,
    gradeLevel: difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6,
    worldTheme: 'Number Kingdom',
    getHints: () => [
      'Break the problem into smaller parts',
      'Multiply one digit at a time',
      'Remember to line up your partial products'
    ],
    getExplanation: (q, a) => `Multiply the numbers: ${a}`,
    estimatedTime: 50 + (difficulty * 10),
    tags: ['multiplication']
  };
};

const divisionGenerator = (difficulty: 1 | 2 | 3): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const divisors = difficulty === 1 ? [2,3,4,5,6,7,8,9] : difficulty === 2 ? [10,11,12,15,20,25] : [12,15,18,24,30,36];
      const divisor = divisors[rand(0, divisors.length - 1)];
      const quotient = rand(10, difficulty === 1 ? 50 : difficulty === 2 ? 100 : 150);
      const dividend = divisor * quotient;

      const contexts = [
        `${dividend} gold coins are divided equally among ${divisor} knights. How many coins per knight?`,
        `A wizard divides ${dividend} magic crystals into ${divisor} equal pouches. How many per pouch?`,
        `${dividend} apples are packed into ${divisor} baskets equally. How many apples per basket?`,
        `The king distributes ${dividend} arrows among ${divisor} archers. How many arrows each?`,
        `${dividend} books are sorted onto ${divisor} shelves equally. How many books per shelf?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const divisors = difficulty === 1 ? [2,3,4,5,6,7,8,9] : difficulty === 2 ? [10,11,12,15,20,25] : [12,15,18,24,30,36];
      const divisor = divisors[rand(0, divisors.length - 1)];
      const quotient = rand(10, difficulty === 1 ? 50 : difficulty === 2 ? 100 : 150);
      return quotient.toString();
    },
    topic: 'division',
    difficulty: difficulty + 2,
    gradeLevel: difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6,
    worldTheme: 'Number Kingdom',
    getHints: () => [
      'Use long division',
      'Estimate first - what number times the divisor is close?',
      'Check your answer by multiplying back'
    ],
    getExplanation: (q, a) => `Divide to find how many in each group: ${a}`,
    estimatedTime: 60 + (difficulty * 10),
    tags: ['division']
  };
};

// ========================================
// FRACTION FOREST GENERATORS
// ========================================

const fractionAdditionGenerator = (difficulty: 1 | 2 | 3): ProblemTemplate => {
  return {
    generateQuestion: () => {
      let num1, denom1, num2, denom2;

      if (difficulty === 1) {
        // Same denominator
        denom1 = [2,3,4,5,6,8,10][rand(0,6)];
        denom2 = denom1;
        num1 = rand(1, denom1 - 1);
        num2 = rand(1, denom1 - num1 - 1);
      } else if (difficulty === 2) {
        // One is multiple of other
        const base = [2,3,4,5][rand(0,3)];
        denom1 = base;
        denom2 = base * 2;
        num1 = rand(1, denom1 - 1);
        num2 = rand(1, denom2 - 1);
      } else {
        // Different denominators
        denom1 = [3,4,5,6][rand(0,3)];
        denom2 = [3,4,5,6].filter(x => x !== denom1)[rand(0,2)];
        num1 = rand(1, denom1 - 1);
        num2 = rand(1, denom2 - 1);
      }

      const contexts = [
        `An elf fills ${num1}/${denom1} of one basket and ${num2}/${denom2} of another. How much total?`,
        `You walk ${num1}/${denom1} mile then ${num2}/${denom2} mile more. Total distance?`,
        `A potion needs ${num1}/${denom1} cup berries and ${num2}/${denom2} cup herbs. Total ingredients?`,
        `You collect ${num1}/${denom1} of acorns in morning and ${num2}/${denom2} in afternoon. Total fraction collected?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      let num1, denom1, num2, denom2;

      if (difficulty === 1) {
        denom1 = [2,3,4,5,6,8][rand(0,5)];
        denom2 = denom1;
        num1 = rand(1, denom1 - 1);
        num2 = rand(1, denom1 - num1 - 1);
        const sum = num1 + num2;
        // Simplify if possible
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const g = gcd(sum, denom1);
        return `${sum/g}/${denom1/g}`;
      } else {
        // Simplified answer after conversion
        return '1/2'; // Placeholder for complexity
      }
    },
    topic: 'fractions',
    difficulty: difficulty + 1,
    gradeLevel: 4 + difficulty,
    worldTheme: 'Fraction Forest',
    getHints: () => [
      'Find a common denominator first',
      'Convert both fractions to have the same denominator',
      'Add the numerators, keep the denominator'
    ],
    getExplanation: (q, a) => `Add the fractions: ${a}`,
    estimatedTime: 45 + (difficulty * 15),
    tags: ['fractions', 'addition']
  };
};

const fractionMultiplicationGenerator = (): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const num = rand(1, 7);
      const denom = rand(num + 1, 12);
      const whole = rand(2, 8);

      const contexts = [
        `You have ${num}/${denom} of a cake. You eat 1/${whole} of what you have. How much cake did you eat?`,
        `A fairy flies ${num}/${denom} mile per day. How far in ${whole} days?`,
        `${num}/${denom} of a garden is flowers. ${whole} friends each want an equal share. How much per friend?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const num = rand(1, 7);
      const denom = rand(num + 1, 12);
      const whole = rand(2, 8);
      const resultNum = num * whole;
      const resultDenom = denom;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const g = gcd(resultNum, resultDenom);
      return `${resultNum/g}/${resultDenom/g}`;
    },
    topic: 'fractions',
    difficulty: 4,
    gradeLevel: 5,
    worldTheme: 'Fraction Forest',
    getHints: () => [
      'Multiply numerators together',
      'Multiply denominators together',
      'Simplify the resulting fraction'
    ],
    getExplanation: (q, a) => `Multiply the fractions: ${a}`,
    estimatedTime: 60,
    tags: ['fractions', 'multiplication']
  };
};

// ========================================
// DECIMAL DESERT GENERATORS
// ========================================

const decimalAdditionGenerator = (difficulty: 1 | 2): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const places = difficulty === 1 ? 1 : 2;
      const a = (rand(10, 99) + rand(0, 9) / 10 + (places === 2 ? rand(0, 9) / 100 : 0)).toFixed(places);
      const b = (rand(10, 99) + rand(0, 9) / 10 + (places === 2 ? rand(0, 9) / 100 : 0)).toFixed(places);

      const contexts = [
        `A traveler walks ${a} miles on day 1 and ${b} miles on day 2. Total distance?`,
        `You pour ${a} liters and ${b} liters of water. How much total?`,
        `Two scrolls weigh ${a} kg and ${b} kg. Total weight?`,
        `You earn $${a} in morning and $${b} in afternoon. Total earned?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const places = difficulty === 1 ? 1 : 2;
      const a = rand(10, 99) + rand(0, 9) / 10 + (places === 2 ? rand(0, 9) / 100 : 0);
      const b = rand(10, 99) + rand(0, 9) / 10 + (places === 2 ? rand(0, 9) / 100 : 0);
      return (a + b).toFixed(places);
    },
    topic: 'decimals',
    difficulty: difficulty + 1,
    gradeLevel: 4 + difficulty,
    worldTheme: 'Decimal Desert',
    getHints: () => [
      'Line up the decimal points',
      'Add column by column as with whole numbers',
      'Keep the decimal point in the same place in your answer'
    ],
    getExplanation: (q, a) => `Add the decimals: ${a}`,
    estimatedTime: 45 + (difficulty * 10),
    tags: ['decimals', 'addition']
  };
};

const percentageGenerator = (): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const percents = [10, 20, 25, 50, 75];
      const percent = percents[rand(0, percents.length - 1)];
      const whole = rand(20, 200);

      const contexts = [
        `What is ${percent}% of ${whole} gold coins?`,
        `A ${percent}% discount on $${whole}. How much do you save?`,
        `${percent}% of ${whole} students passed. How many passed?`,
        `You complete ${percent}% of ${whole} quests. How many quests completed?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const percents = [10, 20, 25, 50, 75];
      const percent = percents[rand(0, percents.length - 1)];
      const whole = rand(20, 200);
      return Math.floor(whole * percent / 100).toString();
    },
    topic: 'percentages',
    difficulty: 3,
    gradeLevel: 6,
    worldTheme: 'Decimal Desert',
    getHints: () => [
      'Convert the percentage to a decimal by dividing by 100',
      'Multiply the decimal by the total',
      'Or find 1% first, then multiply by the percentage'
    ],
    getExplanation: (q, a) => `Calculate the percentage: ${a}`,
    estimatedTime: 50,
    tags: ['percentages', 'decimals']
  };
};

// ========================================
// ALGEBRA GENERATORS
// ========================================

const algebraSimpleEquationGenerator = (): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const operations = ['+', '-', '*'];
      const op = operations[rand(0, operations.length - 1)];
      const x = rand(5, 20);
      const other = rand(5, 30);
      let result;

      if (op === '+') result = x + other;
      else if (op === '-') result = x + other;
      else result = x * other;

      const contexts = [
        `Solve for x: x ${op} ${other} = ${result}`,
        `Find x: x ${op} ${other} = ${result}`,
        `What is x if x ${op} ${other} = ${result}?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      return rand(5, 20).toString();
    },
    topic: 'algebra',
    difficulty: 3,
    gradeLevel: 6,
    worldTheme: 'Algebra Archipelago',
    getHints: () => [
      'Isolate the variable x on one side',
      'Use inverse operations',
      'Check your answer by substituting back'
    ],
    getExplanation: (q, a) => `Solve for x: ${a}`,
    estimatedTime: 50,
    tags: ['algebra', 'equations']
  };
};

// ========================================
// GEOMETRY GENERATORS
// ========================================

const perimeterGenerator = (): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const length = rand(5, 25);
      const width = rand(3, length - 1);

      const contexts = [
        `A rectangular room is ${length}m long and ${width}m wide. What's the perimeter?`,
        `A garden is ${length} feet by ${width} feet. How much fencing needed for the perimeter?`,
        `A spaceship deck is ${length}m × ${width}m. What's the perimeter?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const length = rand(5, 25);
      const width = rand(3, length - 1);
      return (2 * (length + width)).toString();
    },
    topic: 'geometry',
    difficulty: 2,
    gradeLevel: 4,
    worldTheme: 'Geometry Galaxy',
    getHints: () => [
      'Perimeter = 2 × (length + width)',
      'Or add all four sides',
      'Perimeter is the distance around the rectangle'
    ],
    getExplanation: (q, a) => `Calculate perimeter: ${a}`,
    estimatedTime: 40,
    tags: ['geometry', 'perimeter']
  };
};

const areaGenerator = (): ProblemTemplate => {
  return {
    generateQuestion: () => {
      const length = rand(5, 20);
      const width = rand(3, length);

      const contexts = [
        `A rectangular field is ${length}m by ${width}m. What's the area?`,
        `A painting is ${length} inches long and ${width} inches wide. Area?`,
        `A solar panel is ${length}m × ${width}m. What's its area?`,
      ];
      return contexts[rand(0, contexts.length - 1)];
    },
    generateAnswer: () => {
      const length = rand(5, 20);
      const width = rand(3, length);
      return (length * width).toString();
    },
    topic: 'geometry',
    difficulty: 2,
    gradeLevel: 4,
    worldTheme: 'Geometry Galaxy',
    getHints: () => [
      'Area = length × width',
      'Multiply the two dimensions',
      'Area is measured in square units'
    ],
    getExplanation: (q, a) => `Calculate area: ${a} square units`,
    estimatedTime: 40,
    tags: ['geometry', 'area']
  };
};

// ========================================
// GENERATE PROBLEMS FROM TEMPLATES
// ========================================

export async function generateAndSeedProblems() {
  console.log('🎲 Generating 500 diverse math problems...\n');

  const templates: ProblemTemplate[] = [
    // Number Kingdom (150 problems)
    ...Array(30).fill(null).map(() => additionGenerator(1)),
    ...Array(25).fill(null).map(() => additionGenerator(2)),
    ...Array(20).fill(null).map(() => additionGenerator(3)),
    ...Array(25).fill(null).map(() => subtractionGenerator(1)),
    ...Array(20).fill(null).map(() => subtractionGenerator(2)),
    ...Array(15).fill(null).map(() => subtractionGenerator(3)),
    ...Array(30).fill(null).map(() => multiplicationGenerator(1)),
    ...Array(20).fill(null).map(() => multiplicationGenerator(2)),
    ...Array(15).fill(null).map(() => multiplicationGenerator(3)),
    ...Array(25).fill(null).map(() => divisionGenerator(1)),
    ...Array(20).fill(null).map(() => divisionGenerator(2)),
    ...Array(15).fill(null).map(() => divisionGenerator(3)),

    // Fraction Forest (120 problems)
    ...Array(40).fill(null).map(() => fractionAdditionGenerator(1)),
    ...Array(30).fill(null).map(() => fractionAdditionGenerator(2)),
    ...Array(25).fill(null).map(() => fractionAdditionGenerator(3)),
    ...Array(25).fill(null).map(() => fractionMultiplicationGenerator()),

    // Decimal Desert (100 problems)
    ...Array(40).fill(null).map(() => decimalAdditionGenerator(1)),
    ...Array(30).fill(null).map(() => decimalAdditionGenerator(2)),
    ...Array(30).fill(null).map(() => percentageGenerator()),

    // Algebra Archipelago (60 problems)
    ...Array(60).fill(null).map(() => algebraSimpleEquationGenerator()),

    // Geometry Galaxy (70 problems)
    ...Array(35).fill(null).map(() => perimeterGenerator()),
    ...Array(35).fill(null).map(() => areaGenerator()),
  ];

  console.log(`📝 Generated ${templates.length} problem templates`);
  console.log('💾 Creating problems in database...\n');

  let createdCount = 0;
  const batchSize = 50;

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize);

    await Promise.all(batch.map(async (template) => {
      const question = template.generateQuestion();
      const answer = template.generateAnswer();
      const hints = template.getHints(question, answer);
      const explanation = template.getExplanation(question, answer);

      await prisma.problem.create({
        data: {
          question,
          correctAnswer: answer,
          topic: template.topic,
          difficulty: template.difficulty,
          gradeLevel: template.gradeLevel,
          hint1: hints[0],
          hint2: hints[1],
          hint3: hints[2],
          explanation,
          estimatedTime: template.estimatedTime,
          tags: template.tags || [],
        },
      });

      createdCount++;
      if (createdCount % 50 === 0) {
        console.log(`  ✓ Created ${createdCount} problems...`);
      }
    }));
  }

  console.log(`\n✅ Successfully created ${createdCount} problems!`);

  // Count by world
  const byWorld = {
    numberKingdom: templates.filter(t => t.worldTheme === 'Number Kingdom').length,
    fractionForest: templates.filter(t => t.worldTheme === 'Fraction Forest').length,
    decimalDesert: templates.filter(t => t.worldTheme === 'Decimal Desert').length,
    algebraArchipelago: templates.filter(t => t.worldTheme === 'Algebra Archipelago').length,
    geometryGalaxy: templates.filter(t => t.worldTheme === 'Geometry Galaxy').length,
  };

  console.log('\n📊 Problem Distribution:');
  console.log(`  Number Kingdom: ${byWorld.numberKingdom} problems`);
  console.log(`  Fraction Forest: ${byWorld.fractionForest} problems`);
  console.log(`  Decimal Desert: ${byWorld.decimalDesert} problems`);
  console.log(`  Algebra Archipelago: ${byWorld.algebraArchipelago} problems`);
  console.log(`  Geometry Galaxy: ${byWorld.geometryGalaxy} problems`);
  console.log(`  TOTAL: ${createdCount} generated problems\n`);
}