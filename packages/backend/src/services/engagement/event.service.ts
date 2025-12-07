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
   * Join an event (initialize participation)
   */
  async joinEvent(studentId: string, eventId: string) {
    const isEligible = await this.checkEligibility(studentId, eventId);

    if (!isEligible) {
      throw new Error('Not eligible for this event');
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if already participating
    const existing = await prisma.eventParticipation.findUnique({
      where: {
        eventId_studentId: { eventId, studentId },
      },
    });

    if (existing) {
      return existing;
    }

    // Create participation record
    const participation = await prisma.eventParticipation.create({
      data: {
        eventId,
        studentId,
        progress: 0,
        targetProgress: event.targetValue || 100,
        isCompleted: false,
        rewardsClaimed: false,
      },
    });

    return participation;
  }

  /**
   * Update event progress
   */
  async updateEventProgress(studentId: string, eventId: string, progressIncrement: number) {
    const participation = await prisma.eventParticipation.findUnique({
      where: {
        eventId_studentId: { eventId, studentId },
      },
    });

    if (!participation) {
      // Auto-join if not participating
      await this.joinEvent(studentId, eventId);
      return this.updateEventProgress(studentId, eventId, progressIncrement);
    }

    if (participation.isCompleted) {
      return participation;
    }

    const newProgress = Math.min(participation.progress + progressIncrement, participation.targetProgress);
    const isCompleted = newProgress >= participation.targetProgress;

    const updated = await prisma.eventParticipation.update({
      where: { id: participation.id },
      data: {
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastUpdatedAt: new Date(),
      },
    });

    // Notify if completed
    if (isCompleted && !participation.isCompleted) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'QUEST_COMPLETE',
          title: 'Event Completed!',
          message: `You completed ${event?.name || 'the event'}! Claim your rewards!`,
          actionUrl: '/events',
        },
      });
    }

    return updated;
  }

  /**
   * Get student's event participation
   */
  async getEventParticipation(studentId: string, eventId: string) {
    return prisma.eventParticipation.findUnique({
      where: {
        eventId_studentId: { eventId, studentId },
      },
      include: {
        event: true,
      },
    });
  }

  /**
   * Get all event participations for a student
   */
  async getStudentEventParticipations(studentId: string) {
    return prisma.eventParticipation.findMany({
      where: { studentId },
      include: {
        event: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Claim event rewards
   */
  async claimEventRewards(studentId: string, eventId: string) {
    const [event, participation] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.eventParticipation.findUnique({
        where: { eventId_studentId: { eventId, studentId } },
      }),
    ]);

    if (!event) {
      throw new Error('Event not found');
    }

    if (!participation) {
      throw new Error('You have not participated in this event');
    }

    if (!participation.isCompleted) {
      throw new Error('Event not completed yet');
    }

    if (participation.rewardsClaimed) {
      throw new Error('Rewards already claimed');
    }

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

      // Mark rewards as claimed
      await tx.eventParticipation.update({
        where: { id: participation.id },
        data: {
          rewardsClaimed: true,
          claimedAt: new Date(),
        },
      });
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