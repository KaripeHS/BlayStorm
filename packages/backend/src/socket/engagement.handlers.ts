import { Server as SocketServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Setup engagement-related socket handlers
 * Handles real-time updates for quests, leaderboards, battle pass, guild chat, etc.
 */
export function setupEngagementHandlers(io: SocketServer, socket: Socket) {
  const userId = (socket as any).userId; // Set by auth middleware

  // ========================================
  // JOIN ROOMS
  // ========================================

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Join guild room (if in guild)
  socket.on('join:guild', (guildId: string) => {
    socket.join(`guild:${guildId}`);
    logger.info(`User ${userId} joined guild room: ${guildId}`);
  });

  // Join friends room
  socket.on('join:friends', () => {
    socket.join(`friends:${userId}`);
    logger.info(`User ${userId} joined friends room`);
  });

  // ========================================
  // QUEST EVENTS
  // ========================================

  /**
   * Emit quest progress update to user
   * Called by backend when quest progress changes
   */
  socket.on('quest:update', (data: { questId: string; progress: number; target: number }) => {
    io.to(`user:${userId}`).emit('quest:progress', data);
  });

  /**
   * Emit quest completion notification
   */
  socket.on('quest:complete', (data: { questId: string; name: string; rewards: any }) => {
    io.to(`user:${userId}`).emit('quest:completed', data);
  });

  // ========================================
  // LEADERBOARD EVENTS
  // ========================================

  /**
   * Join leaderboard room for real-time updates
   */
  socket.on('leaderboard:join', (type: string, scope: string) => {
    socket.join(`leaderboard:${type}:${scope}`);
    logger.info(`User ${userId} watching leaderboard: ${type}:${scope}`);
  });

  /**
   * Leave leaderboard room
   */
  socket.on('leaderboard:leave', (type: string, scope: string) => {
    socket.leave(`leaderboard:${type}:${scope}`);
  });

  // ========================================
  // BATTLE PASS EVENTS
  // ========================================

  /**
   * Emit Battle Pass XP gain
   */
  socket.on('battlepass:xp', (data: { xp: number; currentXp: number; nextLevel: number }) => {
    io.to(`user:${userId}`).emit('battlepass:xp_gained', data);
  });

  /**
   * Emit Battle Pass level up
   */
  socket.on('battlepass:levelup', (data: { level: number; rewards: any[] }) => {
    io.to(`user:${userId}`).emit('battlepass:level_up', data);
  });

  // ========================================
  // GUILD CHAT
  // ========================================

  /**
   * Send message to guild chat
   */
  socket.on('guild:message', async (data: { guildId: string; message: string }) => {
    const { guildId, message } = data;

    try {
      // Get user info for the message
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!studentProfile) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Save message to database
      const savedMessage = await prisma.guildMessage.create({
        data: {
          guildId,
          senderId: userId,
          content: message,
          messageType: 'TEXT',
        },
      });

      const messageData = {
        id: savedMessage.id,
        guildId,
        senderId: userId,
        senderName: studentProfile.user.profile?.displayName || 'Unknown',
        senderAvatar: studentProfile.user.profile?.avatarUrl,
        content: message,
        messageType: 'TEXT',
        createdAt: savedMessage.createdAt,
      };

      // Broadcast to all guild members
      io.to(`guild:${guildId}`).emit('guild:message_received', messageData);
    } catch (error) {
      console.error('Failed to save guild message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * User is typing in guild chat
   */
  socket.on('guild:typing', (data: { guildId: string; username: string }) => {
    socket.to(`guild:${data.guildId}`).emit('guild:user_typing', {
      userId,
      username: data.username,
    });
  });

  // ========================================
  // CHALLENGE EVENTS
  // ========================================

  /**
   * Send challenge to another player
   */
  socket.on('challenge:send', (data: { targetUserId: string; challengeId: string }) => {
    io.to(`user:${data.targetUserId}`).emit('challenge:received', {
      challengeId: data.challengeId,
      fromUserId: userId,
    });
  });

  /**
   * Challenge accepted
   */
  socket.on('challenge:accept', (data: { challengeId: string; opponentId: string }) => {
    io.to(`user:${data.opponentId}`).emit('challenge:accepted', {
      challengeId: data.challengeId,
      acceptedBy: userId,
    });
  });

  /**
   * Challenge declined
   */
  socket.on('challenge:decline', (data: { challengeId: string; opponentId: string }) => {
    io.to(`user:${data.opponentId}`).emit('challenge:declined', {
      challengeId: data.challengeId,
      declinedBy: userId,
    });
  });

  /**
   * Challenge completed
   */
  socket.on('challenge:complete', (data: { challengeId: string; winnerId: string; loserId: string }) => {
    io.to(`user:${data.winnerId}`).emit('challenge:result', {
      challengeId: data.challengeId,
      result: 'win',
    });
    io.to(`user:${data.loserId}`).emit('challenge:result', {
      challengeId: data.challengeId,
      result: 'loss',
    });
  });

  // ========================================
  // FRIEND ACTIVITY
  // ========================================

  /**
   * User went online
   */
  socket.on('user:online', () => {
    // Emit to all friends
    // TODO: Get friends list
    socket.broadcast.to(`friends:${userId}`).emit('friend:online', { userId });
  });

  /**
   * User activity (started game, defeated boss, etc.)
   */
  socket.on('user:activity', (data: { type: string; details: any }) => {
    // Emit to all friends
    socket.broadcast.to(`friends:${userId}`).emit('friend:activity', {
      userId,
      type: data.type,
      details: data.details,
      timestamp: new Date(),
    });
  });

  // ========================================
  // NOTIFICATIONS
  // ========================================

  /**
   * Send notification to user
   */
  socket.on('notification:send', (data: { targetUserId: string; notification: any }) => {
    io.to(`user:${data.targetUserId}`).emit('notification:new', data.notification);
  });

  // ========================================
  // DISCONNECT
  // ========================================

  socket.on('disconnect', () => {
    // User went offline
    socket.broadcast.to(`friends:${userId}`).emit('friend:offline', { userId });
  });
}

// ========================================
// EMIT HELPERS (called from services)
// ========================================

/**
 * Emit quest progress update to user
 */
export function emitQuestProgress(
  io: SocketServer,
  userId: string,
  questData: { questId: string; progress: number; target: number }
) {
  io.to(`user:${userId}`).emit('quest:progress', questData);
}

/**
 * Emit quest completion
 */
export function emitQuestComplete(
  io: SocketServer,
  userId: string,
  questData: { questId: string; name: string; rewards: any }
) {
  io.to(`user:${userId}`).emit('quest:completed', questData);
}

/**
 * Emit leaderboard update
 */
export function emitLeaderboardUpdate(
  io: SocketServer,
  type: string,
  scope: string,
  entries: any[]
) {
  io.to(`leaderboard:${type}:${scope}`).emit('leaderboard:update', entries);
}

/**
 * Emit Battle Pass XP gain
 */
export function emitBattlePassXP(
  io: SocketServer,
  userId: string,
  xpData: { xp: number; currentXp: number; nextLevel: number }
) {
  io.to(`user:${userId}`).emit('battlepass:xp_gained', xpData);
}

/**
 * Emit Battle Pass level up
 */
export function emitBattlePassLevelUp(
  io: SocketServer,
  userId: string,
  levelData: { level: number; rewards: any[] }
) {
  io.to(`user:${userId}`).emit('battlepass:level_up', levelData);
}

/**
 * Emit challenge notification
 */
export function emitChallengeReceived(
  io: SocketServer,
  targetUserId: string,
  challengeData: { challengeId: string; fromUserId: string }
) {
  io.to(`user:${targetUserId}`).emit('challenge:received', challengeData);
}

/**
 * Emit friend activity
 */
export function emitFriendActivity(
  io: SocketServer,
  userId: string,
  activityData: { type: string; details: any }
) {
  io.to(`friends:${userId}`).emit('friend:activity', {
    userId,
    ...activityData,
    timestamp: new Date(),
  });
}
