import { prisma } from '../../server';
import { ProblemType } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export interface ProblemQuery {
  topic?: string;
  gradeLevel?: number;
  difficulty?: number;
  type?: ProblemType;
}

export class ProblemService {
  async getNextProblem(studentId: string, query: ProblemQuery = {}) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Build query
    const where: any = {
      isActive: true,
    };

    if (query.topic) {
      where.topic = query.topic;
    }

    if (query.type) {
      where.type = query.type;
    }

    // Use student's grade level if not specified
    const targetGradeLevel = query.gradeLevel || student.gradeLevel;
    where.gradeLevel = {
      gte: Math.max(targetGradeLevel - 1, 0),
      lte: targetGradeLevel + 1,
    };

    // Determine difficulty based on student's performance
    const targetDifficulty = query.difficulty || await this.calculateTargetDifficulty(studentId, query.topic);

    where.difficulty = {
      gte: Math.max(targetDifficulty - 1, 1),
      lte: Math.min(targetDifficulty + 1, 10),
    };

    // Get problems that the student hasn't solved recently
    const recentAttempts = await prisma.problemAttempt.findMany({
      where: {
        studentId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: { problemId: true },
    });

    const recentProblemIds = recentAttempts.map((a) => a.problemId);

    if (recentProblemIds.length > 0) {
      where.id = { notIn: recentProblemIds };
    }

    // Find matching problems
    const problems = await prisma.problem.findMany({
      where,
      take: 10,
    });

    if (problems.length === 0) {
      // Fallback: any problem at the right level
      const fallbackProblems = await prisma.problem.findMany({
        where: {
          isActive: true,
          gradeLevel: targetGradeLevel,
        },
        take: 10,
      });

      if (fallbackProblems.length === 0) {
        throw new NotFoundError('No problems available');
      }

      return this.selectProblem(fallbackProblems);
    }

    return this.selectProblem(problems);
  }

  private selectProblem(problems: any[]) {
    // Select a random problem from the list
    const index = Math.floor(Math.random() * problems.length);
    return problems[index];
  }

  private async calculateTargetDifficulty(studentId: string, topic?: string): Promise<number> {
    if (topic) {
      // Get topic-specific difficulty
      const progress = await prisma.topicProgress.findUnique({
        where: {
          studentId_topic: {
            studentId,
            topic,
          },
        },
      });

      if (progress) {
        // Base difficulty on mastery
        return progress.currentDifficulty;
      }
    }

    // Get overall student level
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) return 1;

    // Convert level to difficulty (1-10)
    // Level 1-5 -> difficulty 1-3
    // Level 6-15 -> difficulty 4-6
    // Level 16+ -> difficulty 7-10
    if (student.currentLevel <= 5) {
      return Math.min(student.currentLevel, 3);
    } else if (student.currentLevel <= 15) {
      return Math.min(Math.floor(student.currentLevel / 3) + 2, 6);
    } else {
      return Math.min(Math.floor(student.currentLevel / 5) + 4, 10);
    }
  }

  async getProblemById(problemId: string) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    return problem;
  }

  async getProblemSet(studentId: string, count: number, query: ProblemQuery = {}) {
    const problems: any[] = [];

    for (let i = 0; i < count; i++) {
      const problem = await this.getNextProblem(studentId, query);
      problems.push(problem);
    }

    return problems;
  }

  async checkAnswer(problemId: string, userAnswer: string): Promise<boolean> {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    // Normalize answers for comparison
    const normalizedUserAnswer = this.normalizeAnswer(userAnswer, problem.answerType);
    const normalizedCorrectAnswer = this.normalizeAnswer(problem.answer, problem.answerType);

    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  private normalizeAnswer(answer: string, answerType: string): string {
    answer = answer.trim().toLowerCase();

    if (answerType === 'NUMBER') {
      // Remove commas and extra spaces
      answer = answer.replace(/,/g, '');
      // Parse as float and convert back to string to handle different formats
      const num = parseFloat(answer);
      return isNaN(num) ? answer : num.toString();
    }

    if (answerType === 'FRACTION') {
      // Normalize fractions: "1/2" or "1 / 2" -> "1/2"
      answer = answer.replace(/\s/g, '');
    }

    return answer;
  }

  async getHint(problemId: string, hintIndex: number) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    const hints = problem.hints as string[];

    if (hintIndex >= hints.length) {
      return {
        hint: 'No more hints available. Try your best!',
        isLast: true,
      };
    }

    return {
      hint: hints[hintIndex],
      isLast: hintIndex === hints.length - 1,
    };
  }
}

export default new ProblemService();