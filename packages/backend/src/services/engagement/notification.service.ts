import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    imageUrl?: string;
    actionUrl?: string;
    metadata?: any;
  }) {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        metadata: data.metadata || {},
      },
    });

    // TODO: Send push notification if user has enabled it
    await this.sendPushNotification(data.userId, notification);

    return notification;
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    filters?: {
      unreadOnly?: boolean;
      type?: NotificationType;
      limit?: number;
    }
  ) {
    const where: any = { userId };

    if (filters?.unreadOnly) {
      where.isRead = false;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 50,
    });

    return notifications;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Not authorized');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Not authorized');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return true;
  }

  /**
   * Delete old read notifications (cron job - keep 30 days)
   */
  async cleanOldNotifications() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const deleted = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Cleaned ${deleted.count} old notifications`);
    return deleted.count;
  }

  /**
   * Send push notification (placeholder for push service integration)
   */
  private async sendPushNotification(userId: string, notification: any) {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    // For now, this is a placeholder - push notifications will be implemented later
    console.log('Push notification placeholder for user:', userId, 'notification:', notification.title);
  }

  /**
   * Send daily reminder notifications (cron job)
   */
  async sendDailyReminders() {
    // Get students who haven't played today but were active in last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get students who were active in last 7 days
    const recentlyActive = await prisma.playerAnalytics.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
          lt: today,
        },
      },
      distinct: ['studentId'],
      select: {
        studentId: true,
      },
    });

    // Get students who played today
    const playedToday = await prisma.playerAnalytics.findMany({
      where: {
        date: today,
      },
      select: {
        studentId: true,
      },
    });

    const playedTodayIds = new Set(playedToday.map((p) => p.studentId));

    // Filter to students who haven't played today
    const needReminder = recentlyActive.filter((s) => !playedTodayIds.has(s.studentId));

    let sentCount = 0;

    for (const student of needReminder) {
      // Get student's daily quests
      const quests = await prisma.dailyQuest.count({
        where: {
          studentId: student.studentId,
          expiresAt: {
            gt: new Date(),
          },
          claimedAt: null,
        },
      });

      if (quests > 0) {
        await this.createNotification({
          userId: student.studentId,
          type: 'SYSTEM',
          title: '🎯 Daily Quests Waiting!',
          message: `You have ${quests} daily quest${quests > 1 ? 's' : ''} waiting. Complete them before they expire!`,
          actionUrl: '/quests',
        });
        sentCount++;
      }
    }

    console.log(`Sent ${sentCount} daily reminder notifications`);
    return sentCount;
  }

  /**
   * Send streak reminder (cron job - evening reminder)
   */
  async sendStreakReminders() {
    // Get students with active streaks who haven't played today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const playedToday = await prisma.playerAnalytics.findMany({
      where: {
        date: today,
      },
      select: {
        studentId: true,
      },
    });

    const playedTodayIds = new Set(playedToday.map((p) => p.studentId));

    // Get students with streaks >= 3 days
    const studentsWithStreaks = await prisma.studentProfile.findMany({
      where: {
        currentStreak: {
          gte: 3,
        },
        lastActiveDate: {
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Active in last 2 days
        },
      },
      select: {
        id: true,
        currentStreak: true,
      },
    });

    let sentCount = 0;

    for (const student of studentsWithStreaks) {
      if (!playedTodayIds.has(student.id)) {
        await this.createNotification({
          userId: student.id,
          type: 'SYSTEM',
          title: '🔥 Don\'t Break Your Streak!',
          message: `You're on a ${student.currentStreak}-day streak! Play today to keep it going!`,
          actionUrl: '/play',
        });
        sentCount++;
      }
    }

    console.log(`Sent ${sentCount} streak reminder notifications`);
    return sentCount;
  }

  /**
   * Send weekly report notifications (cron job - runs Monday)
   */
  async sendWeeklyReports() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get all students who played last week
    const activeStudents = await prisma.playerAnalytics.findMany({
      where: {
        date: {
          gte: lastWeek,
          lt: today,
        },
      },
      distinct: ['studentId'],
      select: {
        studentId: true,
      },
    });

    let sentCount = 0;

    for (const student of activeStudents) {
      // Get weekly stats
      const weeklyStats = await prisma.playerAnalytics.aggregate({
        where: {
          studentId: student.studentId,
          date: {
            gte: lastWeek,
            lt: today,
          },
        },
        _sum: {
          problemsSolved: true,
          problemsCorrect: true,
          xpEarned: true,
          coinsEarned: true,
        },
      });

      const problemsSolved = weeklyStats._sum.problemsSolved || 0;
      const xpEarned = weeklyStats._sum.xpEarned || 0;

      await this.createNotification({
        userId: student.studentId,
        type: 'SYSTEM',
        title: '📊 Your Weekly Report',
        message: `Last week you solved ${problemsSolved} problems and earned ${xpEarned} XP! Keep up the amazing work!`,
        actionUrl: '/stats',
      });
      sentCount++;
    }

    console.log(`Sent ${sentCount} weekly report notifications`);
    return sentCount;
  }

  /**
   * Notify on friend achievement
   */
  async notifyFriendAchievement(studentId: string, achievementName: string) {
    // Get student's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ studentId: studentId }, { friendId: studentId }],
        status: 'ACCEPTED',
      },
      select: {
        studentId: true,
        friendId: true,
      },
    });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const friendIds = friendships.map((f) =>
      f.studentId === studentId ? f.friendId : f.studentId
    );

    for (const friendId of friendIds) {
      await this.createNotification({
        userId: friendId,
        type: 'SYSTEM',
        title: 'Friend Achievement!',
        message: `${student?.user.profile?.displayName} just earned the "${achievementName}" achievement!`,
        imageUrl: student?.user.profile?.avatarUrl,
      });
    }
  }

  /**
   * Notify on level up
   */
  async notifyLevelUp(studentId: string, newLevel: number) {
    await this.createNotification({
      userId: studentId,
      type: 'LEVEL_UP',
      title: '🎉 Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      actionUrl: '/profile',
    });
  }

  /**
   * Notify on guild invitation
   */
  async notifyGuildInvitation(studentId: string, guildName: string, inviterId: string) {
    const inviter = await prisma.studentProfile.findUnique({
      where: { id: inviterId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    await this.createNotification({
      userId: studentId,
      type: 'GUILD_INVITE',
      title: 'Guild Invitation',
      message: `${inviter?.user.profile?.displayName} invited you to join ${guildName}!`,
      actionUrl: '/guilds',
    });
  }
}

export default new NotificationService();