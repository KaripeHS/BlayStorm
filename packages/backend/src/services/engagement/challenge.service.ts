import { PrismaClient, ChallengeType, ChallengeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ChallengeService {
  /**
   * Create a challenge
   */
  async createChallenge(
    initiatorId: string,
    receiverId: string,
    data: {
      challengeType: ChallengeType;
      topic?: string;
      difficulty: number;
      problemCount: number;
    }
  ) {
    // Check if receiver exists and is a friend
    const receiver = await prisma.studentProfile.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Check for existing pending challenge between these players
    const existing = await prisma.challenge.findFirst({
      where: {
        OR: [
          { initiatorId, receiverId, status: 'PENDING' },
          { initiatorId: receiverId, receiverId: initiatorId, status: 'PENDING' },
        ],
      },
    });

    if (existing) {
      throw new Error('Already have a pending challenge with this player');
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        initiatorId,
        receiverId,
        ...data,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        initiator: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CHALLENGE_RECEIVED',
        title: 'Challenge Received!',
        message: `${challenge.initiator.user.profile?.displayName} challenged you to a ${data.challengeType}!`,
        actionUrl: `/challenges/${challenge.id}`,
      },
    });

    return challenge;
  }

  /**
   * Accept a challenge
   */
  async acceptChallenge(challengeId: string, receiverId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.receiverId !== receiverId) {
      throw new Error('Not authorized');
    }

    if (challenge.status !== 'PENDING') {
      throw new Error('Challenge is not pending');
    }

    if (new Date() > challenge.expiresAt) {
      await this.expireChallenge(challengeId);
      throw new Error('Challenge expired');
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'ACCEPTED',
      },
    });

    // Notify initiator
    await prisma.notification.create({
      data: {
        userId: challenge.initiatorId,
        type: 'SYSTEM',
        title: 'Challenge Accepted!',
        message: 'Your challenge was accepted! The duel begins now!',
        actionUrl: `/challenges/${challengeId}`,
      },
    });

    return updated;
  }

  /**
   * Decline a challenge
   */
  async declineChallenge(challengeId: string, receiverId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.receiverId !== receiverId) {
      throw new Error('Not authorized');
    }

    if (challenge.status !== 'PENDING') {
      throw new Error('Challenge is not pending');
    }

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'DECLINED',
        completedAt: new Date(),
      },
    });

    // Notify initiator
    await prisma.notification.create({
      data: {
        userId: challenge.initiatorId,
        type: 'SYSTEM',
        title: 'Challenge Declined',
        message: 'Your challenge was declined.',
      },
    });

    return updated;
  }

  /**
   * Update challenge score
   */
  async updateScore(challengeId: string, studentId: string, score: number) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (![challenge.initiatorId, challenge.receiverId].includes(studentId)) {
      throw new Error('Not a participant');
    }

    const isInitiator = studentId === challenge.initiatorId;
    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        [isInitiator ? 'initiatorScore' : 'receiverScore']: score,
        status: 'IN_PROGRESS',
      },
    });

    // Check if both completed
    if (
      updated.initiatorScore > 0 &&
      updated.receiverScore > 0 &&
      updated.status === 'IN_PROGRESS'
    ) {
      await this.completeChallenge(challengeId);
    }

    return updated;
  }

  /**
   * Complete a challenge and determine winner
   */
  async completeChallenge(challengeId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        initiator: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        receiver: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Determine winner
    let winnerId: string | null = null;
    if (challenge.initiatorScore > challenge.receiverScore) {
      winnerId = challenge.initiatorId;
    } else if (challenge.receiverScore > challenge.initiatorScore) {
      winnerId = challenge.receiverId;
    } // else it's a tie

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        winnerId,
      },
    });

    // Award rewards to winner
    if (winnerId) {
      const WINNER_COINS = 100;
      const WINNER_XP = 50;

      await prisma.studentProfile.update({
        where: { id: winnerId },
        data: {
          coins: { increment: WINNER_COINS },
          totalXp: { increment: WINNER_XP },
        },
      });

      // Notify both players
      await prisma.notification.create({
        data: {
          userId: winnerId,
          type: 'SYSTEM',
          title: 'Challenge Won! 🏆',
          message: `You won! Earned ${WINNER_COINS} coins and ${WINNER_XP} XP!`,
        },
      });

      const loserId = winnerId === challenge.initiatorId ? challenge.receiverId : challenge.initiatorId;
      await prisma.notification.create({
        data: {
          userId: loserId,
          type: 'SYSTEM',
          title: 'Challenge Complete',
          message: 'Better luck next time! Keep practicing!',
        },
      });
    } else {
      // Tie - both get small reward
      const TIE_COINS = 50;
      await Promise.all([
        prisma.studentProfile.update({
          where: { id: challenge.initiatorId },
          data: { coins: { increment: TIE_COINS } },
        }),
        prisma.studentProfile.update({
          where: { id: challenge.receiverId },
          data: { coins: { increment: TIE_COINS } },
        }),
        prisma.notification.create({
          data: {
            userId: challenge.initiatorId,
            type: 'SYSTEM',
            title: "It's a Tie!",
            message: `Tied! Earned ${TIE_COINS} coins!`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: challenge.receiverId,
            type: 'SYSTEM',
            title: "It's a Tie!",
            message: `Tied! Earned ${TIE_COINS} coins!`,
          },
        }),
      ]);
    }

    return updated;
  }

  /**
   * Get challenges for a student
   */
  async getChallenges(studentId: string, status?: ChallengeStatus) {
    const where: any = {
      OR: [
        { initiatorId: studentId },
        { receiverId: studentId },
      ],
    };

    if (status) {
      where.status = status;
    }

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        initiator: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        receiver: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return challenges;
  }

  /**
   * Get pending challenges for a student
   */
  async getPendingChallenges(studentId: string) {
    return this.getChallenges(studentId, 'PENDING');
  }

  /**
   * Expire old challenges (cron job)
   */
  async expireOldChallenges() {
    const expired = await prisma.challenge.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'EXPIRED',
        completedAt: new Date(),
      },
    });

    console.log(`Expired ${expired.count} challenges`);
    return expired.count;
  }

  /**
   * Expire a specific challenge
   */
  private async expireChallenge(challengeId: string) {
    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: 'EXPIRED',
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get challenge statistics for a student
   */
  async getChallengeStats(studentId: string) {
    const [total, won, lost, tied] = await Promise.all([
      prisma.challenge.count({
        where: {
          OR: [{ initiatorId: studentId }, { receiverId: studentId }],
          status: 'COMPLETED',
        },
      }),
      prisma.challenge.count({
        where: {
          winnerId: studentId,
          status: 'COMPLETED',
        },
      }),
      prisma.challenge.count({
        where: {
          OR: [{ initiatorId: studentId }, { receiverId: studentId }],
          status: 'COMPLETED',
          winnerId: { not: studentId },
          winnerId: { not: null },
        },
      }),
      prisma.challenge.count({
        where: {
          OR: [{ initiatorId: studentId }, { receiverId: studentId }],
          status: 'COMPLETED',
          winnerId: null,
        },
      }),
    ]);

    const winRate = total > 0 ? (won / total) * 100 : 0;

    return {
      totalChallenges: total,
      won,
      lost,
      tied,
      winRate: Math.round(winRate),
    };
  }
}

export default new ChallengeService();