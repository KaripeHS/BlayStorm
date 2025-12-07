// @ts-nocheck
import webpush from 'web-push';
import { prisma } from '../../server';

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

export class PushService {
  private isConfigured: boolean = false;

  constructor() {
    this.initializeWebPush();
  }

  private initializeWebPush() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@blaystorm.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      this.isConfigured = true;
      console.log('Push notification service initialized');
    } else {
      console.log('Push service: VAPID keys not configured. Push notifications will be logged.');
    }
  }

  /**
   * Register a push token for a user
   */
  async registerToken(userId: string, token: string, platform: string, deviceInfo?: any): Promise<boolean> {
    try {
      await prisma.pushToken.upsert({
        where: { token },
        create: {
          userId,
          token,
          platform,
          deviceInfo,
          isActive: true,
        },
        update: {
          userId,
          isActive: true,
          lastUsedAt: new Date(),
          deviceInfo,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to register push token:', error);
      return false;
    }
  }

  /**
   * Unregister a push token
   */
  async unregisterToken(token: string): Promise<boolean> {
    try {
      await prisma.pushToken.update({
        where: { token },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      console.error('Failed to unregister push token:', error);
      return false;
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<number> {
    const tokens = await prisma.pushToken.findMany({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`);
      return 0;
    }

    let successCount = 0;
    const failedTokens: string[] = [];

    for (const tokenRecord of tokens) {
      const success = await this.sendNotification(tokenRecord.token, payload);
      if (success) {
        successCount++;
        // Update last used timestamp
        await prisma.pushToken.update({
          where: { id: tokenRecord.id },
          data: { lastUsedAt: new Date() },
        });
      } else {
        failedTokens.push(tokenRecord.id);
      }
    }

    // Deactivate failed tokens
    if (failedTokens.length > 0) {
      await prisma.pushToken.updateMany({
        where: { id: { in: failedTokens } },
        data: { isActive: false },
      });
    }

    return successCount;
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<number> {
    let totalSuccess = 0;
    for (const userId of userIds) {
      totalSuccess += await this.sendToUser(userId, payload);
    }
    return totalSuccess;
  }

  /**
   * Send push notification to all active users (for announcements)
   */
  async sendToAll(payload: PushPayload): Promise<number> {
    const tokens = await prisma.pushToken.findMany({
      where: { isActive: true },
      select: { token: true, id: true },
    });

    let successCount = 0;
    const failedTokens: string[] = [];

    for (const tokenRecord of tokens) {
      const success = await this.sendNotification(tokenRecord.token, payload);
      if (success) {
        successCount++;
      } else {
        failedTokens.push(tokenRecord.id);
      }
    }

    // Deactivate failed tokens
    if (failedTokens.length > 0) {
      await prisma.pushToken.updateMany({
        where: { id: { in: failedTokens } },
        data: { isActive: false },
      });
    }

    return successCount;
  }

  /**
   * Send notification to a specific subscription/token
   */
  private async sendNotification(subscription: string, payload: PushPayload): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('=== PUSH NOTIFICATION (Not sent - VAPID not configured) ===');
      console.log(`Title: ${payload.title}`);
      console.log(`Body: ${payload.body}`);
      console.log('============================================================');
      return true; // Return true to not break the flow in dev
    }

    try {
      // Parse the subscription if it's a stringified object
      const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;

      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/badge-72x72.png',
          image: payload.image,
          data: payload.data,
          actions: payload.actions,
        })
      );
      return true;
    } catch (error: any) {
      console.error('Push notification failed:', error.message);
      // If subscription is invalid/expired, return false to deactivate it
      if (error.statusCode === 404 || error.statusCode === 410) {
        return false;
      }
      return true; // For other errors, don't deactivate the token
    }
  }

  // ==================== NOTIFICATION TEMPLATES ====================

  /**
   * Send level up notification
   */
  async notifyLevelUp(userId: string, newLevel: number): Promise<void> {
    await this.sendToUser(userId, {
      title: '🎉 Level Up!',
      body: `Congratulations! You've reached level ${newLevel}!`,
      data: { type: 'level_up', level: newLevel, url: '/profile' },
      actions: [{ action: 'view', title: 'View Profile' }],
    });
  }

  /**
   * Send achievement unlocked notification
   */
  async notifyAchievement(userId: string, achievementName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '🏆 Achievement Unlocked!',
      body: `You earned: ${achievementName}`,
      data: { type: 'achievement', name: achievementName, url: '/achievements' },
      actions: [{ action: 'view', title: 'View Achievement' }],
    });
  }

  /**
   * Send quest completed notification
   */
  async notifyQuestComplete(userId: string, questName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '✅ Quest Complete!',
      body: `You completed: ${questName}. Claim your rewards!`,
      data: { type: 'quest_complete', name: questName, url: '/quests' },
      actions: [{ action: 'claim', title: 'Claim Reward' }],
    });
  }

  /**
   * Send challenge received notification
   */
  async notifyChallengeReceived(userId: string, challengerName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '⚔️ Challenge Received!',
      body: `${challengerName} has challenged you to a math battle!`,
      data: { type: 'challenge', url: '/challenges' },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ],
    });
  }

  /**
   * Send guild invite notification
   */
  async notifyGuildInvite(userId: string, guildName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '🏰 Guild Invitation!',
      body: `You've been invited to join ${guildName}!`,
      data: { type: 'guild_invite', guildName, url: '/guilds' },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ],
    });
  }

  /**
   * Send friend request notification
   */
  async notifyFriendRequest(userId: string, friendName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: '👋 Friend Request!',
      body: `${friendName} wants to be your friend!`,
      data: { type: 'friend_request', url: '/friends' },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ],
    });
  }

  /**
   * Send streak reminder notification
   */
  async notifyStreakReminder(userId: string, currentStreak: number): Promise<void> {
    await this.sendToUser(userId, {
      title: '🔥 Don\'t Break Your Streak!',
      body: `You're on a ${currentStreak}-day streak! Play today to keep it going!`,
      data: { type: 'streak_reminder', streak: currentStreak, url: '/play' },
      actions: [{ action: 'play', title: 'Play Now' }],
    });
  }

  /**
   * Send daily quest reminder notification
   */
  async notifyDailyQuests(userId: string, questCount: number): Promise<void> {
    await this.sendToUser(userId, {
      title: '📋 Daily Quests Available!',
      body: `You have ${questCount} new daily quest${questCount > 1 ? 's' : ''} waiting for you!`,
      data: { type: 'daily_quests', count: questCount, url: '/quests' },
      actions: [{ action: 'view', title: 'View Quests' }],
    });
  }

  /**
   * Send event started notification
   */
  async notifyEventStarted(eventName: string, eventDescription: string): Promise<void> {
    await this.sendToAll({
      title: `🎪 ${eventName} Has Started!`,
      body: eventDescription,
      data: { type: 'event_started', url: '/events' },
      actions: [{ action: 'join', title: 'Join Event' }],
    });
  }
}

export default new PushService();
