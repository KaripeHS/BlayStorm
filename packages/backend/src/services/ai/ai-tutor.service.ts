import OpenAI from 'openai';
import { prisma } from '../../server';
import { ForbiddenError } from '../../utils/errors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AITutorService {
  async getHint(studentId: string, problemId: string, previousHints: string[] = []) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const prompt = this.buildHintPrompt(problem, previousHints);

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: process.env.AI_TUTOR_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly, encouraging math tutor for kids aged 9-14. Give helpful hints without revealing the full answer. Use simple language and be positive.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '300'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });

    const responseTime = Date.now() - startTime;
    const hint = response.choices[0].message.content || '';

    // Log interaction
    await prisma.aITutorInteraction.create({
      data: {
        studentId,
        problemId,
        prompt,
        response: hint,
        interactionType: 'hint',
        model: response.model,
        tokensUsed: response.usage?.total_tokens || 0,
        cost: this.calculateCost(response.usage?.total_tokens || 0, response.model),
        responseTime,
      },
    });

    // Increment AI calls count
    await this.incrementAICallsUsage(studentId);

    return hint;
  }

  async explainMistake(studentId: string, problemId: string, userAnswer: string) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const prompt = `
Problem: ${problem.question}
Student's answer: ${userAnswer}
Correct answer: ${problem.answer}

Explain why the student's answer is incorrect and guide them to understand the correct approach. Be encouraging and constructive.
`;

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: process.env.AI_TUTOR_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a patient, encouraging math tutor. Explain mistakes gently and help students understand where they went wrong.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '300'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });

    const responseTime = Date.now() - startTime;
    const explanation = response.choices[0].message.content || '';

    await prisma.aITutorInteraction.create({
      data: {
        studentId,
        problemId,
        prompt,
        response: explanation,
        interactionType: 'explanation',
        model: response.model,
        tokensUsed: response.usage?.total_tokens || 0,
        cost: this.calculateCost(response.usage?.total_tokens || 0, response.model),
        responseTime,
      },
    });

    await this.incrementAICallsUsage(studentId);

    return explanation;
  }

  async provideEncouragement(studentId: string, context: string) {
    const prompt = `Provide brief, encouraging words for a student. Context: ${context}`;

    const response = await openai.chat.completions.create({
      model: process.env.AI_TUTOR_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an enthusiastic, supportive coach. Give brief, energetic encouragement (1-2 sentences).',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    const encouragement = response.choices[0].message.content || '';

    await prisma.aITutorInteraction.create({
      data: {
        studentId,
        prompt,
        response: encouragement,
        interactionType: 'encouragement',
        model: response.model,
        tokensUsed: response.usage?.total_tokens || 0,
        cost: this.calculateCost(response.usage?.total_tokens || 0, response.model),
        responseTime: 0,
      },
    });

    return encouragement;
  }

  private buildHintPrompt(problem: any, previousHints: string[]): string {
    let prompt = `Problem: ${problem.question}\n`;
    prompt += `Topic: ${problem.topic}\n`;
    prompt += `Difficulty: ${problem.difficulty}/10\n\n`;

    if (previousHints.length > 0) {
      prompt += `Previous hints given:\n`;
      previousHints.forEach((hint, i) => {
        prompt += `${i + 1}. ${hint}\n`;
      });
      prompt += `\nProvide the next hint that builds on these, getting closer to the solution.`;
    } else {
      prompt += `Provide a helpful first hint that guides the student without giving away the answer.`;
    }

    return prompt;
  }

  private calculateCost(tokens: number, model: string): number {
    // Approximate costs (adjust based on actual OpenAI pricing)
    const costs: Record<string, number> = {
      'gpt-4o-mini': 0.00015 / 1000, // $0.15 per 1M tokens
      'gpt-4o': 0.003 / 1000, // $3.00 per 1M tokens
    };

    const costPerToken = costs[model] || costs['gpt-4o-mini'];
    return tokens * costPerToken;
  }

  private async incrementAICallsUsage(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    if (!student) return;

    await prisma.subscription.updateMany({
      where: {
        userId: student.userId,
        status: 'ACTIVE',
      },
      data: {
        aiCallsUsedToday: { increment: 1 },
      },
    });
  }
}

export default new AITutorService();