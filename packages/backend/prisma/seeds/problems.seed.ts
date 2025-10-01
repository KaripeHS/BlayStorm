import { PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface ProblemData {
  question: string;
  correctAnswer: string;
  topic: string;
  difficulty: number;
  gradeLevel: number;
  hint1: string;
  hint2: string;
  hint3: string;
  explanation: string;
  estimatedTime: number;
  tags?: string[];
  worldTheme?: string;
  bossTheme?: string;
}

// ========================================
// NUMBER KINGDOM PROBLEMS (Grades 4-5)
// Basic operations, place value, factors
// ========================================

const numberKingdomProblems: ProblemData[] = [
  // Chapter 1: The Castle Gates (Addition)
  {
    question: "The Castle Gates have 2,347 stones on the left tower and 1,892 stones on the right tower. How many stones in total?",
    correctAnswer: "4239",
    topic: "addition",
    difficulty: 1,
    gradeLevel: 4,
    hint1: "Line up the numbers by place value: ones, tens, hundreds, thousands",
    hint2: "Start adding from the rightmost column (ones place)",
    hint3: "Don't forget to carry over when a column sum is 10 or more!",
    explanation: "Add place by place:\nOnes: 7 + 2 = 9\nTens: 4 + 9 = 13 (write 3, carry 1)\nHundreds: 3 + 8 + 1 = 12 (write 2, carry 1)\nThousands: 2 + 1 + 1 = 4\nAnswer: 4,239 stones",
    estimatedTime: 45,
    worldTheme: "Number Kingdom",
    tags: ["addition", "place value", "carrying"]
  },
  {
    question: "The royal treasury has 5,673 gold coins. The king adds 3,458 more coins. How many coins are there now?",
    correctAnswer: "9131",
    topic: "addition",
    difficulty: 1,
    gradeLevel: 4,
    hint1: "This is another addition problem with larger numbers",
    hint2: "Stack the numbers and add column by column",
    hint3: "Watch out for carrying in multiple columns!",
    explanation: "5,673 + 3,458:\nOnes: 3 + 8 = 11 (write 1, carry 1)\nTens: 7 + 5 + 1 = 13 (write 3, carry 1)\nHundreds: 6 + 4 + 1 = 11 (write 1, carry 1)\nThousands: 5 + 3 + 1 = 9\nAnswer: 9,131 coins 💰",
    estimatedTime: 45,
    worldTheme: "Number Kingdom"
  },
  {
    question: "A merchant brings 847 apples, 562 oranges, and 391 pears to the castle market. How many fruits in total?",
    correctAnswer: "1800",
    topic: "addition",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "You need to add THREE numbers together",
    hint2: "Add two numbers first, then add the third to your result",
    hint3: "847 + 562 = ? Then add 391 to that answer",
    explanation: "First: 847 + 562 = 1,409\nThen: 1,409 + 391 = 1,800\nOr add all at once:\n  847\n  562\n+ 391\n─────\n1,800 fruits 🍎🍊🍐",
    estimatedTime: 60,
    worldTheme: "Number Kingdom"
  },

  // Chapter 2: The Counting Courtyard (Subtraction)
  {
    question: "The royal army has 8,453 soldiers. After 2,687 soldiers go on a quest, how many soldiers remain at the castle?",
    correctAnswer: "5766",
    topic: "subtraction",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "This is a subtraction problem: 8,453 - 2,687",
    hint2: "You'll need to borrow when a digit on top is smaller than the one below",
    hint3: "Start from the ones place and work your way left",
    explanation: "8,453 - 2,687:\nOnes: 3 < 7, borrow: 13 - 7 = 6\nTens: 4 < 8, borrow: 14 - 8 = 6\nHundreds: 4 - 6, borrow: 14 - 6 = 7 (note: we borrowed from this column)\nThousands: 7 - 2 = 5\nAnswer: 5,766 soldiers ⚔️",
    estimatedTime: 60,
    worldTheme: "Number Kingdom"
  },
  {
    question: "The castle library has 6,004 books. If 2,876 books are checked out, how many books are still in the library?",
    correctAnswer: "3128",
    topic: "subtraction",
    difficulty: 3,
    gradeLevel: 4,
    hint1: "Notice the zeros in 6,004 - they make borrowing tricky!",
    hint2: "When you need to borrow from a zero, keep going left until you find a non-zero digit",
    hint3: "Think of 6,004 as 5,990 + 14 when borrowing",
    explanation: "6,004 - 2,876:\nThis requires multiple borrowing steps:\nOnes: 4 < 6, borrow (but from where?)\nBorrow from thousands: 6,004 becomes 5,10,9,14\nNow subtract: 14-6=8, 9-7=2, 10-8=1, 5-2=3\nAnswer: 3,128 books 📚",
    estimatedTime: 75,
    worldTheme: "Number Kingdom"
  },

  // Chapter 3: Multiplication Manor (Multiplication)
  {
    question: "Each guard tower needs 48 arrows. If there are 7 guard towers, how many arrows are needed in total?",
    correctAnswer: "336",
    topic: "multiplication",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Multiply 48 × 7",
    hint2: "Break it down: (40 × 7) + (8 × 7)",
    hint3: "40 × 7 = 280, and 8 × 7 = 56",
    explanation: "48 × 7 can be solved using:\nMethod 1: 280 + 56 = 336\nMethod 2: Standard algorithm:\n   48\n ×  7\n────\n  336\n(7×8=56, write 6 carry 5)\n(7×4=28, plus 5=33)\nAnswer: 336 arrows 🏹",
    estimatedTime: 50,
    worldTheme: "Number Kingdom"
  },
  {
    question: "The royal baker makes 23 loaves of bread each day. How many loaves does he make in 15 days?",
    correctAnswer: "345",
    topic: "multiplication",
    difficulty: 3,
    gradeLevel: 4,
    hint1: "Calculate 23 × 15",
    hint2: "Break 15 into (10 + 5) and multiply separately: (23×10) + (23×5)",
    hint3: "23 × 10 = 230, and 23 × 5 = 115",
    explanation: "23 × 15:\nMethod 1: 230 + 115 = 345\nMethod 2: Standard algorithm:\n   23\n × 15\n────\n  115  (23 × 5)\n 230  (23 × 10)\n────\n  345\nAnswer: 345 loaves 🍞",
    estimatedTime: 60,
    worldTheme: "Number Kingdom"
  },
  {
    question: "The castle feast needs 126 chairs. If each table seats 6 people, and you set up 21 tables, do you have enough chairs?",
    correctAnswer: "yes",
    topic: "multiplication",
    difficulty: 4,
    gradeLevel: 4,
    hint1: "Calculate how many people can sit: 21 tables × 6 people per table",
    hint2: "Compare that number to 126 chairs",
    hint3: "21 × 6 = ?",
    explanation: "21 tables × 6 people = 126 people\nYou have exactly 126 chairs for 126 people.\nPerfect fit! Answer: YES ✓\n\n(If you calculated and got 126 = 126, that's enough!)",
    estimatedTime: 55,
    worldTheme: "Number Kingdom"
  },

  // Chapter 4: Division District (Division)
  {
    question: "The king wants to distribute 456 gold coins equally among 8 knights. How many coins does each knight get?",
    correctAnswer: "57",
    topic: "division",
    difficulty: 3,
    gradeLevel: 4,
    hint1: "Divide 456 ÷ 8",
    hint2: "Start with: How many 8s go into 45? (5), then how many go into 56? (7)",
    hint3: "Use long division or think: 8 × 50 = 400, so try 50 + something",
    explanation: "456 ÷ 8 = 57\nLong division:\n8 goes into 45 five times (5 × 8 = 40), remainder 5\nBring down 6 to make 56\n8 goes into 56 seven times (7 × 8 = 56), remainder 0\nAnswer: Each knight gets 57 gold coins ⚔️💰",
    estimatedTime: 70,
    worldTheme: "Number Kingdom"
  },
  {
    question: "A wizard's spell requires 864 magic crystals to be divided equally into 12 pouches. How many crystals per pouch?",
    correctAnswer: "72",
    topic: "division",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Calculate 864 ÷ 12",
    hint2: "Think: 12 × 70 = 840, so you're close to 70-something",
    hint3: "Try 12 × 72 to check",
    explanation: "864 ÷ 12 = 72\nCheck: 12 × 72 = 12 × 70 + 12 × 2 = 840 + 24 = 864 ✓\nAnswer: 72 crystals per pouch 💎",
    estimatedTime: 65,
    worldTheme: "Number Kingdom"
  },

  // Chapter 5: Factor Forest (Factors & Multiples)
  {
    question: "The royal garden is rectangular with 36 flower beds. What are ALL the possible dimensions (length × width)?",
    correctAnswer: "1x36, 2x18, 3x12, 4x9, 6x6",
    topic: "factors",
    difficulty: 4,
    gradeLevel: 5,
    hint1: "Find all factor pairs of 36",
    hint2: "Start with 1 × 36, then try 2, 3, 4...",
    hint3: "Stop when factors start repeating (like 6×6)",
    explanation: "Factor pairs of 36:\n1 × 36 = 36\n2 × 18 = 36\n3 × 12 = 36\n4 × 9 = 36\n6 × 6 = 36\nAnswer: 1×36, 2×18, 3×12, 4×9, 6×6 🌸",
    estimatedTime: 80,
    worldTheme: "Number Kingdom"
  },
  {
    question: "You need to arrange 48 soldiers into equal rows for a parade. If you want 8 soldiers per row, how many rows will you have?",
    correctAnswer: "6",
    topic: "division",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Divide 48 by 8",
    hint2: "Think: 8 × ? = 48",
    hint3: "Count by 8s: 8, 16, 24, 32, 40, 48",
    explanation: "48 ÷ 8 = 6\nCheck: 8 × 6 = 48 ✓\nAnswer: 6 rows of soldiers ⚔️",
    estimatedTime: 40,
    worldTheme: "Number Kingdom"
  },
];

// ========================================
// FRACTION FOREST PROBLEMS (Grades 4-6)
// Fractions, decimals, percentages
// ========================================

const fractionForestProblems: ProblemData[] = [
  // Chapter 1: The Fractured Path
  {
    question: "A forest path is 3/4 mile long. You've walked 1/4 mile. What fraction of the path remains?",
    correctAnswer: "1/2",
    topic: "fractions",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Subtract the fractions: 3/4 - 1/4",
    hint2: "When denominators are the same, just subtract the numerators",
    hint3: "3 - 1 = 2, so the answer is 2/4. Can you simplify?",
    explanation: "3/4 - 1/4 = 2/4\nSimplify by dividing both numerator and denominator by 2:\n2/4 = 1/2\nAnswer: 1/2 of the path remains 🌲",
    estimatedTime: 45,
    worldTheme: "Fraction Forest"
  },
  {
    question: "An elf collects berries. She fills 2/3 of one basket and 1/3 of another basket. How many baskets total?",
    correctAnswer: "1",
    topic: "fractions",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Add the fractions: 2/3 + 1/3",
    hint2: "Same denominators, so add the numerators: 2 + 1",
    hint3: "2 + 1 = 3, so you get 3/3. What is 3/3?",
    explanation: "2/3 + 1/3 = 3/3 = 1 whole basket\nAnswer: 1 basket 🧺🫐",
    estimatedTime: 40,
    worldTheme: "Fraction Forest"
  },
  {
    question: "A recipe needs 1/2 cup of acorns and 1/4 cup of pinecones. How much more acorns than pinecones?",
    correctAnswer: "1/4",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Find the difference: 1/2 - 1/4",
    hint2: "Convert to common denominators. What's 1/2 with denominator 4?",
    hint3: "1/2 = 2/4, so 2/4 - 1/4 = ?",
    explanation: "Convert 1/2 to fourths: 1/2 = 2/4\nNow subtract: 2/4 - 1/4 = 1/4\nAnswer: 1/4 cup more acorns 🌰",
    estimatedTime: 55,
    worldTheme: "Fraction Forest"
  },
  {
    question: "A squirrel eats 3/8 of the nuts on Monday and 2/8 on Tuesday. What fraction of nuts remain?",
    correctAnswer: "3/8",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "First, add how much was eaten: 3/8 + 2/8",
    hint2: "Then subtract from the whole: 1 - (amount eaten)",
    hint3: "Total eaten = 5/8, so remaining = 8/8 - 5/8",
    explanation: "Monday + Tuesday: 3/8 + 2/8 = 5/8 eaten\nStarted with 8/8 (whole)\nRemaining: 8/8 - 5/8 = 3/8\nAnswer: 3/8 of nuts remain 🥜",
    estimatedTime: 60,
    worldTheme: "Fraction Forest"
  },

  // Chapter 2: Equivalent Grove
  {
    question: "You have 2/3 of a treasure map. Your friend has an equivalent piece. If theirs is in sixths, what fraction do they have?",
    correctAnswer: "4/6",
    topic: "fractions",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Find an equivalent fraction with denominator 6",
    hint2: "What do you multiply 3 by to get 6? Multiply both parts by that number",
    hint3: "2/3 = (2×2)/(3×2) = ?",
    explanation: "To convert 2/3 to sixths:\n2/3 × 2/2 = 4/6\nThese are equivalent fractions!\nAnswer: 4/6 🗺️",
    estimatedTime: 45,
    worldTheme: "Fraction Forest"
  },
  {
    question: "Simplify this fraction to its lowest terms: 12/18",
    correctAnswer: "2/3",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Find the greatest common factor (GCF) of 12 and 18",
    hint2: "Both 12 and 18 are divisible by 6",
    hint3: "Divide both numerator and denominator by 6",
    explanation: "GCF of 12 and 18 is 6\n12 ÷ 6 = 2\n18 ÷ 6 = 3\n12/18 = 2/3 in simplest form\nAnswer: 2/3 ✓",
    estimatedTime: 50,
    worldTheme: "Fraction Forest"
  },

  // Chapter 3: Multiplication Meadow
  {
    question: "A fairy flies 2/5 of a mile each day. How far does she fly in 3 days?",
    correctAnswer: "6/5 or 1 1/5",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Multiply the fraction by the whole number: 2/5 × 3",
    hint2: "Multiply 2 × 3 to get the numerator",
    hint3: "2 × 3 = 6, so the answer is 6/5. Can you write as a mixed number?",
    explanation: "2/5 × 3 = (2 × 3)/5 = 6/5\nAs a mixed number: 6/5 = 1 1/5 miles\nAnswer: 6/5 or 1 1/5 miles 🧚✨",
    estimatedTime: 55,
    worldTheme: "Fraction Forest"
  },
  {
    question: "You have 3/4 of a pizza. You eat 1/2 of what you have. How much pizza did you eat?",
    correctAnswer: "3/8",
    topic: "fractions",
    difficulty: 4,
    gradeLevel: 5,
    hint1: "Find 1/2 of 3/4: multiply the fractions",
    hint2: "1/2 × 3/4 = (1×3)/(2×4)",
    hint3: "Multiply across: numerators together, denominators together",
    explanation: "1/2 × 3/4 = (1×3)/(2×4) = 3/8\nYou ate 3/8 of the whole pizza 🍕",
    estimatedTime: 60,
    worldTheme: "Fraction Forest"
  },

  // Chapter 4: Division Dell
  {
    question: "You have 3/4 cup of magical nectar to divide equally among 3 fairies. How much does each fairy get?",
    correctAnswer: "1/4",
    topic: "fractions",
    difficulty: 4,
    gradeLevel: 6,
    hint1: "Divide the fraction by 3: (3/4) ÷ 3",
    hint2: "Dividing by 3 is the same as multiplying by 1/3",
    hint3: "(3/4) × (1/3) = 3/(4×3) = 3/12. Can you simplify?",
    explanation: "(3/4) ÷ 3 = (3/4) × (1/3) = 3/12\nSimplify: 3/12 = 1/4\nEach fairy gets 1/4 cup 🧚💧",
    estimatedTime: 70,
    worldTheme: "Fraction Forest"
  },
  {
    question: "A rope is 5/6 meter long. You cut it into pieces that are each 1/6 meter. How many pieces do you get?",
    correctAnswer: "5",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Divide: (5/6) ÷ (1/6)",
    hint2: "How many 1/6s fit into 5/6?",
    hint3: "Think: 5 sixths ÷ 1 sixth = 5",
    explanation: "(5/6) ÷ (1/6) = 5\nYou can fit five 1/6-meter pieces into 5/6 meters\nAnswer: 5 pieces 🪢",
    estimatedTime: 55,
    worldTheme: "Fraction Forest"
  },

  // Chapter 5: Comparing Creek
  {
    question: "Which is larger: 5/8 or 3/4?",
    correctAnswer: "3/4",
    topic: "fractions",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Convert to common denominators",
    hint2: "Convert 3/4 to eighths: 3/4 = ?/8",
    hint3: "3/4 = 6/8. Now compare 5/8 and 6/8",
    explanation: "Convert to eighths:\n3/4 = 6/8\nNow compare: 5/8 vs 6/8\n6/8 > 5/8\nTherefore: 3/4 > 5/8\nAnswer: 3/4 is larger ✓",
    estimatedTime: 50,
    worldTheme: "Fraction Forest"
  },
  {
    question: "Order from smallest to largest: 2/3, 1/2, 5/6",
    correctAnswer: "1/2, 2/3, 5/6",
    topic: "fractions",
    difficulty: 4,
    gradeLevel: 5,
    hint1: "Convert all to a common denominator. Try 6!",
    hint2: "1/2 = 3/6, 2/3 = 4/6, 5/6 = 5/6",
    hint3: "Now compare: 3/6, 4/6, 5/6",
    explanation: "Convert to sixths:\n1/2 = 3/6\n2/3 = 4/6\n5/6 = 5/6\nOrder: 3/6 < 4/6 < 5/6\nAnswer: 1/2, 2/3, 5/6 📊",
    estimatedTime: 65,
    worldTheme: "Fraction Forest"
  },
];

// ========================================
// DECIMAL DESERT PROBLEMS (Grades 4-6)
// Decimals, rounding, place value
// ========================================

const decimalDesertProblems: ProblemData[] = [
  // Chapter 1: The Oasis of Ones
  {
    question: "A desert traveler walks 12.8 miles on Day 1 and 15.3 miles on Day 2. How many total miles?",
    correctAnswer: "28.1",
    topic: "decimals",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Add the decimals: 12.8 + 15.3",
    hint2: "Line up the decimal points",
    hint3: "Add column by column: 0.8 + 0.3 = 1.1, 12 + 15 + 1 = 28",
    explanation: "  12.8\n+ 15.3\n─────\n  28.1 miles\nAnswer: 28.1 miles 🏜️",
    estimatedTime: 45,
    worldTheme: "Decimal Desert"
  },
  {
    question: "A water bottle holds 2.5 liters. After drinking some, 0.8 liters remain. How much water was drunk?",
    correctAnswer: "1.7",
    topic: "decimals",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Subtract: 2.5 - 0.8",
    hint2: "Line up decimal points and subtract",
    hint3: "5 - 8 requires borrowing: 15 - 8 = 7, and 1 - 0 = 1",
    explanation: "  2.5\n- 0.8\n─────\n  1.7 liters\nAnswer: 1.7 liters 💧",
    estimatedTime: 45,
    worldTheme: "Decimal Desert"
  },

  // Chapter 2: The Tenth Territory
  {
    question: "A merchant sells spices for $4.25 per pound. If you buy 3 pounds, how much do you pay?",
    correctAnswer: "12.75",
    topic: "decimals",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Multiply: 4.25 × 3",
    hint2: "Multiply as if there's no decimal: 425 × 3 = 1275",
    hint3: "Count decimal places in the problem (2), put it back in answer: 12.75",
    explanation: "4.25 × 3:\nIgnore decimal: 425 × 3 = 1,275\nRestore decimal (2 places): 12.75\nAnswer: $12.75 💰",
    estimatedTime: 55,
    worldTheme: "Decimal Desert"
  },
  {
    question: "Convert this fraction to a decimal: 3/4",
    correctAnswer: "0.75",
    topic: "decimals",
    difficulty: 2,
    gradeLevel: 5,
    hint1: "Divide 3 by 4",
    hint2: "Think: 3.00 ÷ 4",
    hint3: "4 goes into 30 seven times (0.7), remainder 2. 4 goes into 20 five times (0.05)",
    explanation: "3 ÷ 4 = 0.75\nLong division: 3.00 ÷ 4 = 0.75\nAnswer: 0.75 ✓",
    estimatedTime: 50,
    worldTheme: "Decimal Desert"
  },

  // Chapter 3: Hundred Dunes
  {
    question: "Round 47.68 to the nearest tenth.",
    correctAnswer: "47.7",
    topic: "decimals",
    difficulty: 2,
    gradeLevel: 5,
    hint1: "Look at the hundredths place: 8",
    hint2: "Is 8 ≥ 5? If yes, round up the tenths place",
    hint3: "The 6 in the tenths place rounds up to 7",
    explanation: "47.68 → look at hundredths (8)\n8 ≥ 5, so round up\n47.6 rounds to 47.7\nAnswer: 47.7 📍",
    estimatedTime: 40,
    worldTheme: "Decimal Desert"
  },
  {
    question: "What is 3.456 rounded to the nearest hundredth?",
    correctAnswer: "3.46",
    topic: "decimals",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Look at the thousandths place: 6",
    hint2: "Is 6 ≥ 5? If yes, round up the hundredths place",
    hint3: "The 5 in the hundredths place rounds up to 6",
    explanation: "3.456 → look at thousandths (6)\n6 ≥ 5, so round up\n3.45 rounds to 3.46\nAnswer: 3.46 ✓",
    estimatedTime: 45,
    worldTheme: "Decimal Desert"
  },

  // Chapter 4: Division Dunes
  {
    question: "A 15.6-mile desert trail is divided into 4 equal sections. How long is each section?",
    correctAnswer: "3.9",
    topic: "decimals",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Divide: 15.6 ÷ 4",
    hint2: "Use long division: 4 goes into 15 three times (12), remainder 3",
    hint3: "Bring down the 6: 36 ÷ 4 = 9, so answer is 3.9",
    explanation: "15.6 ÷ 4 = 3.9\nCheck: 3.9 × 4 = 15.6 ✓\nAnswer: 3.9 miles per section 🏜️",
    estimatedTime: 60,
    worldTheme: "Decimal Desert"
  },
  {
    question: "If 6 camels cost $234.60, how much does one camel cost?",
    correctAnswer: "39.10 or 39.1",
    topic: "decimals",
    difficulty: 4,
    gradeLevel: 6,
    hint1: "Divide: 234.60 ÷ 6",
    hint2: "6 goes into 234 thirty-nine times (234)",
    hint3: "Bring down .60: 60 ÷ 6 = 10 cents",
    explanation: "234.60 ÷ 6 = 39.10\nAnswer: $39.10 per camel 🐫",
    estimatedTime: 65,
    worldTheme: "Decimal Desert"
  },

  // Chapter 5: Percentage Plains
  {
    question: "Convert 0.45 to a percentage.",
    correctAnswer: "45%",
    topic: "percentages",
    difficulty: 2,
    gradeLevel: 5,
    hint1: "Multiply by 100 to convert decimal to percent",
    hint2: "0.45 × 100 = ?",
    hint3: "Move the decimal point two places right",
    explanation: "0.45 = 45%\n(Multiply by 100 or move decimal 2 places right)\nAnswer: 45% ✓",
    estimatedTime: 35,
    worldTheme: "Decimal Desert"
  },
  {
    question: "What is 25% of 80 gold coins?",
    correctAnswer: "20",
    topic: "percentages",
    difficulty: 3,
    gradeLevel: 6,
    hint1: "25% means 25/100 or 0.25",
    hint2: "Multiply: 0.25 × 80",
    hint3: "Or think: 25% = 1/4, so find 1/4 of 80",
    explanation: "25% of 80:\nMethod 1: 0.25 × 80 = 20\nMethod 2: 25% = 1/4, so 80 ÷ 4 = 20\nAnswer: 20 gold coins 💰",
    estimatedTime: 50,
    worldTheme: "Decimal Desert"
  },
];

// Continue with more worlds... (Algebra Archipelago, Geometry Galaxy)
// For brevity, I'll add a representative sample from each

// ========================================
// ALGEBRA ARCHIPELAGO PROBLEMS (Grades 5-8)
// Variables, equations, expressions
// ========================================

const algebraArchipelagoProblems: ProblemData[] = [
  {
    question: "On Mystery Island, you find x treasure chests. Each chest has 7 gems. If you have 42 gems total, how many chests did you find? (Solve for x)",
    correctAnswer: "6",
    topic: "algebra",
    difficulty: 3,
    gradeLevel: 6,
    hint1: "Write the equation: 7x = 42",
    hint2: "Divide both sides by 7",
    hint3: "x = 42 ÷ 7",
    explanation: "7x = 42\nDivide both sides by 7:\nx = 42 ÷ 7\nx = 6\nAnswer: 6 treasure chests 💎",
    estimatedTime: 55,
    worldTheme: "Algebra Archipelago"
  },
  {
    question: "A pirate has some parrots (p). After buying 5 more parrots, he now has 12 parrots total. How many did he start with? Write and solve: p + 5 = 12",
    correctAnswer: "7",
    topic: "algebra",
    difficulty: 2,
    gradeLevel: 6,
    hint1: "You need to isolate p",
    hint2: "Subtract 5 from both sides",
    hint3: "p = 12 - 5",
    explanation: "p + 5 = 12\nSubtract 5 from both sides:\np = 12 - 5\np = 7\nAnswer: He started with 7 parrots 🦜",
    estimatedTime: 45,
    worldTheme: "Algebra Archipelago"
  },
  {
    question: "Simplify this expression: 3x + 5x",
    correctAnswer: "8x",
    topic: "algebra",
    difficulty: 2,
    gradeLevel: 6,
    hint1: "Combine like terms",
    hint2: "Both terms have the variable x",
    hint3: "3 + 5 = 8, so 3x + 5x = 8x",
    explanation: "3x + 5x = (3 + 5)x = 8x\nAnswer: 8x ✓",
    estimatedTime: 35,
    worldTheme: "Algebra Archipelago"
  },
  {
    question: "Evaluate 4n - 7 when n = 5",
    correctAnswer: "13",
    topic: "algebra",
    difficulty: 2,
    gradeLevel: 6,
    hint1: "Substitute n = 5 into the expression",
    hint2: "4(5) - 7 = ?",
    hint3: "First multiply: 4 × 5 = 20, then subtract: 20 - 7",
    explanation: "4n - 7 when n = 5:\n4(5) - 7 = 20 - 7 = 13\nAnswer: 13 ✓",
    estimatedTime: 40,
    worldTheme: "Algebra Archipelago"
  },
  {
    question: "The sum of a number (n) and 15 equals 42. Find the number. Write and solve the equation.",
    correctAnswer: "27",
    topic: "algebra",
    difficulty: 3,
    gradeLevel: 7,
    hint1: "Write the equation: n + 15 = 42",
    hint2: "Subtract 15 from both sides",
    hint3: "n = 42 - 15",
    explanation: "n + 15 = 42\nSubtract 15 from both sides:\nn = 42 - 15\nn = 27\nAnswer: 27 ✓",
    estimatedTime: 50,
    worldTheme: "Algebra Archipelago"
  },
];

// ========================================
// GEOMETRY GALAXY PROBLEMS (Grades 4-8)
// Shapes, area, perimeter, volume
// ========================================

const geometryGalaxyProblems: ProblemData[] = [
  {
    question: "A rectangular spaceship landing pad is 15 meters long and 8 meters wide. What is its perimeter?",
    correctAnswer: "46",
    topic: "geometry",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Perimeter = 2 × (length + width)",
    hint2: "Or add all four sides: 15 + 8 + 15 + 8",
    hint3: "2 × (15 + 8) = 2 × 23",
    explanation: "Perimeter = 2 × (length + width)\n= 2 × (15 + 8)\n= 2 × 23\n= 46 meters\nAnswer: 46 meters 🚀",
    estimatedTime: 45,
    worldTheme: "Geometry Galaxy"
  },
  {
    question: "What is the area of that same rectangular landing pad? (15m × 8m)",
    correctAnswer: "120",
    topic: "geometry",
    difficulty: 2,
    gradeLevel: 4,
    hint1: "Area of rectangle = length × width",
    hint2: "Multiply 15 × 8",
    hint3: "Think: 15 × 8 = (10 × 8) + (5 × 8) = 80 + 40",
    explanation: "Area = length × width\n= 15 × 8\n= 120 square meters\nAnswer: 120 square meters 📐",
    estimatedTime: 40,
    worldTheme: "Geometry Galaxy"
  },
  {
    question: "A square space station room has sides of 12 meters. What is its area?",
    correctAnswer: "144",
    topic: "geometry",
    difficulty: 2,
    gradeLevel: 5,
    hint1: "Area of square = side × side",
    hint2: "Calculate 12 × 12",
    hint3: "12² = 144",
    explanation: "Area = side²\n= 12 × 12\n= 144 square meters\nAnswer: 144 square meters ⬛",
    estimatedTime: 40,
    worldTheme: "Geometry Galaxy"
  },
  {
    question: "A triangle-shaped solar panel has a base of 10 meters and height of 6 meters. What is its area?",
    correctAnswer: "30",
    topic: "geometry",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Area of triangle = (base × height) ÷ 2",
    hint2: "Calculate (10 × 6) ÷ 2",
    hint3: "60 ÷ 2 = 30",
    explanation: "Area = (base × height) ÷ 2\n= (10 × 6) ÷ 2\n= 60 ÷ 2\n= 30 square meters\nAnswer: 30 square meters 🔺☀️",
    estimatedTime: 50,
    worldTheme: "Geometry Galaxy"
  },
  {
    question: "A cylindrical fuel tank has a radius of 4 meters and height of 10 meters. What is its volume? (Use π ≈ 3.14)",
    correctAnswer: "502.4",
    topic: "geometry",
    difficulty: 5,
    gradeLevel: 7,
    hint1: "Volume of cylinder = π × r² × h",
    hint2: "First calculate r²: 4² = 16",
    hint3: "Then: 3.14 × 16 × 10",
    explanation: "Volume = π × r² × h\n= 3.14 × 4² × 10\n= 3.14 × 16 × 10\n= 3.14 × 160\n= 502.4 cubic meters\nAnswer: 502.4 cubic meters ⚪",
    estimatedTime: 75,
    worldTheme: "Geometry Galaxy"
  },
];

// ========================================
// BOSS BATTLE PROBLEMS (All Topics)
// Harder problems themed around our 14 bosses
// ========================================

const bossBattleProblems: ProblemData[] = [
  // The Fraction Dragon Boss
  {
    question: "The Fraction Dragon has 5/6 of its health remaining. You deal damage equal to 1/3 of its max health. What fraction of health does it have now?",
    correctAnswer: "1/2",
    topic: "fractions",
    difficulty: 5,
    gradeLevel: 6,
    hint1: "Subtract: 5/6 - 1/3",
    hint2: "Convert to common denominator (6)",
    hint3: "1/3 = 2/6, so 5/6 - 2/6 = ?",
    explanation: "5/6 - 1/3:\nConvert 1/3 to sixths: 1/3 = 2/6\n5/6 - 2/6 = 3/6 = 1/2\nThe Dragon has 1/2 health left! 🐉",
    estimatedTime: 70,
    bossTheme: "The Fraction Dragon",
    tags: ["boss", "fractions", "subtraction"]
  },
  {
    question: "The Fraction Dragon splits into 4 equal clones. If the original had 800 HP, how much HP does each clone have?",
    correctAnswer: "200",
    topic: "division",
    difficulty: 3,
    gradeLevel: 5,
    hint1: "Divide 800 by 4",
    hint2: "800 ÷ 4 = ?",
    hint3: "Think: 4 × 200 = 800",
    explanation: "800 HP ÷ 4 clones = 200 HP per clone\nAnswer: Each clone has 200 HP 🐉🐉🐉🐉",
    estimatedTime: 45,
    bossTheme: "The Fraction Dragon"
  },

  // The Decimal Demon Boss
  {
    question: "The Decimal Demon attacks with 47.5 damage on hit 1, 38.2 damage on hit 2, and 54.8 damage on hit 3. What's the total damage?",
    correctAnswer: "140.5",
    topic: "decimals",
    difficulty: 4,
    gradeLevel: 6,
    hint1: "Add all three: 47.5 + 38.2 + 54.8",
    hint2: "Line up the decimals carefully",
    hint3: "Add column by column: 0.5+0.2+0.8=1.5 (carry 1), 47+38+54+1",
    explanation: "  47.5\n  38.2\n+ 54.8\n──────\n 140.5 total damage\nAnswer: 140.5 damage 😈",
    estimatedTime: 60,
    bossTheme: "The Decimal Demon"
  },

  // The Multiplication Monster Boss
  {
    question: "The Multiplication Monster spawns minions. Each wave has 3 times as many minions as the last. Wave 1 has 4 minions. How many in Wave 4?",
    correctAnswer: "108",
    topic: "multiplication",
    difficulty: 5,
    gradeLevel: 6,
    hint1: "Wave 1: 4, Wave 2: 4×3=12, Wave 3: 12×3=36, Wave 4: ?",
    hint2: "Keep multiplying by 3 each time",
    hint3: "36 × 3 = ?",
    explanation: "Wave 1: 4 minions\nWave 2: 4 × 3 = 12 minions\nWave 3: 12 × 3 = 36 minions\nWave 4: 36 × 3 = 108 minions\nAnswer: 108 minions! 👾",
    estimatedTime: 70,
    bossTheme: "The Multiplication Monster"
  },

  // The Percentage Phantom Boss
  {
    question: "The Percentage Phantom steals 20% of your 500 gold coins. How many coins did you lose?",
    correctAnswer: "100",
    topic: "percentages",
    difficulty: 4,
    gradeLevel: 6,
    hint1: "Find 20% of 500",
    hint2: "20% = 0.20, so multiply: 0.20 × 500",
    hint3: "Or think: 20% = 1/5, so 500 ÷ 5",
    explanation: "20% of 500:\nMethod 1: 0.20 × 500 = 100\nMethod 2: 20% = 1/5, so 500 ÷ 5 = 100\nAnswer: Lost 100 coins 👻💰",
    estimatedTime: 55,
    bossTheme: "The Percentage Phantom"
  },

  // The Algebra Alchemist Boss
  {
    question: "The Algebra Alchemist's spell strength is 3x + 15. If x = 8, how powerful is the spell?",
    correctAnswer: "39",
    topic: "algebra",
    difficulty: 3,
    gradeLevel: 7,
    hint1: "Substitute x = 8 into 3x + 15",
    hint2: "3(8) + 15 = ?",
    hint3: "First multiply: 3 × 8 = 24, then add: 24 + 15",
    explanation: "3x + 15 when x = 8:\n3(8) + 15\n= 24 + 15\n= 39 spell power\nAnswer: 39 spell power ⚗️✨",
    estimatedTime: 50,
    bossTheme: "The Algebra Alchemist"
  },

  // The Geometry Giant Boss
  {
    question: "The Geometry Giant's shield is a circle with radius 7 meters. What's the area of the shield? (Use π ≈ 3.14)",
    correctAnswer: "153.86",
    topic: "geometry",
    difficulty: 5,
    gradeLevel: 7,
    hint1: "Area of circle = π × r²",
    hint2: "Calculate r²: 7² = 49",
    hint3: "Then: 3.14 × 49",
    explanation: "Area = π × r²\n= 3.14 × 7²\n= 3.14 × 49\n= 153.86 square meters\nAnswer: 153.86 m² 🛡️",
    estimatedTime: 65,
    bossTheme: "The Geometry Giant"
  },
];

// Compile all problems
export const allProblems: ProblemData[] = [
  ...numberKingdomProblems,
  ...fractionForestProblems,
  ...decimalDesertProblems,
  ...algebraArchipelagoProblems,
  ...geometryGalaxyProblems,
  ...bossBattleProblems,
];

// Export for seeding
export async function seedProblems() {
  console.log('🌱 Seeding math problems...');

  let createdCount = 0;

  for (const problem of allProblems) {
    await prisma.problem.create({
      data: {
        question: problem.question,
        correctAnswer: problem.correctAnswer,
        topic: problem.topic,
        difficulty: problem.difficulty,
        gradeLevel: problem.gradeLevel,
        hint1: problem.hint1,
        hint2: problem.hint2,
        hint3: problem.hint3,
        explanation: problem.explanation,
        estimatedTime: problem.estimatedTime,
        tags: problem.tags || [],
      },
    });
    createdCount++;
  }

  console.log(`✅ Created ${createdCount} math problems!`);

  // Summary by world
  const numberKingdom = allProblems.filter(p => p.worldTheme === 'Number Kingdom').length;
  const fractionForest = allProblems.filter(p => p.worldTheme === 'Fraction Forest').length;
  const decimalDesert = allProblems.filter(p => p.worldTheme === 'Decimal Desert').length;
  const algebraArchipelago = allProblems.filter(p => p.worldTheme === 'Algebra Archipelago').length;
  const geometryGalaxy = allProblems.filter(p => p.worldTheme === 'Geometry Galaxy').length;
  const bossBattles = allProblems.filter(p => p.bossTheme).length;

  console.log('\n📊 Problem Distribution:');
  console.log(`  Number Kingdom: ${numberKingdom} problems`);
  console.log(`  Fraction Forest: ${fractionForest} problems`);
  console.log(`  Decimal Desert: ${decimalDesert} problems`);
  console.log(`  Algebra Archipelago: ${algebraArchipelago} problems`);
  console.log(`  Geometry Galaxy: ${geometryGalaxy} problems`);
  console.log(`  Boss Battles: ${bossBattles} problems`);
  console.log(`  TOTAL: ${createdCount} problems\n`);
}