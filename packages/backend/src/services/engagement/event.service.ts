import { PrismaClient, EventType } from '@prisma/client';

const prisma = new PrismaClient();

export class EventService {
  /**
   * Get all active events
   */
  async getActiveEvents() {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { startDate: 'asc' },
      ],
    });

    return events;
  }

  /**
   * Get event details
   */
  async getEventDetails(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  /**
   * Check if student is eligible for event
   */
  async checkEligibility(studentId: string, eventId: string): Promise<boolean> {
    const [student, event] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { currentLevel: true, gradeLevel: true },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
      }),
    ]);

    if (!student || !event) {
      return false;
    }

    if (!event.isActive) {
      return false;
    }

    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      return false;
    }

    // Check requirements
    if (event.requirements) {
      const requirements = event.requirements as any;

      if (requirements.minLevel && student.currentLevel < requirements.minLevel) {
        return false;
      }

      if (requirements.minGrade && student.gradeLevel < requirements.minGrade) {
        return false;
      }
    }

    return true;
  }

  /**
   * Participate in event (track progress)
   */
  async participateInEvent(studentId: string, eventId: string, progress: any) {
    // TODO: Need EventParticipation table to track progress
    // For now, just verify eligibility

    const isEligible = await this.checkEligibility(studentId, eventId);

    if (!isEligible) {
      throw new Error('Not eligible for this event');
    }

    return { success: true, progress };
  }

  /**
   * Claim event rewards
   */
  async claimEventRewards(studentId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // TODO: Check if completed and not already claimed

    const rewards = event.rewards as any;

    // Award rewards
    await prisma.$transaction(async (tx) => {
      if (rewards.coins) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { coins: { increment: rewards.coins } },
        });
      }

      if (rewards.xp) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { totalXp: { increment: rewards.xp } },
        });
      }

      if (rewards.gems) {
        await tx.studentProfile.update({
          where: { id: studentId },
          data: { gems: { increment: rewards.gems } },
        });
      }

      // Award treasure chest
      if (rewards.chest) {
        await tx.treasureChest.create({
          data: {
            studentId,
            chestType: 'QUEST_REWARD',
            rarity: rewards.chest.rarity || 'RARE',
            earnedFrom: `Event: ${event.name}`,
          },
        });
      }
    });

    // Notify
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'REWARD_CLAIMED',
        title: 'Event Rewards Claimed!',
        message: `You completed ${event.name}!`,
      },
    });

    return rewards;
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents() {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        startDate: { gt: now },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    });

    return events;
  }

  /**
   * Get past events
   */
  async getPastEvents(limit: number = 10) {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        endDate: { lt: now },
      },
      orderBy: {
        endDate: 'desc',
      },
      take: limit,
    });

    return events;
  }

  /**
   * Create event (admin)
   */
  async createEvent(data: {
    name: string;
    description: string;
    eventType: EventType;
    imageUrl: string;
    bannerUrl?: string;
    startDate: Date;
    endDate: Date;
    requirements?: any;
    rewards: any;
    isFeatured?: boolean;
  }) {
    const event = await prisma.event.create({
      data: {
        ...data,
        isActive: true,
      },
    });

    return event;
  }

  /**
   * Update event (admin)
   */
  async updateEvent(eventId: string, data: Partial<any>) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return event;
  }
}

export default new EventService();